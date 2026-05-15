export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const search = searchParams.get('q')?.trim() || '';
  const limit = 24;
  const offset = (page - 1) * limit;

  const rows = search
    ? await db`
        SELECT u.username, u.verified, u.display_id,
               p.display_name, p.avatar_url, p.bio, p.accent_color,
               p.badge_text, p.badge_color, p.background_type, p.background_value,
               vc.total_views
        FROM profiles p
        JOIN users u ON u.id = p.user_id
        LEFT JOIN view_counts vc ON vc.user_id = p.user_id
        WHERE p.listed_in_directory = true
          AND (LOWER(u.username) LIKE ${`%${search.toLowerCase()}%`}
            OR LOWER(p.display_name) LIKE ${`%${search.toLowerCase()}%`})
        ORDER BY vc.total_views DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `
    : await db`
        SELECT u.username, u.verified, u.display_id,
               p.display_name, p.avatar_url, p.bio, p.accent_color,
               p.badge_text, p.badge_color, p.background_type, p.background_value,
               vc.total_views
        FROM profiles p
        JOIN users u ON u.id = p.user_id
        LEFT JOIN view_counts vc ON vc.user_id = p.user_id
        WHERE p.listed_in_directory = true
        ORDER BY vc.total_views DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;

  const [{ count }] = await db`SELECT COUNT(*) FROM profiles WHERE listed_in_directory = true`;

  return NextResponse.json({ profiles: rows, total: Number(count), page, limit });
}

// Toggle directory listing for the logged-in user
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const { listed } = await req.json();
  await db`UPDATE profiles SET listed_in_directory = ${Boolean(listed)} WHERE user_id = ${session.userId}`;
  return NextResponse.json({ success: true });
}
