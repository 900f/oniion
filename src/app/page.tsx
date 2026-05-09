export const dynamic = 'force-dynamic';
'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { IconArrowRight, IconEye, IconMusic, IconSparkles, IconLink, IconFont, IconZap } from '@/components/icons';

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
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.3 + 0.05,
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
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168,85,247,${0.04 * (1 - dist / 100)})`;
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
    { icon: <IconMusic size={16} />, label: 'Music player' },
    { icon: <IconSparkles size={16} />, label: 'Page effects' },
    { icon: <IconFont size={16} />, label: 'Custom fonts' },
    { icon: <IconLink size={16} />, label: 'Custom links' },
    { icon: <IconEye size={16} />, label: 'View counter' },
    { icon: <IconZap size={16} />, label: 'Animations' },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* Soft orb */}
      <div style={{ position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(168,85,247,0.07) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(6,6,8,0.8)', backdropFilter: 'blur(16px)' }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, letterSpacing: '-0.3px' }}>
          <span style={{ color: '#a855f7' }}>oni</span>ion
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/login" className="btn btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }}>Log in</Link>
          <Link href="/register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#b47fea', marginBottom: 40, fontWeight: 500, letterSpacing: '0.02em' }}>
          <IconSparkles size={12} /> your bio, your way
        </div>

        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(52px, 10vw, 104px)', lineHeight: 0.95, letterSpacing: '-3px', marginBottom: 28, color: '#f5f0ff', maxWidth: 700 }}>
          One link.<br />
          <span style={{ color: '#c084fc', fontStyle: 'italic' }}>Infinite you.</span>
        </h1>

        <p style={{ fontSize: 16, color: '#555', lineHeight: 1.7, marginBottom: 44, maxWidth: 420 }}>
          Build a beautiful bio page at <span style={{ color: '#888' }}>oniion.cc/yourname</span> — music, effects, custom fonts, and more.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14, borderRadius: 12, gap: 8 }}>
            Create your page <IconArrowRight size={15} />
          </Link>
          <Link href="/login" className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 12 }}>
            Sign in
          </Link>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 64, maxWidth: 480 }}>
          {features.map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 100, padding: '6px 12px', fontSize: 12, color: '#555' }}>
              <span style={{ color: '#a855f7' }}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
