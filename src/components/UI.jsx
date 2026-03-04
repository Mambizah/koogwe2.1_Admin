export function Icon({ path, size=16, color='currentColor', fill='none', strokeWidth=1.8 }) {
  return (
    <svg width={size} height={size} fill={fill} stroke={color} strokeWidth={strokeWidth} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d={path}/>
    </svg>
  )
}

export function StatCard({ label, value, trend, color='var(--blue)', iconPath, delay=0 }) {
  const positive = trend && !String(trend).startsWith('-')
  return (
    <div className="card fade-up" style={{ padding:'20px', animationDelay:`${delay}ms` }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="18" height="18" fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d={iconPath}/>
          </svg>
        </div>
        {trend && <span style={{ fontSize:11, fontWeight:700, color: positive?'var(--green)':'var(--red)' }}>{positive?'↑':'↓'} {trend}</span>}
      </div>
      <div style={{ color:'var(--text2)', fontSize:12, marginBottom:4 }}>{label}</div>
      <div style={{ fontWeight:800, fontSize:24, letterSpacing:'-0.02em' }}>{value}</div>
    </div>
  )
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:12, flexWrap:'wrap' }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>{title}</h1>
        {subtitle && <p style={{ fontSize:13, color:'var(--text2)' }}>{subtitle}</p>}
      </div>
      {children && <div style={{ display:'flex', gap:8, flexShrink:0 }}>{children}</div>}
    </div>
  )
}

export function TopBar({ title, panicCount=0, onSearch }) {
  return (
    <header style={{ height:'var(--header-h)', background:'rgba(21,29,46,0.9)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)', padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40 }}>
      <h2 style={{ fontSize:18, fontWeight:700 }}>{title}</h2>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ position:'relative' }}>
          <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', opacity:0.4 }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="input" placeholder="Rechercher..." onChange={e=>onSearch?.(e.target.value)} style={{ width:220, paddingLeft:36, background:'var(--surface2)', border:'1px solid var(--border)' }} />
        </div>
        <button style={{ position:'relative', background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer', borderRadius:8, display:'flex', alignItems:'center', padding:8 }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          {panicCount > 0 && <span style={{ position:'absolute', top:4, right:4, width:8, height:8, background:'var(--red)', borderRadius:4, border:'1px solid var(--bg)' }} />}
        </button>
      </div>
    </header>
  )
}

// ✅ StatusBadge complet — tous les statuts du backend couverts
export function StatusBadge({ status }) {
  const cfg = {
    // Statuts compte utilisateur
    ACTIVE:                  { cls:'badge-green',  label:'Actif'           },
    EMAIL_NOT_VERIFIED:      { cls:'badge-gray',   label:'Email non vérifié'},
    EMAIL_VERIFIED:          { cls:'badge-blue',   label:'Email vérifié'   },
    FACE_VERIFICATION_PENDING:{ cls:'badge-orange',label:'Vérif. visage'   },
    DOCUMENTS_PENDING:       { cls:'badge-orange', label:'Docs requis'     },
    ADMIN_REVIEW_PENDING:    { cls:'badge-orange', label:'En validation'   },
    REJECTED:                { cls:'badge-red',    label:'Rejeté'          },
    SUSPENDED:               { cls:'badge-red',    label:'Suspendu'        },
    // Statuts documents
    PENDING:                 { cls:'badge-orange', label:'En attente'      },
    APPROVED:                { cls:'badge-green',  label:'Approuvé'        },
    // Statuts courses
    REQUESTED:               { cls:'badge-orange', label:'Demandée'        },
    ACCEPTED:                { cls:'badge-blue',   label:'Acceptée'        },
    ARRIVED:                 { cls:'badge-blue',   label:'Arrivé'          },
    IN_PROGRESS:             { cls:'badge-blue',   label:'En cours'        },
    COMPLETED:               { cls:'badge-green',  label:'Terminée'        },
    CANCELLED:               { cls:'badge-red',    label:'Annulée'         },
    // Statuts transactions
    PAID:                    { cls:'badge-green',  label:'Versé'           },
    FAILED:                  { cls:'badge-red',    label:'Échoué'          },
    // Statuts alertes
    NEW:                     { cls:'badge-pulse',  label:'🚨 Active'       },
    RESOLVED:                { cls:'badge-green',  label:'Résolue'         },
    FALSE:                   { cls:'badge-gray',   label:'Fausse alerte'   },
  }
  const c = cfg[status] || { cls:'badge-gray', label: status || '—' }
  return <span className={`badge ${c.cls}`}>{c.label}</span>
}

