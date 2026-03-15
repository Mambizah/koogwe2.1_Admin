import { useState, useEffect, useCallback } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { StatCard, TopBar, StatusBadge, Avatar, EmptyState } from '../components/UI'
import { dashboardService, driversService, passengersService, ridesService, financeService, documentsService } from '../services/api'
import { useRealtimeSync } from '../hooks/useRealtimeSync'

const TT = { background:'rgba(255,255,255,0.97)', border:'1.5px solid rgba(43,95,245,0.15)', borderRadius:10, boxShadow:'0 8px 24px rgba(43,95,245,0.12)', fontSize:12, fontFamily:'Plus Jakarta Sans,sans-serif', color:'#0D1B4B' }

function DonutChart({ data, colors }) {
  return (
    <PieChart width={120} height={120}>
      <Pie data={data} cx={55} cy={55} innerRadius={35} outerRadius={52} paddingAngle={3} dataKey="value" startAngle={90} endAngle={450}>
        {data.map((_,i) => <Cell key={i} fill={colors[i]} stroke="none"/>)}
      </Pie>
    </PieChart>
  )
}

export default function Dashboard() {
  const [stats,     setStats]     = useState({})
  const [docs,      setDocs]      = useState([])
  const [rides,     setRides]     = useState([])
  const [drivers,   setDrivers]   = useState([])
  const [passengers,setPassengers]= useState([])
  const [revenue,   setRevenue]   = useState({})
  const [chart,     setChart]     = useState([])
  const [activeRides,setActiveRides]=useState([])

  const load = useCallback(async () => {
    try {
      const [s, r, d, drv, pax, rev, chartData, active] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getRecentRides(),
        dashboardService.getPendingDocs(),
        driversService.getAll(),
        passengersService.getAll(),
        financeService.getStats(),
        financeService.getChart('weekly'),
        ridesService.getActive(),
      ])
      if (s.value)   setStats(s.value)
      if (r.value && Array.isArray(r.value)) setRides(r.value)
      if (d.value && Array.isArray(d.value)) setDocs(d.value)
      if (drv.value) { const list = Array.isArray(drv.value)?drv.value:(drv.value?.items??[]); setDrivers(list) }
      if (pax.value) { const list = Array.isArray(pax.value)?pax.value:(pax.value?.items??[]); setPassengers(list) }
      if (rev.value) setRevenue(rev.value)
      if (chartData.value?.points) {
        const pts = chartData.value.points.slice(-14)
        const grouped = {}
        pts.forEach(p => {
          const d = new Date(p.at).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})
          if (!grouped[d]) grouped[d] = {date:d, revenue:0, rides:0}
          if (p.type==='PAYMENT') grouped[d].revenue += Math.abs(p.amount||0)
          grouped[d].rides++
        })
        setChart(Object.values(grouped).slice(-7))
      }
      if (active.value && Array.isArray(active.value)) setActiveRides(active.value)
    } catch {}
  }, [])

  useRealtimeSync(load, { interval: 20000, topics: ['dashboard','ride','document','panic'] })

  const pendingDocs   = docs.filter(d=>d.status==='PENDING')
  const activeDrivers = drivers.filter(d=>d.accountStatus==='ACTIVE').length
  const inactiveDrivers = drivers.length - activeDrivers
  const totalPassengers = passengers.length
  const activePassengers = passengers.filter(p=>p.accountStatus==='ACTIVE').length

  const dailyRevenue = revenue.paymentAmount != null ? (revenue.paymentAmount/30).toFixed(0) : stats.revenue ? (stats.revenue/30).toFixed(0) : '—'
  const totalRevenue = revenue.paymentAmount != null ? revenue.paymentAmount.toLocaleString('fr-FR',{minimumFractionDigits:0}) : '—'

  const driverDonut = [
    {name:'Actifs',    value: activeDrivers||1},
    {name:'Inactifs',  value: inactiveDrivers||0},
    {name:'En attente',value: (stats.pendingDrivers||0)},
  ]
  const driverColors = ['#10B981','#B0C4E8','#F59E0B']

  return (
    <div className="fade-in">
      <TopBar title="Vue d'ensemble"/>
      <div style={{padding:'24px 28px'}}>

        {/* KPI Row */}
        <div className="stagger" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          <StatCard label="Chauffeurs actifs"  value={activeDrivers||stats.activeDrivers} sub={`${drivers.length||stats.totalDrivers||0} inscrits au total`} trend="+12%" color="#2B5FF5"
            iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" delay={0}/>
          <StatCard label="Passagers inscrits" value={(totalPassengers||stats.totalPassengers||'—')} sub={`${activePassengers} actifs ce mois`} trend="+8%" color="#10B981"
            iconPath="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" delay={60}/>
          <StatCard label="Courses actives"    value={activeRides.length||stats.activeRides||0} sub={`${stats.totalRides||0} au total`} trend="+5.4%" color="#F59E0B"
            iconPath="M8 7h12m0 0l-4-4m4 4l-4 4m0 5H4m0 0l4 4m-4-4l4-4" delay={120}/>
          <StatCard label="Revenu total"        value={`€${totalRevenue}`} sub={`€${dailyRevenue}/jour en moy.`} trend="+18%" color="#8B5CF6"
            iconPath="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" delay={180}/>
        </div>

        {/* Row 2: Charts */}
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:24}}>

          {/* Revenue chart */}
          <div className="card fade-up" style={{padding:'22px',animationDelay:'200ms'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>Revenus & Courses</div>
                <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>7 derniers jours</div>
              </div>
              <span className="badge badge-blue">Cette semaine</span>
            </div>
            {chart.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chart} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <defs>
                    <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2B5FF5" stopOpacity={0.18}/>
                      <stop offset="95%" stopColor="#2B5FF5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradRid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{fontSize:10,fill:'#7A9CC9'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:'#7A9CC9'}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT} formatter={(v,n)=>[n==='revenue'?`€${v.toFixed(2)}`:v, n==='revenue'?'Revenus':'Courses']}/>
                  <Area type="monotone" dataKey="revenue" stroke="#2B5FF5" strokeWidth={2.5} fill="url(#gradRev)" dot={false}/>
                  <Area type="monotone" dataKey="rides"   stroke="#10B981" strokeWidth={2}   fill="url(#gradRid)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{height:180,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{textAlign:'center',color:'var(--text4)',fontSize:13}}>Données insuffisantes</div>
              </div>
            )}
            {chart.length === 0 && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginTop:12}}>
                {Array.from({length:7}).map((_,i)=>(
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <div className="skeleton" style={{width:'100%',height:Math.random()*60+20,borderRadius:6}}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drivers donut */}
          <div className="card fade-up" style={{padding:'22px',animationDelay:'260ms'}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Répartition Chauffeurs</div>
            <div style={{fontSize:12,color:'var(--text3)',marginBottom:16}}>{drivers.length||stats.totalDrivers||0} inscrits</div>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <DonutChart data={driverDonut} colors={driverColors}/>
              <div style={{flex:1}}>
                {[
                  {label:'Actifs',     value:activeDrivers,           color:'#10B981'},
                  {label:'Inactifs',   value:inactiveDrivers,         color:'#B0C4E8'},
                  {label:'En attente', value:stats.pendingDrivers||0,  color:'#F59E0B'},
                ].map(({label,value,color})=>(
                  <div key={label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <div style={{display:'flex',alignItems:'center',gap:7}}>
                      <div style={{width:8,height:8,borderRadius:2,background:color,flexShrink:0}}/>
                      <span style={{fontSize:12,color:'var(--text2)'}}>{label}</span>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{value}</span>
                  </div>
                ))}
                <div style={{marginTop:12,padding:'8px 10px',background:'var(--blue-ll)',borderRadius:8,border:'1px solid var(--border)'}}>
                  <div style={{fontSize:11,color:'var(--text3)'}}>Taux d'activation</div>
                  <div style={{fontSize:16,fontWeight:800,color:'var(--blue)'}}>
                    {drivers.length ? Math.round((activeDrivers/drivers.length)*100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Courses actives + Documents */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>

          {/* Courses en cours */}
          <div className="card fade-up" style={{padding:22,animationDelay:'300ms'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <div style={{fontWeight:700,fontSize:15}}>Courses en direct</div>
                <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{activeRides.length} course{activeRides.length!==1?'s':''} active{activeRides.length!==1?'s':''}</div>
              </div>
              {activeRides.length > 0 && <span className="badge badge-pulse">LIVE</span>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {activeRides.slice(0,4).map(ride=>(
                <div key={ride.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',background:'var(--surface2)',borderRadius:10,border:'1px solid var(--border)'}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'var(--blue-l)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="16" height="16" fill="none" stroke="#2B5FF5" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 5H4m0 0l4 4m-4-4l4-4"/></svg>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600}}>{ride.driver?.name||'Chauffeur'} → {ride.passenger?.name||'Passager'}</div>
                    <div style={{fontSize:11,color:'var(--text3)'}}>{ride.vehicleType} • {ride.originAddress?.split(',')[0]||'—'}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <StatusBadge status={ride.status}/>
                    <div style={{fontSize:11,fontWeight:700,color:'var(--blue)',marginTop:3}}>€{(ride.price||0).toFixed(2)}</div>
                  </div>
                </div>
              ))}
              {activeRides.length === 0 && (
                <div style={{textAlign:'center',color:'var(--text4)',padding:'24px 0',fontSize:13}}>
                  Aucune course en cours actuellement
                </div>
              )}
            </div>
          </div>

          {/* Documents en attente */}
          <div className="card fade-up" style={{padding:22,animationDelay:'360ms'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <div style={{fontWeight:700,fontSize:15}}>Documents en attente</div>
                <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{pendingDocs.length} à examiner</div>
              </div>
              {pendingDocs.length > 0 && (
                <span className="badge badge-orange">{pendingDocs.length} en attente</span>
              )}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {pendingDocs.slice(0,4).map(doc=>(
                <div key={doc.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',background:'var(--surface2)',borderRadius:10,border:'1px solid var(--border)'}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'rgba(245,158,11,0.10)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="16" height="16" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.type?.replace(/_/g,' ')||'Document'}</div>
                    <div style={{fontSize:11,color:'var(--text3)'}}>{doc.driverName||doc.uploaderName||'—'}</div>
                  </div>
                  <StatusBadge status={doc.status}/>
                </div>
              ))}
              {pendingDocs.length === 0 && (
                <div style={{textAlign:'center',color:'var(--text4)',padding:'24px 0',fontSize:13}}>
                  Aucun document en attente
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 4: Recent rides table */}
        <div className="card fade-up" style={{animationDelay:'400ms'}}>
          <div style={{padding:'18px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1.5px solid var(--border)'}}>
            <div>
              <div style={{fontWeight:700,fontSize:15}}>Courses récentes</div>
              <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{rides.length} courses chargées</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-ghost btn-sm">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filtrer
              </button>
              <button className="btn btn-ghost btn-sm">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Exporter
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>ID</th><th>Date</th><th>Chauffeur</th><th>Passager</th><th>Type</th><th>Statut</th><th>Montant</th></tr>
            </thead>
            <tbody>
              {rides.slice(0,8).map(r => (
                <tr key={r.id}>
                  <td style={{color:'var(--blue)',fontWeight:700,fontSize:12,fontFamily:'monospace'}}>#{r.id?.slice(-6)?.toUpperCase()}</td>
                  <td style={{color:'var(--text2)',fontSize:12}}>{r.requestedAt ? new Date(r.requestedAt).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : r.date||'—'}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <Avatar name={r.driver?.name||r.driverName||'?'} size={28}/>
                      <span style={{fontSize:13,fontWeight:500}}>{r.driver?.name||r.driverName||<span style={{color:'var(--text4)',fontStyle:'italic'}}>Recherche...</span>}</span>
                    </div>
                  </td>
                  <td style={{fontSize:13}}>{r.passenger?.name||r.passengerName||'—'}</td>
                  <td><span style={{fontSize:11,fontWeight:600,color:'var(--text2)',background:'var(--surface2)',padding:'2px 8px',borderRadius:20,border:'1px solid var(--border)'}}>{r.vehicleType||'MOTO'}</span></td>
                  <td><StatusBadge status={r.status}/></td>
                  <td style={{fontWeight:700,color:r.price>0?'var(--text)':'var(--text4)'}}>{r.price>0?`€${r.price.toFixed(2)}`:'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rides.length === 0 && <EmptyState message="Aucune course trouvée"/>}
        </div>

      </div>
    </div>
  )
}
