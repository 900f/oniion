export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

// Call GET /api/migrate once after deploying to add new columns to existing DB
// Protected by a secret key to prevent abuse
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await initDB();
    return NextResponse.json({ success: true, message: 'Database migrated successfully' });
  } catch (err) {
    console.error('Migration error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
