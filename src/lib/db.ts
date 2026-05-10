import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let _sql: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL not set');
    _sql = neon(url);
  }
  return _sql;
}

export default new Proxy({} as NeonQueryFunction<false, false>, {
  apply(_t: unknown, _this: unknown, args: unknown[]) {
    return (getDb() as unknown as (...a: unknown[]) => unknown)(...args);
  },
  get(_t: unknown, prop: string | symbol) {
    const db = getDb() as unknown as Record<string | symbol, unknown>;
    return db[prop];
  },
}) as NeonQueryFunction<false, false>;

// Run each migration as a tagged template so TypeScript is happy
export async function runMigrations() {
  const db = getDb();
  const cols = [
    [`custom_font_url`, `TEXT`],
    [`custom_font_name`, `VARCHAR(128)`],
    [`background_image_url`, `TEXT`],
    [`card_image_url`, `TEXT`],
    [`card_position`, `VARCHAR(20) DEFAULT 'top'`],
    [`avatar_orbit`, `BOOLEAN DEFAULT true`],
    [`card_led_border`, `BOOLEAN DEFAULT true`],
    [`card_tilt`, `BOOLEAN DEFAULT true`],
    [`show_views`, `BOOLEAN DEFAULT true`],
    [`show_id`, `BOOLEAN DEFAULT true`],
    [`show_music`, `BOOLEAN DEFAULT true`],
    [`name_font`, `VARCHAR(32) DEFAULT 'orbitron'`],
  ];
  for (const [col, type] of cols) {
    try {
      await db`SELECT ${db`${col}`} FROM profiles LIMIT 0`;
    } catch {
      // Column doesn't exist — add it. We build the SQL string and pass via template.
      try {
        const stmt = `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${col} ${type}`;
        await db([stmt] as unknown as TemplateStringsArray);
      } catch { /* ignore */ }
    }
  }
  // links table
  try { await db([`ALTER TABLE links ADD COLUMN IF NOT EXISTS link_type VARCHAR(20) DEFAULT 'url'`] as unknown as TemplateStringsArray); } catch { /* ok */ }
  // users table
  try { await db([`ALTER TABLE users ADD COLUMN IF NOT EXISTS display_id INTEGER`] as unknown as TemplateStringsArray); } catch { /* ok */ }
  // view_counts table
  try { await db([`ALTER TABLE view_counts ADD COLUMN IF NOT EXISTS daily_hashes JSONB DEFAULT '{}'`] as unknown as TemplateStringsArray); } catch { /* ok */ }
}

export async function initDB() {
  const db = getDb();

  await db`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(255) UNIQUE,
    display_id SERIAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(64), bio TEXT,
    avatar_url TEXT, banner_url TEXT, banner_color TEXT DEFAULT '#0d0d0d',
    background_image_url TEXT, card_image_url TEXT,
    song_url TEXT, song_title TEXT, song_artist TEXT,
    background_type VARCHAR(20) DEFAULT 'color',
    background_value TEXT DEFAULT '#0a0a0a',
    text_color TEXT DEFAULT '#ffffff', accent_color TEXT DEFAULT '#a855f7',
    font_family TEXT DEFAULT 'Space Grotesk',
    font_effect VARCHAR(32) DEFAULT 'none',
    page_effect VARCHAR(32) DEFAULT 'none', effect_color TEXT DEFAULT '#a855f7',
    layout VARCHAR(20) DEFAULT 'center',
    card_position VARCHAR(20) DEFAULT 'top',
    blur_enabled BOOLEAN DEFAULT false, glow_enabled BOOLEAN DEFAULT false,
    badge_text VARCHAR(64), badge_color TEXT DEFAULT '#a855f7',
    cursor_effect VARCHAR(20) DEFAULT 'none', card_style VARCHAR(20) DEFAULT 'glass',
    custom_font_url TEXT, custom_font_name VARCHAR(128),
    avatar_orbit BOOLEAN DEFAULT true,
    card_led_border BOOLEAN DEFAULT true,
    card_tilt BOOLEAN DEFAULT true,
    show_views BOOLEAN DEFAULT true,
    show_id BOOLEAN DEFAULT true,
    show_music BOOLEAN DEFAULT true,
    name_font VARCHAR(32) DEFAULT 'orbitron',
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL, url TEXT NOT NULL,
    icon TEXT DEFAULT 'link', link_type VARCHAR(20) DEFAULT 'url',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS view_counts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_views BIGINT DEFAULT 0,
    daily_hashes JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await db`CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id)`;
  await runMigrations();

  try {
    await db`UPDATE users SET display_id = sub.rn
      FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
            FROM users WHERE display_id IS NULL) sub
      WHERE users.id = sub.id`;
  } catch { /* ok */ }
}
