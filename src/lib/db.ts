import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default sql;

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(32) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email VARCHAR(255) UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      display_name VARCHAR(64),
      bio TEXT,
      avatar_url TEXT,
      banner_url TEXT,
      banner_color TEXT DEFAULT '#0d0d0d',
      song_url TEXT,
      song_title TEXT,
      song_artist TEXT,
      background_type VARCHAR(20) DEFAULT 'color',
      background_value TEXT DEFAULT '#0a0a0a',
      text_color TEXT DEFAULT '#ffffff',
      accent_color TEXT DEFAULT '#a855f7',
      font_family TEXT DEFAULT 'Space Grotesk',
      font_effect VARCHAR(32) DEFAULT 'none',
      page_effect VARCHAR(32) DEFAULT 'none',
      effect_color TEXT DEFAULT '#a855f7',
      layout VARCHAR(20) DEFAULT 'center',
      blur_enabled BOOLEAN DEFAULT false,
      glow_enabled BOOLEAN DEFAULT false,
      badge_text VARCHAR(64),
      badge_color TEXT DEFAULT '#a855f7',
      cursor_effect VARCHAR(20) DEFAULT 'none',
      card_style VARCHAR(20) DEFAULT 'glass',
      custom_font_url TEXT,
      custom_font_name VARCHAR(128),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(128) NOT NULL,
      url TEXT NOT NULL,
      icon TEXT DEFAULT '🔗',
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      viewer_hash TEXT NOT NULL,
      viewed_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, viewer_hash)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS view_counts (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      total_views BIGINT DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_views_user_id ON views(user_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id)
  `;
}
