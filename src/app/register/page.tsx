'use client';

export const dynamic = 'force-dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconUser } from '@/components/icons';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/dashboard');
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'#060608'}}>
      <div style={{position:'fixed',top:'30%',left:'50%',transform:'translateX(-50%)',width:500,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(168,85,247,0.06) 0%,transparent 70%)',filter:'blur(60px)',pointerEvents:'none'}}/>
      <div style={{width:'100%',maxWidth:400,animation:'fadeInUp 0.5s ease'}}>
        <Link href="/" style={{display:'block',marginBottom:32,fontFamily:"'Instrument Serif',serif",fontSize:22,letterSpacing:'-0.3px'}}>
          <span style={{color:'#a855f7'}}>oni</span>ion
        </Link>
        <h1 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,marginBottom:6,letterSpacing:'-0.5px'}}>Create account</h1>
        <p style={{color:'#444',fontSize:13,marginBottom:28}}>
          Your page will be at <span style={{color:'#a855f7'}}>oniion.cc/{username||'yourname'}</span>
        </p>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div>
            <label style={{display:'block',fontSize:12,color:'#555',marginBottom:6,fontWeight:500}}>Username</label>
            <input className="input" value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,''))} placeholder="yourname" maxLength={32} required autoComplete="username" autoCapitalize="none" autoCorrect="off"/>
          </div>
          <div>
            <label style={{display:'block',fontSize:12,color:'#555',marginBottom:6,fontWeight:500}}>Password</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 6 characters" required autoComplete="new-password"/>
          </div>
          {error && <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.18)',borderRadius:9,padding:'9px 13px',fontSize:13,color:'#f87171'}}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',padding:'12px',marginTop:4,gap:8,borderRadius:11}}>
            {loading ? 'Creating…' : <><IconUser size={14}/>Create account<IconArrowRight size={14}/></>}
          </button>
        </form>
        <p style={{textAlign:'center',fontSize:13,color:'#444',marginTop:24}}>
          Already have an account?{' '}
          <Link href="/login" style={{color:'#a855f7',fontWeight:500}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
