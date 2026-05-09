import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-prod'
);

export async function signToken(payload: { userId: string; username: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; username: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export function generateViewerHash(ip: string, userAgent: string, userId: string): string {
  // Create a fingerprint that's hard to spoof but respects privacy
  const data = `${ip}|${userAgent}|${userId}|${process.env.JWT_SECRET}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Add date component (resets daily, so same person doesn't count infinitely but also can recount after a day)
  const dateStr = new Date().toISOString().split('T')[0];
  const fullHash = `${Math.abs(hash).toString(36)}-${dateStr}-${userId.slice(0, 8)}`;
  return fullHash;
}
