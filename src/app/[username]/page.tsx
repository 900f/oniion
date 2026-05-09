'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SocialIcons, detectSocialIcon } from '@/components/social-icons';

const CRYPTO_SYMBOLS: Record<string,string> = {
  eth:'Ξ',btc:'₿',sol:'◎',usdt:'₮',bnb:'⬡',xrp:'✕',ltc:'Ł',doge:'Ð',ada:'₳',avax:'△',matic:'⬡',trx:'◆',
};
const CRYPTO_NAMES: Record<string,string> = {
  eth:'Ethereum',btc:'Bitcoin',sol:'Solana',usdt:'Tether',bnb:'BNB',xrp:'XRP',
  ltc:'Litecoin',doge:'Dogecoin',ada:'Cardano',avax:'Avalanche',matic:'Polygon',trx:'TRON',
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
    display_name:string; bio:string; avatar_url:string;
    banner_url:string; banner_color:string;
    background_image_url:string; card_image_url:string;
    song_url:string; song_title:string; song_artist:string;
    background_type:string; background_value:string;
    text_color:string; accent_color:string; font_family:string;
    font_effect:string; page_effect:string; effect_color:string;
    layout:string; card_position:string;
    blur_enabled:boolean; glow_enabled:boolean;
    badge_text:string; badge_color:string;
    cursor_effect:string; card_style:string;
    custom_font_url:string; custom_font_name:string;
    // optional toggles
    avatar_orbit:boolean; card_led_border:boolean; card_tilt:boolean;
    show_views:boolean; show_id:boolean; show_music:boolean;
    name_font:string;
  };
  links: { id:string; title:string; url:string; icon:string; link_type:string }[];
};

