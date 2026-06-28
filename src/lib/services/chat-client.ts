/**
 * Capa de servicio: Chat WebSocket Client
 * ========================================
 * Encapsula toda la comunicación con el backend de chat en Python (FastAPI + WebSocket).
 * El componente UI solo consume el estado, sin saber nada del transporte.
 *
 * Arquitectura por capas:
 *   view (UI) -> hook -> servicio (este archivo) -> WebSocket -> Python backend
 */

export interface ChatMessage {
  id: string
  username: string
  content: string
  color: string
  avatar: string | null
  timestamp: string
  type: 'user' | 'system'
  pending?: boolean
}

export interface ChatUser {
  username: string
  color: string
  avatar: string
}

type EventListener = (payload: any) => void

interface ServerEvent {
  event: string
  data: any
}

export class ChatClient {
  private ws: WebSocket | null = null
  private listeners: Map<string, Set<EventListener>> = new Map()
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private shouldReconnect = true

  /** Construye la URL del WebSocket vía gateway Caddy (XTransformPort) */
  private buildUrl(): string {
    if (typeof window === 'undefined') return ''
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${window.location.host}/?XTransformPort=3003`
  }

  /** Conecta al servidor de chat */
  connect(): void {
    if (typeof window === 'undefined') return
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    const url = this.buildUrl()
    if (!url) return

    try {
      this.ws = new WebSocket(url)
    } catch (e) {
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.emit('connect', {})
    }

    this.ws.onmessage = (event) => {
      try {
        const payload: ServerEvent = JSON.parse(event.data)
        if (payload.event && payload.data !== undefined) {
          this.emit(payload.event, payload.data)
        }
      } catch {
        /* mensaje no JSON, ignorar */
      }
    }

    this.ws.onclose = () => {
      this.emit('disconnect', {})
      if (this.shouldReconnect) this.scheduleReconnect()
    }

    this.ws.onerror = () => {
      this.emit('connect_error', {})
    }
  }

  /** Programa un reconexión con backoff exponencial */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  /** Suscribe a un evento del servidor */
  on(event: string, listener: EventListener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(listener)
    return () => this.listeners.get(event)?.delete(listener)
  }

  private emit(event: string, payload: any): void {
    this.listeners.get(event)?.forEach((l) => {
      try {
        l(payload)
      } catch {
        /* listener con error, no romper los demás */
      }
    })
  }

  /** Envía un evento al servidor */
  private send(event: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }))
    }
  }

  /** Se une al chat con un nombre de usuario */
  join(username: string): void {
    this.send('chat:join', { username })
  }

  /** Envía un mensaje */
  sendMessage(content: string, username: string): void {
    this.send('chat:message', { content, username })
  }

  /** Notifica que está escribiendo */
  setTyping(username: string, isTyping: boolean): void {
    this.send('chat:typing', { username, isTyping })
  }

  /** Desconecta y limpia */
  disconnect(): void {
    this.shouldReconnect = false
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
    this.listeners.clear()
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
