'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUploadThing } from '@/lib/uploadthing-client';
import { CustomSelect } from '@/components/custom-select';
import { SocialIcons, SOCIAL_OPTIONS, detectSocialIcon } from '@/components/social-icons';
import {
  IconUser, IconPalette, IconSparkles, IconLink, IconMusic,
  IconSave, IconLogOut, IconExternalLink, IconPlus, IconX,
  IconEye, IconUpload, IconFont, IconHash, IconCheck,
  IconImage, IconCamera, IconLayout, IconDroplet, IconType,
  IconMousePointer, IconWand, IconCrown, IconSettings,
} from '@/components/icons';

const FONTS = ['Space Grotesk','Playfair Display','JetBrains Mono','Bebas Neue','Dancing Script','Orbitron','Cinzel','Permanent Marker'];
const NAME_FONTS = [
  {value:'orbitron',label:'Orbitron (tech)'},
  {value:'space-grotesk',label:'Space Grotesk'},
  {value:'playfair',label:'Playfair Display'},
  {value:'bebas',label:'Bebas Neue'},
  {value:'cinzel',label:'Cinzel'},
  {value:'custom',label:'Same as body font'},
];
const FONT_EFFECTS = [
  {value:'none',label:'None'},{value:'shimmer',label:'Shimmer'},{value:'glow',label:'Glow'},
  {value:'glitch',label:'Glitch'},{value:'neon',label:'Neon'},{value:'shadow',label:'Shadow'},{value:'outline',label:'Outline'},
];
const PAGE_EFFECTS = [
  {value:'none',label:'None'},{value:'particles',label:'Particles'},{value:'snow',label:'Snow'},
  {value:'rain',label:'Rain'},{value:'sakura',label:'Sakura'},{value:'bubbles',label:'Bubbles'},
  {value:'fireflies',label:'Fireflies'},{value:'matrix',label:'Matrix'},
];
const CURSOR_EFFECTS = [
  {value:'none',label:'Default cursor'},{value:'trail',label:'Sparkle trail'},
  {value:'ring',label:'Ring'},{value:'dot',label:'Dot'},
  {value:'crosshair',label:'Crosshair'},{value:'bubble',label:'Bubble'},
];
const CARD_STYLES = [{value:'glass',label:'Glass'},{value:'solid',label:'Solid'},{value:'outline',label:'Outline'},{value:'neon',label:'Neon'}];
const BG_TYPES = [
  {value:'color',label:'Solid Color'},{value:'gradient',label:'Gradient'},
  {value:'image',label:'Image / GIF URL'},{value:'particles',label:'Particles'},
];
const CRYPTO_COINS = [
  {value:'eth',label:'Ethereum (ETH)',symbol:'Ξ'},{value:'btc',label:'Bitcoin (BTC)',symbol:'₿'},
  {value:'sol',label:'Solana (SOL)',symbol:'◎'},{value:'usdt',label:'Tether (USDT)',symbol:'₮'},
  {value:'bnb',label:'BNB',symbol:'⬡'},{value:'xrp',label:'XRP',symbol:'✕'},
  {value:'ltc',label:'Litecoin (LTC)',symbol:'Ł'},{value:'doge',label:'Dogecoin',symbol:'Ð'},
  {value:'ada',label:'Cardano (ADA)',symbol:'₳'},{value:'avax',label:'Avalanche',symbol:'△'},
  {value:'matic',label:'Polygon (MATIC)',symbol:'⬡'},{value:'trx',label:'TRON (TRX)',symbol:'◆'},
];

type LinkItem = { title:string; url:string; icon:string; link_type:string };
type Profile = {
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
  // optional feature toggles
  avatar_orbit:boolean; card_led_border:boolean; card_tilt:boolean;
  show_views:boolean; show_id:boolean; show_music:boolean;
  name_font:string;
  total_views?:number; display_id?:number;
};
const DEF: Profile = {
  display_name:'', bio:'', avatar_url:'', banner_url:'', banner_color:'#0d0d0d',
  background_image_url:'', card_image_url:'',
  song_url:'', song_title:'', song_artist:'',
  background_type:'color', background_value:'#0a0a0a',
  text_color:'#ffffff', accent_color:'#a855f7', font_family:'Space Grotesk',
  font_effect:'none', page_effect:'none', effect_color:'#a855f7',
  layout:'center', card_position:'top', blur_enabled:false, glow_enabled:false,
  badge_text:'', badge_color:'#a855f7', cursor_effect:'none', card_style:'glass',
  custom_font_url:'', custom_font_name:'',
  avatar_orbit:true, card_led_border:true, card_tilt:true,
  show_views:true, show_id:true, show_music:true, name_font:'orbitron',
};

