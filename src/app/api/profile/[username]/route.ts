export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const lower = username.toLowerCase();
  const db = getDb();
  const [user] = await db`SELECT id, display_id FROM users WHERE username = ${lower}`;
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [profile] = await db`SELECT * FROM profiles WHERE user_id = ${user.id}`;
  const links = await db`SELECT * FROM links WHERE user_id = ${user.id} ORDER BY display_order ASC`;
  const [vc] = await db`SELECT total_views FROM view_counts WHERE user_id = ${user.id}`;
  return NextResponse.json({
    username: lower, userId: user.id, displayId: user.display_id,
    profile, links, views: vc?.total_views ?? 0,
  });
}
