import clsx from 'clsx'
import type { ReactNode } from 'react'

type Tone = 'info' | 'error' | 'success'

const tones: Record<Tone, string> = {
  info: 'bg-surface ring-line text-ink-soft',
  error: 'bg-stop-wash ring-stop/25 text-stop',
  success: 'bg-go-wash ring-go/25 text-go',
}

export function Notice({ tone = 'info', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={clsx('rounded-md px-4 py-3 text-[15px] leading-relaxed ring-1 ring-inset', tones[tone], className)}
    >
      {children}
    </div>
  )
}