export function SearchBar({ value, onChange, placeholder='Rechercher...' }) {
  return (
    <div style={{ position:'relative', flex:1, minWidth:200 }}>
      <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', opacity:0.4, pointerEvents:'none' }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input className="input" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ paddingLeft:36 }}/>
    </div>
  )
}

export function FilterTabs({ options, value, onChange }) {
  return (
    <div style={{ display:'flex', gap:2, background:'var(--surface2)', padding:3, borderRadius:8, border:'1px solid var(--border)' }}>
      {options.map(opt => (
        <button key={opt.value} onClick={()=>onChange(opt.value)} style={{
          padding:'5px 14px', borderRadius:6, border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
          background: value===opt.value ? 'var(--blue)' : 'transparent',
          color: value===opt.value ? '#fff' : 'var(--text2)',
          transition:'all 0.15s',
        }}>
          {opt.label}{opt.count!==undefined ? ` (${opt.count})` : ''}
        </button>
      ))}
    </div>
  )
}

export function Avatar({ name, size=36 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:size/2, background:'var(--blue-l)', border:'1px solid var(--border2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.38, fontWeight:700, color:'var(--blue)', flexShrink:0 }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

export function Loading({ height=200 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height }}>
      <div className="spinner"/>
    </div>
  )
}

export function EmptyState({ message='Aucun résultat' }) {
  return (
    <div style={{ padding:'48px 24px', textAlign:'center', color:'var(--text3)' }}>
      <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom:12, opacity:0.3 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <div>{message}</div>
    </div>
  )
}

export function Modal({ title, subtitle, onClose, children, footer, maxWidth=560 }) {
  return (
    <div className="fade-in" style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fade-up" style={{ background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:14, width:'100%', maxWidth, maxHeight:'90vh', overflow:'auto' }}>
        <div style={{ padding:'20px 22px 16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', borderBottom:'1px solid var(--border)' }}>
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>{title}</div>
            {subtitle && <div style={{ fontSize:12, color:'var(--text2)', marginTop:3 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:'var(--surface2)', border:'none', color:'var(--text2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ padding:22 }}>{children}</div>
        {footer && <div style={{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>{footer}</div>}
      </div>
    </div>
  )
}

export function InfoRow({ label, value, color }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
      <span style={{ fontSize:12, color:'var(--text3)' }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:500, color: color || 'var(--text)' }}>{value || '—'}</span>
    </div>
  )
}

export function SidePanel({ title, onClose, children, footer }) {
  return (
    <div className="fade-in" style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:380, height:'100%', background:'var(--surface)', borderLeft:'1px solid var(--border2)', display:'flex', flexDirection:'column', overflowY:'auto', animation:'slideR 0.25s ease' }}>
        <div style={{ padding:'20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ fontWeight:700, fontSize:16 }}>{title}</div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:'var(--surface2)', border:'none', color:'var(--text2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ flex:1, padding:20, overflowY:'auto' }}>{children}</div>
        {footer && <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', flexShrink:0 }}>{footer}</div>}
      </div>
    </div>
  )
}

// ✅ Formater le prix — corrige les centimes en euros
export function formatPrice(price) {
  if (!price && price !== 0) return '—'
  // Si le prix est > 10000, probablement en centimes
  const amount = price > 10000 ? price / 100 : price
  return `${amount.toFixed(2)} €`
}