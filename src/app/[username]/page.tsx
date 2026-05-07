'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type ProfileData = {
  username: string;
  userId: string;
  views: number;
  profile: {
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
  };
  links: { id: string; title: string; url: string; icon: string }[];
};

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [data, setData] = useState<ProfileData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [views, setViews] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    fetch(`/api/profile/${username}`).then(r => {
      if (r.status === 404) { setNotFound(true); return null; }
      return r.json();
    }).then(d => {
      if (!d) return;
      setData(d);
      setViews(d.views);
      // Record view
      fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: d.userId }),
      }).then(r => r.json()).then(v => {
        if (v.views) setViews(v.views);
      });
    });
  }, [username]);

  // Cursor effect
  useEffect(() => {
    if (!data?.profile?.cursor_effect || data.profile.cursor_effect === 'none') return;
    const effect = data.profile.cursor_effect;
    const accent = data.profile.accent_color || '#a855f7';
    const particles: HTMLDivElement[] = [];

    const onMove = (e: MouseEvent) => {
      if (effect === 'trail') {
        const p = document.createElement('div');
        p.style.cssText = `position:fixed;pointer-events:none;z-index:9999;width:6px;height:6px;border-radius:50%;background:${accent};left:${e.clientX - 3}px;top:${e.clientY - 3}px;opacity:0.8;transition:opacity 0.5s;`;
        document.body.appendChild(p);
        particles.push(p);
        setTimeout(() => { p.style.opacity = '0'; setTimeout(() => p.remove(), 500); }, 50);
      } else if (effect === 'ring') {
        const cursor = document.getElementById('custom-cursor');
        if (cursor) { cursor.style.left = e.clientX - 16 + 'px'; cursor.style.top = e.clientY - 16 + 'px'; }
      } else if (effect === 'dot') {
        const cursor = document.getElementById('custom-cursor');
        if (cursor) { cursor.style.left = e.clientX - 4 + 'px'; cursor.style.top = e.clientY - 4 + 'px'; }
      }
    };

    if (effect === 'ring') {
      const el = document.createElement('div');
      el.id = 'custom-cursor';
      el.style.cssText = `position:fixed;pointer-events:none;z-index:9999;width:32px;height:32px;border-radius:50%;border:2px solid ${accent};transition:left 0.05s,top 0.05s;`;
      document.body.appendChild(el);
      document.body.style.cursor = 'none';
    } else if (effect === 'dot') {
      const el = document.createElement('div');
      el.id = 'custom-cursor';
      el.style.cssText = `position:fixed;pointer-events:none;z-index:9999;width:8px;height:8px;border-radius:50%;background:${accent};transition:left 0.02s,top 0.02s;`;
      document.body.appendChild(el);
      document.body.style.cursor = 'none';
    }

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.getElementById('custom-cursor')?.remove();
      document.body.style.cursor = '';
      particles.forEach(p => p.remove());
    };
  }, [data]);

  // Page particles effect
  useEffect(() => {
    if (!data?.profile?.page_effect || data.profile.page_effect === 'none') return;
    const effect = data.profile.page_effect;
    const color = data.profile.effect_color || '#a855f7';
    const container = document.getElementById('particle-container');
    if (!container) return;

    const spawn = () => {
      const el = document.createElement('div');
      const x = Math.random() * window.innerWidth;
      const duration = 4 + Math.random() * 6;
      const delay = Math.random() * 2;
      const size = 4 + Math.random() * 8;

      el.style.cssText = `position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;`;

      if (effect === 'snow') {
        el.style.cssText += `width:${size}px;height:${size}px;border-radius:50%;background:white;opacity:${0.4 + Math.random() * 0.6};animation:snowfall ${duration}s ${delay}s linear infinite;`;
      } else if (effect === 'rain') {
        el.style.cssText += `width:1px;height:${10 + Math.random() * 15}px;background:linear-gradient(transparent,${color}88);animation:rain ${1 + Math.random() * 1.5}s ${delay}s linear infinite;`;
      } else if (effect === 'sakura') {
        el.textContent = ['🌸', '🌺', '🌹'][Math.floor(Math.random() * 3)];
        el.style.cssText += `font-size:${size}px;animation:sakura-fall ${duration}s ${delay}s linear infinite;`;
      } else if (effect === 'bubbles') {
        const s2 = 10 + Math.random() * 30;
        el.style.cssText = `position:fixed;pointer-events:none;z-index:1;left:${x}px;bottom:-50px;width:${s2}px;height:${s2}px;border-radius:50%;border:1px solid ${color}44;animation:bubble-rise ${duration}s ${delay}s linear infinite;`;
      } else if (effect === 'fireflies') {
        el.style.cssText += `width:4px;height:4px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color};animation:snowfall ${duration}s ${delay}s ease-in-out infinite;opacity:${Math.random()};`;
      } else if (effect === 'matrix') {
        el.textContent = String.fromCharCode(0x30A0 + Math.random() * 96);
        el.style.cssText += `font-family:monospace;color:${color};font-size:14px;opacity:0.7;animation:rain ${1 + Math.random() * 2}s ${delay}s linear infinite;`;
      }

      container.appendChild(el);
      const t = setTimeout(() => el.remove(), (duration + delay) * 1000 + 1000);
      particlesRef.current.push(t as unknown as ReturnType<typeof setTimeout>);
    };

    const count = effect === 'rain' || effect === 'matrix' ? 80 : 40;
    for (let i = 0; i < count; i++) {
      setTimeout(spawn, i * 100);
    }
    const interval = setInterval(spawn, effect === 'rain' || effect === 'matrix' ? 100 : 300);

    return () => {
      clearInterval(interval);
      particlesRef.current.forEach(clearTimeout);
      if (container) container.innerHTML = '';
    };
  }, [data]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🧅</div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24 }}>Profile not found</h1>
      <p style={{ color: '#555', fontSize: 14 }}>oniion.cc/{username} doesn&apos;t exist yet.</p>
      <Link href="/register" className="btn btn-primary">Create this profile</Link>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#333', fontSize: 14 }}>Loading...</div>
    </div>
  );

  const p = data.profile;
  const fontImport = `https://fonts.googleapis.com/css2?family=${p.font_family?.replace(/ /g, '+')}:wght@400;700&display=swap`;

  const getBg = () => {
    if (p.background_type === 'color') return p.background_value || '#0a0a0a';
    if (p.background_type === 'gradient') return p.background_value || '#0a0a0a';
    if (p.background_type === 'image') return `url(${p.background_value}) center/cover no-repeat`;
    return '#0a0a0a';
  };

  const cardClass = `card-${p.card_style || 'glass'}`;
  const isCenter = p.layout !== 'left';
  const accent = p.accent_color || '#a855f7';
  const textColor = p.text_color || '#ffffff';

  return (
    <>
      <link rel="stylesheet" href={fontImport} />
      <div id="particle-container" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }} />

      <div style={{
        minHeight: '100vh',
        background: getBg(),
        fontFamily: `'${p.font_family || 'Space Grotesk'}', sans-serif`,
        color: textColor,
        position: 'relative',
        overflowX: 'hidden',
      }}>
        {/* Glow overlay */}
        {p.glow_enabled && (
          <div style={{ position: 'fixed', inset: 0, background: `radial-gradient(ellipse at 50% 20%, ${accent}22 0%, transparent 60%)`, pointerEvents: 'none', zIndex: 0 }} />
        )}

        {/* Audio */}
        {p.song_url && (
          <audio ref={audioRef} src={p.song_url} loop preload="none" />
        )}

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 640, margin: '0 auto', padding: '60px 20px 80px' }}>

          {/* Banner */}
          <div style={{
            height: 160,
            borderRadius: '20px 20px 0 0',
            background: p.banner_url ? `url(${p.banner_url}) center/cover` : p.banner_color || '#0d0d0d',
            marginBottom: -50,
            position: 'relative',
          }}>
            {p.blur_enabled && <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(2px)', borderRadius: '20px 20px 0 0' }} />}
          </div>

          {/* Profile card */}
          <div className={cardClass} style={{ borderRadius: '0 0 20px 20px', padding: '60px 32px 32px', textAlign: isCenter ? 'center' : 'left' }}>

            {/* Avatar */}
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              border: `3px solid ${accent}`,
              overflow: 'hidden',
              margin: isCenter ? '-80px auto 16px' : '-80px 0 16px',
              background: '#111',
              boxShadow: p.glow_enabled ? `0 0 24px ${accent}66` : 'none',
              flexShrink: 0,
            }}>
              {p.avatar_url
                ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, background: `${accent}22` }}>
                    {(p.display_name || data.username)?.[0]?.toUpperCase() || '?'}
                  </div>
              }
            </div>

            {/* Name + badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCenter ? 'center' : 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 className={p.font_effect !== 'none' ? `font-effect-${p.font_effect}` : ''}
                style={{
                  fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px',
                  color: textColor,
                  '--accent': accent,
                } as React.CSSProperties}>
                {p.display_name || data.username}
              </h1>
              {p.badge_text && (
                <span style={{
                  background: `${p.badge_color || accent}22`,
                  border: `1px solid ${p.badge_color || accent}66`,
                  color: p.badge_color || accent,
                  borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600,
                }}>
                  {p.badge_text}
                </span>
              )}
            </div>

            {/* Username */}
            <div style={{ fontSize: 13, color: `${textColor}66`, marginBottom: 16 }}>@{data.username}</div>

            {/* Bio */}
            {p.bio && (
              <p style={{ fontSize: 15, lineHeight: 1.7, color: `${textColor}cc`, maxWidth: 420, margin: isCenter ? '0 auto 24px' : '0 0 24px', whiteSpace: 'pre-wrap' }}>
                {p.bio}
              </p>
            )}

            {/* Music player */}
            {p.song_url && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: `${accent}12`, border: `1px solid ${accent}33`,
                borderRadius: 12, padding: '10px 16px', marginBottom: 24,
                justifyContent: isCenter ? 'center' : 'flex-start',
              }}>
                <button onClick={toggleMusic} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: accent, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: '#fff', flexShrink: 0,
                }}>
                  {playing ? '⏸' : '▶'}
                </button>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: textColor }}>{p.song_title || 'Now playing'}</div>
                  {p.song_artist && <div style={{ fontSize: 11, color: `${textColor}77` }}>{p.song_artist}</div>}
                </div>
                {playing && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        width: 3, background: accent, borderRadius: 2,
                        animation: `float ${0.4 + i * 0.1}s ease-in-out infinite`,
                        height: `${6 + Math.random() * 10}px`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Links */}
            {data.links.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {data.links.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 18px', borderRadius: 12, cursor: 'pointer',
                      background: `${accent}10`, border: `1px solid ${accent}25`,
                      color: textColor, transition: 'all 0.2s', fontWeight: 500, fontSize: 14,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = `${accent}22`;
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = `${accent}10`;
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{link.icon}</span>
                    <span>{link.title}</span>
                    <span style={{ marginLeft: 'auto', color: `${textColor}44`, fontSize: 12 }}>↗</span>
                  </a>
                ))}
              </div>
            )}

            {/* Views + footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCenter ? 'center' : 'flex-start', gap: 16, paddingTop: 16, borderTop: `1px solid ${textColor}10` }}>
              <span style={{ fontSize: 12, color: `${textColor}44` }}>
                👁 {views.toLocaleString()} views
              </span>
              <Link href="/" style={{ fontSize: 12, color: `${textColor}33`, marginLeft: 'auto' }}>
                oniion.cc
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
