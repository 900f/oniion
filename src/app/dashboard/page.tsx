export const dynamic = 'force-dynamic';
'use client';
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
  IconMousePointer, IconWand, IconCrown,
} from '@/components/icons';

const FONTS = [
  'Geist','Space Grotesk','Playfair Display','JetBrains Mono',
  'Bebas Neue','Dancing Script','Orbitron','Cinzel','Permanent Marker',
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
  {value:'none',label:'Default'},{value:'trail',label:'Sparkle trail'},{value:'ring',label:'Ring'},
  {value:'dot',label:'Dot'},{value:'crosshair',label:'Crosshair'},{value:'bubble',label:'Bubble'},
];
const CARD_STYLES = [
  {value:'glass',label:'Glass'},{value:'solid',label:'Solid'},{value:'outline',label:'Outline'},{value:'neon',label:'Neon'},
];
const BG_TYPES = [
  {value:'color',label:'Solid Color'},{value:'gradient',label:'Gradient'},
  {value:'image',label:'Image / GIF URL'},{value:'particles',label:'Particles'},
];
const CRYPTO_COINS = [
  {value:'eth',label:'Ethereum (ETH)',symbol:'Ξ'},{value:'btc',label:'Bitcoin (BTC)',symbol:'₿'},
  {value:'sol',label:'Solana (SOL)',symbol:'◎'},{value:'usdt',label:'Tether (USDT)',symbol:'₮'},
  {value:'bnb',label:'BNB',symbol:'⬡'},{value:'xrp',label:'XRP',symbol:'✕'},
  {value:'ltc',label:'Litecoin (LTC)',symbol:'Ł'},{value:'doge',label:'Dogecoin (DOGE)',symbol:'Ð'},
  {value:'ada',label:'Cardano (ADA)',symbol:'₳'},{value:'avax',label:'Avalanche (AVAX)',symbol:'△'},
  {value:'matic',label:'Polygon (MATIC)',symbol:'⬡'},{value:'trx',label:'TRON (TRX)',symbol:'◆'},
];

type LinkItem = { title: string; url: string; icon: string; link_type: string; coin?: string };
type Profile = {
  display_name:string;bio:string;avatar_url:string;banner_url:string;banner_color:string;
  background_image_url:string;card_image_url:string;
  song_url:string;song_title:string;song_artist:string;
  background_type:string;background_value:string;text_color:string;accent_color:string;
  font_family:string;font_effect:string;page_effect:string;effect_color:string;
  layout:string;card_position:string;blur_enabled:boolean;glow_enabled:boolean;
  badge_text:string;badge_color:string;cursor_effect:string;card_style:string;
  custom_font_url:string;custom_font_name:string;total_views?:number;display_id?:number;
};
const DEF:Profile={
  display_name:'',bio:'',avatar_url:'',banner_url:'',banner_color:'#0d0d0d',
  background_image_url:'',card_image_url:'',song_url:'',song_title:'',song_artist:'',
  background_type:'color',background_value:'#0a0a0a',text_color:'#ffffff',accent_color:'#a855f7',
  font_family:'Geist',font_effect:'none',page_effect:'none',effect_color:'#a855f7',
  layout:'center',card_position:'top',blur_enabled:false,glow_enabled:false,
  badge_text:'',badge_color:'#a855f7',cursor_effect:'none',card_style:'glass',
  custom_font_url:'',custom_font_name:'',
};
const TABS=[
  {key:'profile',label:'Profile',icon:<IconUser size={13}/>},
  {key:'appearance',label:'Style',icon:<IconPalette size={13}/>},
  {key:'effects',label:'Effects',icon:<IconSparkles size={13}/>},
  {key:'links',label:'Links',icon:<IconLink size={13}/>},
  {key:'music',label:'Music',icon:<IconMusic size={13}/>},
] as const;
type Tab=typeof TABS[number]['key'];

