export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const [profile] = await db`
    SELECT p.*, vc.total_views, u.display_id FROM profiles p
    LEFT JOIN view_counts vc ON vc.user_id = p.user_id
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ${session.userId}
  `;
  const links = await db`SELECT * FROM links WHERE user_id = ${session.userId} ORDER BY display_order ASC`;
  return NextResponse.json({ profile, links });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const b = await req.json();

  await db`UPDATE profiles SET
    display_name=${b.display_name??null}, bio=${b.bio??null},
    avatar_url=${b.avatar_url??null}, banner_url=${b.banner_url??null},
    banner_color=${b.banner_color??'#0d0d0d'},
    background_image_url=${b.background_image_url??null},
    card_image_url=${b.card_image_url??null},
    song_url=${b.song_url??null}, song_title=${b.song_title??null}, song_artist=${b.song_artist??null},
    background_type=${b.background_type??'color'}, background_value=${b.background_value??'#0a0a0a'},
    text_color=${b.text_color??'#ffffff'}, accent_color=${b.accent_color??'#a855f7'},
    font_family=${b.font_family??'Space Grotesk'}, font_effect=${b.font_effect??'none'},
    page_effect=${b.page_effect??'none'}, effect_color=${b.effect_color??'#a855f7'},
    layout=${b.layout??'center'}, card_position=${b.card_position??'top'},
    blur_enabled=${b.blur_enabled??false}, glow_enabled=${b.glow_enabled??false},
    badge_text=${b.badge_text??null}, badge_color=${b.badge_color??'#a855f7'},
    cursor_effect=${b.cursor_effect??'none'}, card_style=${b.card_style??'glass'},
    custom_font_url=${b.custom_font_url??null}, custom_font_name=${b.custom_font_name??null},
    avatar_orbit=${b.avatar_orbit??true},
    card_led_border=${b.card_led_border??true},
    card_tilt=${b.card_tilt??true},
    show_views=${b.show_views??true},
    show_id=${b.show_id??true},
    show_music=${b.show_music??true},
    name_font=${b.name_font??'orbitron'},
    updated_at=NOW()
    WHERE user_id=${session.userId}`;

  if (Array.isArray(b.links)) {
    await db`DELETE FROM links WHERE user_id=${session.userId}`;
    for (let i = 0; i < b.links.length; i++) {
      const lk = b.links[i];
      if (lk.title && lk.url)
        await db`INSERT INTO links (user_id, title, url, icon, link_type, display_order)
          VALUES (${session.userId},${lk.title},${lk.url},${lk.icon||'link'},${lk.link_type||'url'},${i})`;
    }
  }
  return NextResponse.json({ success: true });
}
