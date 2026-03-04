import { useState, useEffect, useCallback } from 'react'
import { SearchBar, Avatar, EmptyState } from '../components/UI'
import { driversService } from '../services/api'
import { useRealtimeSync } from '../hooks/useRealtimeSync'

export default function Drivers() {
  const [drivers,  setDrivers]  = useState([])
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [saving,   setSaving]   = useState(false)

  const load = useCallback(async () => {
    try {
      const d = await driversService.getAll()
      if (Array.isArray(d)) {
        setDrivers(d)
        if (!selected && d.length > 0) setSelected(d[0])
      }
    } catch {}
  }, [])

  useRealtimeSync(load, { interval: 20000, topics: ['driver', 'drivers', 'account'] })

  const filtered = drivers.filter(d =>
    !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalDrivers = drivers.length
  const activeDrivers = drivers.filter(d => d.accountStatus === 'ACTIVE').length
  const pendingDrivers = drivers.filter(d => d.accountStatus === 'ADMIN_REVIEW_PENDING').length
  const avgRating = drivers.length ? (drivers.reduce((acc, driver) => acc + (driver.rating || 0), 0) / drivers.length).toFixed(1) : '0.0'

  const toggleSuspend = async (driver) => {
    setSaving(true)
    const newStatus = driver.accountStatus==='SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
    try {
      if (driver.accountStatus==='SUSPENDED') await driversService.activate(driver.id)
      else await driversService.suspend(driver.id)
    } catch {}
    setDrivers(p=>p.map(d=>d.id===driver.id?{...d,accountStatus:newStatus}:d))
    if (selected?.id===driver.id) setSelected(prev=>({...prev,accountStatus:newStatus}))
    setSaving(false)
  }

  const statusDot = (s) => {
    if (s==='ACTIVE') return <span className="dot dot-green"/>
    if (s==='SUSPENDED') return <span className="dot dot-red"/>
    return <span className="dot dot-orange"/>
  }
  const statusLabel = (s) => s==='ACTIVE' ? 'En ligne' : s==='SUSPENDED' ? 'Suspendu' : 'En attente'

  return (
    <div style={{ display:'flex', height:'100vh', flexDirection:'column' }}>
      <div style={{ padding:'22px 28px 18px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:0 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Gestion des Chauffeurs</h1>
            <p style={{ fontSize:13, color:'var(--text2)' }}>Gérez et suivez les performances en temps réel.</p>
          </div>
          <button className="btn btn-primary">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Ajouter un Chauffeur
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding:'0 28px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {[
            { label:'TOTAL CHAUFFEURS',     value:totalDrivers.toLocaleString(), trend:'+5.2%', color:'var(--blue)'   },
            { label:"ACTIFS AUJOURD'HUI",   value:activeDrivers.toLocaleString(), trend:'+3.1%', color:'var(--green)'  },
            { label:'NOUVELLES DEMANDES',   value:pendingDrivers,               trend:'+15%',  color:'var(--orange)' },
            { label:'NOTE MOYENNE',         value:`${avgRating}/5`,             trend:'-0.2%', color:'var(--purple)' },
          ].map((s,i)=>(
            <div key={i} className="card fade-up" style={{ padding:'16px 18px', animationDelay:`${i*60}ms` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--text3)' }}>{s.label}</span>
                <span style={{ fontSize:11, fontWeight:700, color: s.trend.startsWith('+') ? 'var(--green)' : 'var(--red)' }}>{s.trend}</span>
              </div>
              <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.02em', color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', flex:1, gap:0, overflow:'hidden', padding:'0 28px 24px' }}>
        {/* Liste */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', marginRight:16 }}>
          {/* Barre de recherche + filtres */}
          <div style={{ display:'flex', gap:10, marginBottom:16 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par nom, ID ou modèle de véhicule..."/>
            <button className="btn btn-ghost btn-sm">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Statut
            </button>
            <button className="btn btn-ghost btn-sm">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5"/><circle cx="16" cy="16" r="2"/><circle cx="8" cy="16" r="2"/></svg>
              Type de Véhicule
            </button>
          </div>

          <div className="table-wrap" style={{ overflow:'auto' }}>
            <table>
              <thead><tr><th>Chauffeur</th><th>ID</th><th>Véhicule</th><th>Statut</th></tr></thead>
              <tbody>
                {filtered.map(d=>(
                  <tr key={d.id} onClick={()=>setSelected(d)} style={{ cursor:'pointer', background: selected?.id===d.id ? 'var(--blue-ll)' : '' }}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Avatar name={d.name} size={38}/>
                        <div>
                          <div style={{ fontWeight:600, fontSize:13 }}>{d.name}</div>
                          <div style={{ fontSize:11, color:'var(--text3)' }}>{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color:'var(--text2)', fontSize:12 }}>#KGW-{d.id.replace(/\D/g,'').padStart(4,'0')}</td>
                    <td style={{ fontSize:12, color:'var(--text2)' }}>{d.vehicleMake} {d.vehicleModel} ({d.vehicleYear})</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        {statusDot(d.accountStatus)}
                        <span style={{ fontSize:12 }}>{statusLabel(d.accountStatus)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0 && <EmptyState message="Aucun chauffeur trouvé"/>}
          </div>
        </div>

        {/* Panel détail droite */}
        {selected && (
          <div className="card" style={{ width:340, flexShrink:0, overflow:'auto', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'18px 18px 14px', display:'flex', justifyContent:'flex-end' }}>
              <button style={{ width:28, height:28, background:'var(--surface2)', border:'none', borderRadius:7, color:'var(--text3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>

            {/* Avatar + nom */}
            <div style={{ textAlign:'center', padding:'0 18px 16px' }}>
              <Avatar name={selected.name} size={80}/>
              <div style={{ fontWeight:800, fontSize:17, marginTop:10 }}>{selected.name}</div>
              <div style={{ fontSize:12, color:'var(--text3)', display:'flex', alignItems:'center', justifyContent:'center', gap:4, marginTop:3 }}>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Cayenne, Guyane
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:'0 16px 14px' }}>
              {[
                { l:'TOTAL RIDES', v:selected.totalRides, c:'var(--text)' },
                { l:'REVENUS',     v:`${selected.earnings?.toLocaleString()}€`, c:'var(--text)' },
                { l:'ACCEPTATION', v:`${selected.acceptRate}%`, c:'var(--green)' },
                { l:'ANNULATION',  v:`${selected.cancelRate}%`, c:'var(--red)' },
              ].map((s,i)=>(
                <div key={i} style={{ background:'var(--surface2)', padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.08em', color:'var(--text3)', marginBottom:4 }}>{s.l}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Infos véhicule */}
            <div style={{ padding:'0 16px 14px' }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--text3)', textTransform:'uppercase', marginBottom:8 }}>Informations Véhicule</div>
              {[
                { label:'Modèle', value:`${selected.vehicleMake} ${selected.vehicleModel} ${selected.vehicleYear}`, extra: selected.vehicleColor },
                { label:'Plaque', value:selected.licensePlate },
                { label:'Assurance', value:`Valide jusqu'au ${selected.insurance}`, color: 'var(--green)' },
              ].map((item,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--surface2)', borderRadius:8, border:'1px solid var(--border)', marginBottom:8 }}>
                  <div style={{ width:32, height:32, borderRadius:7, background:'var(--blue-l)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="14" height="14" fill="none" stroke="var(--blue)" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5"/><circle cx="16" cy="16" r="2"/><circle cx="8" cy="16" r="2"/></svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>{item.label}</div>
                    <div style={{ fontSize:13, fontWeight:500, color: item.color || 'var(--text)' }}>{item.value}</div>
                  </div>
                  {item.extra && <span style={{ fontSize:11, color:'var(--text3)', background:'var(--surface3)', padding:'2px 8px', borderRadius:4 }}>{item.extra}</span>}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ padding:'12px 16px', marginTop:'auto', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-ghost" style={{ flex:1, fontSize:12 }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  Message
                </button>
                <button className="btn btn-ghost" style={{ flex:1, fontSize:12 }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.25 9.09 19.79 19.79 0 01.22 .44 2 2 0 012.22 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.35 6.35l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  Appeler
                </button>
              </div>
              <button className="btn btn-danger btn-full" onClick={()=>toggleSuspend(selected)} disabled={saving} style={{ fontSize:13 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                {selected.accountStatus==='SUSPENDED' ? 'Réactiver le compte' : 'Suspendre le compte'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}