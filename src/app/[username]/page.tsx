'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { IconEye, IconHash, IconPlay, IconPause, IconExternalLink, IconCheck } from '@/components/icons';
import { SocialIcons, detectSocialIcon } from '@/components/social-icons';

const CRYPTO_SYMBOLS: Record<string, string> = {
  eth:'Ξ',btc:'₿',sol:'◎',usdt:'₮',bnb:'⬡',xrp:'✕',ltc:'Ł',doge:'Ð',ada:'₳',avax:'△',matic:'⬡',trx:'◆',
};
const CRYPTO_NAMES: Record<string, string> = {
  eth:'Ethereum',btc:'Bitcoin',sol:'Solana',usdt:'Tether',bnb:'BNB',
  xrp:'XRP',ltc:'Litecoin',doge:'Dogecoin',ada:'Cardano',avax:'Avalanche',matic:'Polygon',trx:'TRON',
};

function ensureUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
  return 'https://' + url;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return isNaN(r) ? '168,85,247' : `${r},${g},${b}`;
}

type ProfileData = {
  username: string; userId: string; views: number; displayId: number;
  profile: {
    display_name: string; bio: string; avatar_url: string;
    banner_url: string; banner_color: string;
    background_image_url: string; card_image_url: string;
    song_url: string; song_title: string; song_artist: string;
    background_type: string; background_value: string;
    text_color: string; accent_color: string; font_family: string;
    font_effect: string; page_effect: string; effect_color: string;
    layout: string; card_position: string;
    blur_enabled: boolean; glow_enabled: boolean;
    badge_text: string; badge_color: string;
    cursor_effect: string; card_style: string;
    custom_font_url: string; custom_font_name: string;
  };
  links: { id: string; title: string; url: string; icon: string; link_type: string }[];
};

