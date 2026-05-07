import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { generateViewerHash } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'No userId' }, { status: 400 });

    // Get real IP, checking all proxy headers
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfIp = req.headers.get('cf-connecting-ip'); // Cloudflare
    const ip = cfIp || (forwarded ? forwarded.split(',')[0].trim() : null) || realIp || 'unknown';

    const userAgent = req.headers.get('user-agent') || 'unknown';
    const acceptLang = req.headers.get('accept-language') || '';
    const acceptEnc = req.headers.get('accept-encoding') || '';

    // Multi-factor fingerprint: IP + UA + language + encoding + secret
    const fingerprintData = `${ip}|${userAgent}|${acceptLang}|${acceptEnc}`;
    const viewerHash = generateViewerHash(fingerprintData, userId, process.env.JWT_SECRET || '');

    // Try to insert unique view (will fail silently if already seen today)
    const result = await sql`
      INSERT INTO views (user_id, viewer_hash)
      VALUES (${userId}, ${viewerHash})
      ON CONFLICT (user_id, viewer_hash) DO NOTHING
      RETURNING id
    `;

    // Only increment counter for new unique views
    if (result.length > 0) {
      await sql`
        INSERT INTO view_counts (user_id, total_views)
        VALUES (${userId}, 1)
        ON CONFLICT (user_id) DO UPDATE
        SET total_views = view_counts.total_views + 1, updated_at = NOW()
      `;
    }

    const [count] = await sql`SELECT total_views FROM view_counts WHERE user_id = ${userId}`;
    return NextResponse.json({ views: count?.total_views ?? 0 });
  } catch (err) {
    console.error('View error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
