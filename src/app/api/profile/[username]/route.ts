import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const lower = username.toLowerCase();

  const [user] = await sql`SELECT id FROM users WHERE username = ${lower}`;
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [profile] = await sql`SELECT * FROM profiles WHERE user_id = ${user.id}`;
  const links = await sql`SELECT * FROM links WHERE user_id = ${user.id} ORDER BY display_order ASC`;
  const [viewCount] = await sql`SELECT total_views FROM view_counts WHERE user_id = ${user.id}`;

  return NextResponse.json({
    username: lower,
    userId: user.id,
    profile,
    links,
    views: viewCount?.total_views ?? 0,
  });
}
