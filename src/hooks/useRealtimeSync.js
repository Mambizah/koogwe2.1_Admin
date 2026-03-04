import { useEffect, useMemo, useRef, useState } from 'react'
import { API_BASE } from '../services/api'

const toWsBase = (httpBase) => {
  if (!httpBase) return 'ws://localhost:3000'
  if (httpBase.startsWith('https://')) return httpBase.replace('https://', 'wss://')
  if (httpBase.startsWith('http://')) return httpBase.replace('http://', 'ws://')
  if (httpBase.startsWith('wss://') || httpBase.startsWith('ws://')) return httpBase
  return `ws://${httpBase}`
}

const DEFAULT_WS_URL = import.meta.env.VITE_WS_URL || `${toWsBase(API_BASE)}/admin/ws`

const extractTopic = (payload) =>
  payload?.topic ||
  payload?.type ||
  payload?.event ||
  payload?.resource ||
  payload?.channel ||
  '*'

const shouldRefreshForTopic = (topics, payload) => {
  if (!topics?.length || topics.includes('*')) return true
  const topic = String(extractTopic(payload)).toLowerCase()
  return topics.map(t => String(t).toLowerCase()).includes(topic)
}

export function useRealtimeSync(
  onRefresh,
  {
    interval = 15000,
    topics = ['*'],
    enabled = true,
    immediate = true,
    debounceMs = 400,
    wsUrl = DEFAULT_WS_URL,
  } = {}
) {
  const refreshRef = useRef(onRefresh)
  const wsRef = useRef(null)
  const reconnectRef = useRef(null)
  const debounceRef = useRef(null)
  const intervalRef = useRef(null)
  const destroyedRef = useRef(false)

  const [connectionStatus, setConnectionStatus] = useState('idle')
  const [lastEventAt, setLastEventAt] = useState(null)

  refreshRef.current = onRefresh

  const stableTopics = useMemo(() => topics, [JSON.stringify(topics)])

  useEffect(() => {
    if (!enabled) return
    destroyedRef.current = false

    const runRefresh = () => refreshRef.current?.()

    const scheduleRefresh = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        runRefresh()
      }, debounceMs)
    }

    const clearReconnect = () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current)
        reconnectRef.current = null
      }
    }

    const connectWs = () => {
      if (!wsUrl || destroyedRef.current) return

      try {
        if (wsRef.current) wsRef.current.close()
        setConnectionStatus('connecting')
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          if (destroyedRef.current) return
          setConnectionStatus('connected')
        }

        ws.onmessage = (event) => {
          if (destroyedRef.current) return
          try {
            const payload = JSON.parse(event.data)
            if (shouldRefreshForTopic(stableTopics, payload)) {
              setLastEventAt(Date.now())
              scheduleRefresh()
            }
          } catch {
            setLastEventAt(Date.now())
            scheduleRefresh()
          }
        }

        ws.onerror = () => {
          if (destroyedRef.current) return
          setConnectionStatus('error')
        }

        ws.onclose = () => {
          if (destroyedRef.current) return
          setConnectionStatus('disconnected')
          clearReconnect()
          reconnectRef.current = setTimeout(connectWs, 3000)
        }
      } catch {
        setConnectionStatus('error')
      }
    }

    if (immediate) runRefresh()

    intervalRef.current = setInterval(runRefresh, interval)
    connectWs()

    return () => {
      destroyedRef.current = true
      setConnectionStatus('idle')
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      clearReconnect()
      if (wsRef.current) wsRef.current.close()
    }
  }, [enabled, immediate, interval, debounceMs, wsUrl, stableTopics])

  return { connectionStatus, lastEventAt }
}

export default useRealtimeSync
