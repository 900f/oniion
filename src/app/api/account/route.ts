export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { getSession, signToken } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const { action, newUsername, newPassword, currentPassword } = await req.json();

    // Verify current password for any change
    const [user] = await db`SELECT id, username, password_hash FROM users WHERE id = ${session.userId}`;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });

    if (action === 'username') {
      const lower = newUsername?.toLowerCase().trim();
      if (!lower || !/^[a-z0-9_-]{3,32}$/.test(lower))
        return NextResponse.json({ error: 'Invalid username (3-32 chars, letters/numbers/_/-)' }, { status: 400 });
      const [existing] = await db`SELECT id FROM users WHERE username = ${lower} AND id != ${session.userId}`;
      if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      await db`UPDATE users SET username = ${lower} WHERE id = ${session.userId}`;
      // Issue new token with updated username
      const token = await signToken({ userId: session.userId, username: lower });
      const res = NextResponse.json({ success: true, username: lower });
      res.cookies.set({ name: 'auth_token', value: token, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' });
      return res;
    }

    if (action === 'password') {
      if (!newPassword || newPassword.length < 6)
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      const hash = await bcrypt.hash(newPassword, 12);
      await db`UPDATE users SET password_hash = ${hash} WHERE id = ${session.userId}`;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Account update error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
