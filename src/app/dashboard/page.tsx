'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUploadThing } from '@/lib/uploadthing-client';
import { CustomSelect } from '@/components/custom-select';
import { SOCIAL_OPTIONS, detectSocialIcon } from '@/components/social-icons';
import { CRYPTO_META } from '@/components/crypto-icons';
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
  {value:'none',label:'Default cursor'},{value:'trail',label:'Trail'},
  {value:'ring',label:'Ring'},{value:'dot',label:'Dot'},
  {value:'crosshair',label:'Crosshair'},{value:'bubble',label:'Bubble'},
];
const TRAIL_STYLES = [
  {value:'dot',label:'Dot'},{value:'star',label:'Star'},
  {value:'ring',label:'Ring'},{value:'spark',label:'Spark'},
  {value:'comet',label:'Comet'},
];
const CARD_STYLES = [{value:'glass',label:'Glass'},{value:'solid',label:'Solid'},{value:'outline',label:'Outline'},{value:'neon',label:'Neon'}];
const BG_TYPES = [
  {value:'color',label:'Solid Color'},{value:'gradient',label:'Gradient'},
  {value:'image',label:'Image / GIF'},{value:'particles',label:'Particles'},
];
const CRYPTO_OPTIONS = Object.entries(CRYPTO_META).map(([k,v])=>({value:k,label:v.name}));

type LinkItem = { title:string; url:string; icon:string; link_type:string };
type Profile = {
  display_name:string; bio:string; avatar_url:string;
  banner_url:string; banner_color:string; background_image_url:string; card_image_url:string;
  song_url:string; song_title:string; song_artist:string;
  background_type:string; background_value:string;
  text_color:string; accent_color:string; font_family:string;
  font_effect:string; page_effect:string; effect_color:string;
  layout:string; card_position:string;
  blur_enabled:boolean; glow_enabled:boolean;
  badge_text:string; badge_color:string;
  cursor_effect:string; cursor_trail_style:string; card_style:string;
  custom_font_url:string; custom_font_name:string;
  avatar_orbit:boolean; card_led_border:boolean; card_tilt:boolean;
  show_views:boolean; show_id:boolean; show_music:boolean;
  name_font:string; glass_opacity:number; glass_tint:string; show_verified_badge:boolean; verified?:boolean; custom_cursor_url:string;
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
  badge_text:'', badge_color:'#a855f7', cursor_effect:'none', cursor_trail_style:'dot',
  card_style:'glass', custom_font_url:'', custom_font_name:'',
  avatar_orbit:true, card_led_border:true, card_tilt:true,
  show_views:true, show_id:true, show_music:true,
  name_font:'orbitron', glass_opacity:0.72, glass_tint:'auto', show_verified_badge:true, custom_cursor_url:'',
};

const TABS = [
  {key:'profile',  label:'Profile',    icon:<IconUser size={13}/>},
  {key:'appearance',label:'Style',     icon:<IconPalette size={13}/>},
  {key:'effects',  label:'Effects',    icon:<IconSparkles size={13}/>},
  {key:'links',    label:'Links',      icon:<IconLink size={13}/>},
  {key:'music',    label:'Music',      icon:<IconMusic size={13}/>},
  {key:'extras',   label:'Extras',     icon:<IconSettings size={13}/>},
  {key:'account',  label:'Account',    icon:<IconUser size={13}/>},
] as const;
type Tab = typeof TABS[number]['key'];