function CopyWallet({ address, accent, text }: { address:string; accent:string; text:string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(address).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});}} style={{
      background:copied?`${accent}22`:`${accent}0e`,
      border:`1px solid ${accent}${copied?'55':'22'}`,
      borderRadius:8,padding:'5px 11px',cursor:'pointer',
      display:'flex',alignItems:'center',gap:5,
      color:copied?accent:`${text}88`,fontSize:11,
      fontFamily:'Space Mono,monospace',transition:'all 0.2s',flexShrink:0,
    }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

const NAME_FONT_MAP: Record<string,string> = {
  orbitron: 'Orbitron, sans-serif',
  'space-grotesk': 'Space Grotesk, sans-serif',
  playfair: 'Playfair Display, serif',
  bebas: 'Bebas Neue, sans-serif',
  cinzel: 'Cinzel, serif',
  custom: 'inherit',
};

export default function ProfilePage() {
  const { username } = useParams() as { username:string };
  const [data, setData] = useState<ProfileData|null>(null);
  const [notFound, setNotFound] = useState(false);
  const [views, setViews] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    fetch(`/api/profile/${username}`).then(r=>{
      if(r.status===404){setNotFound(true);return null;}
      return r.json();
    }).then(d=>{
      if(!d) return;
      setData(d); setViews(Number(d.views));
      fetch('/api/views',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:d.userId})})
        .then(r=>r.json()).then(v=>{if(v.views!=null)setViews(Number(v.views));});
    });
  },[username]);

  // 3D tilt — only when card_tilt is enabled
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>)=>{
    if(!data?.profile?.card_tilt) return;
    const card=cardRef.current; if(!card) return;
    const rect=card.getBoundingClientRect();
    const x=e.clientX-rect.left, y=e.clientY-rect.top;
    const cx=rect.width/2, cy=rect.height/2;
    card.style.transform=`perspective(900px) rotateX(${((y-cy)/cy)*-6}deg) rotateY(${((x-cx)/cx)*6}deg) scale(1.01)`;
  },[data]);

  const handleMouseLeave = useCallback(()=>{
    const card=cardRef.current; if(!card) return;
    card.style.transform='perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  },[]);

  // Canvas particles
  useEffect(()=>{
    if(!data) return;
    const p=data.profile;
    if(p.background_type!=='particles'&&p.page_effect!=='particles') return;
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d'); if(!ctx) return;
    const resize=()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;};
    resize();
    const accent=p.effect_color||p.accent_color||'#a855f7';
    const pts:{x:number;y:number;vx:number;vy:number;sz:number;a:number}[]=[];
    for(let i=0;i<60;i++) pts.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,sz:Math.random()*1.4+.3,a:Math.random()*.3+.05});
    let id:number;
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(pt=>{
        pt.x+=pt.vx;pt.y+=pt.vy;
        if(pt.x<0)pt.x=canvas.width;if(pt.x>canvas.width)pt.x=0;
        if(pt.y<0)pt.y=canvas.height;if(pt.y>canvas.height)pt.y=0;
        ctx.beginPath();ctx.arc(pt.x,pt.y,pt.sz,0,Math.PI*2);
        ctx.fillStyle=`rgba(${hexToRgb(accent)},${pt.a})`;ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<110){ctx.beginPath();ctx.strokeStyle=`rgba(${hexToRgb(accent)},${.06*(1-d/110)})`;ctx.lineWidth=.5;ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();}
      }
      id=requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize',resize);
    return()=>{cancelAnimationFrame(id);window.removeEventListener('resize',resize);};
  },[data]);

  // DOM effects
  useEffect(()=>{
    if(!data?.profile?.page_effect||['none','particles'].includes(data.profile.page_effect)) return;
    const effect=data.profile.page_effect, color=data.profile.effect_color||'#a855f7';
    const container=document.getElementById('fx'); if(!container) return;
    const spawn=()=>{
      const el=document.createElement('div');
      const x=Math.random()*window.innerWidth,dur=4+Math.random()*6,delay=Math.random()*2,sz=4+Math.random()*8;
      if(effect==='snow') el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;width:${sz}px;height:${sz}px;border-radius:50%;background:rgba(255,255,255,.75);animation:snowfall ${dur}s ${delay}s linear infinite;`;
      else if(effect==='rain') el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;width:1px;height:${12+Math.random()*12}px;background:linear-gradient(transparent,${color}99);animation:rain ${1+Math.random()}s ${delay}s linear infinite;`;
      else if(effect==='sakura'){el.textContent=['🌸','🌺','🌼'][Math.floor(Math.random()*3)];el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;font-size:${sz}px;animation:sakura-fall ${dur}s ${delay}s linear infinite;`;}
      else if(effect==='bubbles'){const s2=10+Math.random()*28;el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;bottom:-50px;width:${s2}px;height:${s2}px;border-radius:50%;border:1px solid ${color}55;animation:bubble-rise ${dur}s ${delay}s linear infinite;`;}
      else if(effect==='fireflies') el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:${Math.random()*100}vh;width:4px;height:4px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};opacity:${Math.random()};animation:snowfall ${dur}s ${delay}s ease-in-out infinite;`;
      else if(effect==='matrix'){el.textContent=String.fromCharCode(0x30A0+Math.random()*96);el.style.cssText=`position:fixed;pointer-events:none;z-index:1;left:${x}px;top:-20px;font-family:'Space Mono',monospace;color:${color};font-size:13px;opacity:.65;animation:rain ${1+Math.random()*2}s ${delay}s linear infinite;`;}
      container.appendChild(el);
      setTimeout(()=>el.remove(),(dur+delay)*1000+500);
    };
    const count=(effect==='rain'||effect==='matrix')?70:35;
    for(let i=0;i<count;i++) setTimeout(spawn,i*120);
    const iv=setInterval(spawn,(effect==='rain'||effect==='matrix')?130:340);
    return()=>{clearInterval(iv);if(container)container.innerHTML='';};
  },[data]);

  // Cursor effects
  useEffect(()=>{
    if(!data?.profile?.cursor_effect||data.profile.cursor_effect==='none') return;
    const effect=data.profile.cursor_effect, accent=data.profile.accent_color||'#a855f7';
    document.body.style.cursor='none';
    const onMove=(e:MouseEvent)=>{
      if(effect==='trail'){
        const dot=document.createElement('div');
        dot.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:6px;height:6px;border-radius:50%;background:${accent};left:${e.clientX-3}px;top:${e.clientY-3}px;opacity:.9;transition:opacity .45s,transform .45s;`;
        document.body.appendChild(dot);
        requestAnimationFrame(()=>{dot.style.opacity='0';dot.style.transform='scale(2.5)';});
        setTimeout(()=>dot.remove(),480);
      } else if(effect==='bubble'){
        if(Math.random()>.3) return;
        const b=document.createElement('div'),s=7+Math.random()*14;
        b.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:${s}px;height:${s}px;border-radius:50%;border:1px solid ${accent}99;left:${e.clientX-s/2}px;top:${e.clientY-s/2}px;opacity:.8;transition:all .65s;`;
        document.body.appendChild(b);
        requestAnimationFrame(()=>{b.style.opacity='0';b.style.transform=`translateY(-${10+Math.random()*22}px) scale(.4)`;});
        setTimeout(()=>b.remove(),680);
      } else {
        const c=document.getElementById('_cur');
        if(c){const off=effect==='ring'?16:effect==='crosshair'?12:4;c.style.left=(e.clientX-off)+'px';c.style.top=(e.clientY-off)+'px';}
      }
    };
    let el:HTMLDivElement|null=null;
    if(effect==='ring'){el=document.createElement('div');el.id='_cur';el.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:32px;height:32px;border-radius:50%;border:1.5px solid ${accent};transition:left .06s,top .06s;`;document.body.appendChild(el);}
    else if(effect==='dot'){el=document.createElement('div');el.id='_cur';el.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:8px;height:8px;border-radius:50%;background:${accent};transition:left .03s,top .03s;`;document.body.appendChild(el);}
    else if(effect==='crosshair'){el=document.createElement('div');el.id='_cur';el.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:24px;height:24px;transition:left .03s,top .03s;`;el.innerHTML=`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="1.5"><line x1="12" y1="0" x2="12" y2="24"/><line x1="0" y1="12" x2="24" y2="12"/><circle cx="12" cy="12" r="4"/></svg>`;document.body.appendChild(el);}
    window.addEventListener('mousemove',onMove);
    return()=>{window.removeEventListener('mousemove',onMove);document.getElementById('_cur')?.remove();document.body.style.cursor='';};
  },[data]);

  const toggleMusic=()=>{const a=audioRef.current;if(!a)return;if(playing){a.pause();setPlaying(false);}else a.play().then(()=>setPlaying(true)).catch(()=>{});};
  const ytId=data?.profile?.song_url?getYouTubeId(data.profile.song_url):null;
  const isYT=!!ytId;
  const toggleYT=()=>{const iframe=document.getElementById('yt-player') as HTMLIFrameElement|null;if(iframe?.contentWindow){iframe.contentWindow.postMessage(JSON.stringify({event:'command',func:playing?'pauseVideo':'playVideo',args:[]}),'*');setPlaying(v=>!v);}};

  if(notFound) return(
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14,padding:20}}>
      <div style={{fontSize:40}}>◎</div>
      <h1 style={{fontFamily:'Orbitron,sans-serif',fontSize:20}}>NOT FOUND</h1>
      <p style={{color:'#555',fontSize:13}}>oniion.cc/{username} doesn&apos;t exist yet.</p>
      <Link href="/register" className="btn btn-primary">Claim it free</Link>
    </div>
  );

  if(!data) return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:20,height:20,border:'2px solid rgba(168,85,247,.3)',borderTopColor:'#a855f7',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const p=data.profile;
  // Resolve booleans safely (DB returns null for new columns on old rows)
  const avatarOrbit    = p.avatar_orbit    !== false;
  const cardLed        = p.card_led_border !== false;
  const cardTilt       = p.card_tilt       !== false;
  const showViews      = p.show_views      !== false;
  const showId         = p.show_id         !== false;
  const showMusic      = p.show_music      !== false;

  const isCustomFont=p.font_family==='__custom__'&&p.custom_font_url;
  const fontFamily=isCustomFont?'__custom__':(p.font_family||'Space Grotesk');
  const nameFontFamily=NAME_FONT_MAP[p.name_font||'orbitron']||NAME_FONT_MAP.orbitron;
  const accent=p.accent_color||'#a855f7';
  const accent2=p.badge_color||'#ec4899';
  const text=p.text_color||'#E0E0FF';
  const isCenter=p.layout!=='left';
  const isMiddle=p.card_position==='middle';

  const getBgStyle=():React.CSSProperties=>{
    if(p.background_type==='color') return{background:p.background_value||'#0A0A1A'};
    if(p.background_type==='gradient') return{background:p.background_value||'#0A0A1A'};
    if(p.background_type==='image') return{backgroundImage:`url(${p.background_value})`,backgroundSize:'cover',backgroundPosition:'center',backgroundAttachment:'fixed'};
    return{background:'#08080f'};
  };
  const cardStyleMap:Record<string,React.CSSProperties>={
    glass:{background:'rgba(255,255,255,0.05)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',border:`1px solid ${accent}33`},
    solid:{background:'rgba(10,10,28,0.88)',border:`1px solid ${accent}33`},
    outline:{background:'transparent',border:`2px solid ${accent}66`},
    neon:{background:'rgba(10,10,28,0.9)',border:`1px solid ${accent}`,boxShadow:`0 0 24px ${accent}44,inset 0 0 20px rgba(0,0,0,.4)`},
  };
  const cs=cardStyleMap[p.card_style||'glass']||cardStyleMap.glass;

  const hasSong=p.song_url&&p.song_url.trim()!=='';

  return(
    <>
      {!isCustomFont&&p.font_family&&p.font_family!=='Space Grotesk'&&(
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${p.font_family.replace(/ /g,'+')}:wght@400;700&display=swap`}/>
      )}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&family=Playfair+Display:wght@400;700&family=Bebas+Neue&family=Cinzel:wght@400;700&display=swap"/>
      {isCustomFont&&(
        <style>{`@font-face{font-family:'__custom__';src:url('${p.custom_font_url}') format('${p.custom_font_url.endsWith('.woff2')?'woff2':p.custom_font_url.endsWith('.woff')?'woff':p.custom_font_url.endsWith('.otf')?'opentype':'truetype'}');font-weight:100 900;font-display:swap;}`}</style>
      )}
      <style>{`
        *{scrollbar-width:none;-ms-overflow-style:none;}
        *::-webkit-scrollbar{display:none;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes orbit{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes led-glow{0%{background-position:0% 50%}50%{background-position:400% 50%}100%{background-position:0% 50%}}
        @keyframes shine{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes snowfall{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(360deg);opacity:0}}
        @keyframes rain{0%{transform:translateY(-10px);opacity:1}100%{transform:translateY(100vh);opacity:0}}
        @keyframes sakura-fall{0%{transform:translateY(-20px) rotate(0) translateX(0);opacity:1}50%{transform:translateY(50vh) rotate(180deg) translateX(30px)}100%{transform:translateY(100vh) rotate(360deg) translateX(-20px);opacity:0}}
        @keyframes bubble-rise{0%{transform:translateY(100vh) scale(0);opacity:0}50%{opacity:.6}100%{transform:translateY(-10px) scale(1);opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .p-card{transition:transform 0.15s ease-out;}
        .p-link{display:flex;align-items:center;gap:12px;padding:11px 16px;border-radius:12px;font-weight:500;font-size:14px;text-decoration:none;transition:transform .2s,background .2s;position:relative;overflow:hidden;-webkit-tap-highlight-color:transparent;}
        .p-link:hover{transform:translateY(-1px);}
        .p-link::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(0deg,transparent,var(--la),transparent);transform-origin:bottom right;animation:shine 3s linear infinite;opacity:0;transition:opacity .4s;}
        .p-link:hover::before{opacity:.1;}
        ${avatarOrbit?`.av-wrap{position:relative;display:inline-block;}.av-wrap::after{content:'';position:absolute;top:-6px;left:-6px;right:-6px;bottom:-6px;border-radius:50%;background:radial-gradient(circle at 12px 12px,${accent} 15%,transparent 25%);animation:orbit 3s linear infinite;z-index:-1;filter:blur(2px);box-shadow:0 0 10px ${accent};}`:'.av-wrap{display:inline-block;}'}
        ${cardLed?`.led-w{position:relative;}.led-w::before{content:'';position:absolute;top:-2px;left:-2px;right:-2px;bottom:-2px;border-radius:inherit;background:linear-gradient(90deg,transparent 0%,${accent} 20%,${accent2} 40%,transparent 60%);background-size:400%;animation:led-glow 4s ease-in-out infinite;z-index:-1;pointer-events:none;}`:'.led-w{}'}
      `}</style>

      {(p.background_type==='particles'||p.page_effect==='particles')&&(
        <canvas ref={canvasRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>
      )}
      <div id="fx" style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:1,overflow:'hidden'}}/>

      {isYT&&(
        <div style={{position:'fixed',width:1,height:1,overflow:'hidden',opacity:0,zIndex:-1}}>
          <iframe id="yt-player" src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&autoplay=0&controls=0`} allow="autoplay" title="audio" style={{width:1,height:1}}/>
        </div>
      )}
      {!isYT&&hasSong&&<audio ref={audioRef} src={p.song_url} loop preload="none"/>}

      <div style={{
        minHeight:'100vh', fontFamily:`'${fontFamily}','Space Grotesk',sans-serif`,
        color:text, position:'relative', overflowX:'hidden',
        display:'flex', alignItems:isMiddle?'center':'flex-start', justifyContent:'center',
        padding:isMiddle?'20px 16px':'60px 16px 80px',
        ...getBgStyle(),
      }}>
        {p.glow_enabled&&<div style={{position:'fixed',inset:0,background:`radial-gradient(ellipse at 50% 30%,${accent}16 0%,transparent 60%)`,pointerEvents:'none',zIndex:0}}/>}

        <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:580,animation:'fadeIn .6s ease'}}>

          {/* ── Main card ── */}
          <div className="led-w" style={{borderRadius:20}}>
            <div
              ref={cardRef}
              className="p-card"
              onMouseMove={cardTilt?handleMouseMove:undefined}
              onMouseLeave={cardTilt?handleMouseLeave:undefined}
              style={{
                borderRadius:20, padding:'36px 28px 28px',
                textAlign:isCenter?'center':'left',
                position:'relative', overflow:'hidden',
                transformStyle:'preserve-3d',
                ...cs,
                ...(p.card_image_url?{backgroundImage:`url(${p.card_image_url})`,backgroundSize:'cover',backgroundPosition:'center'}:{}),
              }}
            >
              {p.card_image_url&&<div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(1px)'}}/>}
              <div style={{position:'relative',zIndex:2}}>

                {/* Avatar */}
                {p.avatar_url&&(
                  <div style={{display:'flex',justifyContent:isCenter?'center':'flex-start',marginBottom:18}}>
                    <div className="av-wrap">
                      <div style={{width:96,height:96,borderRadius:'50%',overflow:'hidden',border:`3px solid ${accent}`,boxShadow:p.glow_enabled?`0 0 24px ${accent}66,0 0 48px ${accent}22`:`0 4px 24px rgba(0,0,0,.5)`,background:`${accent}18`}}>
                        <img src={p.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                      </div>
                    </div>
                  </div>
                )}
                {!p.avatar_url&&(
                  <div style={{display:'flex',justifyContent:isCenter?'center':'flex-start',marginBottom:18}}>
                    <div style={{width:80,height:80,borderRadius:'50%',background:`${accent}18`,border:`2px solid ${accent}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,fontFamily:nameFontFamily,color:accent}}>
                      {(p.display_name||data.username)?.[0]?.toUpperCase()||'?'}
                    </div>
                  </div>
                )}

                {/* Name + badge */}
                <div style={{display:'flex',alignItems:'center',justifyContent:isCenter?'center':'flex-start',gap:10,flexWrap:'wrap',marginBottom:4}}>
                  <h1
                    className={p.font_effect&&p.font_effect!=='none'?`font-effect-${p.font_effect}`:''}
                    style={{
                      fontFamily:nameFontFamily, fontWeight:700,
                      fontSize:'clamp(18px,4vw,26px)', letterSpacing:'2px', color:text,
                      textShadow:`0 0 10px ${accent}88,0 0 20px ${accent}44`,
                      '--accent':accent,
                    } as React.CSSProperties}
                  >
                    {p.display_name||data.username}
                  </h1>
                  {p.badge_text&&(
                    <span style={{background:`${p.badge_color||accent}18`,border:`1px solid ${p.badge_color||accent}55`,color:p.badge_color||accent,borderRadius:100,padding:'2px 10px',fontSize:11,fontWeight:600,letterSpacing:'0.03em'}}>
                      {p.badge_text}
                    </span>
                  )}
                </div>

                {/* @username + #id */}
                <div style={{display:'flex',alignItems:'center',justifyContent:isCenter?'center':'flex-start',gap:10,marginBottom:16,flexWrap:'wrap'}}>
                  <span style={{fontSize:12,color:`${text}55`,fontFamily:'Space Mono,monospace'}}>@{data.username}</span>
                  {showId&&data.displayId&&(
                    <span style={{fontSize:11,color:`${text}33`,fontFamily:'Space Mono,monospace'}}>#{data.displayId}</span>
                  )}
                </div>

                {/* Bio */}
                {p.bio&&(
                  <p style={{fontSize:13,lineHeight:1.8,color:`${text}bb`,maxWidth:440,margin:isCenter?'0 auto 20px':'0 0 20px',whiteSpace:'pre-wrap',wordBreak:'break-word',fontFamily:'Space Mono,monospace'}}>
                    {p.bio}
                  </p>
                )}

                {/* Links */}
                {data.links.length>0&&(
                  <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                    {data.links.map(lk=>{
                      if(lk.link_type==='crypto'){
                        const sym=CRYPTO_SYMBOLS[lk.icon]||'₿';
                        const name=CRYPTO_NAMES[lk.icon]||lk.icon?.toUpperCase();
                        return(
                          <div key={lk.id} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderRadius:12,background:`${accent}0d`,border:`1px solid ${accent}22`}}>
                            <span style={{fontSize:22,flexShrink:0,filter:`drop-shadow(0 0 8px ${accent}88)`}}>{sym}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:11,color:`${text}55`,marginBottom:1}}>{name}{lk.title?` · ${lk.title}`:''}</div>
                              <div style={{fontSize:11,color:`${text}88`,fontFamily:'Space Mono,monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lk.url}</div>
                            </div>
                            <CopyWallet address={lk.url} accent={accent} text={text}/>
                          </div>
                        );
                      }
                      const iconKey=lk.icon||detectSocialIcon(lk.url);
                      const IconComp=SocialIcons[iconKey]||SocialIcons['link'];
                      const href=ensureUrl(lk.url);
                      return(
                        <a key={lk.id} href={href} target="_blank" rel="noopener noreferrer"
                          className="p-link"
                          style={{background:`${accent}0d`,border:`1px solid ${accent}22`,color:text,'--la':accent} as React.CSSProperties}
                        >
                          <span style={{flexShrink:0,display:'flex',alignItems:'center',filter:`drop-shadow(0 0 4px ${accent}66)`}}>
                            <IconComp size={18} color={text}/>
                          </span>
                          <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lk.title}</span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={`${text}33`} strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      );
                    })}
                  </div>
                )}

                {/* Footer */}
                {(showViews||showId)&&(
                  <div style={{display:'flex',alignItems:'center',justifyContent:isCenter?'center':'flex-start',gap:12,paddingTop:14,borderTop:`1px solid ${text}0d`}}>
                    {showViews&&(
                      <span style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:`${text}33`,fontFamily:'Space Mono,monospace'}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={`${text}33`} strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        {Number(views).toLocaleString()}
                      </span>
                    )}
                    {showId&&data.displayId&&(
                      <span style={{fontSize:11,color:`${text}22`,fontFamily:'Space Mono,monospace'}}>#{data.displayId}</span>
                    )}
                    <Link href="/" style={{marginLeft:'auto',fontSize:11,color:`${text}22`,fontFamily:nameFontFamily,letterSpacing:'1px'}}>
                      oniion.cc
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Music player — separate card, only if song set AND show_music ── */}
          {hasSong&&showMusic&&(
            <div style={{
              marginTop:10, borderRadius:14, padding:'14px 18px',
              display:'flex', alignItems:'center', gap:14,
              background:'rgba(255,255,255,0.03)',
              border:`1px solid ${accent}22`,
              backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            }}>
              <button onClick={isYT?toggleYT:toggleMusic} style={{
                width:38, height:38, borderRadius:'50%',
                background:accent, border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                boxShadow:playing?`0 0 16px ${accent}88`:'none', transition:'box-shadow .3s',
              }}>
                {playing
                  ?<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  :<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                }
              </button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {p.song_title||'Now playing'}
                </div>
                {p.song_artist&&<div style={{fontSize:11,color:`${text}66`,marginTop:1,fontFamily:'Space Mono,monospace'}}>{p.song_artist}</div>}
              </div>
              {playing&&(
                <div style={{display:'flex',gap:2.5,alignItems:'flex-end',height:18,flexShrink:0}}>
                  {[1,2,3,4,5].map(i=>(
                    <div key={i} style={{width:2.5,background:accent,borderRadius:2,animation:`float ${.3+i*.1}s ease-in-out infinite`,height:`${5+i*2.5}px`}}/>
                  ))}
                </div>
              )}
              {isYT&&<svg width="14" height="14" viewBox="0 0 24 24" fill={`${text}33`} style={{flexShrink:0}}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
