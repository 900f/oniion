'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SocialIcons, detectSocialIcon } from '@/components/social-icons';

/* ── helpers ── */
const CRYPTO_SYM: Record<string,string> = { eth:'Ξ',btc:'₿',sol:'◎',usdt:'₮',bnb:'⬡',xrp:'✕',ltc:'Ł',doge:'Ð',ada:'₳',avax:'△',matic:'⬡',trx:'◆' };
const CRYPTO_NAME: Record<string,string> = { eth:'Ethereum',btc:'Bitcoin',sol:'Solana',usdt:'Tether',bnb:'BNB',xrp:'XRP',ltc:'Litecoin',doge:'Dogecoin',ada:'Cardano',avax:'Avalanche',matic:'Polygon',trx:'TRON' };
const NAME_FONT: Record<string,string> = { orbitron:"'Orbitron',sans-serif", 'space-grotesk':"'Space Grotesk',sans-serif", playfair:"'Playfair Display',serif", bebas:"'Bebas Neue',sans-serif", cinzel:"'Cinzel',serif", custom:'inherit' };

function url(s: string) {
  if (!s) return s;
  if (/^(https?:|mailto:)/.test(s)) return s;
  return 'https://' + s;
}
function ytId(u: string) {
  return u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;
}
function rgb(hex: string) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return isNaN(r)?'168,85,247':`${r},${g},${b}`;
}
function bool(v: unknown, def=true): boolean {
  if (v === null || v === undefined) return def;
  return Boolean(v);
}

type P = {
  display_name:string; bio:string; avatar_url:string;
  banner_url:string; banner_color:string; card_image_url:string;
  song_url:string; song_title:string; song_artist:string;
  background_type:string; background_value:string;
  text_color:string; accent_color:string; font_family:string;
  font_effect:string; page_effect:string; effect_color:string;
  layout:string; card_position:string;
  blur_enabled:unknown; glow_enabled:unknown;
  badge_text:string; badge_color:string;
  cursor_effect:string; card_style:string;
  custom_font_url:string; custom_font_name:string;
  avatar_orbit:unknown; card_led_border:unknown; card_tilt:unknown;
  show_views:unknown; show_id:unknown; show_music:unknown;
  name_font:string;
};
type Data = {
  username:string; userId:string; views:number; displayId:number;
  profile:P;
  links:{ id:string; title:string; url:string; icon:string; link_type:string }[];
};

