require('dotenv').config({ path: '.env.local' });
async function main() {
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  console.log('Initializing database…');

  await sql`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(255) UNIQUE,
    display_id SERIAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log('✓ users');

  await sql`CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(64), bio TEXT,
    avatar_url TEXT, banner_url TEXT, banner_color TEXT DEFAULT '#0d0d0d',
    background_image_url TEXT, card_image_url TEXT,
    song_url TEXT, song_title TEXT, song_artist TEXT,
    background_type VARCHAR(20) DEFAULT 'color',
    background_value TEXT DEFAULT '#0a0a0a',
    text_color TEXT DEFAULT '#ffffff', accent_color TEXT DEFAULT '#a855f7',
    font_family TEXT DEFAULT 'Geist', font_effect VARCHAR(32) DEFAULT 'none',
    page_effect VARCHAR(32) DEFAULT 'none', effect_color TEXT DEFAULT '#a855f7',
    layout VARCHAR(20) DEFAULT 'center', card_position VARCHAR(20) DEFAULT 'top',
    blur_enabled BOOLEAN DEFAULT false, glow_enabled BOOLEAN DEFAULT false,
    badge_text VARCHAR(64), badge_color TEXT DEFAULT '#a855f7',
    cursor_effect VARCHAR(20) DEFAULT 'none', card_style VARCHAR(20) DEFAULT 'glass',
    custom_font_url TEXT, custom_font_name VARCHAR(128),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log('✓ profiles');

  await sql`CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL, url TEXT NOT NULL,
    icon TEXT DEFAULT 'link', link_type VARCHAR(20) DEFAULT 'url',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log('✓ links');

  await sql`CREATE TABLE IF NOT EXISTS view_counts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_views BIGINT DEFAULT 0,
    daily_hashes JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log('✓ view_counts (lean — no views table)');

  await sql`CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id)`;

  // Safe migrations for existing databases
  const migs = [
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_font_url TEXT`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_font_name VARCHAR(128)`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_image_url TEXT`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_image_url TEXT`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_position VARCHAR(20) DEFAULT 'top'`,
    `ALTER TABLE links ADD COLUMN IF NOT EXISTS link_type VARCHAR(20) DEFAULT 'url'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS display_id INTEGER`,
    `ALTER TABLE view_counts ADD COLUMN IF NOT EXISTS daily_hashes JSONB DEFAULT '{}'`,
  ];
  for (const m of migs) {
    try { await sql.unsafe(m); console.log('  migrated:', m.split(' ').slice(0,6).join(' ')); }
    catch { console.log('  (already exists, skipped)'); }
  }

  // Backfill display_id for existing users
  try {
    await sql.unsafe(`UPDATE users SET display_id = sub.rn FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn FROM users WHERE display_id IS NULL
    ) sub WHERE users.id = sub.id`);
    console.log('✓ display_id backfill');
  } catch (e) { console.log('  display_id backfill skipped'); }

  console.log('\n✅ Database ready!');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
