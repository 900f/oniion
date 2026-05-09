export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql, { initDB } from '@/lib/db';
import { signToken } from '@/lib/auth';

const USERNAME_REGEX = /^[a-z0-9_-]{3,32}$/;
const RESERVED = ['admin','api','dashboard','login','register','settings','help','about','oniion','support'];

export async function POST(req: NextRequest) {
  try {
    await initDB();
    const { username, password } = await req.json();

    if (!username || !password)
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });

    const lower = username.toLowerCase();

    if (!USERNAME_REGEX.test(lower))
      return NextResponse.json({ error: 'Username must be 3-32 chars, letters/numbers/_ only' }, { status: 400 });

    if (RESERVED.includes(lower))
      return NextResponse.json({ error: 'This username is reserved' }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

    const existing = await sql`SELECT id FROM users WHERE username = ${lower}`;
    if (existing.length > 0)
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await sql`
      INSERT INTO users (username, password_hash)
      VALUES (${lower}, ${passwordHash})
      RETURNING id, username
    `;

    await sql`INSERT INTO profiles (user_id, display_name) VALUES (${user.id}, ${lower})`;
    await sql`INSERT INTO view_counts (user_id, total_views) VALUES (${user.id}, 0)`;

    const token = await signToken({ userId: user.id, username: user.username });
    const res = NextResponse.json({ success: true, username: user.username });
    res.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