function Toggle({label,desc,checked,onChange}:{label:string;desc?:string;checked:boolean;onChange:(v:boolean)=>void}) {
  return (
    <div onClick={()=>onChange(!checked)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,cursor:'pointer',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',userSelect:'none' as const}}>
      <div>
        <div style={{fontSize:13,fontWeight:500,color:'#ccc'}}>{label}</div>
        {desc&&<div style={{fontSize:11,color:'#444',marginTop:2}}>{desc}</div>}
      </div>
      <div style={{width:38,height:22,borderRadius:11,background:checked?'#a855f7':'rgba(255,255,255,0.1)',position:'relative',transition:'background .2s',flexShrink:0}}>
        <div style={{position:'absolute',top:3,left:checked?17:3,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
      </div>
    </div>
  );
}

function ImgUpload({label,value,onChange}:{label:string;value:string;onChange:(url:string)=>void}) {
  const [up,setUp]=useState(false);
  const [err,setErr]=useState('');
  const ref=useRef<HTMLInputElement>(null);
  const {startUpload}=useUploadThing('imageUploader',{
    onClientUploadComplete:(res)=>{if(res?.[0]){const f=res[0];onChange((f as {ufsUrl?:string;url?:string}).ufsUrl||f.url||'');}setUp(false);},
    onUploadError:(e)=>{setErr(e.message);setUp(false);},
  });
  return (
    <div>
      <label style={{display:'block',fontSize:12,color:'#555',marginBottom:5,fontWeight:500}}>{label}</label>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        {value&&<img src={value} alt="" style={{width:40,height:40,borderRadius:8,objectFit:'cover',flexShrink:0,border:'1px solid rgba(255,255,255,0.08)'}}/>}
        <input className="input" value={value} onChange={e=>onChange(e.target.value)} placeholder="https://… or upload" style={{flex:1,minWidth:100}}/>
        <button type="button" onClick={()=>ref.current?.click()} className="btn btn-ghost" style={{fontSize:11,padding:'8px 10px',flexShrink:0,gap:4}} disabled={up}>
          <IconUpload size={12}/>{up?'…':'Upload'}
        </button>
        <input ref={ref} type="file" accept="image/*,.gif" style={{display:'none'}} onChange={async e=>{
          const f=e.target.files?.[0];if(!f)return;
          if(f.size>8*1024*1024){setErr('Max 8MB');return;}
          setUp(true);setErr('');await startUpload([f]);
        }}/>
      </div>
      {err&&<div style={{fontSize:11,color:'#f87171',marginTop:3}}>{err}</div>}
    </div>
  );
}

function AudioUpload({label,value,onChange}:{label:string;value:string;onChange:(url:string)=>void}) {
  const [up,setUp]=useState(false);
  const [err,setErr]=useState('');
  const ref=useRef<HTMLInputElement>(null);
  const {startUpload}=useUploadThing('audioUploader',{
    onClientUploadComplete:(res)=>{if(res?.[0]){const f=res[0];onChange((f as {ufsUrl?:string;url?:string}).ufsUrl||f.url||'');}setUp(false);},
    onUploadError:(e)=>{setErr(e.message);setUp(false);},
  });
  return (
    <div>
      <label style={{display:'block',fontSize:12,color:'#555',marginBottom:5,fontWeight:500}}>{label}</label>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <input className="input" value={value} onChange={e=>onChange(e.target.value)} placeholder="https://…/song.mp3 or youtube.com/… or upload" style={{flex:1,minWidth:100}}/>
        <button type="button" onClick={()=>ref.current?.click()} className="btn btn-ghost" style={{fontSize:11,padding:'8px 10px',flexShrink:0,gap:4}} disabled={up}>
          <IconUpload size={12}/>{up?'…':'Upload'}
        </button>
        <input ref={ref} type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a" style={{display:'none'}} onChange={async e=>{
          const f=e.target.files?.[0];if(!f)return;
          if(f.size>10*1024*1024){setErr('Max 10MB');return;}
          setUp(true);setErr('');await startUpload([f]);
        }}/>
      </div>
      {err&&<div style={{fontSize:11,color:'#f87171',marginTop:3}}>{err}</div>}
    </div>
  );
}

export default function Dashboard() {
  const router=useRouter();
  const [user,setUser]=useState<{username:string;userId?:string}|null>(null);
  const [profile,setProfile]=useState<Profile>(DEF);
  const [links,setLinks]=useState<LinkItem[]>([]);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [tab,setTab]=useState<Tab>('profile');
  const [loading,setLoading]=useState(true);
  const [fontUploading,setFontUploading]=useState(false);
  const [fontError,setFontError]=useState('');
  const fontRef=useRef<HTMLInputElement>(null);
  // Account tab state
  const [curPwd,setCurPwd]=useState('');
  const [newUser,setNewUser]=useState('');
  const [newPwd,setNewPwd]=useState('');
  const [acctMsg,setAcctMsg]=useState('');
  const [acctErr,setAcctErr]=useState('');
  const [acctLoading,setAcctLoading]=useState(false);

  const set=(k:keyof Profile,v:unknown)=>setProfile(p=>({...p,[k]:v}));

  const {startUpload:uploadFont}=useUploadThing('fontUploader',{
    onClientUploadComplete:(res)=>{
      if(res?.[0]){const f=res[0];const url=(f as {ufsUrl?:string;url?:string}).ufsUrl||f.url||'';const name=f.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');
        setProfile(p=>({...p,custom_font_url:url,custom_font_name:name,font_family:'__custom__'}));}
      setFontUploading(false);
    },
    onUploadError:(e)=>{setFontError(e.message);setFontUploading(false);},
  });

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
          glass_opacity:d2.profile.glass_opacity??0.72,
          glass_tint:d2.profile.glass_tint||'auto',
          cursor_trail_style:d2.profile.cursor_trail_style||'dot',
          show_verified_badge:d2.profile.show_verified_badge??true,
          custom_cursor_url:d2.profile.custom_cursor_url||'',
          verified:d2.profile.verified??false,
        });
        if(d2.links)setLinks(d2.links.map((l:LinkItem)=>({...l,link_type:l.link_type||'url'})));
        setLoading(false);
      });
    });
  },[router]);

  const save=useCallback(async()=>{
    setSaving(true);
    try {
      const res=await fetch('/api/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...profile,links})});
      const data=await res.json();
      if(!res.ok){alert('Save failed: '+(data.error||'Unknown error'));}
      else{setSaved(true);setTimeout(()=>setSaved(false),2000);}
    } catch(e){alert('Save error: '+String(e));}
    setSaving(false);
  },[profile,links]);

  const logout=async()=>{await fetch('/api/auth/logout',{method:'POST'});router.push('/');};

  const changeUsername=async()=>{
    if(!newUser.trim()){setAcctErr('Enter a new username');return;}
    if(!curPwd){setAcctErr('Enter your current password');return;}
    setAcctLoading(true);setAcctErr('');setAcctMsg('');
    const res=await fetch('/api/account',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'username',newUsername:newUser,currentPassword:curPwd})});
    const d=await res.json();
    if(!res.ok){setAcctErr(d.error);}
    else{setAcctMsg('Username changed! Reloading…');setUser(u=>u?{...u,username:d.username}:u);setNewUser('');setCurPwd('');setTimeout(()=>window.location.reload(),1500);}
    setAcctLoading(false);
  };

  const changePassword=async()=>{
    if(!newPwd||newPwd.length<6){setAcctErr('New password must be 6+ characters');return;}
    if(!curPwd){setAcctErr('Enter your current password');return;}
    setAcctLoading(true);setAcctErr('');setAcctMsg('');
    const res=await fetch('/api/account',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'password',newPassword:newPwd,currentPassword:curPwd})});
    const d=await res.json();
    if(!res.ok){setAcctErr(d.error);}
    else{setAcctMsg('Password changed successfully!');setNewPwd('');setCurPwd('');}
    setAcctLoading(false);
  };

  if(loading)return<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#333',fontSize:13}}>Loading…</div>;

  const usingCustomFont=!!(profile.custom_font_url&&profile.font_family==='__custom__');
  const views=Number(profile.total_views??0).toLocaleString();

  return(
    <div style={{minHeight:'100vh',background:'#0a0a0a'}}>
      {/* Nav */}
      <nav style={{borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0 16px',display:'flex',alignItems:'center',gap:8,height:52,position:'sticky',top:0,background:'rgba(10,10,10,0.97)',backdropFilter:'blur(12px)',zIndex:200}}>
        <Link href="/" style={{fontWeight:800,fontSize:17,marginRight:'auto',flexShrink:0,color:'#e0e0ff'}}>
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
        <div style={{display:'flex',gap:2,marginBottom:20,overflowX:'auto',WebkitOverflowScrolling:'touch' as unknown as string}}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{
              background:tab===t.key?'rgba(168,85,247,0.1)':'none',
              border:tab===t.key?'1px solid rgba(168,85,247,0.22)':'1px solid transparent',
              color:tab===t.key?'#c084fc':'#555',
              fontSize:12,padding:'7px 12px',cursor:'pointer',fontFamily:'inherit',
              borderRadius:8,fontWeight:tab===t.key?600:400,
              display:'flex',alignItems:'center',gap:5,flexShrink:0,transition:'all .15s',
            }}>{t.icon}{t.label}</button>
          ))}
        </div>

        {/* ── PROFILE ── */}
        {tab==='profile'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Identity" icon={<IconUser size={12}/>}>
            <Field label="Display Name"><input className="input" value={profile.display_name} onChange={e=>set('display_name',e.target.value)} placeholder="Your name" maxLength={64}/></Field>
            <Field label="Bio"><textarea className="input" value={profile.bio} onChange={e=>set('bio',e.target.value)} placeholder="Tell the world about yourself…" maxLength={300} rows={3}/></Field>
            <Field label="Badge text">
              <div style={{display:'flex',gap:8}}>
                <input className="input" value={profile.badge_text} onChange={e=>set('badge_text',e.target.value)} placeholder="artist, she/her, etc" maxLength={64}/>
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
            <Field label="Custom font upload (.ttf / .otf / .woff / .woff2)">
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
            {/* Glass opacity */}
            <Field label={`Glass Opacity: ${Math.round((profile.glass_opacity??0.72)*100)}%`}>
              <input type="range" min={0.05} max={0.98} step={0.01} value={profile.glass_opacity??0.72} onChange={e=>set('glass_opacity',parseFloat(e.target.value))} className="input" style={{padding:0,height:8,background:`rgba(168,85,247,${profile.glass_opacity??0.72})`}}/>
            </Field>
            {/* Glass tint */}
            <Field label="Glass Tint Color">
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                {['auto','none','#0a0a0a','#0a0a1a','#1a0a0a'].map(v=>(
                  <button key={v} onClick={()=>set('glass_tint',v)} style={{padding:'6px 12px',borderRadius:8,fontSize:12,border:`1px solid ${profile.glass_tint===v?'#a855f7':'rgba(255,255,255,0.1)'}`,background:profile.glass_tint===v?'rgba(168,85,247,0.15)':'rgba(255,255,255,0.04)',color:profile.glass_tint===v?'#c084fc':'#888',cursor:'pointer'}}>
                    {v==='auto'?'Match accent':v==='none'?'Dark':v}
                  </button>
                ))}
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <input type="color" value={!['auto','none'].includes(profile.glass_tint||'auto')?(profile.glass_tint||'#0a0a1a'):'#0a0a1a'} onChange={e=>set('glass_tint',e.target.value)} style={{width:36,height:32,border:'none',borderRadius:6,cursor:'pointer'}}/>
                  <span style={{fontSize:11,color:'#555'}}>Custom</span>
                </div>
              </div>
            </Field>
            <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
                <input type="checkbox" checked={profile.blur_enabled} onChange={e=>set('blur_enabled',e.target.checked)} style={{accentColor:'#a855f7',width:14,height:14}}/>Blur bg
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
            <Field label="Color">
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input type="color" value={profile.effect_color} onChange={e=>set('effect_color',e.target.value)} style={{width:42,height:40,border:'none',borderRadius:8,cursor:'pointer',flexShrink:0}}/>
                <input className="input" value={profile.effect_color} onChange={e=>set('effect_color',e.target.value)}/>
              </div>
            </Field>
          </Card>
          <Card title="Cursor Effect" icon={<IconMousePointer size={12}/>}>
            <Field label="Type"><CustomSelect value={profile.cursor_effect} onChange={v=>set('cursor_effect',v)} options={CURSOR_EFFECTS}/></Field>
            {profile.cursor_effect==='trail'&&(
              <Field label="Trail Style">
                <CustomSelect
                  value={profile.cursor_trail_style||'dot'}
                  onChange={v=>set('cursor_trail_style',v)}
                  options={TRAIL_STYLES}
                />
              </Field>
            )}
            </Card>

            <Card title="Custom Cursor Image" icon={<IconMousePointer size={12}/>}>
            <p style={{fontSize:12,color:'#444',marginBottom:8}}>Upload a .png or .gif to use as a custom cursor. Overrides the cursor effect above. Recommended: 32×32px.</p>
            <ImgUpload label="Cursor image (PNG or GIF, max 8MB)" value={profile.custom_cursor_url} onChange={v=>set('custom_cursor_url',v)}/>
            {profile.custom_cursor_url&&(
              <button onClick={()=>set('custom_cursor_url','')} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.18)',color:'#f87171',borderRadius:7,padding:'5px 10px',cursor:'pointer',fontFamily:'inherit',fontSize:12,alignSelf:'flex-start',marginTop:4}}>
                Remove cursor image
              </button>
            )}
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
                      <div style={{flex:1}}>
                        <CustomSelect value={lk.icon||'eth'} onChange={v=>setLinks(l=>l.map((x,j)=>j===i?{...x,icon:v}:x))}
                          options={CRYPTO_OPTIONS.map(c=>({value:c.value,label:c.label,preview:<span style={{fontSize:14}}>{CRYPTO_META[c.value]?.color?'●':''}</span>}))}/>
                      </div>
                      <button onClick={()=>setLinks(l=>l.filter((_,j)=>j!==i))} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',color:'#f87171',borderRadius:8,padding:8,cursor:'pointer',flexShrink:0,display:'flex'}}><IconX size={12}/></button>
                    </div>
                    <input className="input" value={lk.title} onChange={e=>setLinks(l=>l.map((x,j)=>j===i?{...x,title:e.target.value}:x))} placeholder="Label e.g. Donate ETH" maxLength={64}/>
                    <input className="input" value={lk.url} onChange={e=>setLinks(l=>l.map((x,j)=>j===i?{...x,url:e.target.value}:x))} placeholder="0x… wallet address"/>
                  </>
                ):(
                  <>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      {/* Custom dropdown for social platform */}
                      <div style={{width:140,flexShrink:0}}>
                        <CustomSelect
                          value={lk.icon||'link'}
                          onChange={v=>setLinks(l=>l.map((x,j)=>j===i?{...x,icon:v}:x))}
                          options={SOCIAL_OPTIONS.map(s=>({value:s.key,label:s.label}))}
                        />
                      </div>
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
          <p style={{color:'#444',fontSize:12,marginBottom:10}}>Upload an audio file (max 10MB) or paste a direct URL / YouTube link. Autoplays when profile loads.</p>
          <AudioUpload label="Audio File / URL / YouTube" value={profile.song_url} onChange={v=>set('song_url',v)}/>
          <Field label="Song Title"><input className="input" value={profile.song_title} onChange={e=>set('song_title',e.target.value)} placeholder="Song name" maxLength={100}/></Field>
          <Field label="Artist"><input className="input" value={profile.song_artist} onChange={e=>set('song_artist',e.target.value)} placeholder="Artist name" maxLength={100}/></Field>
        </Card>}

        {/* ── EXTRAS ── */}
        {tab==='extras'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Card Animations" icon={<IconSparkles size={12}/>}>
            <Toggle label="LED border animation" desc="Animated gradient glow around the card" checked={profile.card_led_border} onChange={v=>set('card_led_border',v)}/>
            <Toggle label="3D tilt on hover" desc="Card tilts in 3D when you move your mouse" checked={profile.card_tilt} onChange={v=>set('card_tilt',v)}/>
            <Toggle label="Avatar orbit ring" desc="Glowing orbit animation around profile picture" checked={profile.avatar_orbit} onChange={v=>set('avatar_orbit',v)}/>
          </Card>
          <Card title="Profile Info" icon={<IconUser size={12}/>}>
            <Toggle label="Show view counter" desc="Show how many people visited your profile" checked={profile.show_views} onChange={v=>set('show_views',v)}/>
            <Toggle label="Show #ID" desc="Show your unique profile number" checked={profile.show_id} onChange={v=>set('show_id',v)}/>
            <Toggle label="Show music player" desc="Show the music player card" checked={profile.show_music} onChange={v=>set('show_music',v)}/>
          </Card>
          {profile.verified && <Card title="Verified Badge" icon={<IconCheck size={12}/>}>
            <Toggle label="Show verified badge" desc="Display the blue verified checkmark next to your name" checked={profile.show_verified_badge} onChange={v=>set('show_verified_badge',v)}/>
            <p style={{fontSize:11,color:'#444',marginTop:4}}>Your account is verified. You can hide the badge if you prefer.</p>
          </Card>}
          {!profile.verified && <Card title="Verified Badge" icon={<IconCheck size={12}/>}>
            <p style={{fontSize:12,color:'#555'}}>Verification is granted manually. Contact us if you believe you qualify.</p>
          </Card>}
        </div>}

        {/* ── ACCOUNT ── */}
        {tab==='account'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Change Username" icon={<IconUser size={12}/>}>
            <p style={{color:'#444',fontSize:12,marginBottom:8}}>Your profile URL will change to oniion.cc/newname.</p>
            <Field label="New username">
              <input className="input" value={newUser} onChange={e=>setNewUser(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,''))} placeholder="newusername" maxLength={32}/>
            </Field>
            <Field label="Current password">
              <input className="input" type="password" value={curPwd} onChange={e=>setCurPwd(e.target.value)} placeholder="Required to confirm"/>
            </Field>
            {acctErr&&<div style={{fontSize:12,color:'#f87171',padding:'8px 12px',background:'rgba(239,68,68,0.08)',borderRadius:8}}>{acctErr}</div>}
            {acctMsg&&<div style={{fontSize:12,color:'#4ade80',padding:'8px 12px',background:'rgba(74,222,128,0.08)',borderRadius:8}}>{acctMsg}</div>}
            <button onClick={changeUsername} className="btn btn-primary" disabled={acctLoading} style={{alignSelf:'flex-start',gap:6}}>
              <IconCheck size={13}/>{acctLoading?'Saving…':'Change username'}
            </button>
          </Card>

          <Card title="Change Password" icon={<IconSettings size={12}/>}>
            <Field label="Current password">
              <input className="input" type="password" value={curPwd} onChange={e=>setCurPwd(e.target.value)} placeholder="Your current password"/>
            </Field>
            <Field label="New password">
              <input className="input" type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="Min. 6 characters"/>
            </Field>
            {acctErr&&<div style={{fontSize:12,color:'#f87171',padding:'8px 12px',background:'rgba(239,68,68,0.08)',borderRadius:8}}>{acctErr}</div>}
            {acctMsg&&<div style={{fontSize:12,color:'#4ade80',padding:'8px 12px',background:'rgba(74,222,128,0.08)',borderRadius:8}}>{acctMsg}</div>}
            <button onClick={changePassword} className="btn btn-primary" disabled={acctLoading} style={{alignSelf:'flex-start',gap:6}}>
              <IconCheck size={13}/>{acctLoading?'Saving…':'Change password'}
            </button>
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
  return(
    <div style={{background:'rgba(255,255,255,0.015)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:14,padding:'16px 14px'}}>
      <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:14,color:'#555',fontSize:11,fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.07em'}}>
        {icon}{title}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>{children}</div>
    </div>
  );
}
function Field({label,children}:{label:string;children:React.ReactNode}) {
  return(
    <div>
      {label&&<label style={{display:'block',fontSize:12,color:'#555',marginBottom:5,fontWeight:500}}>{label}</label>}
      {children}
    </div>
  );
}
