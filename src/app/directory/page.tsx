'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

type Profile = {
  username: string; verified: boolean; display_id: number;
  display_name: string; avatar_url: string; bio: string;
  accent_color: string; badge_text: string; badge_color: string;
  total_views: number;
};

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  const load = (p: number, q: string) => {
    setLoading(true);
    fetch(`/api/directory?page=${p}&q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setProfiles(d.profiles||[]); setTotal(d.total||0); setLoading(false); });
  };

  useEffect(() => { load(1, ''); }, []);

  const onSearch = (v: string) => {
    setSearch(v);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => { setPage(1); load(1, v); }, 350);
  };

  const totalPages = Math.ceil(total / 24);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e0e0ff', fontFamily: "'Space Grotesk',sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 17 }}><span style={{ color: '#a855f7' }}>oni</span>ion.cc</Link>
        <span style={{ color: '#333', fontSize: 16 }}>/</span>
        <span style={{ color: '#666', fontSize: 14 }}>directory</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Link href="/themes" style={{ color: '#555', fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>Themes</Link>
          <Link href="/dashboard" style={{ background: '#a855f7', color: '#fff', fontSize: 13, padding: '6px 14px', borderRadius: 8, fontWeight: 600 }}>Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 8 }}>
            Profile Directory
          </h1>
          <p style={{ color: '#555', fontSize: 14 }}>{total.toLocaleString()} profiles listed</p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 32, position: 'relative', maxWidth: 420 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search profiles…"
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '11px 14px 11px 42px', color: '#e0e0ff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 24, height: 24, border: '2px solid rgba(168,85,247,.3)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin .8s linear infinite' }}/>
          </div>
        ) : profiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#444' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◎</div>
            <div style={{ fontSize: 16 }}>No profiles found</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {profiles.map(p => {
              const ac = p.accent_color || '#a855f7';
              return (
                <Link key={p.username} href={`/${p.username}`} target="_blank" style={{ display: 'block', textDecoration: 'none' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${ac}22`, borderRadius: 16, padding: '20px 18px', transition: 'all .2s', cursor: 'pointer' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `${ac}10`; (e.currentTarget as HTMLDivElement).style.borderColor = `${ac}55`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLDivElement).style.borderColor = `${ac}22`; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      {/* Avatar */}
                      <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${ac}44`, flexShrink: 0, background: `${ac}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontFamily: "'Orbitron',sans-serif", color: ac }}>
                        {p.avatar_url
                          ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                          : (p.display_name||p.username)?.[0]?.toUpperCase()
                        }
                      </div>
                      <div style={{ minWidth: 0 }}>
                        {/* Name + verified */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#e0e0ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.display_name || p.username}
                          </span>
                          {p.verified && (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-.612 3.73 3.745 3.745 0 0 1-3.73.612A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.73-.612 3.745 3.745 0 0 1-.612-3.73A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 .612-3.73 3.745 3.745 0 0 1 3.73-.612A3.745 3.745 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.73.612 3.746 3.746 0 0 1 .612 3.73A3.745 3.745 0 0 1 21 12z" fill="#1D4ED8" stroke="#3B82F6" strokeWidth="1.5"/>
                              <path d="M9 12.75 11.25 15 15 9.75" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#444' }}>@{p.username}</div>
                      </div>
                    </div>

                    {/* Badge */}
                    {p.badge_text && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ background: `${p.badge_color||ac}18`, border: `1px solid ${p.badge_color||ac}44`, color: p.badge_color||ac, borderRadius: 100, padding: '2px 9px', fontSize: 11, fontWeight: 600 }}>
                          {p.badge_text}
                        </span>
                      </div>
                    )}

                    {/* Bio */}
                    {p.bio && (
                      <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                        {p.bio}
                      </p>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: 11, color: '#333', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Space Mono',monospace" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        {Number(p.total_views||0).toLocaleString()}
                      </span>
                      {p.display_id && <span style={{ fontSize: 10, color: '#2a2a2a', fontFamily: "'Space Mono',monospace" }}>#{p.display_id}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40 }}>
            {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); load(p, search); window.scrollTo(0,0); }} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${page===p?'#a855f7':'rgba(255,255,255,0.08)'}`, background: page===p?'rgba(168,85,247,0.15)':'rgba(255,255,255,0.03)', color: page===p?'#c084fc':'#555', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: page===p?600:400 }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{scrollbar-width:none;} *::-webkit-scrollbar{display:none;}`}</style>
    </div>
  );
}