// Image upload button
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
  const handle=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return;
    if(f.size>8*1024*1024){setErr('Max 8MB');return;}
    setUploading(true);setErr('');
    await startUpload([f]);
  };
  return(
    <div>
      <label style={{display:'block',fontSize:12,color:'#555',marginBottom:6,fontWeight:500}}>{label}</label>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        {value&&<img src={value} alt="" style={{width:40,height:40,borderRadius:8,objectFit:'cover',flexShrink:0,border:'1px solid rgba(255,255,255,0.08)'}}/>}
        <input className="input" value={value} onChange={e=>onChange(e.target.value)} placeholder="https://… or upload below" style={{flex:1,minWidth:120}}/>
        <button type="button" onClick={()=>ref.current?.click()} className="btn btn-ghost" style={{fontSize:12,padding:'8px 12px',flexShrink:0,gap:5}} disabled={uploading}>
          <IconUpload size={13}/>{uploading?'Uploading…':'Upload'}
        </button>
        <input ref={ref} type="file" accept="image/*,.gif" style={{display:'none'}} onChange={handle}/>
      </div>
      {err&&<div style={{fontSize:11,color:'#f87171',marginTop:4}}>{err}</div>}
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
      if(res?.[0]){const f=res[0];const url=(f as {ufsUrl?:string;url?:string}).ufsUrl||f.url||'';const name=f.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');setProfile(p=>({...p,custom_font_url:url,custom_font_name:name,font_family:'__custom__'}));}
      setFontUploading(false);
    },
    onUploadError:(e)=>{setFontError(e.message);setFontUploading(false);},
  });

  useEffect(()=>{
    fetch('/api/auth/session').then(r=>r.json()).then(d=>{
      if(!d.user){router.push('/login');return;}
      setUser(d.user);
      fetch('/api/profile').then(r=>r.json()).then(d2=>{
        if(d2.profile)setProfile({...DEF,...d2.profile});
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

  const addLink=(type='url')=>setLinks(l=>[...l,{title:'',url:'',icon:type==='crypto'?'eth':'link',link_type:type}]);
  const removeLink=(i:number)=>setLinks(l=>l.filter((_,j)=>j!==i));
  const updateLink=(i:number,field:keyof LinkItem,val:string)=>setLinks(l=>l.map((x,j)=>j===i?{...x,[field]:val}:x));

  const handleFontFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return;
    const ext=f.name.split('.').pop()?.toLowerCase();
    if(!['ttf','otf','woff','woff2'].includes(ext||'')){setFontError('Only .ttf .otf .woff .woff2');return;}
    if(f.size>4*1024*1024){setFontError('Max 4MB');return;}
    setFontUploading(true);setFontError('');
    await uploadFont([f]);
  };

  if(loading)return<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#333',fontSize:13}}>Loading…</div>;

  const usingCustomFont=!!(profile.custom_font_url&&profile.font_family==='__custom__');
  const views=Number(profile.total_views??0).toLocaleString();

  return(
    <div style={{minHeight:'100vh',background:'#060608'}}>
      {/* Nav */}
      <nav style={{borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0 16px',display:'flex',alignItems:'center',gap:8,height:52,position:'sticky',top:0,background:'rgba(6,6,8,0.97)',backdropFilter:'blur(12px)',zIndex:200}}>
        <Link href="/" style={{fontFamily:"'Instrument Serif',serif",fontSize:17,marginRight:'auto',flexShrink:0}}>
          <span style={{color:'#a855f7'}}>oni</span>ion
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
          <h1 style={{fontFamily:"'Instrument Serif',serif",fontSize:21,letterSpacing:'-0.5px',marginBottom:2}}>Dashboard</h1>
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

        {/* PROFILE TAB */}
        {tab==='profile'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Identity" icon={<IconUser size={12}/>}>
            <Field label="Display Name"><input className="input" value={profile.display_name} onChange={e=>set('display_name',e.target.value)} placeholder="Your name" maxLength={64}/></Field>
            <Field label="Bio"><textarea className="input" value={profile.bio} onChange={e=>set('bio',e.target.value)} placeholder="Tell the world about yourself…" maxLength={300} rows={3}/></Field>
            <Field label="Badge">
              <div style={{display:'flex',gap:8}}>
                <input className="input" value={profile.badge_text} onChange={e=>set('badge_text',e.target.value)} placeholder="artist, she/her, etc" maxLength={64}/>
                <input type="color" value={profile.badge_color} onChange={e=>set('badge_color',e.target.value)} style={{width:42,height:40,border:'none',borderRadius:8,cursor:'pointer',padding:2,background:'none',flexShrink:0}}/>
              </div>
            </Field>
          </Card>

          <Card title="Images" icon={<IconCamera size={12}/>}>
            <ImgUpload label="Profile Picture (URL or upload GIF/image)" value={profile.avatar_url} onChange={v=>set('avatar_url',v)}/>
            <ImgUpload label="Banner (URL or upload GIF/image)" value={profile.banner_url} onChange={v=>set('banner_url',v)}/>
            <Field label="Banner Fallback Color">
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input type="color" value={profile.banner_color} onChange={e=>set('banner_color',e.target.value)} style={{width:42,height:40,border:'none',borderRadius:8,cursor:'pointer',flexShrink:0}}/>
                <input className="input" value={profile.banner_color} onChange={e=>set('banner_color',e.target.value)}/>
              </div>
            </Field>
          </Card>
        </div>}

        {/* APPEARANCE TAB */}
        {tab==='appearance'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Background" icon={<IconImage size={12}/>}>
            <Field label="Type">
              <CustomSelect value={profile.background_type} onChange={v=>set('background_type',v)} options={BG_TYPES}/>
            </Field>
            {profile.background_type==='color'&&<Field label="Color">
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input type="color" value={profile.background_value} onChange={e=>set('background_value',e.target.value)} style={{width:42,height:40,border:'none',borderRadius:8,cursor:'pointer',flexShrink:0}}/>
                <input className="input" value={profile.background_value} onChange={e=>set('background_value',e.target.value)}/>
              </div>
            </Field>}
            {profile.background_type==='gradient'&&<Field label="CSS Gradient">
              <input className="input" value={profile.background_value} onChange={e=>set('background_value',e.target.value)} placeholder="linear-gradient(135deg, #0a0a0a, #1a0a2a)"/>
            </Field>}
            {profile.background_type==='image'&&<ImgUpload label="Background Image / GIF URL" value={profile.background_value} onChange={v=>set('background_value',v)}/>}
            {profile.background_type==='particles'&&<Field label="Particle Color">
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input type="color" value={profile.effect_color} onChange={e=>set('effect_color',e.target.value)} style={{width:42,height:40,border:'none',borderRadius:8,cursor:'pointer',flexShrink:0}}/>
                <span style={{fontSize:12,color:'#555'}}>Uses effect color</span>
              </div>
            </Field>}
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
            <Field label="Upload custom font (.ttf / .otf / .woff / .woff2)">
              <div style={{border:usingCustomFont?'1px solid rgba(168,85,247,0.35)':'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:14,background:'rgba(255,255,255,0.015)'}}>
                {usingCustomFont?(
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <IconFont size={15} color="#a855f7"/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{profile.custom_font_name}</div>
                      <div style={{fontSize:11,color:'#555'}}>Custom font active</div>
                    </div>
                    <button onClick={()=>setProfile(p=>({...p,custom_font_url:'',custom_font_name:'',font_family:'Geist'}))} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.18)',color:'#f87171',borderRadius:7,padding:'5px 10px',cursor:'pointer',fontFamily:'inherit',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
                      <IconX size={11}/>Remove
                    </button>
                  </div>
                ):(
                  <div className={`upload-zone${fontUploading?' uploading':''}`} onClick={()=>fontRef.current?.click()}>
                    {fontUploading?<div style={{color:'#a855f7',fontSize:13}}>Uploading…</div>:<>
                      <IconUpload size={18} color="#444"/><div style={{fontSize:13,color:'#555',marginTop:6}}>Click to upload font</div>
                      <div style={{fontSize:11,color:'#333',marginTop:2}}>.ttf • .otf • .woff • .woff2 — max 4MB</div>
                    </>}
                  </div>
                )}
                <input ref={fontRef} type="file" accept=".ttf,.otf,.woff,.woff2" style={{display:'none'}} onChange={handleFontFile}/>
                {fontError&&<div style={{marginTop:6,fontSize:12,color:'#f87171'}}>{fontError}</div>}
              </div>
            </Field>
            <Field label={usingCustomFont?'Preset (remove custom to switch)':'Preset Font'}>
              <CustomSelect
                value={usingCustomFont?'__custom__':profile.font_family}
                onChange={v=>set('font_family',v)}
                options={[
                  ...(usingCustomFont?[{value:'__custom__',label:profile.custom_font_name||'Custom font'}]:[]),
                  ...FONTS.map(f=>({value:f,label:f,preview:<span style={{fontFamily:`'${f}',sans-serif`,fontSize:15,color:'#888'}}>Aa</span>}))
                ]}
              />
            </Field>
            {/* Live preview */}
            <div style={{padding:14,background:'rgba(255,255,255,0.015)',borderRadius:10,border:'1px solid rgba(255,255,255,0.05)'}}>
              <div style={{fontSize:10,color:'#444',marginBottom:8,letterSpacing:'0.08em'}}>PREVIEW</div>
              {usingCustomFont&&<style>{`@font-face{font-family:'__custom__';src:url('${profile.custom_font_url}');font-display:swap;}`}</style>}
              <div style={{fontFamily:usingCustomFont?'__custom__':`'${profile.font_family}',sans-serif`,fontSize:20,color:'#fff'}}>The quick brown fox</div>
              <div style={{fontFamily:usingCustomFont?'__custom__':`'${profile.font_family}',sans-serif`,fontSize:13,color:'#555',marginTop:3}}>AaBbCc 0123456789</div>
            </div>
          </Card>

          <Card title="Layout & Card" icon={<IconLayout size={12}/>}>
            <Field label="Profile Text Alignment">
              <CustomSelect value={profile.layout} onChange={v=>set('layout',v)} options={[
                {value:'center',label:'Centered'},{value:'left',label:'Left aligned'},
              ]}/>
            </Field>
            <Field label="Card Position">
              <CustomSelect value={profile.card_position||'top'} onChange={v=>set('card_position',v)} options={[
                {value:'top',label:'Top (default)'},{value:'middle',label:'Middle of screen'},
              ]}/>
            </Field>
            <Field label="Card Style">
              <CustomSelect value={profile.card_style} onChange={v=>set('card_style',v)} options={CARD_STYLES}/>
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

        {/* EFFECTS TAB */}
        {tab==='effects'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Font Effect" icon={<IconType size={12}/>}>
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
            <CustomSelect value={profile.cursor_effect} onChange={v=>set('cursor_effect',v)} options={CURSOR_EFFECTS}/>
          </Card>
        </div>}

        {/* LINKS TAB */}
        {tab==='links'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Links & Wallets" icon={<IconLink size={12}/>}>
            <p style={{color:'#444',fontSize:12,marginBottom:10}}>Add social links, websites, or crypto wallet addresses.</p>

            {links.map((lk,i)=>(
              <div key={i} style={{padding:12,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:10,marginBottom:8,display:'flex',flexDirection:'column',gap:8}}>
                {lk.link_type==='crypto'?(
                  <>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <div style={{fontSize:18,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.04)',borderRadius:8,flexShrink:0}}>
                        {CRYPTO_COINS.find(c=>c.value===lk.icon)?.symbol||'₿'}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <CustomSelect value={lk.icon||'eth'} onChange={v=>updateLink(i,'icon',v)} options={CRYPTO_COINS.map(c=>({value:c.value,label:c.label,preview:<span style={{fontFamily:'monospace',fontSize:14,color:'#888'}}>{c.symbol}</span>}))}/>
                      </div>
                      <button onClick={()=>removeLink(i)} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',color:'#f87171',borderRadius:8,padding:8,cursor:'pointer',flexShrink:0,display:'flex'}}><IconX size={12}/></button>
                    </div>
                    <input className="input" value={lk.title} onChange={e=>updateLink(i,'title',e.target.value)} placeholder="Label (e.g. Donate ETH)" maxLength={64}/>
                    <input className="input" value={lk.url} onChange={e=>updateLink(i,'url',e.target.value)} placeholder="0x… wallet address"/>
                  </>
                ):(
                  <>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      {/* Social icon selector */}
                      <div style={{position:'relative',flexShrink:0}}>
                        <select
                          value={lk.icon||'link'}
                          onChange={e=>{
                            updateLink(i,'icon',e.target.value);
                          }}
                          style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'8px 10px',color:'#fff',fontFamily:'inherit',fontSize:13,cursor:'pointer',outline:'none',width:100}}
                        >
                          {SOCIAL_OPTIONS.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </div>
                      <input className="input" value={lk.title} onChange={e=>updateLink(i,'title',e.target.value)} placeholder="Label" style={{flex:1,minWidth:0}} maxLength={128}/>
                      <button onClick={()=>removeLink(i)} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',color:'#f87171',borderRadius:8,padding:8,cursor:'pointer',flexShrink:0,display:'flex'}}><IconX size={12}/></button>
                    </div>
                    <input className="input" value={lk.url} onChange={e=>{
                      updateLink(i,'url',e.target.value);
                      // Auto-detect icon from URL
                      const detected=detectSocialIcon(e.target.value);
                      if(detected!=='link')updateLink(i,'icon',detected);
                    }} placeholder="https://…"/>
                  </>
                )}
              </div>
            ))}

            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button onClick={()=>addLink('url')} className="btn btn-ghost" style={{flex:1,justifyContent:'center',gap:5,fontSize:12}}>
                <IconPlus size={13}/>Add link
              </button>
              <button onClick={()=>addLink('crypto')} className="btn btn-ghost" style={{flex:1,justifyContent:'center',gap:5,fontSize:12}}>
                <IconCrown size={13}/>Add wallet
              </button>
            </div>
          </Card>
        </div>}

        {/* MUSIC TAB */}
        {tab==='music'&&<Card title="Music Player" icon={<IconMusic size={12}/>}>
          <p style={{color:'#444',fontSize:12,marginBottom:10}}>Direct .mp3 URL <strong style={{color:'#666'}}>or</strong> YouTube link — audio only, plays on your profile.</p>
          <Field label="Audio / YouTube URL">
            <input className="input" value={profile.song_url} onChange={e=>set('song_url',e.target.value)} placeholder="https://…/song.mp3  or  https://youtube.com/watch?v=…"/>
          </Field>
          <Field label="Song Title"><input className="input" value={profile.song_title} onChange={e=>set('song_title',e.target.value)} placeholder="Song name" maxLength={100}/></Field>
          <Field label="Artist"><input className="input" value={profile.song_artist} onChange={e=>set('song_artist',e.target.value)} placeholder="Artist name" maxLength={100}/></Field>
          {profile.song_url&&profile.song_url.includes('youtube')&&(
            <div style={{padding:'10px 12px',background:'rgba(255,87,34,0.08)',border:'1px solid rgba(255,87,34,0.18)',borderRadius:8,fontSize:12,color:'#ff8a65'}}>
              YouTube links are extracted server-side to audio only.
            </div>
          )}
        </Card>}

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
      <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:14,color:'#555',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.07em'}}>
        {icon}{title}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>{children}</div>
    </div>
  );
}
function Field({label,children}:{label:string;children:React.ReactNode}) {
  return(
    <div>
      <label style={{display:'block',fontSize:12,color:'#555',marginBottom:5,fontWeight:500}}>{label}</label>
      {children}
    </div>
  );
}