function CopyWallet({ address, accent, text }: { address: string; accent: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{
      background: copied ? `${accent}20` : `${accent}0d`,
      border: `1px solid ${accent}${copied ? '55' : '22'}`,
      borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 6,
      color: text, fontSize: 11, fontFamily: 'monospace',
      transition: 'all 0.2s', marginLeft: 'auto', flexShrink: 0,
      whiteSpace: 'nowrap',
    }}>
      {copied ? <IconCheck size={11} color={accent}/> : null}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function ProfilePage() {
  const { username } = useParams() as { username: string };
  const [data, setData] = useState<ProfileData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [views, setViews] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch(`/api/profile/${username}`).then(r => {
      if (r.status === 404) { setNotFound(true); return null; }
      return r.json();
    }).then(d => {
      if (!d) return;
      setData(d);
      setViews(Number(d.views));
      fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: d.userId }),
      }).then(r => r.json()).then(v => { if (v.views != null) setViews(Number(v.views)); });
    });
  }, [username]);

  // Particle canvas
  useEffect(() => {
    if (!data) return;
    const p = data.profile;
    const need = p.background_type === 'particles' || p.page_effect === 'particles';
    if (!need) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    const accent = p.effect_color || p.accent_color || '#a855f7';
    const pts: {x:number;y:number;vx:number;vy:number;sz:number;a:number}[] = [];
    for (let i=0;i<55;i++) pts.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,sz:Math.random()*1.4+.3,a:Math.random()*.3+.05});
    let id: number;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(pt => {
        pt.x+=pt.vx; pt.y+=pt.vy;
        if(pt.x<0)pt.x=canvas.width; if(pt.x>canvas.width)pt.x=0;
        if(pt.y<0)pt.y=canvas.height; if(pt.y>canvas.height)pt.y=0;
        ctx.beginPath(); ctx.arc(pt.x,pt.y,pt.sz,0,Math.PI*2);
        ctx.fillStyle=`rgba(${hexToRgb(accent)},${pt.a})`; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<110){ctx.beginPath();ctx.strokeStyle=`rgba(${hexToRgb(accent)},${.06*(1-d/110)})`;ctx.lineWidth=.5;ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();}
      }
      id=requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize',resize);
    return ()=>{cancelAnimationFrame(id);window.removeEventListener('resize',resize);};
  }, [data]);

  // DOM particle effects
  useEffect(() => {
    if (!data?.profile?.page_effect || ['none','particles'].includes(data.profile.page_effect)) return;
    const effect = data.profile.page_effect;
    const color = data.profile.effect_color || '#a855f7';
    const container = document.getElementById('fx'); if (!container) return;
    const spawn = () => {
      const el = document.createElement('div');
      const x = Math.random()*window.innerWidth;
      const dur = 4+Math.random()*6, delay = Math.random()*2, sz = 4+Math.random()*8;
      if (effect==='snow') el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;width:${sz}px;height:${sz}px;border-radius:50%;background:rgba(255,255,255,.75);animation:snowfall ${dur}s ${delay}s linear infinite;`;
      else if (effect==='rain') el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;width:1px;height:${12+Math.random()*12}px;background:linear-gradient(transparent,${color}99);animation:rain ${1+Math.random()}s ${delay}s linear infinite;`;
      else if (effect==='sakura'){el.textContent=['🌸','🌺','🌼'][Math.floor(Math.random()*3)];el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;font-size:${sz}px;animation:sakura-fall ${dur}s ${delay}s linear infinite;`;}
      else if (effect==='bubbles'){const s2=10+Math.random()*28;el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;bottom:-50px;width:${s2}px;height:${s2}px;border-radius:50%;border:1px solid ${color}55;animation:bubble-rise ${dur}s ${delay}s linear infinite;`;}
      else if (effect==='fireflies') el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:${Math.random()*100}vh;width:4px;height:4px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};opacity:${Math.random()};animation:snowfall ${dur}s ${delay}s ease-in-out infinite;`;
      else if (effect==='matrix'){el.textContent=String.fromCharCode(0x30A0+Math.random()*96);el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;font-family:monospace;color:${color};font-size:13px;opacity:.65;animation:rain ${1+Math.random()*2}s ${delay}s linear infinite;`;}
      container.appendChild(el);
      setTimeout(()=>el.remove(),(dur+delay)*1000+500);
    };
    const count=(effect==='rain'||effect==='matrix')?70:35;
    for(let i=0;i<count;i++) setTimeout(spawn,i*120);
    const iv=setInterval(spawn,(effect==='rain'||effect==='matrix')?130:340);
    return ()=>{clearInterval(iv);if(container)container.innerHTML='';};
  }, [data]);

  // Cursor effects
  useEffect(() => {
    if (!data?.profile?.cursor_effect || data.profile.cursor_effect==='none') return;
    const effect = data.profile.cursor_effect;
    const accent = data.profile.accent_color || '#a855f7';
    const onMove = (e: MouseEvent) => {
      if (effect==='trail') {
        const dot=document.createElement('div');
        dot.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:5px;height:5px;border-radius:50%;background:${accent};left:${e.clientX-2.5}px;top:${e.clientY-2.5}px;opacity:.9;transition:opacity .4s,transform .4s;`;
        document.body.appendChild(dot);
        requestAnimationFrame(()=>{dot.style.opacity='0';dot.style.transform='scale(2)';});
        setTimeout(()=>dot.remove(),450);
      } else if (effect==='bubble') {
        if(Math.random()>.3) return;
        const b=document.createElement('div');
        const s=6+Math.random()*14;
        b.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:${s}px;height:${s}px;border-radius:50%;border:1px solid ${accent}88;left:${e.clientX-s/2}px;top:${e.clientY-s/2}px;opacity:.8;transition:all .6s;`;
        document.body.appendChild(b);
        requestAnimationFrame(()=>{b.style.opacity='0';b.style.transform=`translateY(-${10+Math.random()*20}px) scale(.5)`;});
        setTimeout(()=>b.remove(),650);
      } else {
        const c=document.getElementById('_cur');
        if(c){c.style.left=(e.clientX-(effect==='ring'?16:effect==='crosshair'?12:4))+'px';c.style.top=(e.clientY-(effect==='ring'?16:effect==='crosshair'?12:4))+'px';}
      }
    };
    let el: HTMLDivElement|null=null;
    if(effect==='ring'){el=document.createElement('div');el.id='_cur';el.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:32px;height:32px;border-radius:50%;border:1.5px solid ${accent};transition:left .06s,top .06s;`;document.body.appendChild(el);document.body.style.cursor='none';}
    else if(effect==='dot'){el=document.createElement('div');el.id='_cur';el.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:8px;height:8px;border-radius:50%;background:${accent};transition:left .03s,top .03s;`;document.body.appendChild(el);document.body.style.cursor='none';}
    else if(effect==='crosshair'){el=document.createElement('div');el.id='_cur';el.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:24px;height:24px;transition:left .03s,top .03s;`;el.innerHTML=`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="1.5"><line x1="12" y1="0" x2="12" y2="24"/><line x1="0" y1="12" x2="24" y2="12"/><circle cx="12" cy="12" r="4"/></svg>`;document.body.appendChild(el);document.body.style.cursor='none';}
    window.addEventListener('mousemove',onMove);
    return ()=>{window.removeEventListener('mousemove',onMove);document.getElementById('_cur')?.remove();document.body.style.cursor='';};
  }, [data]);

  const toggleMusic = () => {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else a.play().then(()=>setPlaying(true)).catch(()=>{});
  };

  if (notFound) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14,padding:20}}>
      <div style={{fontSize:40,fontFamily:"'Instrument Serif',serif"}}>◎</div>
      <h1 style={{fontFamily:"'Instrument Serif',serif",fontSize:22}}>Not found</h1>
      <p style={{color:'#555',fontSize:13,textAlign:'center'}}>oniion.cc/{username} doesn&apos;t exist yet.</p>
      <Link href="/register" className="btn btn-primary">Claim it free</Link>
    </div>
  );

  if (!data) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:20,height:20,border:'2px solid rgba(168,85,247,.3)',borderTopColor:'#a855f7',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const p = data.profile;
  const isCustomFont = p.font_family==='__custom__' && p.custom_font_url;
  const fontFamily = isCustomFont ? '__custom__' : (p.font_family || 'Geist');
  const accent = p.accent_color || '#a855f7';
  const text = p.text_color || '#ffffff';
  const isCenter = p.layout !== 'left';
  const cardClass = `card-${p.card_style||'glass'}`;
  const isMiddle = p.card_position === 'middle';

  const ytId = p.song_url ? getYouTubeId(p.song_url) : null;
  const isYT = !!ytId;

  const getBgStyle = (): React.CSSProperties => {
    if (p.background_type==='color') return {background:p.background_value||'#0a0a0a'};
    if (p.background_type==='gradient') return {background:p.background_value||'#0a0a0a'};
    if (p.background_type==='image') return {backgroundImage:`url(${p.background_value})`,backgroundSize:'cover',backgroundPosition:'center',backgroundAttachment:'fixed'};
    if (p.background_type==='particles') return {background:'#08080f'};
    return {background:'#0a0a0a'};
  };

  return (
    <>
      {!isCustomFont && p.font_family && p.font_family !== 'Geist' && (
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${p.font_family.replace(/ /g,'+')}:wght@400;700&display=swap`}/>
      )}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"/>
      {isCustomFont && (
        <style>{`@font-face{font-family:'__custom__';src:url('${p.custom_font_url}') format('${p.custom_font_url.endsWith('.woff2')?'woff2':p.custom_font_url.endsWith('.woff')?'woff':p.custom_font_url.endsWith('.otf')?'opentype':'truetype'}');font-weight:100 900;font-display:swap;}`}</style>
      )}
      <style>{`*{scrollbar-width:none;-ms-overflow-style:none;}*::-webkit-scrollbar{display:none;}@keyframes spin{to{transform:rotate(360deg)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes snowfall{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(360deg);opacity:0}}@keyframes rain{0%{transform:translateY(-10px);opacity:1}100%{transform:translateY(100vh);opacity:0}}@keyframes sakura-fall{0%{transform:translateY(-20px) rotate(0) translateX(0);opacity:1}50%{transform:translateY(50vh) rotate(180deg) translateX(30px)}100%{transform:translateY(100vh) rotate(360deg) translateX(-20px);opacity:0}}@keyframes bubble-rise{0%{transform:translateY(100vh) scale(0);opacity:0}50%{opacity:.6}100%{transform:translateY(-10px) scale(1);opacity:0}}`}</style>

      {/* Particles canvas */}
      {(p.background_type==='particles'||p.page_effect==='particles') && (
        <canvas ref={canvasRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>
      )}
      <div id="fx" style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:1,overflow:'hidden'}}/>

      {/* YouTube hidden iframe for audio */}
      {isYT && (
        <div style={{position:'fixed',width:1,height:1,overflow:'hidden',opacity:0,pointerEvents:'none',zIndex:-1}}>
          <iframe
            ref={iframeRef}
            id="yt-player"
            src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&autoplay=0&controls=0&rel=0`}
            allow="autoplay"
            style={{width:1,height:1}}
            title="audio"
          />
        </div>
      )}
      {isYT && !playing && (
        <script dangerouslySetInnerHTML={{__html:`
          var _ytReady=false;
          function onYouTubeIframeAPIReady(){_ytReady=true;}
        `}}/>
      )}

      <div style={{
        minHeight:'100vh',
        fontFamily:`'${fontFamily}',sans-serif`,
        color:text, position:'relative', overflowX:'hidden',
        ...getBgStyle(),
        ...(isMiddle ? {display:'flex',alignItems:'center',justifyContent:'center'} : {}),
      }}>
        {p.glow_enabled && <div style={{position:'fixed',inset:0,background:`radial-gradient(ellipse at 50% 0%,${accent}18 0%,transparent 55%)`,pointerEvents:'none',zIndex:0}}/>}

        {/* Direct audio element for MP3 */}
        {!isYT && p.song_url && <audio ref={audioRef} src={p.song_url} loop preload="none"/>}

        <div style={{
          position:'relative', zIndex:10,
          maxWidth:580, width:'100%',
          padding: isMiddle ? '20px 16px' : '48px 16px 80px',
          margin: isMiddle ? undefined : '0 auto',
        }}>

          {/* Banner — only show when card is NOT in middle */}
          {!isMiddle && (
            <div style={{
              height:130, borderRadius:'16px 16px 0 0',
              background:p.banner_url?`url(${p.banner_url}) center/cover no-repeat`:(p.banner_color||'#111'),
              marginBottom:-48, position:'relative', overflow:'hidden', zIndex:1,
            }}>
              {p.blur_enabled && <div style={{position:'absolute',inset:0,backdropFilter:'blur(3px)'}}/>}
            </div>
          )}

          {/* Main card */}
          <div
            className={cardClass}
            style={{
              borderRadius: isMiddle ? 16 : '0 0 16px 16px',
              padding: isMiddle ? '28px 24px' : '56px 24px 28px',
              textAlign: isCenter ? 'center' : 'left',
              position:'relative', overflow:'hidden',
              ...(p.card_image_url ? {backgroundImage:`url(${p.card_image_url})`,backgroundSize:'cover',backgroundPosition:'center'} : {}),
            }}
          >
            {p.card_image_url && <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.58)',backdropFilter:'blur(1px)'}}/>}
            <div style={{position:'relative',zIndex:2}}>

              {/* Avatar — z-index fix: sits above banner */}
              {!isMiddle && (
                <div style={{
                  width:84, height:84, borderRadius:'50%',
                  border:`3px solid ${accent}`,
                  overflow:'hidden', flexShrink:0,
                  margin: isCenter ? '-68px auto 14px' : '-68px 0 14px',
                  background:'#111',
                  boxShadow: p.glow_enabled ? `0 0 20px ${accent}55,0 0 40px ${accent}22` : '0 4px 20px rgba(0,0,0,.5)',
                  position:'relative', zIndex:5,
                }}>
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                    : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,background:`${accent}18`,fontFamily:"'Instrument Serif',serif"}}>
                        {(p.display_name||data.username)?.[0]?.toUpperCase()||'?'}
                      </div>
                  }
                </div>
              )}

              {/* Avatar for middle layout */}
              {isMiddle && p.avatar_url && (
                <div style={{
                  width:76, height:76, borderRadius:'50%',
                  border:`3px solid ${accent}`,
                  overflow:'hidden', flexShrink:0,
                  margin: isCenter ? '0 auto 14px' : '0 0 14px',
                  boxShadow: p.glow_enabled ? `0 0 20px ${accent}55` : '0 4px 20px rgba(0,0,0,.4)',
                }}>
                  <img src={p.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                </div>
              )}

              {/* Name + badge */}
              <div style={{display:'flex',alignItems:'center',justifyContent:isCenter?'center':'flex-start',gap:8,flexWrap:'wrap',marginBottom:4}}>
                <h1
                  className={p.font_effect&&p.font_effect!=='none'?`font-effect-${p.font_effect}`:''}
                  style={{fontSize:22,fontWeight:700,letterSpacing:'-.5px',color:text,lineHeight:1.1,'--accent':accent} as React.CSSProperties}
                >
                  {p.display_name||data.username}
                </h1>
                {p.badge_text && (
                  <span style={{background:`${p.badge_color||accent}18`,border:`1px solid ${p.badge_color||accent}44`,color:p.badge_color||accent,borderRadius:100,padding:'2px 9px',fontSize:11,fontWeight:600}}>
                    {p.badge_text}
                  </span>
                )}
              </div>

              {/* @username + #id */}
              <div style={{display:'flex',alignItems:'center',justifyContent:isCenter?'center':'flex-start',gap:10,marginBottom:14,flexWrap:'wrap'}}>
                <span style={{fontSize:12,color:`${text}44`}}>@{data.username}</span>
                {data.displayId && (
                  <span style={{display:'flex',alignItems:'center',gap:2,fontSize:11,color:`${text}28`}}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={`${text}28`} strokeWidth="2" strokeLinecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                    {data.displayId}
                  </span>
                )}
              </div>

              {/* Bio */}
              {p.bio && (
                <p style={{fontSize:14,lineHeight:1.75,color:`${text}bb`,maxWidth:420,margin:isCenter?'0 auto 18px':'0 0 18px',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
                  {p.bio}
                </p>
              )}

              {/* Links */}
              {data.links.length > 0 && (
                <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:18}}>
                  {data.links.map(lk => {
                    if (lk.link_type === 'crypto') {
                      const sym = CRYPTO_SYMBOLS[lk.icon] || '₿';
                      const name = CRYPTO_NAMES[lk.icon] || lk.icon?.toUpperCase();
                      return (
                        <div key={lk.id} style={{
                          display:'flex',alignItems:'center',gap:10,
                          padding:'11px 14px',borderRadius:11,
                          background:`${accent}0d`,border:`1px solid ${accent}22`,
                        }}>
                          <span style={{fontSize:20,flexShrink:0,lineHeight:1,filter:`drop-shadow(0 0 6px ${accent}66)`}}>{sym}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,color:`${text}66`,marginBottom:2}}>{name}{lk.title?` · ${lk.title}`:''}</div>
                            <div style={{fontSize:11,color:`${text}99`,fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lk.url}</div>
                          </div>
                          <CopyWallet address={lk.url} accent={accent} text={text}/>
                        </div>
                      );
                    }
                    // Social / URL link
                    const iconKey = lk.icon || detectSocialIcon(lk.url);
                    const IconComp = SocialIcons[iconKey] || SocialIcons['link'];
                    const href = ensureUrl(lk.url);
                    return (
                      <a key={lk.id} href={href} target="_blank" rel="noopener noreferrer"
                        style={{
                          display:'flex',alignItems:'center',gap:12,
                          padding:'11px 16px',borderRadius:11,
                          background:`${accent}0d`,border:`1px solid ${accent}22`,
                          color:text,transition:'all .18s',fontWeight:500,fontSize:14,
                          textDecoration:'none',WebkitTapHighlightColor:'transparent',
                        }}
                        onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background=`${accent}1e`;el.style.transform='translateY(-1px)';}}
                        onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background=`${accent}0d`;el.style.transform='none';}}
                      >
                        <span style={{flexShrink:0,display:'flex',alignItems:'center'}}>
                          <IconComp size={18} color={text}/>
                        </span>
                        <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lk.title}</span>
                        <IconExternalLink size={11} color={`${text}33`}/>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Footer: views + id */}
              <div style={{display:'flex',alignItems:'center',justifyContent:isCenter?'center':'flex-start',gap:12,paddingTop:14,borderTop:`1px solid ${text}0d`}}>
                <span style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:`${text}33`}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={`${text}33`} strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {Number(views).toLocaleString()}
                </span>
                <Link href="/" style={{marginLeft:'auto',fontSize:10,color:`${text}22`,fontFamily:"'Instrument Serif',serif",letterSpacing:'-.2px'}}>
                  oniion.cc
                </Link>
              </div>
            </div>
          </div>

          {/* Music player — separate card below */}
          {p.song_url && (
            <div style={{
              marginTop:10,
              borderRadius:14,
              padding:'14px 18px',
              display:'flex',alignItems:'center',gap:14,
              background:'rgba(255,255,255,0.03)',
              border:`1px solid ${accent}22`,
              backdropFilter:'blur(20px)',
              WebkitBackdropFilter:'blur(20px)',
            }}>
              {/* Play button */}
              <button
                onClick={() => {
                  if (isYT) {
                    const iframe = document.getElementById('yt-player') as HTMLIFrameElement | null;
                    if (iframe?.contentWindow) {
                      iframe.contentWindow.postMessage(
                        JSON.stringify({ event: 'command', func: playing ? 'pauseVideo' : 'playVideo', args: [] }),
                        '*'
                      );
                      setPlaying(v => !v);
                    }
                  } else {
                    toggleMusic();
                  }
                }}
                style={{
                  width:38,height:38,borderRadius:'50%',
                  background:accent,border:'none',cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  flexShrink:0,
                  boxShadow:playing?`0 0 14px ${accent}77`:'none',
                  transition:'box-shadow .3s',
                }}
              >
                {playing ? <IconPause size={13} color="#fff"/> : <IconPlay size={13} color="#fff"/>}
              </button>

              {/* Song info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {p.song_title || 'Now playing'}
                </div>
                {p.song_artist && <div style={{fontSize:11,color:`${text}66`,marginTop:1}}>{p.song_artist}</div>}
              </div>

              {/* Waveform animation */}
              {playing && (
                <div style={{display:'flex',gap:2.5,alignItems:'flex-end',height:18,flexShrink:0}}>
                  {[1,2,3,4,5].map(i=>(
                    <div key={i} style={{
                      width:2.5,background:accent,borderRadius:2,
                      animation:`float ${.3+i*.1}s ease-in-out infinite`,
                      height:`${5+i*2.5}px`,
                    }}/>
                  ))}
                </div>
              )}

              {/* YouTube icon if YT source */}
              {isYT && !playing && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill={`${text}33`}>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
