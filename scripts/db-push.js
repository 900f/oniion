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
  console.log('✓ view_counts');

  await sql`CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id)`;

  // ALL migrations — safe to run on existing databases
  const migs = [
    // original columns
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_font_url TEXT`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_font_name VARCHAR(128)`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_image_url TEXT`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_image_url TEXT`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_position VARCHAR(20) DEFAULT 'top'`,
    `ALTER TABLE links ADD COLUMN IF NOT EXISTS link_type VARCHAR(20) DEFAULT 'url'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS display_id INTEGER`,
    `ALTER TABLE view_counts ADD COLUMN IF NOT EXISTS daily_hashes JSONB DEFAULT '{}'`,
    // NEW feature toggle columns
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_orbit BOOLEAN DEFAULT true`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_led_border BOOLEAN DEFAULT true`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_tilt BOOLEAN DEFAULT true`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_views BOOLEAN DEFAULT true`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_id BOOLEAN DEFAULT true`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_music BOOLEAN DEFAULT true`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name_font VARCHAR(32) DEFAULT 'orbitron'`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS glass_opacity REAL DEFAULT 0.72`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS glass_tint TEXT DEFAULT 'auto'`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cursor_trail_style VARCHAR(32) DEFAULT 'dot'`,
    // backfill nulls with defaults for existing rows
    `UPDATE profiles SET avatar_orbit = true WHERE avatar_orbit IS NULL`,
    `UPDATE profiles SET card_led_border = true WHERE card_led_border IS NULL`,
    `UPDATE profiles SET card_tilt = true WHERE card_tilt IS NULL`,
    `UPDATE profiles SET show_views = true WHERE show_views IS NULL`,
    `UPDATE profiles SET show_id = true WHERE show_id IS NULL`,
    `UPDATE profiles SET show_music = true WHERE show_music IS NULL`,
    `UPDATE profiles SET name_font = 'orbitron' WHERE name_font IS NULL`,
    `UPDATE profiles SET layout = 'center' WHERE layout IS NULL`,
    `UPDATE profiles SET card_style = 'glass' WHERE card_style IS NULL`,
    `UPDATE profiles SET font_family = 'Space Grotesk' WHERE font_family IS NULL`,
  ];

  for (const m of migs) {
    try {
      await sql.unsafe(m);
      console.log('  ✓', m.split(' ').slice(0, 7).join(' '));
    } catch (e) {
      console.log('  skipped (already exists)');
    }
  }

  // Backfill display_id
  try {
    await sql.unsafe(`UPDATE users SET display_id = sub.rn FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn FROM users WHERE display_id IS NULL
    ) sub WHERE users.id = sub.id`);
    console.log('✓ display_id backfill');
  } catch { console.log('  display_id backfill skipped'); }

  console.log('\n✅ Database ready!');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
