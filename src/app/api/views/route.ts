export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateViewerHash } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'No userId' }, { status: 400 });

    const cfIp = req.headers.get('cf-connecting-ip');
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = cfIp || (forwarded ? forwarded.split(',')[0].trim() : null) || realIp || 'unknown';
    const ua = req.headers.get('user-agent') || '';
    const lang = req.headers.get('accept-language') || '';

    const hash = generateViewerHash(`${ip}|${ua}|${lang}`, userId, process.env.JWT_SECRET || '');
    const today = new Date().toISOString().split('T')[0];
    const db = getDb();

    // Upsert view_counts row if missing
    await db`INSERT INTO view_counts (user_id, total_views, daily_hashes)
      VALUES (${userId}, 0, '{}') ON CONFLICT (user_id) DO NOTHING`;

    // Read current state
    const [row] = await db`SELECT total_views, daily_hashes FROM view_counts WHERE user_id = ${userId}`;
    const hashes: Record<string, string[]> = row?.daily_hashes || {};

    // Keep only today's hashes (prune old dates)
    const todayHashes: string[] = hashes[today] || [];
    const alreadySeen = todayHashes.includes(hash);

    let newTotal = Number(row?.total_views || 0);

    if (!alreadySeen) {
      todayHashes.push(hash);
      newTotal += 1;
      // Only keep today in the JSONB — prune everything else
      const newHashes = { [today]: todayHashes };

      await db`UPDATE view_counts SET
        total_views = ${newTotal},
        daily_hashes = ${JSON.stringify(newHashes)}::jsonb,
        updated_at = NOW()
      WHERE user_id = ${userId}`;
    }

    return NextResponse.json({ views: newTotal });
  } catch (err) {
    console.error('View error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
