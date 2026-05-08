'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FONTS = [
  'Space Grotesk', 'Syne', 'Playfair Display', 'JetBrains Mono',
  'Bebas Neue', 'Dancing Script', 'Orbitron', 'Cinzel', 'Permanent Marker',
];

const FONT_EFFECTS = [
  { value: 'none', label: 'None' },
  { value: 'shimmer', label: '✨ Shimmer' },
  { value: 'glow', label: '💫 Glow' },
  { value: 'glitch', label: '⚡ Glitch' },
  { value: 'neon', label: '🌟 Neon' },
  { value: 'shadow', label: '🌑 Shadow' },
  { value: 'outline', label: '◻ Outline' },
];

const PAGE_EFFECTS = [
  { value: 'none', label: 'None' },
  { value: 'snow', label: '❄️ Snow' },
  { value: 'rain', label: '🌧 Rain' },
  { value: 'sakura', label: '🌸 Sakura' },
  { value: 'bubbles', label: '🫧 Bubbles' },
  { value: 'fireflies', label: '✨ Fireflies' },
  { value: 'matrix', label: '💻 Matrix' },
];

const CURSOR_EFFECTS = [
  { value: 'none', label: 'Default' },
  { value: 'trail', label: '✨ Sparkle trail' },
  { value: 'ring', label: '⭕ Ring' },
  { value: 'dot', label: '• Dot' },
];

const CARD_STYLES = [
  { value: 'glass', label: 'Glass' },
  { value: 'solid', label: 'Solid' },
  { value: 'outline', label: 'Outline' },
  { value: 'neon', label: 'Neon' },
];

