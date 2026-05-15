export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Fields that should NEVER be exported (security/privilege fields)
const STRIP_FIELDS = [
  'id','user_id','updated_at','total_views','display_id',
  'verified','show_verified_badge','password_hash',
];

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();

  const [profile] = await db`SELECT * FROM profiles WHERE user_id = ${session.userId}`;
  const links = await db`SELECT title, url, icon, link_type, display_order FROM links WHERE user_id = ${session.userId} ORDER BY display_order ASC`;

  if (!profile) return NextResponse.json({ error: 'No profile found' }, { status: 404 });

  // Strip sensitive/privileged fields
  const exportProfile: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(profile)) {
    if (!STRIP_FIELDS.includes(k)) exportProfile[k] = v;
  }

  const config = {
    _version: 1,
    _exported_at: new Date().toISOString(),
    _note: 'oniion.cc profile config — import at dashboard/account',
    profile: exportProfile,
    links: links.map(l => ({ title: l.title, url: l.url, icon: l.icon, link_type: l.link_type })),
  };

  return new NextResponse(JSON.stringify(config, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="oniion-config-${session.username}.json"`,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();

  let config: { _version?: number; profile?: Record<string, unknown>; links?: { title:string; url:string; icon:string; link_type:string }[] };
  try {
    config = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!config.profile) return NextResponse.json({ error: 'Missing profile data' }, { status: 400 });

  // Only allow safe fields to be imported — never allow privilege escalation
  const ALLOWED_PROFILE_FIELDS = [
    'display_name','bio','avatar_url','banner_url','banner_color',
    'background_image_url','card_image_url',
    'song_url','song_title','song_artist',
    'background_type','background_value',
    'text_color','accent_color','font_family',
    'font_effect','page_effect','effect_color',
    'layout','card_position','blur_enabled','glow_enabled',
    'badge_text','badge_color','cursor_effect','cursor_trail_style','card_style',
    'custom_font_url','custom_font_name',
    'avatar_orbit','card_led_border','card_tilt',
    'show_views','show_id','show_music',
    'name_font','glass_opacity','glass_tint','custom_cursor_url',
  ];

  const p = config.profile;
  const bool = (v: unknown, def: boolean) => v === null || v === undefined ? def : Boolean(v);
  const str = (v: unknown, def: string) => (typeof v === 'string' ? v : def) ?? def;
  const num = (v: unknown, def: number) => (typeof v === 'number' ? v : def) ?? def;

  // Validate all fields are in allowed list
  for (const key of Object.keys(p)) {
    if (!ALLOWED_PROFILE_FIELDS.includes(key)) {
      delete p[key]; // silently strip unknown/disallowed fields
    }
  }

  await db`UPDATE profiles SET
    display_name      = ${str(p.display_name, '')},
    bio               = ${str(p.bio, '')},
    avatar_url        = ${str(p.avatar_url, '')},
    banner_url        = ${str(p.banner_url, '')},
    banner_color      = ${str(p.banner_color, '#0d0d0d')},
    background_image_url = ${str(p.background_image_url, '')},
    card_image_url    = ${str(p.card_image_url, '')},
    song_url          = ${str(p.song_url, '')},
    song_title        = ${str(p.song_title, '')},
    song_artist       = ${str(p.song_artist, '')},
    background_type   = ${str(p.background_type, 'color')},
    background_value  = ${str(p.background_value, '#0a0a0a')},
    text_color        = ${str(p.text_color, '#ffffff')},
    accent_color      = ${str(p.accent_color, '#a855f7')},
    font_family       = ${str(p.font_family, 'Space Grotesk')},
    font_effect       = ${str(p.font_effect, 'none')},
    page_effect       = ${str(p.page_effect, 'none')},
    effect_color      = ${str(p.effect_color, '#a855f7')},
    layout            = ${str(p.layout, 'center')},
    card_position     = ${str(p.card_position, 'top')},
    blur_enabled      = ${bool(p.blur_enabled, false)},
    glow_enabled      = ${bool(p.glow_enabled, false)},
    badge_text        = ${str(p.badge_text, '')},
    badge_color       = ${str(p.badge_color, '#a855f7')},
    cursor_effect     = ${str(p.cursor_effect, 'none')},
    cursor_trail_style = ${str(p.cursor_trail_style, 'dot')},
    card_style        = ${str(p.card_style, 'glass')},
    custom_font_url   = ${str(p.custom_font_url, '')},
    custom_font_name  = ${str(p.custom_font_name, '')},
    avatar_orbit      = ${bool(p.avatar_orbit, true)},
    card_led_border   = ${bool(p.card_led_border, true)},
    card_tilt         = ${bool(p.card_tilt, true)},
    show_views        = ${bool(p.show_views, true)},
    show_id           = ${bool(p.show_id, true)},
    show_music        = ${bool(p.show_music, true)},
    name_font         = ${str(p.name_font, 'orbitron')},
    glass_opacity     = ${num(p.glass_opacity, 0.72)},
    glass_tint        = ${str(p.glass_tint, 'auto')},
    custom_cursor_url = ${str(p.custom_cursor_url, '')},
    updated_at        = NOW()
  WHERE user_id = ${session.userId}`;

  // Import links if provided
  if (Array.isArray(config.links)) {
    await db`DELETE FROM links WHERE user_id = ${session.userId}`;
    for (let i = 0; i < config.links.length; i++) {
      const lk = config.links[i];
      if (lk.title && lk.url) {
        await db`INSERT INTO links (user_id, title, url, icon, link_type, display_order)
          VALUES (${session.userId}, ${lk.title}, ${lk.url}, ${lk.icon||'link'}, ${lk.link_type||'url'}, ${i})`;
      }
    }
  }

  return NextResponse.json({ success: true, message: 'Config imported successfully' });
}
