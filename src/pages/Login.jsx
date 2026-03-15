import { useState } from 'react'
import { authService } from '../services/api'

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState(localStorage.getItem('koogwe_admin_email') || '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPwd,  setShowPwd]  = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return }
    setLoading(true); setError('')
    try {
      const data = await authService.adminLogin(email, password)
      if (data.user?.role !== 'ADMIN') { setError('Accès refusé. Réservé aux administrateurs.'); setLoading(false); return }
      localStorage.setItem('koogwe_admin_token', data.access_token)
      if (remember) localStorage.setItem('koogwe_admin_email', email)
      else localStorage.removeItem('koogwe_admin_email')
      onLogin({ id: data.user.id, name: data.user.name || 'Administrateur', email: data.user.email, role: data.user.role })
    } catch (err) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message
      if (status === 401 || msg?.toLowerCase().includes('mot de passe')) setError('Email ou mot de passe incorrect.')
      else if (msg?.includes('réservé') || msg?.includes('Accès')) setError('Accès refusé. Réservé aux administrateurs KOOGWE.')
      else setError('Impossible de se connecter. Vérifiez votre connexion.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg, #F0F4FF 0%, #E8EEFF 50%, #EEF2FF 100%)',
      position:'relative', overflow:'hidden', padding:'20px',
    }}>
      {/* Decorative blobs */}
      <div style={{position:'absolute',top:-100,right:-100,width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(43,95,245,0.12) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-150,left:-100,width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(91,139,255,0.10) 0%,transparent 70%)',pointerEvents:'none'}}/>
      
      {/* Grid pattern */}
      <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(43,95,245,0.06) 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none'}}/>

      <div className="fade-up" style={{width:'100%',maxWidth:440,position:'relative',zIndex:1}}>
        
        {/* Logo area */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{
            width:68,height:68,borderRadius:20,
            background:'linear-gradient(135deg,#2B5FF5,#5B8BFF)',
            display:'inline-flex',alignItems:'center',justifyContent:'center',
            marginBottom:18,boxShadow:'0 12px 40px rgba(43,95,245,0.35)',
            animation:'floatUp 3s ease-in-out infinite',
          }}>
            <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
              <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
            </svg>
          </div>
          <div style={{fontFamily:'Sora,sans-serif',fontSize:28,fontWeight:800,color:'#0D1B4B',letterSpacing:'-0.02em'}}>KOOGWE</div>
          <div style={{fontSize:12,color:'#7A9CC9',letterSpacing:'0.15em',textTransform:'uppercase',marginTop:6,fontWeight:600}}>
            Portail Administrateur
          </div>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(255,255,255,0.85)',backdropFilter:'blur(20px)',
          border:'1.5px solid rgba(43,95,245,0.12)',
          borderRadius:24,padding:'36px 36px 28px',
          boxShadow:'0 24px 80px rgba(43,95,245,0.14), 0 4px 16px rgba(43,95,245,0.08)',
        }}>
          <div style={{marginBottom:28}}>
            <h2 style={{fontSize:20,fontWeight:800,color:'#0D1B4B',marginBottom:6}}>Bienvenue</h2>
            <p style={{fontSize:13,color:'#7A9CC9'}}>Connectez-vous pour accéder au tableau de bord</p>
          </div>

          {error && (
            <div className="slide-r" style={{
              background:'rgba(239,68,68,0.07)',border:'1.5px solid rgba(239,68,68,0.2)',
              borderRadius:12,padding:'12px 16px',marginBottom:22,
              display:'flex',alignItems:'flex-start',gap:10,
            }}>
              <svg width="16" height="16" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{color:'#B91C1C',fontSize:13,lineHeight:1.5}}>{error}</span>
            </div>
          )}

          <form onSubmit={submit}>
            <div className="field">
              <label className="label">Adresse Email</label>
              <div style={{position:'relative'}}>
                <svg style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#7A9CC9'}} width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@koogwe.com" style={{paddingLeft:40}} required autoFocus/>
              </div>
            </div>

            <div className="field" style={{marginBottom:16}}>
              <label className="label">Mot de passe</label>
              <div style={{position:'relative'}}>
                <svg style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#7A9CC9'}} width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <input className="input" type={showPwd?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={{paddingLeft:40,paddingRight:42}} required/>
                <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#7A9CC9',display:'flex',padding:4}}>
                  {showPwd
                    ? <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:24}}>
              <input type="checkbox" id="rem" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{width:16,height:16,accentColor:'var(--blue)',cursor:'pointer'}}/>
              <label htmlFor="rem" style={{fontSize:13,color:'#3D5A99',cursor:'pointer',fontWeight:500}}>Se souvenir de moi</label>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{letterSpacing:'0.01em'}}>
              {loading
                ? <div className="spinner" style={{margin:'0 auto',borderTopColor:'#fff'}}/>
                : <><span>Se connecter</span><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
              }
            </button>
          </form>

          <div style={{marginTop:22,padding:'12px 14px',background:'rgba(43,95,245,0.05)',border:'1.5px solid rgba(43,95,245,0.10)',borderRadius:10,display:'flex',gap:9,alignItems:'flex-start'}}>
            <svg width="14" height="14" fill="none" stroke="#2B5FF5" strokeWidth="2" viewBox="0 0 24 24" style={{flexShrink:0,marginTop:1}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{fontSize:12,color:'#3D5A99',lineHeight:1.6}}>Accès restreint aux comptes administrateurs. Toute tentative non autorisée est enregistrée.</span>
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'center',gap:24,marginTop:22}}>
          {['Support','Confidentialité','Conditions'].map(l => (
            <button key={l} style={{fontSize:11,color:'#7A9CC9',background:'none',border:'none',cursor:'pointer',fontWeight:500}}>{l}</button>
          ))}
        </div>
      </div>
      <style>{`@keyframes floatUp{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}`}</style>
    </div>
  )
}