const BG_TYPES = [
  { value: 'color', label: 'Solid Color' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Image URL' },
];

type LinkItem = { title: string; url: string; icon: string };

type Profile = {
  display_name: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  banner_color: string;
  song_url: string;
  song_title: string;
  song_artist: string;
  background_type: string;
  background_value: string;
  text_color: string;
  accent_color: string;
  font_family: string;
  font_effect: string;
  page_effect: string;
  effect_color: string;
  layout: string;
  blur_enabled: boolean;
  glow_enabled: boolean;
  badge_text: string;
  badge_color: string;
  cursor_effect: string;
  card_style: string;
  custom_font_url: string;
  custom_font_name: string;
  total_views?: number;
};

const defaultProfile: Profile = {
  display_name: '',
  bio: '',
  avatar_url: '',
  banner_url: '',
  banner_color: '#0d0d0d',
  song_url: '',
  song_title: '',
  song_artist: '',
  background_type: 'color',
  background_value: '#0a0a0a',
  text_color: '#ffffff',
  accent_color: '#a855f7',
  font_family: 'Space Grotesk',
  font_effect: 'none',
  page_effect: 'none',
  effect_color: '#a855f7',
  layout: 'center',
  blur_enabled: false,
  glow_enabled: false,
  badge_text: '',
  badge_color: '#a855f7',
  cursor_effect: 'none',
  card_style: 'glass',
  custom_font_url: '',
  custom_font_name: '',
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'effects' | 'links' | 'music'>('profile');
  const [loading, setLoading] = useState(true);
  const [fontUploading, setFontUploading] = useState(false);
  const [fontUploadError, setFontUploadError] = useState('');
  const fontInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(data => {
      if (!data.user) { router.push('/login'); return; }
      setUser(data.user);
      fetch('/api/profile').then(r => r.json()).then(d => {
        if (d.profile) setProfile({ ...defaultProfile, ...d.profile });
        if (d.links) setLinks(d.links);
        setLoading(false);
      });
    });
  }, [router]);

  const save = useCallback(async () => {
    setSaving(true);
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, links }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [profile, links]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const addLink = () => setLinks(l => [...l, { title: '', url: '', icon: '🔗' }]);
  const removeLink = (i: number) => setLinks(l => l.filter((_, idx) => idx !== i));
  const updateLink = (i: number, field: keyof LinkItem, val: string) =>
    setLinks(l => l.map((lk, idx) => idx === i ? { ...lk, [field]: val } : lk));

  // Font upload via uploadthing
  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['ttf', 'otf', 'woff', 'woff2'].includes(ext || '')) {
      setFontUploadError('Only .ttf, .otf, .woff, .woff2 files are supported');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setFontUploadError('Font file must be under 4MB');
      return;
    }

    setFontUploading(true);
    setFontUploadError('');

    try {
      // Get uploadthing presigned URL
      const presignRes = await fetch('/api/uploadthing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: [{ name: file.name, size: file.size, type: file.type || 'font/ttf' }],
          input: {},
          action: 'upload',
          slug: 'fontUploader',
        }),
      });

      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const presignData = await presignRes.json();
      const { url, fields, key } = presignData[0] || presignData?.data?.[0] || {};

      if (!url) throw new Error('No upload URL returned');

      // Upload the file
      const formData = new FormData();
      if (fields) Object.entries(fields).forEach(([k, v]) => formData.append(k, v as string));
      formData.append('file', file);

      const uploadRes = await fetch(url, { method: 'POST', body: formData });
      if (!uploadRes.ok && uploadRes.status !== 204) throw new Error('Upload failed');

      // Construct the public URL
      const fileUrl = `https://utfs.io/f/${key}`;
      const fontName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');

      setProfile(p => ({ ...p, custom_font_url: fileUrl, custom_font_name: fontName, font_family: `__custom__` }));
      setFontUploading(false);
    } catch (err) {
      console.error('Font upload error:', err);
      // Fallback: use object URL for preview (won't persist without UT key)
      setFontUploadError('Upload failed. Check your UPLOADTHING_SECRET in .env.local');
      setFontUploading(false);
    }
  };

  const clearCustomFont = () => {
    setProfile(p => ({ ...p, custom_font_url: '', custom_font_name: '', font_family: 'Space Grotesk' }));
    if (fontInputRef.current) fontInputRef.current.value = '';
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#666', fontSize: 14 }}>Loading...</div>
    </div>
  );

  const tabs = [
    { key: 'profile', label: '👤 Profile' },
    { key: 'appearance', label: '🎨 Appearance' },
    { key: 'effects', label: '✨ Effects' },
    { key: 'links', label: '🔗 Links' },
    { key: 'music', label: '🎵 Music' },
  ] as const;

  const usingCustomFont = profile.custom_font_url && profile.font_family === '__custom__';

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 16, height: 56, position: 'sticky', top: 0, background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, marginRight: 'auto' }}>
          <span style={{ color: '#a855f7' }}>oni</span>ion.cc
        </Link>
        <span style={{ fontSize: 12, color: '#555' }}>👁 {profile.total_views ?? 0} views</span>
        <Link href={`/${user?.username}`} target="_blank" className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }}>View profile ↗</Link>
        <button onClick={save} className="btn btn-primary" style={{ fontSize: 12, padding: '6px 16px' }} disabled={saving}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save'}
        </button>
        <button onClick={logout} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 14px', color: '#666' }}>Sign out</button>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, letterSpacing: '-0.5px', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: '#555', fontSize: 14 }}>oniion.cc/<span style={{ color: '#a855f7' }}>{user?.username}</span></p>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              background: 'none', border: 'none', color: activeTab === t.key ? '#fff' : '#555',
              fontSize: 13, padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit',
              borderBottom: activeTab === t.key ? '2px solid #a855f7' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s', fontWeight: activeTab === t.key ? 600 : 400,
            }}>{t.label}</button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Section title="Basic Info">
              <Field label="Display Name">
                <input className="input" value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))} placeholder="Your name" maxLength={64} />
              </Field>
              <Field label="Bio">
                <textarea className="input" value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell the world about yourself..." maxLength={300} rows={4} />
              </Field>
              <Field label="Avatar URL">
                <input className="input" value={profile.avatar_url} onChange={e => setProfile(p => ({ ...p, avatar_url: e.target.value }))} placeholder="https://example.com/avatar.jpg" />
              </Field>
              <Field label="Badge Text (optional)">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" value={profile.badge_text} onChange={e => setProfile(p => ({ ...p, badge_text: e.target.value }))} placeholder="e.g. he/him, admin, artist" maxLength={64} />
                  <input type="color" value={profile.badge_color} onChange={e => setProfile(p => ({ ...p, badge_color: e.target.value }))} style={{ width: 44, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none', padding: 2 }} />
                </div>
              </Field>
            </Section>
            <Section title="Banner">
              <Field label="Banner Image URL (leave empty to use color)">
                <input className="input" value={profile.banner_url} onChange={e => setProfile(p => ({ ...p, banner_url: e.target.value }))} placeholder="https://example.com/banner.jpg" />
              </Field>
              <Field label="Banner Color (if no image)">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={profile.banner_color} onChange={e => setProfile(p => ({ ...p, banner_color: e.target.value }))} style={{ width: 44, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <span style={{ color: '#666', fontSize: 13 }}>{profile.banner_color}</span>
                </div>
              </Field>
            </Section>
          </div>
        )}

        {/* APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Section title="Background">
              <Field label="Background Type">
                <div style={{ display: 'flex', gap: 8 }}>
                  {BG_TYPES.map(t => (
                    <button key={t.value} onClick={() => setProfile(p => ({ ...p, background_type: t.value }))}
                      className={profile.background_type === t.value ? 'btn btn-primary' : 'btn btn-ghost'}
                      style={{ fontSize: 12, padding: '8px 14px' }}>{t.label}</button>
                  ))}
                </div>
              </Field>
              <Field label={profile.background_type === 'color' ? 'Color' : profile.background_type === 'gradient' ? 'CSS Gradient' : 'Image URL'}>
                {profile.background_type === 'color' ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={profile.background_value} onChange={e => setProfile(p => ({ ...p, background_value: e.target.value }))} style={{ width: 44, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                    <input className="input" value={profile.background_value} onChange={e => setProfile(p => ({ ...p, background_value: e.target.value }))} placeholder="#0a0a0a" />
                  </div>
                ) : (
                  <input className="input" value={profile.background_value} onChange={e => setProfile(p => ({ ...p, background_value: e.target.value }))} placeholder={profile.background_type === 'gradient' ? 'linear-gradient(135deg, #0a0a0a, #1a0a2a)' : 'https://...'} />
                )}
              </Field>
            </Section>

            <Section title="Colors">
              <Field label="Text Color">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={profile.text_color} onChange={e => setProfile(p => ({ ...p, text_color: e.target.value }))} style={{ width: 44, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input className="input" value={profile.text_color} onChange={e => setProfile(p => ({ ...p, text_color: e.target.value }))} />
                </div>
              </Field>
              <Field label="Accent Color">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={profile.accent_color} onChange={e => setProfile(p => ({ ...p, accent_color: e.target.value }))} style={{ width: 44, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input className="input" value={profile.accent_color} onChange={e => setProfile(p => ({ ...p, accent_color: e.target.value }))} />
                </div>
              </Field>
            </Section>

            <Section title="Font">
              {/* Custom font upload */}
              <Field label="Custom Font (upload your own .ttf / .otf / .woff / .woff2)">
                <div className="glass" style={{ padding: 16, borderRadius: 12, border: usingCustomFont ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.06)' }}>
                  {usingCustomFont ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20 }}>🔤</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{profile.custom_font_name}</div>
                        <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Custom font — active</div>
                      </div>
                      <button onClick={clearCustomFont} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px', color: '#f87171' }}>
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fontInputRef.current?.click()}
                      style={{
                        border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 10,
                        padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                    >
                      {fontUploading ? (
                        <div style={{ color: '#a855f7', fontSize: 13 }}>Uploading...</div>
                      ) : (
                        <>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>🔤</div>
                          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Click to upload your font file</div>
                          <div style={{ fontSize: 11, color: '#555' }}>.ttf • .otf • .woff • .woff2 — max 4MB</div>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fontInputRef}
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    style={{ display: 'none' }}
                    onChange={handleFontUpload}
                  />
                  {fontUploadError && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#f87171', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
                      {fontUploadError}
                    </div>
                  )}
                </div>
              </Field>

              <Field label={usingCustomFont ? 'Preset Font (custom font is active — remove it to use a preset)' : 'Preset Font'}>
                <select
                  className="input"
                  value={usingCustomFont ? '' : profile.font_family}
                  onChange={e => setProfile(p => ({ ...p, font_family: e.target.value }))}
                  disabled={!!usingCustomFont}
                  style={{ opacity: usingCustomFont ? 0.4 : 1 }}
                >
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>

              {/* Live preview */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>PREVIEW</div>
                {usingCustomFont && (
                  <style>{`@font-face { font-family: '__custom__'; src: url('${profile.custom_font_url}'); }`}</style>
                )}
                <div style={{ fontFamily: usingCustomFont ? '__custom__' : `'${profile.font_family}', sans-serif`, fontSize: 22, color: '#fff' }}>
                  The quick brown fox
                </div>
                <div style={{ fontFamily: usingCustomFont ? '__custom__' : `'${profile.font_family}', sans-serif`, fontSize: 14, color: '#888', marginTop: 4 }}>
                  AaBbCcDd 0123456789 !@#$
                </div>
              </div>
            </Section>

            <Section title="Layout & Card">
              <Field label="Profile Layout">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['center', 'left'].map(l => (
                    <button key={l} onClick={() => setProfile(p => ({ ...p, layout: l }))}
                      className={profile.layout === l ? 'btn btn-primary' : 'btn btn-ghost'}
                      style={{ fontSize: 12, padding: '8px 16px' }}>
                      {l === 'center' ? '⬛ Centered' : '◧ Left'}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Card Style">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CARD_STYLES.map(s => (
                    <button key={s.value} onClick={() => setProfile(p => ({ ...p, card_style: s.value }))}
                      className={profile.card_style === s.value ? 'btn btn-primary' : 'btn btn-ghost'}
                      style={{ fontSize: 12, padding: '8px 16px' }}>{s.label}</button>
                  ))}
                </div>
              </Field>
              <Field label="Options">
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={profile.blur_enabled} onChange={e => setProfile(p => ({ ...p, blur_enabled: e.target.checked }))} style={{ accentColor: '#a855f7' }} />
                    Background blur
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={profile.glow_enabled} onChange={e => setProfile(p => ({ ...p, glow_enabled: e.target.checked }))} style={{ accentColor: '#a855f7' }} />
                    Accent glow
                  </label>
                </div>
              </Field>
            </Section>
          </div>
        )}

        {/* EFFECTS TAB */}
        {activeTab === 'effects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Section title="Font Effect">
              <Field label="Name/Display Text Effect">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {FONT_EFFECTS.map(f => (
                    <button key={f.value} onClick={() => setProfile(p => ({ ...p, font_effect: f.value }))}
                      className={profile.font_effect === f.value ? 'btn btn-primary' : 'btn btn-ghost'}
                      style={{ fontSize: 12, padding: '8px 14px' }}>{f.label}</button>
                  ))}
                </div>
              </Field>
            </Section>
            <Section title="Page Effect">
              <Field label="Ambient Effect">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {PAGE_EFFECTS.map(e => (
                    <button key={e.value} onClick={() => setProfile(p => ({ ...p, page_effect: e.value }))}
                      className={profile.page_effect === e.value ? 'btn btn-primary' : 'btn btn-ghost'}
                      style={{ fontSize: 12, padding: '8px 14px' }}>{e.label}</button>
                  ))}
                </div>
              </Field>
              <Field label="Effect Color">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={profile.effect_color} onChange={e => setProfile(p => ({ ...p, effect_color: e.target.value }))} style={{ width: 44, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input className="input" value={profile.effect_color} onChange={e => setProfile(p => ({ ...p, effect_color: e.target.value }))} />
                </div>
              </Field>
            </Section>
            <Section title="Cursor Effect">
              <Field label="Cursor Style">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CURSOR_EFFECTS.map(c => (
                    <button key={c.value} onClick={() => setProfile(p => ({ ...p, cursor_effect: c.value }))}
                      className={profile.cursor_effect === c.value ? 'btn btn-primary' : 'btn btn-ghost'}
                      style={{ fontSize: 12, padding: '8px 14px' }}>{c.label}</button>
                  ))}
                </div>
              </Field>
            </Section>
          </div>
        )}

        {/* LINKS TAB */}
        {activeTab === 'links' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section title="Custom Links">
              <p style={{ color: '#555', fontSize: 13, marginBottom: 16 }}>Add links to your socials, projects, or anything else.</p>
              {links.map((link, i) => (
                <div key={i} className="glass" style={{ padding: '16px', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input className="input" value={link.icon} onChange={e => updateLink(i, 'icon', e.target.value)} style={{ width: 60, textAlign: 'center', fontSize: 18 }} placeholder="🔗" maxLength={2} />
                    <input className="input" value={link.title} onChange={e => updateLink(i, 'title', e.target.value)} placeholder="Link title" style={{ flex: 1 }} maxLength={128} />
                    <button onClick={() => removeLink(i)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>✕</button>
                  </div>
                  <input className="input" value={link.url} onChange={e => updateLink(i, 'url', e.target.value)} placeholder="https://..." />
                </div>
              ))}
              <button onClick={addLink} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>+ Add link</button>
            </Section>
          </div>
        )}

        {/* MUSIC TAB */}
        {activeTab === 'music' && (
          <Section title="Music Player">
            <p style={{ color: '#555', fontSize: 13, marginBottom: 16 }}>Add a song that plays on your profile. Supports direct MP3 URLs.</p>
            <Field label="Audio URL (direct .mp3 link)">
              <input className="input" value={profile.song_url} onChange={e => setProfile(p => ({ ...p, song_url: e.target.value }))} placeholder="https://example.com/song.mp3" />
            </Field>
            <Field label="Song Title">
              <input className="input" value={profile.song_title} onChange={e => setProfile(p => ({ ...p, song_title: e.target.value }))} placeholder="Song name" maxLength={100} />
            </Field>
            <Field label="Artist">
              <input className="input" value={profile.song_artist} onChange={e => setProfile(p => ({ ...p, song_artist: e.target.value }))} placeholder="Artist name" maxLength={100} />
            </Field>
          </Section>
        )}

        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          <button onClick={save} className="btn btn-primary" disabled={saving} style={{ padding: '12px 32px', fontSize: 14 }}>
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save all changes'}
          </button>
          <Link href={`/${user?.username}`} target="_blank" className="btn btn-ghost" style={{ fontSize: 14, padding: '12px 24px' }}>
            Preview profile ↗
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#888', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: '#777', marginBottom: 6, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}
