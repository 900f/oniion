'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { IconMusic, IconSparkles, IconFont, IconLink, IconEye, IconImage } from '@/components/icons';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.35 + 0.05,
      });
    }

    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,85,247,${p.alpha})`;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168,85,247,${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  const features = [
    { icon: <IconMusic size={15} color="currentColor" />, label: 'Music player' },
    { icon: <IconSparkles size={15} color="currentColor" />, label: 'Page effects' },
    { icon: <IconFont size={15} color="currentColor" />, label: 'Custom fonts' },
    { icon: <IconLink size={15} color="currentColor" />, label: 'Custom links' },
    { icon: <IconEye size={15} color="currentColor" />, label: 'View counter' },
    { icon: <IconImage size={15} color="currentColor" />, label: 'Full theming' },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#0a0a0a' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* Purple glow orb behind hero */}
      <div style={{ position: 'fixed', top: '25%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(120,40,200,0.18) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>
          <span style={{ color: '#a855f7' }}>oni</span><span style={{ color: '#fff' }}>ion.cc</span>
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login" style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontFamily: "'Space Grotesk',sans-serif" }}>
            Log in
          </Link>
          <Link href="/register" style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#a855f7', border: 'none', borderRadius: 8, fontFamily: "'Space Grotesk',sans-serif" }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '80px 24px 60px', textAlign: 'center' }}>

        {/* Pill badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#c084fc', marginBottom: 36, fontWeight: 500, letterSpacing: '0.03em', fontFamily: "'Space Grotesk',sans-serif" }}>
          <IconSparkles size={11} color="#c084fc" /> your bio. your vibe.
        </div>

        {/* Headline — matches screenshot exactly */}
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(56px, 9vw, 96px)', lineHeight: 1, letterSpacing: '-4px', marginBottom: 24, color: '#fff' }}>
          One link.
        </h1>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(56px, 9vw, 96px)', lineHeight: 1, letterSpacing: '-4px', marginBottom: 32, background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Infinite you.
        </h1>

        {/* Subtext */}
        <p style={{ fontSize: 16, color: '#666', lineHeight: 1.7, marginBottom: 40, maxWidth: 460, fontFamily: "'Space Grotesk',sans-serif" }}>
          Build a stunning bio page at <strong style={{ color: '#999', fontWeight: 600 }}>oniion.cc/yourname</strong>. Custom effects, music, fonts, and more.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ padding: '13px 32px', fontSize: 15, fontWeight: 700, color: '#fff', background: '#a855f7', border: 'none', borderRadius: 10, fontFamily: "'Space Grotesk',sans-serif", display: 'inline-block' }}>
            Create your page →
          </Link>
          <Link href="/login" style={{ padding: '13px 28px', fontSize: 15, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontFamily: "'Space Grotesk',sans-serif", display: 'inline-block' }}>
            Sign in
          </Link>
        </div>

        {/* Feature pills with SVG icons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 60 }}>
          {features.map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100, padding: '8px 14px', fontSize: 13, color: '#666', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500 }}>
              <span style={{ color: '#a855f7', display: 'flex', alignItems: 'center' }}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
