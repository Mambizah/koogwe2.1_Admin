import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCircle, ArrowLeftRight, 
  FileText, Wallet, AlertTriangle, Settings, LogOut 
} from 'lucide-react';
import logoPng from '../assets/logo.png';

const NAV = [
  { to:'/',           label:'Tableau de bord',  icon: LayoutDashboard },
  { to:'/drivers',    label:'Chauffeurs',        icon: Users },
  { to:'/passengers', label:'Passagers',         icon: UserCircle },
  { to:'/rides',      label:'Courses',           icon: ArrowLeftRight },
  { to:'/documents',  label:'Documents',         icon: FileText, badge:'docs' },
  { to:'/revenue',    label:'Revenus',           icon: Wallet },
  { to:'/panics',     label:'Alertes Panique',   icon: AlertTriangle, badge:'panics', danger:true },
  { to:'/settings',   label:'Paramètres',        icon: Settings },
]

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
      {/* SECTION LOGO REMPLACÉE */}
      <div style={{padding:'22px 20px 18px', borderBottom:'1.5px solid rgba(43,95,245,0.08)'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{
            width:42, height:42, borderRadius:10,
            background:'white', // Fond blanc pour que le logo PNG soit propre
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            boxShadow:'0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid rgba(43,95,245,0.1)',
            overflow: 'hidden'
          }}>
            <img src={logoPng} alt="Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:17, color:'#0D1B4B', letterSpacing:'-0.01em'}}>KOOGWE</div>
            <div style={{fontSize:10, color:'#7A9CC9', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase'}}>Admin Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation avec Lucide Icons */}
      <nav style={{flex:1, padding:'12px 10px', overflowY:'auto'}}>
        {NAV.map(({ to, label, icon: Icon, badge, danger }) => {
          const count = badge ? badges[badge] || 0 : 0;
          return (
            <NavLink key={to} to={to} end={to==='/'} style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
              borderRadius:10, marginBottom:3, textDecoration:'none',
              fontSize:13, fontWeight:isActive?600:500, transition:'all 0.15s',
              color: isActive ? '#2B5FF5' : danger ? '#EF4444' : '#3D5A99',
              background: isActive ? 'rgba(43,95,245,0.08)' : 'transparent',
              borderLeft: isActive ? '3px solid #2B5FF5' : '3px solid transparent',
            })}>
              {({ isActive }) => (<>
                <span style={{color:isActive?'#2B5FF5':danger?'#EF4444':'#7A9CC9', display:'flex'}}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                <span style={{flex:1}}>{label}</span>
                {count > 0 && (
                  <span style={{
                    background:danger?'#EF4444':'#2B5FF5',
                    color:'#fff', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:700,
                  }}>{count}</span>
                )}
              </>)}
            </NavLink>
          )
        })}
      </nav>

      {/* Bouton Déconnexion avec Icône Lucide */}
      <div style={{padding:'12px 14px', borderTop:'1.5px solid rgba(43,95,245,0.08)', display:'flex', alignItems:'center', gap:10}}>
        {/* ... (avatar admin) ... */}
        <button onClick={onLogout} style={{background:'none', border:'none', cursor:'pointer', color:'#7A9CC9'}}>
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}