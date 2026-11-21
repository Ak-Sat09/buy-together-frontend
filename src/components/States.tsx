import type { ReactNode } from 'react'
import { ApiError } from '../lib/api'
import { Notice } from './Notice'

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-ink/25 px-6 py-12 text-center">
      <p className="font-display text-2xl font-bold">{title}</p>
      {children ? <p className="mx-auto mt-2 max-w-[46ch] text-ink-soft">{children}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="divide-y divide-line overflow-hidden rounded-lg bg-surface ring-1 ring-line">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center justify-between gap-6 px-5 py-6">
          <div className="space-y-3">
            <div className="h-5 w-44 rounded bg-ink/8" />
            <div className="h-4 w-28 rounded bg-ink/6" />
          </div>
          <div className="h-4 w-32 rounded bg-ink/6" />
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof ApiError ? error.message : 'Something went wrong. Refresh the page to try again.'
  return <Notice tone="error">{message}</Notice>
}
