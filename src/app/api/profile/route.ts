import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [profile] = await sql`
    SELECT p.*, vc.total_views FROM profiles p
    LEFT JOIN view_counts vc ON vc.user_id = p.user_id
    WHERE p.user_id = ${session.userId}
  `;

  const links = await sql`
    SELECT * FROM links WHERE user_id = ${session.userId} ORDER BY display_order ASC
  `;

  return NextResponse.json({ profile, links });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    display_name, bio, avatar_url, banner_url, banner_color,
    song_url, song_title, song_artist,
    background_type, background_value, text_color, accent_color,
    font_family, font_effect, page_effect, effect_color,
    layout, blur_enabled, glow_enabled, badge_text, badge_color,
    cursor_effect, card_style, links,
  } = body;

  await sql`
    UPDATE profiles SET
      display_name = ${display_name ?? null},
      bio = ${bio ?? null},
      avatar_url = ${avatar_url ?? null},
      banner_url = ${banner_url ?? null},
      banner_color = ${banner_color ?? '#0d0d0d'},
      song_url = ${song_url ?? null},
      song_title = ${song_title ?? null},
      song_artist = ${song_artist ?? null},
      background_type = ${background_type ?? 'color'},
      background_value = ${background_value ?? '#0a0a0a'},
      text_color = ${text_color ?? '#ffffff'},
      accent_color = ${accent_color ?? '#a855f7'},
      font_family = ${font_family ?? 'Space Grotesk'},
      font_effect = ${font_effect ?? 'none'},
      page_effect = ${page_effect ?? 'none'},
      effect_color = ${effect_color ?? '#a855f7'},
      layout = ${layout ?? 'center'},
      blur_enabled = ${blur_enabled ?? false},
      glow_enabled = ${glow_enabled ?? false},
      badge_text = ${badge_text ?? null},
      badge_color = ${badge_color ?? '#a855f7'},
      cursor_effect = ${cursor_effect ?? 'none'},
      card_style = ${card_style ?? 'glass'},
      updated_at = NOW()
    WHERE user_id = ${session.userId}
  `;

  // Update links
  if (Array.isArray(links)) {
    await sql`DELETE FROM links WHERE user_id = ${session.userId}`;
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (link.title && link.url) {
        await sql`
          INSERT INTO links (user_id, title, url, icon, display_order)
          VALUES (${session.userId}, ${link.title}, ${link.url}, ${link.icon || '🔗'}, ${i})
        `;
      }
    }
  }

  return NextResponse.json({ success: true });
}
