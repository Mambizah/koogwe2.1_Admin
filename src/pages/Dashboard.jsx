import { useState, useEffect, useCallback } from 'react'
import { StatCard, TopBar, StatusBadge, Avatar } from '../components/UI'
import { dashboardService } from '../services/api'
import { useRealtimeSync } from '../hooks/useRealtimeSync'

export default function Dashboard() {
  const [stats, setStats] = useState({})
  const [docs,  setDocs]  = useState([])
  const [rides, setRides] = useState([])

  const load = useCallback(async () => {
    
    try {
      const [s, r, d] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentRides(),
        dashboardService.getPendingDocs(),
      ])
      if (s) setStats(s)
      if (Array.isArray(r)) setRides(r)
      if (Array.isArray(d)) setDocs(d)
    } catch {}
  }, [])

  useRealtimeSync(load, { interval: 20000, topics: ['dashboard', 'ride', 'document', 'panic'] })

  const pendingDocs = docs.filter(d=>d.status==='PENDING')

  return (
    <div className="fade-in">
      <TopBar title="Vue d'ensemble" panicCount={stats.panicAlerts} />
      <div style={{ padding:'24px 28px' }}>

        {/* KPI Row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
          <StatCard label="Total Chauffeurs"    value={stats.totalDrivers?.toLocaleString()}        trend="+12%"  color="var(--blue)"   delay={0}   iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          <StatCard label="Revenu Journalier"   value={`€${((stats.revenue || 0)/30).toFixed(0)}`}  trend="+5.4%" color="var(--green)"  delay={80}  iconPath="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          <StatCard label="Courses Actives"     value={stats.activeRides ?? 0}                       trend="-2.1%" color="var(--orange)" delay={160} iconPath="M8 7h12m0 0l-4-4m4 4l-4 4m0 5H4m0 0l4 4m-4-4l4-4"/>
          <StatCard label="Documents en attente" value={stats.pendingDocs ?? pendingDocs.length}      trend="+8%"   color="var(--purple)" delay={240} iconPath="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </div>

        {/* Middle row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>

          {/* Documents en attente */}
          <div className="card" style={{ padding:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div style={{ fontWeight:700 }}>Gestion des Documents</div>
              <button style={{ fontSize:12, color:'var(--blue)', background:'none', border:'none', cursor:'pointer' }}>Voir tout →</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {pendingDocs.slice(0,3).map(doc => (
                <div key={doc.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'var(--surface2)', borderRadius:8, border:'1px solid var(--border)' }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:'var(--blue-l)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="16" height="16" fill="none" stroke="var(--blue)" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.type?.replace(/_/g,' ')} — {doc.driverName}</div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>Téléchargé {doc.uploadedAt || doc.createdAt || '—'}</div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button style={{ width:28, height:28, borderRadius:14, background:'var(--green-l)', border:'1px solid rgba(16,185,129,0.2)', color:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button style={{ width:28, height:28, borderRadius:14, background:'var(--red-l)', border:'1px solid rgba(239,68,68,0.2)', color:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              ))}
              {pendingDocs.length === 0 && <div style={{ textAlign:'center', color:'var(--text3)', padding:24, fontSize:13 }}>Aucun document en attente</div>}
            </div>
          </div>

          {/* Alertes panique */}
          <div className="card" style={{ padding:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:10, height:10, borderRadius:5, background:'var(--red)', display:'inline-block', animation:'pulse 1s ease infinite' }}/>
                <span style={{ fontWeight:700, color:'var(--red)' }}>Alertes Panique Urgentes</span>
              </div>
              <span className="badge badge-red">{stats.panicAlerts} ACTIVES</span>
            </div>
            {/* Mini map placeholder */}
            <div style={{ height:160, borderRadius:10, overflow:'hidden', background:'var(--surface2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, position:'relative' }}>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, #1a2a4a 0%, #0d1b36 100%)' }}/>
              <div style={{ position:'relative', textAlign:'center', color:'var(--text3)' }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom:8 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div style={{ fontSize:12 }}>Carte GPS</div>
                <div style={{ fontSize:10, marginTop:2 }}>Voir page Alertes Panique</div>
              </div>
            </div>
            <div style={{ padding:'10px 14px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:8, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22 }}>🆘</span>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--red)' }}>ALERTE: Trajet #RK-9921</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>Passager: Julie Moreau • Chauffeur: Marc Leblanc</div>
              </div>
              <button className="btn btn-danger btn-sm" style={{ marginLeft:'auto', flexShrink:0 }}>Intervenir</button>
            </div>
          </div>
        </div>

        {/* Courses récentes */}
        <div className="card">
          <div style={{ padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontWeight:700, fontSize:15 }}>Courses Récentes</div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-ghost btn-sm">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filtrer
              </button>
              <button className="btn btn-ghost btn-sm">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Exporter
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID Course</th><th>Date & Heure</th><th>Chauffeur</th><th>Passager</th><th>Statut</th><th>Montant</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rides.map(r => (
                <tr key={r.id}>
                  <td style={{ color:'var(--blue)', fontWeight:600, fontSize:13 }}>{r.refId}</td>
                  <td style={{ color:'var(--text2)', fontSize:12 }}>{r.date || r.createdAt || '—'}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Avatar name={r.driverName || '?'} size={30}/>
                      <span style={{ fontSize:13, fontWeight:500 }}>{r.driverName || <span style={{ color:'var(--text3)', fontStyle:'italic' }}>Recherche...</span>}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:13 }}>{r.passengerName || r.passenger?.name || '—'}</td>
                  <td><StatusBadge status={r.status}/></td>
                  <td style={{ fontWeight:600 }}>{r.price > 0 ? `€${r.price.toFixed(2)}` : '—'}</td>
                  <td>
                    <button style={{ width:30, height:30, borderRadius:8, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}