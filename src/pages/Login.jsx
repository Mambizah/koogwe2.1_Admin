import { useState } from 'react'
import { authService } from '../services/api'

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return }

    setLoading(true)
    setError('')

    try {
      // Appelle /auth/admin-login → rejette si pas ADMIN
      const data = await authService.adminLogin(email, password)

      // Vérification côté frontend aussi (double sécurité)
      if (data.user?.role !== 'ADMIN') {
        setError('Accès refusé. Ce portail est réservé aux administrateurs KOOGWE.')
        setLoading(false)
        return
      }

      // Stocker le token
      localStorage.setItem('koogwe_admin_token', data.access_token)
      if (remember) localStorage.setItem('koogwe_admin_email', email)

      onLogin({
        id:    data.user.id,
        name:  data.user.name || 'Administrateur',
        email: data.user.email,
        role:  data.user.role,
      })

    } catch (err) {
      const msg = err?.response?.data?.message
      if (msg?.includes('réservé') || msg?.includes('Accès')) {
        setError('Accès refusé. Ce portail est réservé aux administrateurs KOOGWE.')
      } else if (msg?.includes('Mot de passe')) {
        setError('Mot de passe incorrect.')
      } else if (msg?.includes('Email')) {
        setError('Adresse email introuvable.')
      } else {
        setError('Impossible de se connecter au serveur. Vérifiez votre connexion.')
      }
    }

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Fond animé */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(15,73,189,0.1) 0%, transparent 70%)', pointerEvents:'none' }}/>

      {/* Card */}
      <div className="fade-up" style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1, padding:'0 16px' }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 16, padding: '40px 36px 32px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}>

          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, background: 'var(--blue)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 18, boxShadow: '0 8px 32px rgba(15,73,189,0.4)',
            }}>
              <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                <circle cx="7.5" cy="14.5" r="1.5"/>
                <circle cx="16.5" cy="14.5" r="1.5"/>
              </svg>
            </div>
            <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.02em' }}>KOOGWE</div>
            <div style={{ fontSize:11, color:'var(--text3)', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:4 }}>
              Administrative Portal
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 22,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <svg width="16" height="16" fill="none" stroke="var(--red)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink:0, marginTop:1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ color:'var(--red)', fontSize:13, lineHeight:1.5 }}>{error}</span>
            </div>
          )}

          <form onSubmit={submit}>
            {/* Email */}
            <div className="field">
              <label className="label">Adresse Email</label>
              <div style={{ position:'relative' }}>
                <svg style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', opacity:0.35 }} width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  className="input" type="email" value={email}
                  onChange={e=>setEmail(e.target.value)}
                  placeholder="admin@koogwe.com"
                  style={{ paddingLeft:40 }}
                  required autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="field" style={{ marginBottom:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <label className="label" style={{ margin:0 }}>Mot de passe</label>
              </div>
              <div style={{ position:'relative' }}>
                <svg style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', opacity:0.35 }} width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  className="input" type="password" value={password}
                  onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingLeft:40 }}
                  required
                />
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
              <input
                type="checkbox" id="remember" checked={remember}
                onChange={e=>setRemember(e.target.checked)}
                style={{ width:16, height:16, accentColor:'var(--blue)', cursor:'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize:13, color:'var(--text2)', cursor:'pointer' }}>
                Se souvenir de moi
              </label>
            </div>

            {/* Bouton */}
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading
                ? <div className="spinner" style={{ margin:'0 auto' }}/>
                : <>
                    Se connecter
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
              }
            </button>
          </form>

          {/* Info sécurité */}
          <div style={{
            marginTop: 24, padding: '12px 14px',
            background: 'rgba(15,73,189,0.06)', border: '1px solid rgba(15,73,189,0.15)',
            borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <svg width="14" height="14" fill="none" stroke="var(--blue)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink:0, marginTop:1 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ fontSize:12, color:'var(--text3)', lineHeight:1.5 }}>
              Accès restreint aux comptes administrateurs KOOGWE. Toute tentative non autorisée est enregistrée.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'center', gap:24, marginTop:20 }}>
          {['Support','Politique de confidentialité','Conditions'].map(l => (
            <button key={l} style={{ fontSize:11, color:'var(--text3)', background:'none', border:'none', cursor:'pointer' }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  )
}