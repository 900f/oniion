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
  const body = await req.json();
  const {
    display_name, bio, avatar_url, banner_url, banner_color,
    background_image_url, card_image_url,
    song_url, song_title, song_artist,
    background_type, background_value, text_color, accent_color,
    font_family, font_effect, page_effect, effect_color,
    layout, card_position, blur_enabled, glow_enabled,
    badge_text, badge_color, cursor_effect, card_style, links,
    custom_font_url, custom_font_name,
  } = body;

  await db`UPDATE profiles SET
    display_name=${display_name??null}, bio=${bio??null},
    avatar_url=${avatar_url??null}, banner_url=${banner_url??null},
    banner_color=${banner_color??'#0d0d0d'},
    background_image_url=${background_image_url??null},
    card_image_url=${card_image_url??null},
    song_url=${song_url??null}, song_title=${song_title??null}, song_artist=${song_artist??null},
    background_type=${background_type??'color'}, background_value=${background_value??'#0a0a0a'},
    text_color=${text_color??'#ffffff'}, accent_color=${accent_color??'#a855f7'},
    font_family=${font_family??'Geist'}, font_effect=${font_effect??'none'},
    page_effect=${page_effect??'none'}, effect_color=${effect_color??'#a855f7'},
    layout=${layout??'center'}, card_position=${card_position??'top'},
    blur_enabled=${blur_enabled??false}, glow_enabled=${glow_enabled??false},
    badge_text=${badge_text??null}, badge_color=${badge_color??'#a855f7'},
    cursor_effect=${cursor_effect??'none'}, card_style=${card_style??'glass'},
    custom_font_url=${custom_font_url??null}, custom_font_name=${custom_font_name??null},
    updated_at=NOW()
    WHERE user_id=${session.userId}`;

  if (Array.isArray(links)) {
    await db`DELETE FROM links WHERE user_id=${session.userId}`;
    for (let i = 0; i < links.length; i++) {
      const lk = links[i];
      if (lk.title && lk.url) {
        await db`INSERT INTO links (user_id, title, url, icon, link_type, display_order)
          VALUES (${session.userId}, ${lk.title}, ${lk.url}, ${lk.icon||'link'}, ${lk.link_type||'url'}, ${i})`;
      }
    }
  }
  return NextResponse.json({ success: true });
}