function CopyBtn({ addr, accent, text }: { addr:string; accent:string; text:string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={()=>{ navigator.clipboard.writeText(addr).then(()=>{ setOk(true); setTimeout(()=>setOk(false),2000); }); }} style={{ background:ok?`${accent}22`:`${accent}0e`, border:`1px solid ${accent}${ok?'55':'22'}`, borderRadius:8, padding:'5px 11px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, color:ok?accent:`${text}77`, fontSize:11, fontFamily:"'Space Mono',monospace", transition:'all .2s', flexShrink:0 }}>
      {ok ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function ProfilePage() {
  const { username } = useParams() as { username:string };
  const [data, setData] = useState<Data|null>(null);
  const [notFound, setNotFound] = useState(false);
  const [views, setViews] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  /* load profile */
  useEffect(() => {
    fetch(`/api/profile/${username}`).then(r => {
      if (r.status === 404) { setNotFound(true); return null; }
      return r.json();
    }).then(d => {
      if (!d) return;
      setData(d); setViews(Number(d.views));
      fetch('/api/views', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({userId:d.userId}) })
        .then(r=>r.json()).then(v=>{ if (v.views != null) setViews(Number(v.views)); });
    });
  }, [username]);

  /* 3D tilt */
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current; if (!card) return;
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const rx = ((y - r.height/2) / (r.height/2)) * -7;
    const ry = ((x - r.width/2)  / (r.width/2))  *  7;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.015)`;
  }, []);
  const onMouseLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);

  /* particle canvas */
  useEffect(() => {
    if (!data) return;
    const p = data.profile;
    if (p.background_type !== 'particles' && p.page_effect !== 'particles') return;
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    const ac = p.effect_color || p.accent_color || '#a855f7';
    const pts = Array.from({length:60}, () => ({
      x:Math.random()*cv.width, y:Math.random()*cv.height,
      vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
      sz:Math.random()*1.4+.3, a:Math.random()*.3+.05
    }));
    let id: number;
    const draw = () => {
      ctx.clearRect(0,0,cv.width,cv.height);
      pts.forEach(pt => {
        pt.x+=pt.vx; pt.y+=pt.vy;
        if(pt.x<0)pt.x=cv.width; if(pt.x>cv.width)pt.x=0;
        if(pt.y<0)pt.y=cv.height; if(pt.y>cv.height)pt.y=0;
        ctx.beginPath(); ctx.arc(pt.x,pt.y,pt.sz,0,Math.PI*2);
        ctx.fillStyle=`rgba(${rgb(ac)},${pt.a})`; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<110){ ctx.beginPath(); ctx.strokeStyle=`rgba(${rgb(ac)},${.06*(1-d/110)})`; ctx.lineWidth=.5; ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke(); }
      }
      id=requestAnimationFrame(draw);
    };
    draw(); window.addEventListener('resize',resize);
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize',resize); };
  }, [data]);

  /* DOM effects */
  useEffect(() => {
    if (!data?.profile?.page_effect || ['none','particles'].includes(data.profile.page_effect)) return;
    const ef = data.profile.page_effect, col = data.profile.effect_color||'#a855f7';
    const box = document.getElementById('fx'); if (!box) return;
    const spawn = () => {
      const el = document.createElement('div');
      const x = Math.random()*window.innerWidth, dur = 4+Math.random()*6, delay = Math.random()*2, sz = 4+Math.random()*8;
      if (ef==='snow') el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;width:${sz}px;height:${sz}px;border-radius:50%;background:rgba(255,255,255,.75);animation:snowfall ${dur}s ${delay}s linear infinite;`;
      else if (ef==='rain') el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;width:1px;height:${12+Math.random()*12}px;background:linear-gradient(transparent,${col}99);animation:rain ${1+Math.random()}s ${delay}s linear infinite;`;
      else if (ef==='sakura'){el.textContent=['🌸','🌺','🌼'][Math.floor(Math.random()*3)];el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;font-size:${sz}px;animation:sakura-fall ${dur}s ${delay}s linear infinite;`;}
      else if (ef==='bubbles'){const s2=10+Math.random()*28;el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;bottom:-50px;width:${s2}px;height:${s2}px;border-radius:50%;border:1px solid ${col}55;animation:bubble-rise ${dur}s ${delay}s linear infinite;`;}
      else if (ef==='fireflies') el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:${Math.random()*100}vh;width:4px;height:4px;border-radius:50%;background:${col};box-shadow:0 0 8px ${col};opacity:${Math.random()};animation:snowfall ${dur}s ${delay}s ease-in-out infinite;`;
      else if (ef==='matrix'){el.textContent=String.fromCharCode(0x30A0+Math.random()*96);el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;font-family:'Space Mono',monospace;color:${col};font-size:13px;opacity:.65;animation:rain ${1+Math.random()*2}s ${delay}s linear infinite;`;}
      box.appendChild(el); setTimeout(()=>el.remove(),(dur+delay)*1000+500);
    };
    const count=(ef==='rain'||ef==='matrix')?70:35;
    for(let i=0;i<count;i++) setTimeout(spawn,i*120);
    const iv=setInterval(spawn,(ef==='rain'||ef==='matrix')?130:340);
    return()=>{clearInterval(iv);if(box)box.innerHTML='';};
  }, [data]);

  /* cursor effects — cursor stays visible unless effect selected */
  useEffect(() => {
    if (!data?.profile?.cursor_effect || data.profile.cursor_effect==='none') return;
    const ef = data.profile.cursor_effect, ac = data.profile.accent_color||'#a855f7';
    // Only hide cursor for custom cursor effects
    // cursor always visible

    const onMove = (e: MouseEvent) => {
      if (ef==='trail') {
        const d=document.createElement('div');
        d.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:6px;height:6px;border-radius:50%;background:${ac};left:${e.clientX-3}px;top:${e.clientY-3}px;opacity:.9;transition:opacity .45s,transform .45s;`;
        document.body.appendChild(d);
        requestAnimationFrame(()=>{d.style.opacity='0';d.style.transform='scale(2.5)';});
        setTimeout(()=>d.remove(),480);
      } else if (ef==='bubble') {
        if(Math.random()>.3) return;
        const b=document.createElement('div'),s=7+Math.random()*14;
        b.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:${s}px;height:${s}px;border-radius:50%;border:1px solid ${ac}99;left:${e.clientX-s/2}px;top:${e.clientY-s/2}px;opacity:.8;transition:all .65s;`;
        document.body.appendChild(b);
        requestAnimationFrame(()=>{b.style.opacity='0';b.style.transform=`translateY(-${10+Math.random()*22}px) scale(.4)`;});
        setTimeout(()=>b.remove(),680);
      } else {
        const c=document.getElementById('_cur');
        if(c){const off=ef==='ring'?16:ef==='crosshair'?12:4;c.style.left=(e.clientX-off)+'px';c.style.top=(e.clientY-off)+'px';}
      }
    };
    let el:HTMLDivElement|null=null;
    if(ef==='ring'){el=document.createElement('div');el.id='_cur';el.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:32px;height:32px;border-radius:50%;border:1.5px solid ${ac};transition:left .06s,top .06s;`;document.body.appendChild(el);}
    else if(ef==='dot'){el=document.createElement('div');el.id='_cur';el.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:8px;height:8px;border-radius:50%;background:${ac};transition:left .03s,top .03s;`;document.body.appendChild(el);}
    else if(ef==='crosshair'){el=document.createElement('div');el.id='_cur';el.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:24px;height:24px;transition:left .03s,top .03s;`;el.innerHTML=`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${ac}" stroke-width="1.5"><line x1="12" y1="0" x2="12" y2="24"/><line x1="0" y1="12" x2="24" y2="12"/><circle cx="12" cy="12" r="4"/></svg>`;document.body.appendChild(el);}
    window.addEventListener('mousemove',onMove);
    return()=>{window.removeEventListener('mousemove',onMove);document.getElementById('_cur')?.remove();// cursor restored (was already visible)};
  }, [data]);

  /* audio */
  const toggleAudio = () => {
    const a=audioRef.current; if(!a)return;
    if(playing){a.pause();setPlaying(false);}
    else a.play().then(()=>setPlaying(true)).catch(()=>{});
  };
  const vid = data?.profile?.song_url ? ytId(data.profile.song_url) : null;
  const isYT = !!vid;
  const toggleYT = () => {
    const f=document.getElementById('yt-pl') as HTMLIFrameElement|null;
    f?.contentWindow?.postMessage(JSON.stringify({event:'command',func:playing?'pauseVideo':'playVideo',args:[]}),'*');
    setPlaying(v=>!v);
  };

  /* ── not found ── */
  if (notFound) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14,padding:20,background:'#0a0a0a',color:'#e0e0ff'}}>
      <div style={{fontSize:40}}>◎</div>
      <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,letterSpacing:'2px'}}>NOT FOUND</h1>
      <p style={{color:'#555',fontSize:13}}>oniion.cc/{username} doesn&apos;t exist yet.</p>
      <Link href="/register" style={{background:'#a855f7',color:'#fff',padding:'10px 24px',borderRadius:10,fontWeight:600,fontSize:14}}>Claim it free</Link>
    </div>
  );

  /* ── loading ── */
  if (!data) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0a0a'}}>
      <div style={{width:20,height:20,border:'2px solid rgba(168,85,247,.3)',borderTopColor:'#a855f7',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── resolve settings ── */
  const p = data.profile;
  const ac = p.accent_color || '#a855f7';
  const ac2 = p.badge_color || '#06b6d4';
  const tx = p.text_color || '#e0e0ff';
  const isCenter = p.layout !== 'left';
  const isMiddle = p.card_position === 'middle';
  const doOrbit  = bool(p.avatar_orbit,  true);
  const doLed    = bool(p.card_led_border, true);
  const doTilt   = bool(p.card_tilt,    true);
  const doViews  = bool(p.show_views,   true);
  const doId     = bool(p.show_id,      true);
  const doMusic  = bool(p.show_music,   true);
  const nf = NAME_FONT[p.name_font || 'orbitron'] || NAME_FONT.orbitron;
  const isCustomFont = p.font_family==='__custom__' && p.custom_font_url;
  const bodyFont = isCustomFont ? '__custom__' : (p.font_family || 'Space Grotesk');
  const hasSong = !!(p.song_url?.trim());

  const bgStyle = (): React.CSSProperties => {
    if (p.background_type==='color') return {background:p.background_value||'#0a0a0a'};
    if (p.background_type==='gradient') return {background:p.background_value||'#0a0a0a'};
    if (p.background_type==='image') return {backgroundImage:`url(${p.background_value})`,backgroundSize:'cover',backgroundPosition:'center',backgroundAttachment:'fixed'};
    return {background:'#080810'};
  };

  const cardBase: React.CSSProperties = (() => {
    const cs = p.card_style || 'glass';
    if (cs==='glass') return {background:'rgba(20,22,40,0.72)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',border:`1px solid ${ac}33`};
    if (cs==='solid') return {background:'rgba(10,10,20,0.95)',border:`1px solid ${ac}33`};
    if (cs==='outline') return {background:'transparent',border:`2px solid ${ac}66`};
    if (cs==='neon') return {background:'rgba(10,10,20,0.92)',border:`1px solid ${ac}`,boxShadow:`0 0 28px ${ac}44,inset 0 0 20px rgba(0,0,0,.4)`};
    return {background:'rgba(20,22,40,0.72)',backdropFilter:'blur(24px)',border:`1px solid ${ac}33`};
  })();

  return (
    <>
      {/* fonts */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&family=Playfair+Display:wght@400;700&family=Bebas+Neue&family=Cinzel:wght@400;700&display=swap"/>
      {!isCustomFont && p.font_family && !['Space Grotesk','Orbitron','Space Mono','Playfair Display','Bebas Neue','Cinzel'].includes(p.font_family) && (
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${p.font_family.replace(/ /g,'+')}:wght@400;700&display=swap`}/>
      )}
      {isCustomFont && <style>{`@font-face{font-family:'__custom__';src:url('${p.custom_font_url}') format('${p.custom_font_url.endsWith('.woff2')?'woff2':p.custom_font_url.endsWith('.woff')?'woff':p.custom_font_url.endsWith('.otf')?'opentype':'truetype'}');font-weight:100 900;font-display:swap;}`}</style>}

      {/* scoped styles */}
      <style>{`
        *{scrollbar-width:none;-ms-overflow-style:none;}*::-webkit-scrollbar{display:none;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes orbit{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes led-glow{0%{background-position:0% 50%}50%{background-position:400% 50%}100%{background-position:0% 50%}}
        @keyframes shine{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes snowfall{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(360deg);opacity:0}}
        @keyframes rain{0%{transform:translateY(-10px);opacity:1}100%{transform:translateY(100vh);opacity:0}}
        @keyframes sakura-fall{0%{transform:translateY(-20px) rotate(0) translateX(0);opacity:1}50%{transform:translateY(50vh) rotate(180deg) translateX(30px)}100%{transform:translateY(100vh) rotate(360deg) translateX(-20px);opacity:0}}
        @keyframes bubble-rise{0%{transform:translateY(100vh) scale(0);opacity:0}50%{opacity:.6}100%{transform:translateY(-10px) scale(1);opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        /* card tilt transition */
        .pc{transition:transform .15s ease-out;transform-style:preserve-3d;}
        /* led wrapper */
        ${doLed ? `.lw{position:relative;border-radius:18px;}.lw::before{content:'';position:absolute;top:-2px;left:-2px;right:-2px;bottom:-2px;border-radius:18px;background:linear-gradient(90deg,transparent 0%,${ac} 20%,${ac2} 40%,transparent 60%);background-size:400%;animation:led-glow 4s ease-in-out infinite;z-index:0;pointer-events:none;}` : `.lw{border-radius:18px;}`}
        /* orbit ring */
        ${doOrbit && p.avatar_url ? `.av{position:relative;display:inline-block;}.av::after{content:'';position:absolute;top:-7px;left:-7px;right:-7px;bottom:-7px;border-radius:50%;background:radial-gradient(circle at 12px 12px,${ac} 15%,transparent 25%);animation:orbit 3s linear infinite;z-index:-1;filter:blur(2px);box-shadow:0 0 12px ${ac};}` : `.av{display:inline-block;}`}
        /* link rows */
        .pl{display:flex;align-items:center;gap:12px;padding:11px 16px;border-radius:12px;font-weight:500;font-size:14px;text-decoration:none;transition:transform .2s,background .2s;position:relative;overflow:hidden;-webkit-tap-highlight-color:transparent;cursor:pointer;}
        .pl:hover{transform:translateY(-1px);}
        .pl::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(0deg,transparent,${ac}22,transparent);transform-origin:bottom right;animation:shine 3s linear infinite;opacity:0;transition:opacity .4s;}
        .pl:hover::before{opacity:1;}
      `}</style>

      {/* particles canvas */}
      {(p.background_type==='particles'||p.page_effect==='particles') && (
        <canvas ref={canvasRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>
      )}
      <div id="fx" style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:1,overflow:'hidden'}}/>

      {/* yt iframe */}
      {isYT && (
        <div style={{position:'fixed',width:1,height:1,overflow:'hidden',opacity:0,zIndex:-1}}>
          <iframe id="yt-pl" src={`https://www.youtube.com/embed/${vid}?enablejsapi=1&autoplay=0&controls=0`} allow="autoplay" title="audio" style={{width:1,height:1}}/>
        </div>
      )}
      {!isYT && hasSong && <audio ref={audioRef} src={p.song_url} loop preload="none"/>}

      {/* page */}
      <div style={{minHeight:'100vh',fontFamily:`'${bodyFont}','Space Grotesk',sans-serif`,color:tx,position:'relative',overflowX:'hidden',display:'flex',alignItems:isMiddle?'center':'flex-start',justifyContent:'center',padding:isMiddle?'20px 16px':'60px 16px 80px',...bgStyle()}}>
        {bool(p.glow_enabled,false) && <div style={{position:'fixed',inset:0,background:`radial-gradient(ellipse at 50% 30%,${ac}18 0%,transparent 60%)`,pointerEvents:'none',zIndex:0}}/>}

        <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:600,animation:'fadeIn .6s ease'}}>

          {/* ── card wrapper (LED) ── */}
          <div className="lw">
            <div
              ref={cardRef}
              className="pc"
              onMouseMove={doTilt ? onMouseMove : undefined}
              onMouseLeave={doTilt ? onMouseLeave : undefined}
              style={{position:'relative',zIndex:1,borderRadius:16,padding:'32px 26px 26px',textAlign:isCenter?'center':'left',overflow:'hidden',...cardBase,...(p.card_image_url?{backgroundImage:`url(${p.card_image_url})`,backgroundSize:'cover',backgroundPosition:'center'}:{})}}
            >
              {p.card_image_url && <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.62)',backdropFilter:'blur(2px)'}}/>}
              <div style={{position:'relative',zIndex:2}}>

                {/* avatar */}
                {p.avatar_url && (
                  <div style={{display:'flex',justifyContent:isCenter?'center':'flex-start',marginBottom:18}}>
                    <div className="av">
                      <div style={{width:92,height:92,borderRadius:'50%',overflow:'hidden',border:`3px solid ${ac}`,boxShadow:bool(p.glow_enabled,false)?`0 0 24px ${ac}66,0 0 48px ${ac}22`:'0 4px 24px rgba(0,0,0,.6)',background:`${ac}18`}}>
                        <img src={p.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                      </div>
                    </div>
                  </div>
                )}
                {!p.avatar_url && (
                  <div style={{display:'flex',justifyContent:isCenter?'center':'flex-start',marginBottom:18}}>
                    <div style={{width:80,height:80,borderRadius:'50%',background:`${ac}18`,border:`2px solid ${ac}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontFamily:nf,color:ac}}>
                      {(p.display_name||data.username)?.[0]?.toUpperCase()||'?'}
                    </div>
                  </div>
                )}

                {/* name + badge */}
                <div style={{display:'flex',alignItems:'center',justifyContent:isCenter?'center':'flex-start',gap:10,flexWrap:'wrap',marginBottom:4}}>
                  <h1 className={p.font_effect&&p.font_effect!=='none'?`font-effect-${p.font_effect}`:''} style={{fontFamily:nf,fontWeight:700,fontSize:'clamp(18px,4vw,26px)',letterSpacing:'2px',color:tx,textShadow:`0 0 10px ${ac}88,0 0 20px ${ac}44`,'--accent':ac} as React.CSSProperties}>
                    {p.display_name||data.username}
                  </h1>
                  {p.badge_text && (
                    <span style={{background:`${p.badge_color||ac}18`,border:`1px solid ${p.badge_color||ac}55`,color:p.badge_color||ac,borderRadius:100,padding:'2px 10px',fontSize:11,fontWeight:600,letterSpacing:'0.03em'}}>
                      {p.badge_text}
                    </span>
                  )}
                </div>

                {/* @handle + #id */}
                <div style={{display:'flex',alignItems:'center',justifyContent:isCenter?'center':'flex-start',gap:10,marginBottom:16,flexWrap:'wrap'}}>
                  <span style={{fontSize:12,color:`${tx}44`,fontFamily:"'Space Mono',monospace"}}>@{data.username}</span>
                  {doId && data.displayId && <span style={{fontSize:11,color:`${tx}28`,fontFamily:"'Space Mono',monospace"}}>#{data.displayId}</span>}
                </div>

                {/* bio */}
                {p.bio && (
                  <p style={{fontSize:13,lineHeight:1.85,color:`${tx}bb`,maxWidth:460,margin:isCenter?'0 auto 20px':'0 0 20px',whiteSpace:'pre-wrap',wordBreak:'break-word',fontFamily:"'Space Mono',monospace"}}>
                    {p.bio}
                  </p>
                )}

                {/* links */}
                {data.links.length > 0 && (
                  <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                    {data.links.map(lk => {
                      /* crypto */
                      if (lk.link_type==='crypto') {
                        const sym = CRYPTO_SYM[lk.icon]||'₿', name = CRYPTO_NAME[lk.icon]||lk.icon?.toUpperCase();
                        return (
                          <div key={lk.id} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderRadius:12,background:`${ac}0d`,border:`1px solid ${ac}22`}}>
                            <span style={{fontSize:22,flexShrink:0,filter:`drop-shadow(0 0 8px ${ac}88)`}}>{sym}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:11,color:`${tx}44`,marginBottom:1}}>{name}{lk.title?` · ${lk.title}`:''}</div>
                              <div style={{fontSize:11,color:`${tx}77`,fontFamily:"'Space Mono',monospace",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lk.url}</div>
                            </div>
                            <CopyBtn addr={lk.url} accent={ac} text={tx}/>
                          </div>
                        );
                      }
                      /* social/url */
                      const key = lk.icon || detectSocialIcon(lk.url);
                      const Icon = SocialIcons[key] || SocialIcons['link'];
                      return (
                        <a key={lk.id} href={url(lk.url)} target="_blank" rel="noopener noreferrer" className="pl" style={{background:`${ac}0d`,border:`1px solid ${ac}22`,color:tx}}>
                          <span style={{flexShrink:0,display:'flex',alignItems:'center',filter:`drop-shadow(0 0 5px ${ac}66)`}}>
                            <Icon size={18} color={tx}/>
                          </span>
                          <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lk.title}</span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={`${tx}33`} strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      );
                    })}
                  </div>
                )}

                {/* footer */}
                {(doViews || doId) && (
                  <div style={{display:'flex',alignItems:'center',justifyContent:isCenter?'center':'flex-start',gap:12,paddingTop:14,borderTop:`1px solid ${tx}0d`}}>
                    {doViews && (
                      <span style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:`${tx}33`,fontFamily:"'Space Mono',monospace"}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={`${tx}44`} strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        {Number(views).toLocaleString()}
                      </span>
                    )}
                    {doId && data.displayId && <span style={{fontSize:11,color:`${tx}22`,fontFamily:"'Space Mono',monospace"}}>#{data.displayId}</span>}
                    <Link href="/" style={{marginLeft:'auto',fontSize:11,color:`${tx}22`,fontFamily:"'Orbitron',sans-serif",letterSpacing:'1px'}}>oniion.cc</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── music player ── */}
          {hasSong && doMusic && (
            <div style={{marginTop:10,borderRadius:14,padding:'13px 18px',display:'flex',alignItems:'center',gap:14,background:'rgba(255,255,255,0.03)',border:`1px solid ${ac}22`,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)'}}>
              <button onClick={isYT?toggleYT:toggleAudio} style={{width:38,height:38,borderRadius:'50%',background:ac,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:playing?`0 0 16px ${ac}88`:'none',transition:'box-shadow .3s'}}>
                {playing
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
              </button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:tx,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.song_title||'Now playing'}</div>
                {p.song_artist && <div style={{fontSize:11,color:`${tx}55`,marginTop:1,fontFamily:"'Space Mono',monospace"}}>{p.song_artist}</div>}
              </div>
              {playing && (
                <div style={{display:'flex',gap:2.5,alignItems:'flex-end',height:18,flexShrink:0}}>
                  {[1,2,3,4,5].map(i=><div key={i} style={{width:2.5,background:ac,borderRadius:2,animation:`float ${.3+i*.1}s ease-in-out infinite`,height:`${5+i*2.5}px`}}/>)}
                </div>
              )}
              {isYT && !playing && <svg width="14" height="14" viewBox="0 0 24 24" fill={`${tx}33`} style={{flexShrink:0}}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
