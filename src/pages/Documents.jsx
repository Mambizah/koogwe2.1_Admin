// src/pages/Documents.jsx
import { useState, useEffect } from 'react'
import { Check, X, Eye, RefreshCw } from 'lucide-react'
import { Modal, StatusBadge, PageHeader, SearchBar, EmptyState, Loading } from '../components/UI'
import { DOC_LABELS } from '../constants/documentTypes'
import { documentsService } from '../services/api'
import { useRealtimeSync } from '../hooks/useRealtimeSync'

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await documentsService.getAll()
      setDocs(Array.isArray(data) ? data : [])
    } catch {
      setDocs([])
    }
    setLoading(false)
  }

  useRealtimeSync(load, { interval: 15000, topics: ['document', 'documents', 'kyc'] })

  const filtered = docs.filter(d => {
    const matchFilter = filter === 'ALL' || d.status === filter
    const matchSearch = !search || d.driverName?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const approve = async (id) => {
    setActionLoading(true)
    try { await documentsService.approve(id) } catch {}
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'APPROVED' } : d))
    setSelected(null)
    setActionLoading(false)
  }

  const reject = async (id) => {
    if (!reason.trim()) { alert('Entrez une raison de rejet'); return }
    setActionLoading(true)
    try { await documentsService.reject(id, reason) } catch {}
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'REJECTED' } : d))
    setSelected(null)
    setReason('')
    setActionLoading(false)
  }

  const pendingCount = docs.filter(d => d.status === 'PENDING').length

  return (
    <div className="fade-in">
      <PageHeader title="Documents" subtitle={`${pendingCount} en attente de vérification`}>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} /> Rafraîchir</button>
      </PageHeader>

      {/* Filtres + Search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un chauffeur..." />
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}>
              {f === 'ALL' ? 'Tous' : f === 'PENDING' ? `En attente (${pendingCount})` : f === 'APPROVED' ? 'Approuvés' : 'Rejetés'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loading /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Chauffeur</th>
                <th>Type de document</th>
                <th>Statut</th>
                <th>Date upload</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 500 }}>{doc.driverName}</td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: 5, fontSize: 11, background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                      {DOC_LABELS[doc.type] || doc.type}
                    </span>
                  </td>
                  <td><StatusBadge status={doc.status} /></td>
                  <td style={{ color: 'var(--text2)' }}>{doc.uploadedAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(doc); setReason('') }}>
                        <Eye size={13} /> Voir
                      </button>
                      {doc.status === 'PENDING' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => approve(doc.id)}><Check size={13} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => { setSelected(doc); setReason('') }}><X size={13} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState message="Aucun document trouvé" />}
        </div>
      )}

      {/* Modal document */}
      {selected && (
        <Modal
          title={DOC_LABELS[selected.type] || selected.type}
          subtitle={`Chauffeur : ${selected.driverName} • Uploadé le ${selected.uploadedAt}`}
          onClose={() => setSelected(null)}
          footer={selected.status === 'PENDING' ? (
            <>
              <button className="btn btn-success" style={{ flex: 1 }} onClick={() => approve(selected.id)} disabled={actionLoading}>
                <Check size={15} /> Approuver
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => reject(selected.id)} disabled={actionLoading}>
                <X size={15} /> Rejeter
              </button>
            </>
          ) : null}
        >
          <img
            src={selected.url}
            alt="document"
            style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', maxHeight: 280, objectFit: 'cover', marginBottom: 16 }}
          />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <StatusBadge status={selected.status} />
            <span style={{ padding: '2px 10px', borderRadius: 5, fontSize: 11, background: 'var(--surface2)', color: 'var(--text2)' }}>
              {DOC_LABELS[selected.type]}
            </span>
          </div>

          {selected.status === 'PENDING' && (
            <div className="field">
              <label className="label">Raison de rejet (si rejet)</label>
              <textarea
                className="textarea"
                rows={2}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Document illisible, expiré, mauvaise qualité..."
              />
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}