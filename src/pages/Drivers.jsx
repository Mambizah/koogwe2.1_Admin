import { useState, useCallback } from 'react'
import { SearchBar, Avatar, EmptyState, StatusBadge } from '../components/UI'
import { driversService } from '../services/api'
import { useRealtimeSync } from '../hooks/useRealtimeSync'

export default function Drivers() {
  const [drivers,  setDrivers]  = useState([])
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [saving,   setSaving]   = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await driversService.getAll()
      // ✅ FIX: backend retourne { items, total } ou un tableau direct
      const list = Array.isArray(res) ? res : (res?.items ?? [])
      setDrivers(list)
      if (list.length > 0 && !selected) setSelected(list[0])
    } catch {}
  }, [])

  useRealtimeSync(load, { interval: 20000, topics: ['driver', 'drivers', 'account'] })

  const filtered = drivers.filter(d =>
    !search ||
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalDrivers   = drivers.length
  const activeDrivers  = drivers.filter(d => d.accountStatus === 'ACTIVE').length
  const pendingDrivers = drivers.filter(d => d.accountStatus === 'ADMIN_REVIEW_PENDING').length
  const avgRating = drivers.length
    ? (drivers.reduce((s, d) => s + (d.rating || 0), 0) / drivers.length).toFixed(1)
    : '0.0'

  const handleSuspendToggle = async (driver) => {
    setSaving(true)
    try {
      if (driver.accountStatus === 'SUSPENDED') {
        await driversService.activate(driver.id)
        updateDriver(driver.id, 'ACTIVE')
      } else {
        await driversService.suspend(driver.id)
        updateDriver(driver.id, 'SUSPENDED')
      }
    } catch (e) { alert('Erreur: ' + (e?.response?.data?.message || e.message)) }
    setSaving(false)
  }

  // ✅ FIX: approuver manuellement un chauffeur
  const handleApprove = async (driver) => {
    setSaving(true)
    try {
      await driversService.approve(driver.id)
      updateDriver(driver.id, 'ACTIVE')
      alert('✅ Chauffeur activé avec succès !')
    } catch (e) { alert('Erreur: ' + (e?.response?.data?.message || e.message)) }
    setSaving(false)
  }

  const updateDriver = (id, newStatus) => {
    setDrivers(p => p.map(d => d.id === id ? { ...d, accountStatus: newStatus } : d))
    setSelected(prev => prev?.id === id ? { ...prev, accountStatus: newStatus } : prev)
  }

  const statusDot = s => {
    if (s === 'ACTIVE')    return <span className="dot dot-green"/>
    if (s === 'SUSPENDED') return <span className="dot dot-red"/>
    return <span className="dot dot-orange"/>
  }
  const statusLabel = s =>
    s === 'ACTIVE' ? 'Actif' :
    s === 'SUSPENDED' ? 'Suspendu' :
    s === 'ADMIN_REVIEW_PENDING' ? 'En attente approbation' :
    s === 'DOCUMENTS_PENDING' ? 'Documents en attente' : (s || '—')

  return (
    <div style={{ display:'flex', height:'100vh', flexDirection:'column' }}>
      <div style={{ padding:'22px 28px 18px' }}>
        <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Gestion des Chauffeurs</h1>
        <p style={{ fontSize:13, color:'var(--text2)' }}>Gérez et suivez les chauffeurs en temps réel.</p>
      </div>

      {/* Stats */}
      <div style={{ padding:'0 28px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {[
            { label:'TOTAL', value:totalDrivers, color:'var(--blue)' },
            { label:'ACTIFS', value:activeDrivers, color:'var(--green)' },
            { label:'EN ATTENTE', value:pendingDrivers, color:'var(--orange)' },
            { label:'NOTE MOY.', value:`${avgRating}/5`, color:'var(--purple)' },
          ].map((s,i) => (
            <div key={i} className="card" style={{ padding:'16px 18px' }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--text3)', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden', padding:'0 28px 24px', gap:16 }}>
        {/* Liste chauffeurs */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ marginBottom:16 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par nom ou email..."/>
          </div>
          <div className="table-wrap" style={{ overflow:'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Chauffeur</th>
                  <th>Véhicule</th>
                  <th>Documents</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id} onClick={() => setSelected(d)}
                    style={{ cursor:'pointer', background: selected?.id === d.id ? 'var(--blue-ll)' : '' }}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Avatar name={d.name} size={36}/>
                        <div>
                          <div style={{ fontWeight:600, fontSize:13 }}>{d.name || 'Sans nom'}</div>
                          <div style={{ fontSize:11, color:'var(--text3)' }}>{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:12, color:'var(--text2)' }}>
                      {d.vehicleMake ? `${d.vehicleMake} ${d.vehicleModel||''} ${d.vehicleYear||''}`.trim() : '—'}
                    </td>
                    <td>
                      {d.documentsSummary && (
                        <span style={{ fontSize:11, color:'var(--text3)' }}>
                          ✅{d.documentsSummary.approved} ⏳{d.documentsSummary.pending} ❌{d.documentsSummary.rejected}
                        </span>
                      )}
                    </td>
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
            {filtered.length === 0 && <EmptyState message="Aucun chauffeur trouvé"/>}
          </div>
        </div>

        {/* Panneau détail */}
        {selected && (
          <div className="card" style={{ width:340, flexShrink:0, overflow:'auto', display:'flex', flexDirection:'column' }}>
            <div style={{ textAlign:'center', padding:'18px 18px 12px' }}>
              <Avatar name={selected.name} size={70}/>
              <div style={{ fontWeight:800, fontSize:17, marginTop:10 }}>{selected.name || 'Sans nom'}</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>{selected.email}</div>
              <div style={{ marginTop:8 }}><StatusBadge status={selected.accountStatus}/></div>
            </div>

            {selected.vehicleMake && (
              <div style={{ padding:'0 16px 12px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', marginBottom:8 }}>VÉHICULE</div>
                <div style={{ background:'var(--surface2)', padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:13 }}>
                  <div>{selected.vehicleMake} {selected.vehicleModel} ({selected.vehicleYear})</div>
                  <div style={{ color:'var(--text3)', fontSize:12 }}>
                    Plaque: {selected.licensePlate||'—'} • {selected.vehicleColor}
                  </div>
                </div>
              </div>
            )}

            {selected.documentsSummary && (
              <div style={{ padding:'0 16px 12px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', marginBottom:8 }}>DOCUMENTS</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {[
                    { label:'Approuvés', value:selected.documentsSummary.approved, color:'var(--green)' },
                    { label:'En attente', value:selected.documentsSummary.pending, color:'var(--orange)' },
                    { label:'Rejetés', value:selected.documentsSummary.rejected, color:'var(--red)' },
                  ].map((s,i) => (
                    <div key={i} style={{ background:'var(--surface2)', padding:'8px', borderRadius:8, textAlign:'center', border:'1px solid var(--border)' }}>
                      <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:10, color:'var(--text3)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ padding:'12px 16px', marginTop:'auto', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:8 }}>
              {/* ✅ Bouton approuver si le chauffeur attend validation */}
              {(selected.accountStatus === 'ADMIN_REVIEW_PENDING') && (
                <button
                  className="btn btn-success btn-full"
                  onClick={() => handleApprove(selected)}
                  disabled={saving}
                  style={{ fontSize:13 }}
                >
                  ✅ Approuver & Activer le compte
                </button>
              )}
              <button
                className="btn btn-danger btn-full"
                onClick={() => handleSuspendToggle(selected)}
                disabled={saving}
                style={{ fontSize:13 }}
              >
                {selected.accountStatus === 'SUSPENDED' ? '✅ Réactiver le compte' : '🚫 Suspendre le compte'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}