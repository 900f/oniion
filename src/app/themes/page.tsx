'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

type Theme = {
  id: string; name: string; description: string;
  preview_color: string; preview_accent: string;
  uses: number; created_at: string;
  username: string; verified: boolean;
  config: { profile?: Record<string, unknown> };
};

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [myThemes, setMyThemes] = useState<Theme[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'popular'|'newest'>('popular');
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [applying, setApplying] = useState<string|null>(null);
  const [appliedMsg, setAppliedMsg] = useState<string|null>(null);
  const [showPublish, setShowPublish] = useState(false);
  const [pubName, setPubName] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [pubbing, setPubbing] = useState(false);
  const [pubMsg, setPubMsg] = useState('');
  const [pubErr, setPubErr] = useState('');
  const [activeTab, setActiveTab] = useState<'browse'|'mine'>('browse');
  const searchRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => setAuthed(!!d.user));
  }, []);

  const loadThemes = (p: number, q: string, s: string) => {
    setLoading(true);
    fetch(`/api/themes?page=${p}&q=${encodeURIComponent(q)}&sort=${s}`)
      .then(r => r.json())
      .then(d => { setThemes(d.themes||[]); setTotal(d.total||0); setLoading(false); });
  };

  const loadMine = () => {
    fetch('/api/themes?sort=mine')
      .then(r => r.json())
      .then(d => setMyThemes(d.themes||[]));
  };

  useEffect(() => { loadThemes(1, '', 'popular'); }, []);

  const onSearch = (v: string) => {
    setSearch(v);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => { setPage(1); loadThemes(1, v, sort); }, 350);
  };

  const applyTheme = async (themeId: string, themeName: string) => {
    if (!authed) { alert('Sign in to apply themes'); return; }
    if (!confirm(`Apply theme "${themeName}"? This will change your visual style but keep your bio, links, and images.`)) return;
    setApplying(themeId);
    const res = await fetch('/api/themes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'apply', themeId }) });
    const d = await res.json();
    setApplying(null);
    if (res.ok) { setAppliedMsg(themeId); setTimeout(() => setAppliedMsg(null), 2500); }
    else alert('Failed: ' + d.error);
  };

  const publishTheme = async () => {
    if (!pubName.trim()) { setPubErr('Name is required'); return; }
    setPubbing(true); setPubErr(''); setPubMsg('');
    const res = await fetch('/api/themes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'publish', name: pubName, description: pubDesc }) });
    const d = await res.json();
    setPubbing(false);
    if (res.ok) { setPubMsg('Theme published!'); setPubName(''); setPubDesc(''); loadMine(); setTimeout(() => { setShowPublish(false); setPubMsg(''); }, 2000); }
    else setPubErr(d.error);
  };

  const deleteTheme = async (themeId: string) => {
    if (!confirm('Delete this theme? It will be removed from the gallery.')) return;
    await fetch('/api/themes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', themeId }) });
    loadMine(); loadThemes(page, search, sort);
  };

  const totalPages = Math.ceil(total / 24);

  const ThemeCard = ({ t, owned }: { t: Theme; owned?: boolean }) => {
    const ac = t.preview_color || '#a855f7';
    const ac2 = t.preview_accent || '#06b6d4';
    const p = t.config?.profile || {};
    return (
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${ac}22`, borderRadius: 16, overflow: 'hidden', transition: 'all .2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${ac}55`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${ac}22`; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}>

        {/* Visual preview */}
        <div style={{ height: 90, position: 'relative', overflow: 'hidden',
          background: (p.background_type as string)==='gradient' ? (p.background_value as string)||`#0a0a0a` :
                      (p.background_type as string)==='color' ? (p.background_value as string)||'#0a0a0a' : '#0a0a0a' }}>
          {/* Fake LED border preview */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${ac}33, ${ac2}22, transparent)` }}/>
          {/* Card preview */}
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', background: `rgba(20,20,40,0.7)`, backdropFilter: 'blur(8px)', borderRadius: '10px 10px 0 0', padding: '8px 12px', border: `1px solid ${ac}33`, borderBottom: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${ac}44`, border: `1.5px solid ${ac}`, flexShrink: 0 }}/>
              <div>
                <div style={{ height: 5, width: 60, background: `${ac}88`, borderRadius: 3, marginBottom: 3 }}/>
                <div style={{ height: 3, width: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}/>
              </div>
            </div>
            {/* Mini link previews */}
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ height: 5, background: `${ac}22`, borderRadius: 3, border: `1px solid ${ac}22` }}/>
              <div style={{ height: 5, background: `${ac}22`, borderRadius: 3, border: `1px solid ${ac}22` }}/>
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#e0e0ff', marginBottom: 2 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: '#444', display: 'flex', alignItems: 'center', gap: 4 }}>
                by <Link href={`/${t.username}`} target="_blank" style={{ color: ac, textDecoration: 'none' }}>@{t.username}</Link>
                {t.verified && <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" fill="#1D4ED8"/><path d="M9 12.75 11.25 15 15 9.75" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
            <span style={{ fontSize: 11, color: '#333', display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Space Mono',monospace", flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {t.uses.toLocaleString()}
            </span>
          </div>
          {t.description && <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{t.description}</p>}

          {/* Color chips */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: ac, boxShadow: `0 0 6px ${ac}88` }} title="Accent"/>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: ac2, boxShadow: `0 0 6px ${ac2}88` }} title="Secondary"/>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: (p.text_color as string)||'#fff', border: '1px solid rgba(255,255,255,0.1)' }} title="Text"/>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: (p.background_value as string)||'#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }} title="Background"/>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => applyTheme(t.id, t.name)}
              disabled={applying === t.id}
              style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: `1px solid ${ac}44`, background: appliedMsg===t.id ? `${ac}22` : `${ac}11`, color: appliedMsg===t.id ? ac : '#888', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, transition: 'all .2s' }}
            >
              {appliedMsg===t.id ? '✓ Applied!' : applying===t.id ? 'Applying…' : 'Apply'}
            </button>
            {owned && (
              <button onClick={() => deleteTheme(t.id)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.07)', color: '#f87171', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e0e0ff', fontFamily: "'Space Grotesk',sans-serif" }}>
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 17 }}><span style={{ color: '#a855f7' }}>oni</span>ion.cc</Link>
        <span style={{ color: '#333', fontSize: 16 }}>/</span>
        <span style={{ color: '#666', fontSize: 14 }}>themes</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Link href="/directory" style={{ color: '#555', fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>Directory</Link>
          <Link href="/dashboard" style={{ background: '#a855f7', color: '#fff', fontSize: 13, padding: '6px 14px', borderRadius: 8, fontWeight: 600 }}>Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Theme Gallery</h1>
            <p style={{ color: '#555', fontSize: 14 }}>{total.toLocaleString()} themes · one-click apply to your profile</p>
          </div>
          {authed && (
            <button onClick={() => { setShowPublish(true); loadMine(); }} style={{ background: '#a855f7', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              + Publish my theme
            </button>
          )}
        </div>

        {/* Publish modal */}
        {showPublish && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setShowPublish(false); }}>
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '28px 24px', maxWidth: 460, width: '100%' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Publish theme</h2>
              <p style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>Your current visual style will be saved as a theme others can apply. Bio, links, and images are not included.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 5 }}>Theme name *</label>
                  <input value={pubName} onChange={e => setPubName(e.target.value)} placeholder="e.g. Dark Teal Minimal" maxLength={64} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9, padding: '9px 13px', color: '#e0e0ff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}/>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 5 }}>Description (optional)</label>
                  <input value={pubDesc} onChange={e => setPubDesc(e.target.value)} placeholder="Describe the vibe…" maxLength={256} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9, padding: '9px 13px', color: '#e0e0ff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}/>
                </div>
              </div>
              {pubErr && <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(239,68,68,0.08)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>{pubErr}</div>}
              {pubMsg && <div style={{ fontSize: 12, color: '#4ade80', background: 'rgba(74,222,128,0.08)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>{pubMsg}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={publishTheme} disabled={pubbing} style={{ flex: 1, background: '#a855f7', color: '#fff', border: 'none', borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {pubbing ? 'Publishing…' : 'Publish'}
                </button>
                <button onClick={() => setShowPublish(false)} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9, color: '#888', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                  Cancel
                </button>
              </div>

              {/* My themes list */}
              {myThemes.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 10, fontWeight: 600 }}>YOUR THEMES ({myThemes.length}/10)</div>
                  {myThemes.map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div>
                        <div style={{ fontSize: 13, color: '#ccc' }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: '#333' }}>{t.uses} uses</div>
                      </div>
                      <button onClick={() => deleteTheme(t.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11 }}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {(['browse', 'mine'] as const).map(t => (
            <button key={t} onClick={() => { setActiveTab(t); if (t === 'mine') { loadMine(); } else { loadThemes(page, search, sort); } }} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${activeTab===t?'rgba(168,85,247,0.3)':'rgba(255,255,255,0.06)'}`, background: activeTab===t?'rgba(168,85,247,0.1)':'rgba(255,255,255,0.03)', color: activeTab===t?'#c084fc':'#555', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: activeTab===t?600:400 }}>
              {t === 'browse' ? 'Browse' : 'My themes'}
            </button>
          ))}
        </div>

        {activeTab === 'browse' && <>
          {/* Search + sort */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search themes…" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px 10px 40px', color: '#e0e0ff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}/>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['popular','newest'] as const).map(s => (
                <button key={s} onClick={() => { setSort(s); setPage(1); loadThemes(1, search, s); }} style={{ padding: '9px 14px', borderRadius: 9, border: `1px solid ${sort===s?'rgba(168,85,247,0.3)':'rgba(255,255,255,0.07)'}`, background: sort===s?'rgba(168,85,247,0.1)':'rgba(255,255,255,0.03)', color: sort===s?'#c084fc':'#666', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', textTransform: 'capitalize' as const }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 24, height: 24, border: '2px solid rgba(168,85,247,.3)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin .8s linear infinite' }}/>
            </div>
          ) : themes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: '#444' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>◎</div>
              <div style={{ fontSize: 16 }}>No themes yet</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Be the first to publish one!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {themes.map(t => <ThemeCard key={t.id} t={t}/>)}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40 }}>
              {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => { setPage(p); loadThemes(p, search, sort); window.scrollTo(0,0); }} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${page===p?'#a855f7':'rgba(255,255,255,0.08)'}`, background: page===p?'rgba(168,85,247,0.15)':'rgba(255,255,255,0.03)', color: page===p?'#c084fc':'#555', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>}

        {activeTab === 'mine' && (
          <div>
            {!authed ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <p style={{ color: '#555', marginBottom: 16 }}>Sign in to manage your themes</p>
                <Link href="/login" style={{ background: '#a855f7', color: '#fff', padding: '9px 20px', borderRadius: 10, fontWeight: 600 }}>Sign in</Link>
              </div>
            ) : myThemes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#444' }}>
                <div style={{ fontSize: 13, marginBottom: 16 }}>You haven&apos;t published any themes yet.</div>
                <button onClick={() => setShowPublish(true)} style={{ background: '#a855f7', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Publish my current style</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {myThemes.map(t => <ThemeCard key={t.id} t={t} owned/>)}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{scrollbar-width:none;} *::-webkit-scrollbar{display:none;}`}</style>
    </div>
  );
}
