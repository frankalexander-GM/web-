'use client'

/**
 * Vista: Chat Mundial
 * ===================
 * Componente UI delgado que consume el hook useChat.
 * Toda la lógica de conexión/transporte vive en src/lib/services/chat-client.ts
 * y src/hooks/use-chat.ts (separación en capas).
 */
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Users, Wifi, WifiOff } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useChat } from '@/hooks/use-chat'
import { timeAgo } from '@/lib/format'
import { SectionHeading } from '@/components/shared/badges'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function ChatView() {
  const currentUser = useAppStore((s) => s.currentUser)
  const {
    messages,
    onlineCount,
    typingUsers,
    connected,
    joined,
    loading,
    send,
    setTyping,
  } = useChat(currentUser?.displayName)

  const [input, setInput] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al final
  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || !connected || !joined) return
    send(text)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const myName = currentUser?.displayName
  const placeholder = !connected ? 'Conectando...' : !joined ? 'Uniéndose...' : 'Escribe un mensaje...'

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <SectionHeading
        title="Chat Mundial"
        subtitle="Conecta con streamers y gamers en tiempo real · Backend en Python"
        icon={MessageCircle}
        action={
          <Badge className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {onlineCount} en línea
          </Badge>
        }
      />

      <Card className="glass-card relative flex h-[calc(100vh-320px)] min-h-[400px] flex-col overflow-hidden rounded-2xl border-border/50 p-0">
        <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-pink-600/20 blur-3xl" />

        {/* Barra de estado */}
        <div className="relative flex items-center justify-between border-b border-border/50 bg-card/30 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs">
            {connected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-medium text-emerald-300">Conectado</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400 live-dot" />
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-medium text-amber-300">Reconectando...</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{onlineCount} usuarios</span>
          </div>
        </div>

        {/* Mensajes */}
        <div ref={containerRef} className="scrollbar-neon relative flex-1 space-y-2.5 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <MessageCircle className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm font-medium">No hay mensajes aún</p>
              <p className="mt-1 text-xs">¡Sé el primero en escribir!</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                if (msg.type === 'system') {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-center py-1"
                    >
                      <span className="rounded-full border border-border/40 bg-muted/30 px-3 py-1 text-center text-[11px] italic text-muted-foreground">
                        {msg.content} · {timeAgo(msg.timestamp)}
                      </span>
                    </motion.div>
                  )
                }
                const isOwn = myName === msg.username
                const avatar = msg.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(msg.username)}`
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={`flex items-start gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <img src={avatar} alt={msg.username} className="mt-0.5 h-8 w-8 shrink-0 rounded-full border border-border/50 bg-card object-cover" loading="lazy" />
                    <div className={`flex max-w-[78%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-1.5 text-[11px] ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <span className="font-semibold" style={{ color: msg.color || '#a855f7' }}>{msg.username}</span>
                        <span className="text-muted-foreground">{timeAgo(msg.timestamp)}</span>
                        {msg.pending && <span className="italic text-muted-foreground">· enviando...</span>}
                      </div>
                      <div className={`mt-1 rounded-2xl px-3 py-1.5 text-sm leading-snug ${isOwn ? 'rounded-tr-sm bg-primary/15 text-foreground' : 'rounded-tl-sm bg-card/60 text-foreground'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Indicador de escritura */}
        <div className="relative flex min-h-[26px] items-center px-4">
          <AnimatePresence mode="wait">
            {typingUsers.length > 0 && (
              <motion.div
                key={typingUsers.join(',')}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400" />
                </span>
                <span>
                  {typingUsers.length === 1
                    ? `${typingUsers[0]} está escribiendo...`
                    : typingUsers.length <= 3
                      ? `${typingUsers.join(', ')} están escribiendo...`
                      : `${typingUsers.length} personas están escribiendo...`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="relative border-t border-border/50 bg-card/30 p-3">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => { setInput(e.target.value); if (e.target.value.trim()) setTyping() }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={!connected || !joined}
              maxLength={500}
              className="border-border/60 bg-card/60"
            />
            <Button
              onClick={handleSend}
              disabled={!connected || !joined || !input.trim()}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md transition-all hover:opacity-90 hover:glow-purple disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </div>
          <p className="mt-1.5 px-1 text-right text-[10px] text-muted-foreground">{input.length}/500</p>
        </div>
      </Card>
    </div>
  )
}
