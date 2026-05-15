export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

const STRIP = ['id','user_id','updated_at','total_views','display_id','verified','show_verified_badge','listed_in_directory'];

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const search = searchParams.get('q')?.trim() || '';
  const sort = searchParams.get('sort') || 'popular'; // popular | newest | mine
  const limit = 24;
  const offset = (page - 1) * limit;

  // "mine" requires auth
  if (sort === 'mine') {
    const session = await getSession();
    if (!session) return NextResponse.json({ themes: [], total: 0 });
    const themes = await db`
      SELECT t.*, u.username, u.verified FROM themes t
      JOIN users u ON u.id = t.user_id
      WHERE t.user_id = ${session.userId}
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const [{ count }] = await db`SELECT COUNT(*) FROM themes WHERE user_id = ${session.userId}`;
    return NextResponse.json({ themes, total: Number(count), page, limit });
  }

  const themes = search
    ? await db`
        SELECT t.*, u.username, u.verified FROM themes t
        JOIN users u ON u.id = t.user_id
        WHERE LOWER(t.name) LIKE ${`%${search.toLowerCase()}%`}
           OR LOWER(t.description) LIKE ${`%${search.toLowerCase()}%`}
        ORDER BY ${sort === 'newest' ? db`t.created_at DESC` : db`t.uses DESC`}
        LIMIT ${limit} OFFSET ${offset}
      `
    : await db`
        SELECT t.*, u.username, u.verified FROM themes t
        JOIN users u ON u.id = t.user_id
        ORDER BY ${sort === 'newest' ? db`t.created_at DESC` : db`t.uses DESC`}
        LIMIT ${limit} OFFSET ${offset}
      `;

  const [{ count }] = await db`SELECT COUNT(*) FROM themes`;
  return NextResponse.json({ themes, total: Number(count), page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const body = await req.json();

  if (body.action === 'publish') {
    const { name, description } = body;
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    if (name.length > 64) return NextResponse.json({ error: 'Name too long (max 64)' }, { status: 400 });

    // Get current profile to snapshot as theme config
    const [profile] = await db`SELECT * FROM profiles WHERE user_id = ${session.userId}`;
    if (!profile) return NextResponse.json({ error: 'No profile found' }, { status: 404 });
    const links = await db`SELECT title, url, icon, link_type FROM links WHERE user_id = ${session.userId} ORDER BY display_order ASC`;

    const config: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(profile)) {
      if (!STRIP.includes(k)) config[k] = v;
    }

    // Check user theme limit (max 10)
    const [{ count }] = await db`SELECT COUNT(*) FROM themes WHERE user_id = ${session.userId}`;
    if (Number(count) >= 10) return NextResponse.json({ error: 'Max 10 themes per user' }, { status: 400 });

    const [theme] = await db`
      INSERT INTO themes (user_id, name, description, preview_color, preview_accent, config)
      VALUES (${session.userId}, ${name.trim()}, ${description?.trim()||null},
              ${profile.accent_color||'#a855f7'}, ${profile.badge_color||'#06b6d4'},
              ${JSON.stringify({ profile: config, links })})
      RETURNING id, name
    `;
    return NextResponse.json({ success: true, theme });
  }

  if (body.action === 'apply') {
    const { themeId } = body;
    if (!themeId) return NextResponse.json({ error: 'themeId required' }, { status: 400 });

    const [theme] = await db`SELECT * FROM themes WHERE id = ${themeId}`;
    if (!theme) return NextResponse.json({ error: 'Theme not found' }, { status: 404 });

    const cfg = theme.config as { profile?: Record<string, unknown>; links?: { title:string; url:string; icon:string; link_type:string }[] };
    const p = cfg.profile || {};

    const str = (v: unknown, d: string) => typeof v === 'string' ? v : d;
    const bool = (v: unknown, d: boolean) => v === null || v === undefined ? d : Boolean(v);
    const num = (v: unknown, d: number) => typeof v === 'number' ? v : d;

    await db`UPDATE profiles SET
      background_type=${str(p.background_type,'color')}, background_value=${str(p.background_value,'#0a0a0a')},
      text_color=${str(p.text_color,'#ffffff')}, accent_color=${str(p.accent_color,'#a855f7')},
      font_family=${str(p.font_family,'Space Grotesk')}, font_effect=${str(p.font_effect,'none')},
      page_effect=${str(p.page_effect,'none')}, effect_color=${str(p.effect_color,'#a855f7')},
      layout=${str(p.layout,'center')}, card_position=${str(p.card_position,'top')},
      blur_enabled=${bool(p.blur_enabled,false)}, glow_enabled=${bool(p.glow_enabled,false)},
      badge_color=${str(p.badge_color,'#a855f7')},
      cursor_effect=${str(p.cursor_effect,'none')}, cursor_trail_style=${str(p.cursor_trail_style,'dot')},
      card_style=${str(p.card_style,'glass')},
      avatar_orbit=${bool(p.avatar_orbit,true)}, card_led_border=${bool(p.card_led_border,true)},
      card_tilt=${bool(p.card_tilt,true)},
      name_font=${str(p.name_font,'orbitron')},
      glass_opacity=${num(p.glass_opacity,0.72)}, glass_tint=${str(p.glass_tint,'auto')},
      custom_font_url=${str(p.custom_font_url,'')}, custom_font_name=${str(p.custom_font_name,'')},
      updated_at=NOW()
    WHERE user_id=${session.userId}`;

    // Increment use count
    await db`UPDATE themes SET uses = uses + 1 WHERE id = ${themeId}`;

    return NextResponse.json({ success: true });
  }

  if (body.action === 'delete') {
    const { themeId } = body;
    await db`DELETE FROM themes WHERE id = ${themeId} AND user_id = ${session.userId}`;
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
