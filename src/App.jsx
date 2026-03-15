import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import Drivers from './pages/Drivers'
import Settings from './pages/Settings'
import { Passengers, Rides, Revenue, Panics } from './pages/Pages'
import { documentsService, panicsService } from './services/api'
import { useRealtimeSync } from './hooks/useRealtimeSync'
import './index.css'

export default function App() {
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('koogwe_admin_token')
    if (!t) return null
    // Lire le vrai nom depuis le localStorage (sauvegardé au login)
    try {
      const savedUser = localStorage.getItem('koogwe_admin_user')
      if (savedUser) return JSON.parse(savedUser)
    } catch {}
    return { name: 'Administrateur', email: '' }
  })

  const handleLogin = (userData) => {
    localStorage.setItem('koogwe_admin_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('koogwe_admin_token')
    localStorage.removeItem('koogwe_admin_user')
    setUser(null)
  }

  const [badges, setBadges] = useState({ docs: 0, panics: 0 })

  const loadBadges = useCallback(async () => {
    try {
      const [docs, panics] = await Promise.all([
        documentsService.getAll('PENDING'),
        panicsService.getActive(),
      ])
      setBadges({
        docs: Array.isArray(docs) ? docs.length : 0,
        panics: Array.isArray(panics) ? panics.length : 0,
      })
    } catch {
      setBadges({ docs: 0, panics: 0 })
    }
  }, [])

  useEffect(() => {
    if (!user) return
    loadBadges()
  }, [user, loadBadges])

  useRealtimeSync(loadBadges, {
    enabled: Boolean(user),
    interval: 15000,
    topics: ['document', 'documents', 'panic', 'sos', 'alert'],
  })

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar badges={badges} user={user} onLogout={logout} />
        <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1, minHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/drivers"    element={<Drivers />} />
            <Route path="/documents"  element={<Documents />} />
            <Route path="/revenue"    element={<Revenue />} />
            <Route path="/panics"     element={<Panics />} />
            <Route path="/passengers" element={<Passengers />} />
            <Route path="/rides"      element={<Rides />} />
            <Route path="/settings"   element={<Settings />} />
            <Route path="*"           element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}