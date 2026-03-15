// Pages : Passengers, Rides, Revenue, Panics
import { useState, useEffect, useCallback } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { SearchBar, FilterTabs, StatusBadge, Avatar, Loading, EmptyState, StatCard } from '../components/UI'
import { passengersService, ridesService, financeService, panicsService } from '../services/api'
import { useRealtimeSync } from '../hooks/useRealtimeSync'

const TT = { background:'#1A2438', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, fontSize:12 }

// ── PASSAGERS ─────────────────────────────────────────────────────────────────
export function Passengers() {
  const [passengers, setPassengers] = useState([])
  const [selected,   setSelected]   = useState(null)
  const [search,     setSearch]     = useState('')
  const [loading,    setLoading]    = useState(false)

  const load = useCallback(async()=>{
    try{
      const d=await passengersService.getAll()
      const list=Array.isArray(d)?d:(d?.items??[])
      setPassengers(list)
    } catch(e) {
      console.error('Passagers:', e?.response?.status, e?.message)
    }
    setLoading(false)
  },[])
  useRealtimeSync(load, { interval: 25000, topics: ['passenger', 'passengers', 'account'] })

  const filtered = passengers.filter(p=>
    !search||p.name?.toLowerCase().includes(search.toLowerCase())||p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSuspend = async(p)=>{
    const ns = p.accountStatus==='SUSPENDED'?'ACTIVE':'SUSPENDED'
    try{if(p.accountStatus==='SUSPENDED')await passengersService.activate(p.id);else await passengersService.suspend(p.id)}catch{}
    setPassengers(prev=>prev.map(x=>x.id===p.id?{...x,accountStatus:ns}:x))
    if(selected?.id===p.id)setSelected(prev=>({...prev,accountStatus:ns}))
  }

  return (
    <div style={{display:'flex',height:'100vh',flexDirection:'column'}}>
      <div style={{padding:'22px 28px 20px'}}>
        <h1 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Gestion des Passagers</h1>
        <p style={{fontSize:13,color:'var(--text2)'}}>Supervisez et gérez tous les comptes passagers enregistrés sur la plateforme.</p>
      </div>

      {/* Stats */}
      <div style={{padding:'0 28px 20px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        <StatCard label="Total Passagers"           value={passengers.length.toLocaleString()} trend="+12%"  color="var(--blue)"  iconPath="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" delay={0}/>
        <StatCard label="Utilisateurs Actifs (Auj)" value={passengers.filter(p => p.accountStatus === 'ACTIVE').length.toLocaleString()} trend="+5%"  color="var(--green)" iconPath="M13 10V3L4 14h7v7l9-11h-7z" delay={80}/>
        <StatCard label="Nouveaux (ce mois)"        value={passengers.filter(p => {
          if (!p.createdAt) return false
          const createdAt = new Date(p.createdAt)
          const now = new Date()
          return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
        }).length} trend="+8%"  color="var(--orange)"iconPath="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" delay={160}/>
      </div>

      <div style={{display:'flex',flex:1,overflow:'hidden',padding:'0 28px 24px',gap:16}}>
        {/* Table */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{display:'flex',gap:10,marginBottom:14}}>
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par nom, email ou ID..."/>
            <button className="btn btn-ghost btn-sm">Filtrer</button>
          </div>
          <div className="table-wrap" style={{overflow:'auto'}}>
            <table>
              <thead><tr><th>Passager</th><th>Contact</th><th>Courses</th><th>Note</th><th>Statut</th></tr></thead>
              <tbody>
                {filtered.map(p=>(
                  <tr key={p.id} onClick={()=>setSelected(p)} style={{cursor:'pointer',background:selected?.id===p.id?'var(--blue-ll)':''}}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <Avatar name={p.name} size={36}/>
                        <div>
                          <div style={{fontWeight:600,fontSize:13}}>{p.name}</div>
                          <div style={{fontSize:10,color:'var(--text3)'}}>ID: #KG-{p.id.replace(/\D/g,'').padStart(4,'0')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{fontSize:12}}>{p.email}</div>
                      <div style={{fontSize:11,color:'var(--text3)'}}>{p.phone}</div>
                    </td>
                    <td style={{fontWeight:700}}>{p.totalRides}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        <span style={{color:'var(--orange)'}}>★</span>
                        <span style={{fontWeight:600,fontSize:13}}>{p.rating}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={p.accountStatus}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0&&<EmptyState message="Aucun passager trouvé"/>}
            <div style={{padding:'12px 16px',fontSize:12,color:'var(--text3)',borderTop:'1px solid var(--border)'}}>
              Affichage de 1 à {filtered.length} sur {passengers.length} passagers
            </div>
          </div>
        </div>

        {/* Panel droite */}
        {selected && (
          <div className="card" style={{width:360,flexShrink:0,overflow:'auto',display:'flex',flexDirection:'column'}}>
            <div style={{padding:'18px 18px 0',display:'flex',justifyContent:'space-between'}}>
              <div style={{fontWeight:700}}>Détails du Passager</div>
              <button onClick={()=>setSelected(null)} style={{width:28,height:28,borderRadius:7,background:'var(--surface2)',border:'none',color:'var(--text2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{padding:'14px 18px 18px',textAlign:'center'}}>
              <div style={{position:'relative',display:'inline-block'}}>
                <Avatar name={selected.name} size={72}/>
                {selected.accountStatus==='ACTIVE'&&<div style={{position:'absolute',bottom:2,right:2,width:14,height:14,borderRadius:7,background:'var(--green)',border:'2px solid var(--surface)'}}/>}
              </div>
              <div style={{fontWeight:700,fontSize:16,marginTop:10}}>{selected.name}</div>
              <div style={{fontSize:12,color:'var(--text3)'}}>Passager depuis le {selected.createdAt}</div>
              <div style={{display:'flex',justifyContent:'center',gap:12,marginTop:14}}>
                {[{l:'NOTE',v:`${selected.rating} ★`},{l:'COURSES',v:selected.totalRides},{l:'TOTAL DÉPENSÉ',v:`${selected.totalSpent}€`}].map((s,i)=>(
                  <div key={i} style={{padding:'8px 12px',background:'var(--surface2)',borderRadius:8,textAlign:'center'}}>
                    <div style={{fontSize:9,fontWeight:700,color:'var(--text3)',letterSpacing:'0.06em'}}>{s.l}</div>
                    <div style={{fontSize:16,fontWeight:800,marginTop:2}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:'0 18px',marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',color:'var(--text3)',textTransform:'uppercase',marginBottom:8}}>Informations de Contact</div>
              {[{i:'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',v:selected.email},{i:'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.25 9.09 19.79 19.79 0 01.22.44A2 2 0 012.22 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.35 6.35l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',v:selected.phone},{i:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 10h.01',v:selected.city}].map((item,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                  <svg width="14" height="14" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24"><path d={item.i}/></svg>
                  <span style={{fontSize:13}}>{item.v}</span>
                </div>
              ))}
            </div>
            {selected.lastRides?.length>0 && (
              <div style={{padding:'0 18px',marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',color:'var(--text3)',textTransform:'uppercase',marginBottom:8}}>Dernières Courses</div>
                {selected.lastRides.map((r,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',background:'var(--surface2)',borderRadius:8,marginBottom:6,alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:'var(--blue)'}}>{r.ref}</div>
                      <div style={{fontSize:11,color:'var(--text3)'}}>{r.date} • Avec {r.driver}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:13,fontWeight:700}}>{r.price}€</div>
                      <StatusBadge status={r.status}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{padding:'14px 18px',marginTop:'auto',borderTop:'1px solid var(--border)',display:'flex',gap:8}}>
              <button className="btn btn-primary" style={{flex:1,fontSize:12}} onClick={()=>{}}>Enregistrer</button>
              <button className={`btn ${selected.accountStatus==='SUSPENDED'?'btn-success':'btn-danger'}`} style={{flex:1,fontSize:12}} onClick={()=>toggleSuspend(selected)}>
                {selected.accountStatus==='SUSPENDED'?'Réactiver':'Suspendre'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── COURSES ───────────────────────────────────────────────────────────────────
export function Rides() {
  const [rides,    setRides]    = useState([])
  const [selected, setSelected] = useState(null)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('ALL')
  const [loading,  setLoading]  = useState(false)

  const load = useCallback(async()=>{
    try{
      const d=await ridesService.getAll()
      const list=Array.isArray(d)?d:(d?.items??d?.data??[])
      setRides(list)
    } catch(e) {
      console.error('Courses:', e?.response?.status, e?.message)
    }
    setLoading(false)
  },[])
  useRealtimeSync(load, { interval: 10000, topics: ['ride', 'rides', 'trip'] })

  const counts = { ALL:rides.length, IN_PROGRESS:rides.filter(r=>r.status==='IN_PROGRESS').length, REQUESTED:rides.filter(r=>r.status==='REQUESTED').length, COMPLETED:rides.filter(r=>r.status==='COMPLETED').length }
  const filtered = rides.filter(r=>{
    const fOk=filter==='ALL'||r.status===filter
    const sOk=!search||r.passengerName?.toLowerCase().includes(search.toLowerCase())||r.driverName?.toLowerCase().includes(search.toLowerCase())||r.refId?.includes(search)
    return fOk&&sOk
  })

  return (
    <div style={{display:'flex',height:'100vh',flexDirection:'column'}}>
      <div style={{padding:'22px 28px 18px'}}>
        <h1 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Gestion des Courses</h1>
        <p style={{fontSize:13,color:'var(--text2)'}}>Surveillez et gérez les trajets en temps réel</p>
      </div>
      {/* KPIs */}
      <div style={{padding:'0 28px 18px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {[
          {l:'Total Courses (Auj)',v:counts.ALL,       s:'+12% vs hier',  c:'var(--blue)',  i:'M8 7h12m0 0l-4-4m4 4l-4 4m0 5H4m0 0l4 4m-4-4l4-4'},
          {l:'Courses Actives',   v:counts.IN_PROGRESS,s:'En temps réel', c:'var(--green)', i:'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0'},
          {l:'Courses Planifiées',v:15,              s:'Prochaines 24h', c:'var(--orange)','i':'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'},
          {l:'Courses Annulées', v:counts.ALL-counts.COMPLETED-counts.IN_PROGRESS-counts.REQUESTED,s:'-2% ce mois',c:'var(--red)',i:'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'},
        ].map((s,i)=>(
          <div key={i} className="card" style={{padding:'16px 18px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <div style={{width:36,height:36,borderRadius:9,background:`${s.c}18`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="16" height="16" fill="none" stroke={s.c} strokeWidth="2" viewBox="0 0 24 24"><path d={s.i}/></svg>
              </div>
            </div>
            <div style={{fontSize:12,color:'var(--text2)',marginBottom:4}}>{s.l}</div>
            <div style={{fontSize:28,fontWeight:800,letterSpacing:'-0.02em'}}>{s.v}</div>
            <div style={{fontSize:11,color:'var(--green)',marginTop:4}}>{s.s}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',flex:1,overflow:'hidden',padding:'0 28px 24px',gap:16}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{display:'flex',gap:10,marginBottom:14,alignItems:'center'}}>
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par ID, passager, chauffeur..."/>
            <button className="btn btn-ghost btn-sm">Statut: Tous</button>
            <button className="btn btn-ghost btn-sm">Date: Aujourd'hui</button>
            <button className="btn btn-primary btn-sm">Filtrer</button>
          </div>
          <div className="table-wrap" style={{overflow:'auto'}}>
            <table>
              <thead><tr><th>ID Course</th><th>Passager</th><th>Chauffeur</th><th>Trajet</th><th>Prix</th><th>Statut</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map(r=>(
                  <tr key={r.id} onClick={()=>setSelected(r)} style={{cursor:'pointer',background:selected?.id===r.id?'var(--blue-ll)':''}}>
                    <td style={{color:'var(--blue)',fontWeight:600,fontSize:13}}>{r.refId}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <Avatar name={r.passengerName} size={30}/>
                        <span style={{fontSize:13}}>{r.passengerName}</span>
                      </div>
                    </td>
                    <td>
                      {r.driverName
                        ? <div style={{display:'flex',alignItems:'center',gap:8}}><Avatar name={r.driverName} size={30}/><span style={{fontSize:13}}>{r.driverName}</span></div>
                        : <span style={{color:'var(--text3)',fontSize:12,fontStyle:'italic'}}>Recherche chauffeur...</span>}
                    </td>
                    <td>
                      <div style={{fontSize:12}}>
                        <div style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:6,height:6,borderRadius:3,background:'var(--green)',flexShrink:0,display:'inline-block'}}/>{r.origin}</div>
                        <div style={{display:'flex',alignItems:'center',gap:4,marginTop:3}}><span style={{width:6,height:6,borderRadius:3,background:'var(--red)',flexShrink:0,display:'inline-block'}}/>{r.destination}</div>
                      </div>
                    </td>
                    <td style={{fontWeight:700}}>{r.price>0?`${r.price.toFixed(2)}€`:'—'}</td>
                    <td><StatusBadge status={r.status}/></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" style={{minWidth:32}}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0&&<EmptyState message="Aucune course trouvée"/>}
          </div>
        </div>

        {/* Détail course */}
        {selected && (
          <div className="card" style={{width:320,flexShrink:0,overflow:'auto'}}>
            <div style={{padding:'16px 16px 12px',borderBottom:'1px solid var(--border)',fontWeight:700}}>Détails de la course</div>
            <div style={{height:140,background:'var(--surface2)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',fontSize:12}}>
              <div style={{textAlign:'center'}}>
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{marginBottom:6}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Carte GPS
              </div>
            </div>
            <div style={{padding:16}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',color:'var(--blue)',textTransform:'uppercase',marginBottom:10}}>Étapes de la Course</div>
              {[{t:'Commandée',d:'14:20 • '+selected.origin},{t:'Acceptée',d:'14:22 • Chauffeur à 2km'},{t:'Arrivée au point de départ',d:'14:27 • Temps d\'attente 2min'},{t:'Course terminée',d:'14:45 • '+selected.destination}].map((step,i)=>(
                <div key={i} style={{display:'flex',gap:10,marginBottom:10}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                    <div style={{width:10,height:10,borderRadius:5,background:'var(--blue)',flexShrink:0,marginTop:2}}/>
                    {i<3&&<div style={{width:1,height:24,background:'var(--border)',margin:'3px 0'}}/>}
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600}}>{step.t}</div>
                    <div style={{fontSize:11,color:'var(--text3)'}}>{step.d}</div>
                  </div>
                </div>
              ))}
              <div style={{marginTop:16,paddingTop:14,borderTop:'1px solid var(--border)'}}>
                <div style={{fontSize:12,color:'var(--text2)',marginBottom:4}}>Paiement</div>
                <div style={{fontSize:13,fontWeight:600}}>💳 Mastercard •••• 4242</div>
                <div style={{fontSize:12,color:'var(--text2)',marginTop:6}}>Total payé</div>
                <div style={{fontSize:20,fontWeight:800,marginTop:2}}>{selected.price.toFixed(2)} €</div>
              </div>
              {selected.status==='COMPLETED'&&(
                <div style={{marginTop:14,padding:'10px 12px',background:'var(--surface2)',borderRadius:8,textAlign:'center'}}>
                  <div style={{fontSize:18,marginBottom:4}}>{'★'.repeat(5)}</div>
                  <div style={{fontSize:12,color:'var(--text3)',fontStyle:'italic'}}>"Très ponctuel !"</div>
                </div>
              )}
              <button className="btn btn-danger btn-full" style={{marginTop:14,fontSize:12}}>
                <span style={{width:8,height:8,borderRadius:4,background:'var(--red)',animation:'pulse 1s ease infinite',flexShrink:0,display:'inline-block'}}/>
                Signaler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── REVENUS ───────────────────────────────────────────────────────────────────
export function Revenue() {
  const [period,  setPeriod]  = useState('weekly')
  const [page,    setPage]    = useState(1)
  const [txs,     setTxs]     = useState([])
  const [chartData,setChart]  = useState([])
  const [stats,   setStats]   = useState({ revenue: 0, commission: 0, pendingPayments: 0, monthGrowth: 0 })
  const [loading, setLoading] = useState(false)

  const load = useCallback(async()=>{
    try{
      const [t,c,s]=await Promise.all([
        financeService.getTransactions(page),
        financeService.getChart(period),
        financeService.getStats(),
      ])
      if(Array.isArray(t)) setTxs(t)
      if (t?.data && Array.isArray(t.data)) setTxs(t.data)
      const chartArr = Array.isArray(c)?c:(c?.points??c?.data??[])
      if(chartArr.length) setChart(chartArr)
      if (s) setStats(s)
    }catch{}
    setLoading(false)
  },[period,page])
  useRealtimeSync(load, { interval: 30000, topics: ['finance', 'revenue', 'transaction', 'payment'] })

  const statusTx = {PAID:'badge-green',PENDING:'badge-orange',CANCELLED:'badge-red'}
  const labelTx  = {PAID:'Versé',PENDING:'En attente',CANCELLED:'Annulé'}

  return (
    <div style={{padding:'24px 28px',overflow:'auto',height:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Gestion des Revenus</h1>
          <p style={{fontSize:13,color:'var(--text2)'}}>Aperçu financier et suivi des commissions</p>
        </div>
        <button className="btn btn-primary">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exporter
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:22}}>
        {[
          {l:'Revenu Total',         v:`${(stats.revenue || 0).toLocaleString()} €`,  s:'+5.2%',  c:'var(--blue)'  },
          {l:'Commissions KOOGWE',   v:`${(stats.commission || 0).toLocaleString()} €`,   s:'+3.1%',  c:'var(--green)' },
          {l:'Paiements en attente', v:`${(stats.pendingPayments || 0).toLocaleString()} €`,   s:'À traiter',c:'var(--orange)'},
          {l:'Croissance mensuelle', v:`+${stats.monthGrowth || 0}%`,        s:'Cible: +15%',c:'var(--purple)'},
        ].map((s,i)=>(
          <div key={i} className="card fade-up" style={{padding:'18px 20px',animationDelay:`${i*60}ms`}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
              <div style={{fontSize:12,color:'var(--text2)'}}>{s.l}</div>
              <div style={{width:30,height:30,borderRadius:8,background:`${s.c}18`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="14" height="14" fill="none" stroke={s.c} strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
            </div>
            <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>{s.v}</div>
            <div style={{fontSize:11,color:'var(--green)'}}>{s.s}</div>
          </div>
        ))}
      </div>

      {/* Graphique */}
      <div className="card" style={{padding:24,marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>Évolution des Revenus</div>
            <div style={{fontSize:12,color:'var(--text2)',marginTop:3}}>Performance financière sur la période sélectionnée</div>
          </div>
          <div style={{display:'flex',gap:4,background:'var(--surface2)',padding:3,borderRadius:8}}>
            {[['daily','Quotidien'],['weekly','Hebdomadaire'],['monthly','Mensuel']].map(([v,l])=>(
              <button key={v} onClick={()=>setPeriod(v)} style={{padding:'5px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,background:period===v?'var(--blue)':'transparent',color:period===v?'#fff':'var(--text2)',transition:'all 0.15s'}}>{l}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0f49bd" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#0f49bd" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={TT} formatter={v=>[`${v}€`,'Revenus']}/>
            <Area type="monotone" dataKey="value" stroke="#0f49bd" strokeWidth={2.5} fill="url(#blueGrad)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions */}
      <div className="card">
        <div style={{padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid var(--border)'}}>
          <div style={{fontWeight:700}}>Transactions Récentes</div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-ghost btn-sm">Tous les statuts</button>
            <button className="btn btn-ghost btn-sm">Derniers 30 jours</button>
          </div>
        </div>
        <table>
          <thead><tr><th>ID Transaction</th><th>Date/Heure</th><th>Chauffeur</th><th>Revenu Brut</th><th>Commission (15%)</th><th>Net Chauffeur</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {txs.map(tx=>(
              <tr key={tx.id}>
                <td style={{color:'var(--blue)',fontWeight:600,fontSize:13}}>{tx.refId}</td>
                <td style={{color:'var(--text2)',fontSize:12}}>{tx.date}</td>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <Avatar name={tx.driverName} size={28}/>
                    <span style={{fontSize:13}}>{tx.driverName}</span>
                  </div>
                </td>
                <td style={{fontWeight:600}}>{tx.gross.toFixed(2)} €</td>
                <td style={{color:'var(--text2)'}}>{tx.commission.toFixed(2)} €</td>
                <td style={{color:'var(--blue)',fontWeight:600}}>{tx.net.toFixed(2)} €</td>
                <td><span className={`badge ${statusTx[tx.status]||'badge-gray'}`}>{labelTx[tx.status]||tx.status}</span></td>
                <td>
                  <button style={{width:28,height:28,borderRadius:6,background:'var(--surface2)',border:'none',color:'var(--text2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid var(--border)'}}>
          <div style={{fontSize:12,color:'var(--text3)'}}>Affichage de 1-{txs.length} sur 458 transactions</div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setPage(p=>Math.max(1,p-1))}>Précédent</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setPage(p=>p+1)}>Suivant</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ALERTES PANIQUE ───────────────────────────────────────────────────────────
export function Panics() {
  const [panics,   setPanics]   = useState([])
  const [selected, setSelected] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [saving,   setSaving]   = useState(false)

  const load = useCallback(async()=>{
    try{
      const d = await panicsService.getAll()
      if (Array.isArray(d)) {
        setPanics(d)
        if (!selected && d.length) setSelected(d[0])
      }
    } catch {}
    setLoading(false)
  },[])
  useRealtimeSync(load, { interval: 8000, topics: ['panic', 'sos', 'alert'] })

  const resolve = async(id)=>{
    setSaving(true)
    try{await panicsService.resolve(id)}catch{}
    setPanics(p=>p.map(x=>x.id===id?{...x,status:'RESOLVED'}:x))
    if(selected?.id===id)setSelected(p=>({...p,status:'RESOLVED'}))
    setSaving(false)
  }

  const active = panics.filter(p=>p.status==='NEW')

  return (
    <div style={{display:'flex',height:'100vh',flexDirection:'column'}}>
      {/* Search top */}
      <div style={{padding:'14px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:16,background:'var(--surface)'}}>
        <SearchBar placeholder="Rechercher une alerte, un chauffeur ou un ID..."/>
        <button style={{width:34,height:34,borderRadius:8,background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        </button>
        <button style={{width:34,height:34,borderRadius:8,background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </button>
      </div>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        {/* Carte + détail alerte */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'auto'}}>
          {/* Map placeholder */}
          <div style={{position:'relative',height:340,background:'linear-gradient(135deg,#0d1b36 0%,#1a2a4a 100%)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{position:'absolute',top:16,left:16,background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:20,padding:'6px 14px',display:'flex',alignItems:'center',gap:6}}>
              <span style={{width:8,height:8,borderRadius:4,background:'var(--red)',animation:'pulse 1s ease infinite'}}/>
              <span style={{fontSize:12,fontWeight:600,color:'var(--red)'}}>{active.length} ALERTES ACTIVES</span>
            </div>
            <div style={{textAlign:'center',color:'var(--text3)'}}>
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{marginBottom:10}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>Carte GPS temps réel</div>
              <div style={{fontSize:11,marginTop:4}}>{active.length} positions actives</div>
            </div>
            {/* Alertes pin simulées */}
            {active.map((p,i)=>(
              <div key={p.id} style={{position:'absolute',top:`${40+i*15}%`,left:`${35+i*10}%`,background:'var(--red)',borderRadius:20,padding:'4px 10px',fontSize:11,fontWeight:700,cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',gap:4}} onClick={()=>setSelected(p)}>
                ⚠️ ID {p.rideRef}
              </div>
            ))}
          </div>

          {/* Détail alerte sélectionnée */}
          {selected && (
            <div style={{padding:'20px 24px',flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
                <span style={{color:'var(--red)',fontSize:18}}>✳</span>
                <span style={{fontWeight:800,fontSize:16}}>Détails de l'Alerte {selected.rideRef}</span>
                <span className="badge badge-pulse" style={{marginLeft:'auto'}}>URGENCE CRITIQUE</span>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
                {[
                  {title:'CHAUFFEUR',name:selected.userName,sub:`⭐ 4.9 (2,450 courses)\nToyota Prius • AB-123-CD\nNoir Métallisé`},
                  {title:'PASSAGER', name:selected.passName,sub:`⭐ 4.7 (128 courses)\nLocalisation Signalée\n${selected.lat}° N, ${selected.lng}° E`},
                ].map((p,i)=>(
                  <div key={i} style={{padding:'14px 16px',background:'var(--surface2)',borderRadius:10,border:'1px solid var(--border)'}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.08em',color:'var(--text3)',marginBottom:8}}>{p.title}</div>
                    <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                      <Avatar name={p.name} size={44}/>
                      <div>
                        <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
                        {p.sub.split('\n').map((l,j)=><div key={j} style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{l}</div>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                {[
                  {label:'Appeler Chauffeur', color:'var(--blue)',   icon:'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.25 9.09 19.79 19.79 0 01.22.44 2 2 0 012.22 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.35 6.35l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z'},
                  {label:'Appeler Passager',  color:'var(--surface3)',icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',dark:true},
                  {label:'Contacter Secours', color:'var(--red)',    icon:'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'},
                  {label:'Résolue',           color:'var(--green)',  icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',action:()=>resolve(selected.id)},
                ].map((btn,i)=>(
                  <button key={i} onClick={btn.action} disabled={saving&&btn.label==='Résolue'}
                    style={{padding:'14px 8px',borderRadius:10,border:'none',cursor:'pointer',background:btn.color,color:btn.dark?'var(--text)':'#fff',display:'flex',flexDirection:'column',alignItems:'center',gap:6,fontSize:12,fontWeight:700,transition:'opacity 0.2s'}}
                    onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
                    onMouseLeave={e=>e.currentTarget.style.opacity='1'}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d={btn.icon}/></svg>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* File d'attente + historique */}
        <div style={{width:340,borderLeft:'1px solid var(--border)',display:'flex',flexDirection:'column',flexShrink:0,overflow:'auto'}}>
          <div style={{padding:'16px 18px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
            <div style={{fontWeight:700}}>Files d'Attente</div>
            <span className="badge badge-red" style={{animation:'pulse 1s ease infinite'}}>LIVE</span>
          </div>
          <div style={{padding:14,display:'flex',flexDirection:'column',gap:8,flexShrink:0}}>
            {panics.filter(p=>p.status==='NEW').map(p=>(
              <div key={p.id} onClick={()=>setSelected(p)} style={{padding:'12px 14px',borderRadius:10,border:`1px solid ${selected?.id===p.id?'rgba(239,68,68,0.4)':'var(--border)'}`,background:selected?.id===p.id?'rgba(239,68,68,0.06)':'var(--surface2)',cursor:'pointer'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontWeight:700,color:'var(--red)',fontSize:13}}>{p.userName}</span>
                  <span style={{fontSize:11,color:'var(--text3)'}}>{p.time}</span>
                </div>
                <div style={{fontSize:11,color:'var(--text3)'}}>ID Ride: {p.rideRef}</div>
                <div style={{fontSize:11,color:'var(--text3)',display:'flex',alignItems:'center',gap:4,marginTop:2}}>
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  Passager: {p.passName}
                </div>
              </div>
            ))}
            {active.length===0&&<div style={{textAlign:'center',color:'var(--text3)',padding:24,fontSize:13}}>Aucune alerte active</div>}
          </div>

          {/* Historique */}
          <div style={{borderTop:'1px solid var(--border)',padding:'14px 18px',flex:1,overflow:'auto'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',color:'var(--text3)',textTransform:'uppercase',marginBottom:12}}>Historique des Résolutions</div>
            <table style={{width:'100%'}}>
              <thead>
                <tr><th style={{padding:'6px 0',fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.06em',textAlign:'left'}}>Ride ID</th><th>Statut</th><th>Temps</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {panics.filter(p => p.status !== 'NEW').map((h,i)=>(
                  <tr key={i}>
                    <td style={{padding:'8px 4px 8px 0',fontSize:12,color:'var(--blue)',fontWeight:600}}>{h.rideRef || '—'}</td>
                    <td style={{padding:'8px 4px'}}><span className={`badge ${h.status==='RESOLVED'?'badge-green':'badge-gray'}`} style={{fontSize:9}}>{h.status==='RESOLVED'?'RÉSOLU':'FAUSSE'}</span></td>
                    <td style={{padding:'8px 4px',fontSize:11,color:'var(--text3)'}}>{h.resolvedAt || h.time || '—'}</td>
                    <td style={{padding:'8px 4px 8px 0',fontSize:10,color:'var(--text3)',maxWidth:100}}>{h.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}