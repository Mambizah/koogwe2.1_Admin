import { NavLink } from 'react-router-dom'

const NAV = [
  { to:'/',           label:'Tableau de bord',  icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to:'/drivers',    label:'Chauffeurs',        icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { to:'/passengers', label:'Passagers',         icon:'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { to:'/rides',      label:'Courses',           icon:'M8 7h12m0 0l-4-4m4 4l-4 4m0 5H4m0 0l4 4m-4-4l4-4' },
  { to:'/documents',  label:'Documents',         icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', badge:'docs' },
  { to:'/revenue',    label:'Revenus',           icon:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { to:'/panics',     label:'Alertes Panique',   icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', badge:'panics', danger:true },
  { to:'/settings',   label:'Paramètres',        icon:'M12 15.5A3.5 3.5 0 1012 8.5a3.5 3.5 0 000 7zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' },
]

function Icon({ path, size=17 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d={path}/>
    </svg>
  )
}

export default function Sidebar({ badges = {}, user, onLogout }) {
  return (
    <aside style={{
      width:'var(--sidebar-w)',
      background:'linear-gradient(180deg, #FFFFFF 0%, #F7F9FF 100%)',
      borderRight:'1.5px solid rgba(43,95,245,0.10)',
      height:'100vh', position:'fixed', left:0, top:0,
      display:'flex', flexDirection:'column', zIndex:50,
      boxShadow:'4px 0 24px rgba(43,95,245,0.06)',
    }}>
      {/* Logo */}
      <div style={{padding:'22px 20px 18px',borderBottom:'1.5px solid rgba(43,95,245,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{
            width:42,height:42,borderRadius:12,
            background:'linear-gradient(135deg,#2B5FF5,#5B8BFF)',
            display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
            boxShadow:'0 6px 18px rgba(43,95,245,0.30)',
          }}>
            <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
              <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
            </svg>
          </div>
          <div>
            <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:17,color:'#0D1B4B',letterSpacing:'-0.01em'}}>KOOGWE</div>
            <div style={{fontSize:10,color:'#7A9CC9',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase'}}>Admin Portal</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:'12px 10px',overflowY:'auto'}}>
        {NAV.map(({ to, label, icon, badge, danger }) => {
          const count = badge ? badges[badge] || 0 : 0
          return (
            <NavLink key={to} to={to} end={to==='/'} style={({ isActive }) => ({
              display:'flex',alignItems:'center',gap:10,padding:'10px 12px',
              borderRadius:10,marginBottom:3,textDecoration:'none',
              fontSize:13,fontWeight:isActive?600:500,transition:'all 0.15s',
              color: isActive ? '#2B5FF5' : danger ? '#EF4444' : '#3D5A99',
              background: isActive ? 'rgba(43,95,245,0.08)' : 'transparent',
              borderLeft: isActive ? '3px solid #2B5FF5' : '3px solid transparent',
            })}>
              {({ isActive }) => (<>
                <span style={{color:isActive?'#2B5FF5':danger?'#EF4444':'#7A9CC9',display:'flex',flexShrink:0}}>
                  <Icon path={icon} size={17}/>
                </span>
                <span style={{flex:1}}>{label}</span>
                {count > 0 && (
                  <span style={{
                    background:isActive?'#2B5FF5':danger?'#EF4444':'#2B5FF5',
                    color:'#fff',borderRadius:20,padding:'2px 8px',fontSize:10,fontWeight:700,
                    boxShadow:danger?'0 2px 8px rgba(239,68,68,0.3)':'0 2px 8px rgba(43,95,245,0.3)',
                  }}>
                    {count}
                  </span>
                )}
              </>)}
            </NavLink>
          )
        })}
      </nav>

      {/* Status bar */}
      <div style={{padding:'8px 14px',margin:'0 10px 10px',background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.15)',borderRadius:10}}>
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <span className="dot dot-green"/>
          <span style={{fontSize:11,color:'#047857',fontWeight:600}}>Système opérationnel</span>
        </div>
      </div>

      {/* User */}
      <div style={{padding:'12px 14px',borderTop:'1.5px solid rgba(43,95,245,0.08)',display:'flex',alignItems:'center',gap:10}}>
        <div style={{
          width:36,height:36,borderRadius:10,
          background:'linear-gradient(135deg,#2B5FF5,#5B8BFF)',
          display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
          fontSize:14,fontWeight:700,color:'#fff',
          boxShadow:'0 3px 10px rgba(43,95,245,0.25)',
        }}>
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div style={{flex:1,overflow:'hidden'}}>
          <div style={{fontSize:13,fontWeight:700,color:'#0D1B4B',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.name||'Administrateur'}</div>
          <div style={{fontSize:11,color:'#7A9CC9',fontWeight:500}}>Super Admin</div>
        </div>
        <button onClick={onLogout} title="Déconnexion"
          style={{background:'none',border:'none',cursor:'pointer',color:'#7A9CC9',padding:6,borderRadius:8,display:'flex',transition:'all 0.2s'}}
          onMouseEnter={e=>{e.currentTarget.style.color='#EF4444';e.currentTarget.style.background='rgba(239,68,68,0.08)'}}
          onMouseLeave={e=>{e.currentTarget.style.color='#7A9CC9';e.currentTarget.style.background='none'}}
        >
          <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
      </div>
    </aside>
  )
}
