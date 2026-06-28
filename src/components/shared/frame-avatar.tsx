'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface FrameAvatarProps {
  src: string | null
  fallback: string
  frameColor?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  ring?: boolean
}

const sizeMap = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-28 w-28',
}

const borderMap = {
  sm: 'p-[2px]',
  md: 'p-[3px]',
  lg: 'p-[3px]',
  xl: 'p-[4px]',
}

export function FrameAvatar({ src, fallback, frameColor, size = 'md', className, ring }: FrameAvatarProps) {
  if (frameColor) {
    return (
      <div className={cn('relative inline-block', className)}>
        {/* Glow halo detrás */}
        <div
          className="pointer-events-none absolute -inset-1 rounded-full blur-md"
          style={{ backgroundColor: frameColor, opacity: 0.45 }}
        />
        {/* Marco conic rotatorio */}
        <div
          className={cn('relative rounded-full', borderMap[size])}
          style={{
            background: `conic-gradient(from 0deg, ${frameColor}, ${frameColor}55, #ffffff, ${frameColor}, ${frameColor}88, ${frameColor})`,
            animation: 'spin 6s linear infinite',
            boxShadow: `0 0 14px ${frameColor}, 0 0 28px ${frameColor}66, inset 0 0 4px ${frameColor}`,
          }}
        >
          <Avatar className={cn(sizeMap[size], 'relative border-2 border-background/90 rounded-full')}>
            <AvatarImage src={src || undefined} alt={fallback} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {fallback.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(sizeMap[size], 'border-2 border-border/60', ring && 'ring-2 ring-primary ring-offset-2 ring-offset-background')}>
        <AvatarImage src={src || undefined} alt={fallback} />
        <AvatarFallback className="bg-primary/20 text-primary font-bold">
          {fallback.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
