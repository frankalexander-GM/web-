'use client'

/**
 * Hook: useChat
 * =============
 * Capa intermedia entre la UI y el servicio ChatClient.
 * Gestiona el estado React (mensajes, conexión, usuarios en línea, typing)
 * y expone acciones limpias al componente de vista.
 *
 * El componente solo hace:
 *   const { messages, onlineCount, connected, send, setTyping } = useChat(username)
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatClient, type ChatMessage } from '@/lib/services/chat-client'

const TYPING_STOP_DELAY = 2500

export function useChat(username: string | null | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({})
  const [connected, setConnected] = useState(false)
  const [joined, setJoined] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const clientRef = useRef<ChatClient | null>(null)
  const usernameRef = useRef(username)
  const hasJoinedRef = useRef(false)
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  useEffect(() => {
    usernameRef.current = username
  }, [username])

  // Inicializar cliente y suscribirse a eventos
  useEffect(() => {
    const client = new ChatClient()
    clientRef.current = client

    const offs: Array<() => void> = []

    offs.push(client.on('connect', () => {
      setConnected(true)
      const name = usernameRef.current
      if (name && !hasJoinedRef.current) {
        client.join(name)
        hasJoinedRef.current = true
      }
    }))

    offs.push(client.on('disconnect', () => {
      setConnected(false)
      setJoined(false)
      hasJoinedRef.current = false
    }))

    offs.push(client.on('connect_error', () => setConnected(false)))

    offs.push(client.on('chat:history', (history: ChatMessage[]) => {
      setMessages(Array.isArray(history) ? history : [])
      setHistoryLoaded(true)
    }))

    offs.push(client.on('chat:joined', () => setJoined(true)))

    offs.push(client.on('chat:message', (msg: ChatMessage) => {
      if (!msg?.id) return
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        const name = usernameRef.current
        if (name && msg.username === name && msg.type === 'user') {
          const idx = prev.findIndex((m) => m.pending && m.content === msg.content && m.username === msg.username)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = msg
            return next
          }
        }
        return [...prev, msg]
      })
    }))

    offs.push(client.on('chat:system', (msg: ChatMessage) => {
      if (!msg?.id) return
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
    }))

    offs.push(client.on('chat:users', (data: { count: number }) => {
      if (typeof data?.count === 'number') setOnlineCount(data.count)
    }))

    offs.push(client.on('chat:typing', (data: { username: string; isTyping: boolean }) => {
      if (!data?.username) return
      const me = usernameRef.current
      if (me && data.username === me) return
      setTypingUsers((prev) => {
        const next = { ...prev }
        if (data.isTyping) next[data.username] = Date.now()
        else delete next[data.username]
        return next
      })
    }))

    client.connect()

    // Prune typing stale cada segundo
    const prune = setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now()
        let changed = false
        const next = { ...prev }
        for (const [n, ts] of Object.entries(next)) {
          if (now - ts > 3000) {
            delete next[n]
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 1000)

    return () => {
      offs.forEach((off) => off())
      clearInterval(prune)
      client.disconnect()
      clientRef.current = null
      hasJoinedRef.current = false
    }
  }, [])

  // Re-intentar join cuando llegue el username
  useEffect(() => {
    if (username && clientRef.current?.isConnected && !hasJoinedRef.current) {
      clientRef.current.join(username)
      hasJoinedRef.current = true
    }
  }, [username])

  /** Envía un mensaje (optimista) */
  const send = useCallback((content: string) => {
    const client = clientRef.current
    const name = usernameRef.current
    if (!client || !name || !client.isConnected) return
    const text = content.trim()
    if (!text) return

    // Mensaje optimista
    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      username: name,
      content: text,
      color: '#a855f7',
      avatar: null,
      timestamp: new Date().toISOString(),
      type: 'user',
      pending: true,
    }
    setMessages((prev) => [...prev, optimistic])
    client.sendMessage(text, name)

    // Reset typing
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current)
    if (isTypingRef.current) {
      isTypingRef.current = false
      client.setTyping(name, false)
    }
  }, [])

  /** Notifica que el usuario está escribiendo (con debounce) */
  const setTyping = useCallback(() => {
    const client = clientRef.current
    const name = usernameRef.current
    if (!client || !name || !client.isConnected) return
    if (!isTypingRef.current) {
      isTypingRef.current = true
      client.setTyping(name, true)
    }
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current)
    typingStopTimer.current = setTimeout(() => {
      isTypingRef.current = false
      client.setTyping(name, false)
    }, TYPING_STOP_DELAY)
  }, [])

  return {
    messages,
    onlineCount,
    typingUsers: Object.keys(typingUsers),
    connected,
    joined,
    historyLoaded,
    send,
    setTyping,
    loading: !historyLoaded || !joined,
  }
}