const TABS = [
  {key:'profile',label:'Profile',icon:<IconUser size={13}/>},
  {key:'appearance',label:'Style',icon:<IconPalette size={13}/>},
  {key:'effects',label:'Effects',icon:<IconSparkles size={13}/>},
  {key:'links',label:'Links',icon:<IconLink size={13}/>},
  {key:'music',label:'Music',icon:<IconMusic size={13}/>},
  {key:'extras',label:'Extras',icon:<IconSettings size={13}/>},
] as const;
type Tab = typeof TABS[number]['key'];

function Toggle({label, desc, checked, onChange}: {label:string; desc?:string; checked:boolean; onChange:(v:boolean)=>void}) {
  return (
    <div onClick={()=>onChange(!checked)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,cursor:'pointer',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',userSelect:'none' as const}}>
      <div>
        <div style={{fontSize:13,fontWeight:500,color:'#ccc'}}>{label}</div>
        {desc && <div style={{fontSize:11,color:'#444',marginTop:2}}>{desc}</div>}
      </div>
      <div style={{width:38,height:22,borderRadius:11,background:checked?'#a855f7':'rgba(255,255,255,0.1)',position:'relative',transition:'background 0.2s',flexShrink:0}}>
        <div style={{position:'absolute',top:3,left:checked?17:3,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'left 0.2s'}}/>
      </div>
    </div>
  );
}

function ImgUpload({label,value,onChange}:{label:string;value:string;onChange:(url:string)=>void}) {
  const [uploading,setUploading]=useState(false);
  const [err,setErr]=useState('');
  const ref=useRef<HTMLInputElement>(null);
  const {startUpload}=useUploadThing('imageUploader',{
    onClientUploadComplete:(res)=>{
      if(res?.[0]){const f=res[0];onChange((f as {ufsUrl?:string;url?:string}).ufsUrl||f.url||'');}
      setUploading(false);
    },
    onUploadError:(e)=>{setErr(e.message);setUploading(false);},
  });
  return (
    <div>
      <label style={{display:'block',fontSize:12,color:'#555',marginBottom:6,fontWeight:500}}>{label}</label>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        {value&&<img src={value} alt="" style={{width:40,height:40,borderRadius:8,objectFit:'cover',flexShrink:0,border:'1px solid rgba(255,255,255,0.08)'}}/>}
        <input className="input" value={value} onChange={e=>onChange(e.target.value)} placeholder="https://… or upload" style={{flex:1,minWidth:100}}/>
        <button type="button" onClick={()=>ref.current?.click()} className="btn btn-ghost" style={{fontSize:11,padding:'8px 10px',flexShrink:0,gap:4}} disabled={uploading}>
          <IconUpload size={12}/>{uploading?'…':'Upload'}
        </button>
        <input ref={ref} type="file" accept="image/*,.gif" style={{display:'none'}} onChange={async e=>{
          const f=e.target.files?.[0];if(!f)return;
          if(f.size>8*1024*1024){setErr('Max 8MB');return;}
          setUploading(true);setErr('');await startUpload([f]);
        }}/>
      </div>
      {err&&<div style={{fontSize:11,color:'#f87171',marginTop:3}}>{err}</div>}
    </div>
  );
}

export default function Dashboard() {
  const router=useRouter();
  const [user,setUser]=useState<{username:string}|null>(null);
  const [profile,setProfile]=useState<Profile>(DEF);
  const [links,setLinks]=useState<LinkItem[]>([]);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [tab,setTab]=useState<Tab>('profile');
  const [loading,setLoading]=useState(true);
  const [fontUploading,setFontUploading]=useState(false);
  const [fontError,setFontError]=useState('');
  const fontRef=useRef<HTMLInputElement>(null);
  const set=(k:keyof Profile,v:unknown)=>setProfile(p=>({...p,[k]:v}));

  const {startUpload:uploadFont}=useUploadThing('fontUploader',{
    onClientUploadComplete:(res)=>{
      if(res?.[0]){const f=res[0];const url=(f as {ufsUrl?:string;url?:string}).ufsUrl||f.url||'';
        const name=f.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');
        setProfile(p=>({...p,custom_font_url:url,custom_font_name:name,font_family:'__custom__'}));}
      setFontUploading(false);
    },
    onUploadError:(e)=>{setFontError(e.message);setFontUploading(false);},
  });

  useEffect(() => {
  if (sessionStorage.getItem('heartbeat_dashboard')) return;

  sessionStorage.setItem('heartbeat_dashboard', 'true');

  fetch('/api/heartbeat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      path: window.location.pathname,
    }),
  }).catch(console.error);
}, []);


  useEffect(()=>{
    fetch('/api/auth/session').then(r=>r.json()).then(d=>{
      if(!d.user){router.push('/login');return;}
      setUser(d.user);
      fetch('/api/profile').then(r=>r.json()).then(d2=>{
        if(d2.profile)setProfile({...DEF,...d2.profile,
          avatar_orbit:d2.profile.avatar_orbit??true,
          card_led_border:d2.profile.card_led_border??true,
          card_tilt:d2.profile.card_tilt??true,
          show_views:d2.profile.show_views??true,
          show_id:d2.profile.show_id??true,
          show_music:d2.profile.show_music??true,
          name_font:d2.profile.name_font||'orbitron',
        });
        if(d2.links)setLinks(d2.links.map((l:LinkItem)=>({...l,link_type:l.link_type||'url'})));
        setLoading(false);
      });
    });
  },[router]);

  const save=useCallback(async()=>{
    setSaving(true);
    await fetch('/api/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...profile,links})});
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2000);
  },[profile,links]);

  const logout=async()=>{await fetch('/api/auth/logout',{method:'POST'});router.push('/');};

  const usingCustomFont=!!(profile.custom_font_url&&profile.font_family==='__custom__');
  const views=Number(profile.total_views??0).toLocaleString();

  if(loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#333',fontSize:13}}>Loading…</div>;

  return (
    <div style={{minHeight:'100vh',background:'#0A0A1A'}}>
      {/* Topbar */}
      <nav style={{borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0 16px',display:'flex',alignItems:'center',gap:8,height:52,position:'sticky',top:0,background:'rgba(10,10,26,0.97)',backdropFilter:'blur(12px)',zIndex:200}}>
        <Link href="/" style={{fontWeight:800,fontSize:17,marginRight:'auto',flexShrink:0}}>
          <span style={{color:'#a855f7'}}>oni</span>ion.cc
        </Link>
        <span style={{fontSize:11,color:'#444',display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
          <IconEye size={11}/>{views}
        </span>
        {profile.display_id&&<span style={{fontSize:11,color:'#333',display:'flex',alignItems:'center',gap:2,flexShrink:0}}>
          <IconHash size={10}/>{profile.display_id}
        </span>}
        <Link href={`/${user?.username}`} target="_blank" className="btn btn-ghost" style={{fontSize:11,padding:'5px 10px',flexShrink:0,gap:4}}>
          <IconExternalLink size={11}/>View
        </Link>
        <button onClick={save} className="btn btn-primary" style={{fontSize:11,padding:'5px 12px',flexShrink:0,gap:4}} disabled={saving}>
          {saved?<><IconCheck size={11}/>Saved</>:<><IconSave size={11}/>{saving?'Saving…':'Save'}</>}
        </button>
        <button onClick={logout} style={{background:'none',border:'none',color:'#444',cursor:'pointer',padding:'5px',flexShrink:0,display:'flex'}}><IconLogOut size={15}/></button>
      </nav>

      <div style={{maxWidth:780,margin:'0 auto',padding:'20px 14px 80px'}}>
        <div style={{marginBottom:20}}>
          <h1 style={{fontWeight:700,fontSize:21,letterSpacing:'-0.5px',marginBottom:2}}>Dashboard</h1>
          <p style={{color:'#444',fontSize:12}}>oniion.cc/<span style={{color:'#a855f7'}}>{user?.username}</span></p>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:2,marginBottom:20,overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{
              background:tab===t.key?'rgba(168,85,247,0.1)':'none',
              border:tab===t.key?'1px solid rgba(168,85,247,0.22)':'1px solid transparent',
              color:tab===t.key?'#c084fc':'#555',
              fontSize:12,padding:'7px 12px',cursor:'pointer',fontFamily:'inherit',
              borderRadius:8,fontWeight:tab===t.key?600:400,
              display:'flex',alignItems:'center',gap:5,flexShrink:0,transition:'all 0.15s',
            }}>{t.icon}{t.label}</button>
          ))}
        </div>

        {/* ── PROFILE ── */}
        {tab==='profile'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Identity" icon={<IconUser size={12}/>}>
            <Field label="Display Name"><input className="input" value={profile.display_name} onChange={e=>set('display_name',e.target.value)} placeholder="Your name" maxLength={64}/></Field>
            <Field label="Bio"><textarea className="input" value={profile.bio} onChange={e=>set('bio',e.target.value)} placeholder="Tell the world about yourself…" maxLength={300} rows={3}/></Field>
            <Field label="Badge text (optional)">
              <div style={{display:'flex',gap:8}}>
                <input className="input" value={profile.badge_text} onChange={e=>set('badge_text',e.target.value)} placeholder="e.g. artist, she/her" maxLength={64}/>
                <input type="color" value={profile.badge_color} onChange={e=>set('badge_color',e.target.value)} style={{width:42,height:40,border:'none',borderRadius:8,cursor:'pointer',padding:2,background:'none',flexShrink:0}}/>
              </div>
            </Field>
          </Card>
          <Card title="Images" icon={<IconCamera size={12}/>}>
            <ImgUpload label="Profile Picture (supports GIF)" value={profile.avatar_url} onChange={v=>set('avatar_url',v)}/>
            <ImgUpload label="Banner (optional, supports GIF)" value={profile.banner_url} onChange={v=>set('banner_url',v)}/>
            <Field label="Banner Fallback Color">
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input type="color" value={profile.banner_color} onChange={e=>set('banner_color',e.target.value)} style={{width:42,height:40,border:'none',borderRadius:8,cursor:'pointer',flexShrink:0}}/>
                <input className="input" value={profile.banner_color} onChange={e=>set('banner_color',e.target.value)}/>
              </div>
            </Field>
          </Card>
        </div>}

        {/* ── APPEARANCE ── */}
        {tab==='appearance'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Background" icon={<IconImage size={12}/>}>
            <Field label="Type"><CustomSelect value={profile.background_type} onChange={v=>set('background_type',v)} options={BG_TYPES}/></Field>
            {profile.background_type==='color'&&<Field label="Color">
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input type="color" value={profile.background_value} onChange={e=>set('background_value',e.target.value)} style={{width:42,height:40,border:'none',borderRadius:8,cursor:'pointer',flexShrink:0}}/>
                <input className="input" value={profile.background_value} onChange={e=>set('background_value',e.target.value)}/>
              </div>
            </Field>}
            {profile.background_type==='gradient'&&<Field label="CSS Gradient">
              <input className="input" value={profile.background_value} onChange={e=>set('background_value',e.target.value)} placeholder="linear-gradient(135deg, #0a0a1a, #1a0a2a)"/>
            </Field>}
            {profile.background_type==='image'&&<ImgUpload label="Background Image / GIF" value={profile.background_value} onChange={v=>set('background_value',v)}/>}
          </Card>

          <Card title="Colors" icon={<IconDroplet size={12}/>}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Field label="Text">
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input type="color" value={profile.text_color} onChange={e=>set('text_color',e.target.value)} style={{width:42,height:40,border:'none',borderRadius:8,cursor:'pointer',flexShrink:0}}/>
                  <input className="input" value={profile.text_color} onChange={e=>set('text_color',e.target.value)} style={{minWidth:0}}/>
                </div>
              </Field>
              <Field label="Accent">
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input type="color" value={profile.accent_color} onChange={e=>set('accent_color',e.target.value)} style={{width:42,height:40,border:'none',borderRadius:8,cursor:'pointer',flexShrink:0}}/>
                  <input className="input" value={profile.accent_color} onChange={e=>set('accent_color',e.target.value)} style={{minWidth:0}}/>
                </div>
              </Field>
            </div>
          </Card>

          <Card title="Font" icon={<IconType size={12}/>}>
            <Field label="Name / Title Font">
              <CustomSelect value={profile.name_font||'orbitron'} onChange={v=>set('name_font',v)} options={NAME_FONTS}/>
            </Field>
            <Field label="Upload custom body font (.ttf / .otf / .woff / .woff2)">
              <div style={{border:usingCustomFont?'1px solid rgba(168,85,247,0.35)':'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:14,background:'rgba(255,255,255,0.015)'}}>
                {usingCustomFont?(
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <IconFont size={15} color="#a855f7"/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{profile.custom_font_name}</div>
                      <div style={{fontSize:11,color:'#555'}}>Custom font active</div>
                    </div>
                    <button onClick={()=>setProfile(p=>({...p,custom_font_url:'',custom_font_name:'',font_family:'Space Grotesk'}))} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.18)',color:'#f87171',borderRadius:7,padding:'5px 10px',cursor:'pointer',fontFamily:'inherit',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
                      <IconX size={11}/>Remove
                    </button>
                  </div>
                ):(
                  <div className={`upload-zone${fontUploading?' uploading':''}`} onClick={()=>fontRef.current?.click()}>
                    {fontUploading?<div style={{color:'#a855f7',fontSize:13}}>Uploading…</div>:<>
                      <IconUpload size={18} color="#444"/>
                      <div style={{fontSize:13,color:'#555',marginTop:6}}>Click to upload font</div>
                      <div style={{fontSize:11,color:'#333',marginTop:2}}>.ttf • .otf • .woff • .woff2 — max 4MB</div>
                    </>}
                  </div>
                )}
                <input ref={fontRef} type="file" accept=".ttf,.otf,.woff,.woff2" style={{display:'none'}} onChange={async e=>{
                  const f=e.target.files?.[0];if(!f)return;
                  if(!['ttf','otf','woff','woff2'].includes(f.name.split('.').pop()||'')){setFontError('Only .ttf .otf .woff .woff2');return;}
                  if(f.size>4*1024*1024){setFontError('Max 4MB');return;}
                  setFontUploading(true);setFontError('');await uploadFont([f]);
                }}/>
                {fontError&&<div style={{marginTop:6,fontSize:12,color:'#f87171'}}>{fontError}</div>}
              </div>
            </Field>
            <Field label={usingCustomFont?'Preset (remove custom to use)':'Preset Body Font'}>
              <CustomSelect
                value={usingCustomFont?'__custom__':profile.font_family}
                onChange={v=>set('font_family',v)}
                options={[
                  ...(usingCustomFont?[{value:'__custom__',label:profile.custom_font_name||'Custom font'}]:[]),
                  ...FONTS.map(f=>({value:f,label:f,preview:<span style={{fontFamily:`'${f}',sans-serif`,fontSize:15,color:'#888'}}>Aa</span>}))
                ]}
              />
            </Field>
          </Card>

          <Card title="Layout & Card" icon={<IconLayout size={12}/>}>
            <Field label="Text Alignment"><CustomSelect value={profile.layout} onChange={v=>set('layout',v)} options={[{value:'center',label:'Centered'},{value:'left',label:'Left aligned'}]}/></Field>
            <Field label="Card Position"><CustomSelect value={profile.card_position||'top'} onChange={v=>set('card_position',v)} options={[{value:'top',label:'Top of page'},{value:'middle',label:'Middle of screen'}]}/></Field>
            <Field label="Card Style"><CustomSelect value={profile.card_style} onChange={v=>set('card_style',v)} options={CARD_STYLES}/></Field>
            <Field label="Card Background Image (optional)">
              <ImgUpload label="" value={profile.card_image_url} onChange={v=>set('card_image_url',v)}/>
            </Field>
            <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
                <input type="checkbox" checked={profile.blur_enabled} onChange={e=>set('blur_enabled',e.target.checked)} style={{accentColor:'#a855f7',width:14,height:14}}/>Blur
              </label>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
                <input type="checkbox" checked={profile.glow_enabled} onChange={e=>set('glow_enabled',e.target.checked)} style={{accentColor:'#a855f7',width:14,height:14}}/>Glow
              </label>
            </div>
          </Card>
        </div>}

        {/* ── EFFECTS ── */}
        {tab==='effects'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Name Text Effect" icon={<IconType size={12}/>}>
            <CustomSelect value={profile.font_effect} onChange={v=>set('font_effect',v)} options={FONT_EFFECTS}/>
          </Card>
          <Card title="Page Effect" icon={<IconWand size={12}/>}>
            <Field label="Effect"><CustomSelect value={profile.page_effect} onChange={v=>set('page_effect',v)} options={PAGE_EFFECTS}/></Field>
            <Field label="Effect Color">
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input type="color" value={profile.effect_color} onChange={e=>set('effect_color',e.target.value)} style={{width:42,height:40,border:'none',borderRadius:8,cursor:'pointer',flexShrink:0}}/>
                <input className="input" value={profile.effect_color} onChange={e=>set('effect_color',e.target.value)}/>
              </div>
            </Field>
          </Card>
          <Card title="Cursor Effect" icon={<IconMousePointer size={12}/>}>
            <CustomSelect value={profile.cursor_effect} onChange={v=>set('cursor_effect',v)} options={CURSOR_EFFECTS}/>
          </Card>
        </div>}

        {/* ── LINKS ── */}
        {tab==='links'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Links & Wallets" icon={<IconLink size={12}/>}>
            <p style={{color:'#444',fontSize:12,marginBottom:10}}>Add social links, websites, or crypto wallet addresses.</p>
            {links.map((lk,i)=>(
              <div key={i} style={{padding:12,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:10,marginBottom:8,display:'flex',flexDirection:'column',gap:8}}>
                {lk.link_type==='crypto'?(
                  <>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <div style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.04)',borderRadius:8,flexShrink:0,fontSize:18}}>
                        {CRYPTO_COINS.find(c=>c.value===lk.icon)?.symbol||'₿'}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <CustomSelect value={lk.icon||'eth'} onChange={v=>setLinks(l=>l.map((x,j)=>j===i?{...x,icon:v}:x))} options={CRYPTO_COINS.map(c=>({value:c.value,label:c.label,preview:<span style={{fontFamily:'monospace',fontSize:14}}>{c.symbol}</span>}))}/>
                      </div>
                      <button onClick={()=>setLinks(l=>l.filter((_,j)=>j!==i))} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',color:'#f87171',borderRadius:8,padding:8,cursor:'pointer',flexShrink:0,display:'flex'}}><IconX size={12}/></button>
                    </div>
                    <input className="input" value={lk.title} onChange={e=>setLinks(l=>l.map((x,j)=>j===i?{...x,title:e.target.value}:x))} placeholder="Label e.g. Donate ETH" maxLength={64}/>
                    <input className="input" value={lk.url} onChange={e=>setLinks(l=>l.map((x,j)=>j===i?{...x,url:e.target.value}:x))} placeholder="0x… wallet address"/>
                  </>
                ):(
                  <>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <select value={lk.icon||'link'} onChange={e=>setLinks(l=>l.map((x,j)=>j===i?{...x,icon:e.target.value}:x))} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'8px 10px',color:'#fff',fontFamily:'inherit',fontSize:12,cursor:'pointer',outline:'none',width:110,flexShrink:0}}>
                        {SOCIAL_OPTIONS.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                      <input className="input" value={lk.title} onChange={e=>setLinks(l=>l.map((x,j)=>j===i?{...x,title:e.target.value}:x))} placeholder="Label" style={{flex:1,minWidth:0}} maxLength={128}/>
                      <button onClick={()=>setLinks(l=>l.filter((_,j)=>j!==i))} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',color:'#f87171',borderRadius:8,padding:8,cursor:'pointer',flexShrink:0,display:'flex'}}><IconX size={12}/></button>
                    </div>
                    <input className="input" value={lk.url} onChange={e=>{
                      const v=e.target.value;
                      const detected=detectSocialIcon(v);
                      setLinks(l=>l.map((x,j)=>j===i?{...x,url:v,icon:detected!=='link'?detected:x.icon}:x));
                    }} placeholder="https://…"/>
                  </>
                )}
              </div>
            ))}
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button onClick={()=>setLinks(l=>[...l,{title:'',url:'',icon:'link',link_type:'url'}])} className="btn btn-ghost" style={{flex:1,justifyContent:'center',gap:5,fontSize:12}}>
                <IconPlus size={13}/>Add link
              </button>
              <button onClick={()=>setLinks(l=>[...l,{title:'',url:'',icon:'eth',link_type:'crypto'}])} className="btn btn-ghost" style={{flex:1,justifyContent:'center',gap:5,fontSize:12}}>
                <IconCrown size={13}/>Add wallet
              </button>
            </div>
          </Card>
        </div>}

        {/* ── MUSIC ── */}
        {tab==='music'&&<Card title="Music Player" icon={<IconMusic size={12}/>}>
          <p style={{color:'#444',fontSize:12,marginBottom:10}}>Paste a direct .mp3 URL or a YouTube link — audio only.</p>
          <Field label="Audio / YouTube URL"><input className="input" value={profile.song_url} onChange={e=>set('song_url',e.target.value)} placeholder="https://…/song.mp3  or  youtube.com/watch?v=…"/></Field>
          <Field label="Song Title"><input className="input" value={profile.song_title} onChange={e=>set('song_title',e.target.value)} placeholder="Song name" maxLength={100}/></Field>
          <Field label="Artist"><input className="input" value={profile.song_artist} onChange={e=>set('song_artist',e.target.value)} placeholder="Artist name" maxLength={100}/></Field>
        </Card>}

        {/* ── EXTRAS ── */}
        {tab==='extras'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Card Animations" icon={<IconSparkles size={12}/>}>
            <Toggle label="LED border animation" desc="Animated gradient glow around the card" checked={profile.card_led_border} onChange={v=>set('card_led_border',v)}/>
            <Toggle label="3D tilt on hover" desc="Card tilts in 3D when you move your mouse over it" checked={profile.card_tilt} onChange={v=>set('card_tilt',v)}/>
            <Toggle label="Avatar orbit ring" desc="Glowing orbit animation around the profile picture" checked={profile.avatar_orbit} onChange={v=>set('avatar_orbit',v)}/>
          </Card>
          <Card title="Profile Info" icon={<IconUser size={12}/>}>
            <Toggle label="Show view counter" desc="Show how many people have visited your profile" checked={profile.show_views} onChange={v=>set('show_views',v)}/>
            <Toggle label="Show #ID" desc="Show your unique profile number (e.g. #42)" checked={profile.show_id} onChange={v=>set('show_id',v)}/>
            <Toggle label="Show music player" desc="Show the music player card even when a song is set" checked={profile.show_music} onChange={v=>set('show_music',v)}/>
          </Card>
        </div>}

        <div style={{marginTop:20,display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={save} className="btn btn-primary" disabled={saving} style={{padding:'11px 24px',fontSize:13,gap:6}}>
            {saved?<><IconCheck size={14}/>Saved!</>:<><IconSave size={14}/>{saving?'Saving…':'Save changes'}</>}
          </button>
          <Link href={`/${user?.username}`} target="_blank" className="btn btn-ghost" style={{fontSize:13,padding:'11px 18px',gap:6}}>
            <IconExternalLink size={13}/>Preview
          </Link>
        </div>
      </div>
    </div>
  );
}

function Card({title,icon,children}:{title:string;icon:React.ReactNode;children:React.ReactNode}) {
  return (
    <div style={{background:'rgba(255,255,255,0.015)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:14,padding:'16px 14px'}}>
      <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:14,color:'#555',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.07em'}}>
        {icon}{title}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>{children}</div>
    </div>
  );
}
function Field({label,children}:{label:string;children:React.ReactNode}) {
  return (
    <div>
      {label&&<label style={{display:'block',fontSize:12,color:'#555',marginBottom:5,fontWeight:500}}>{label}</label>}
      {children}
    </div>
  );
}
