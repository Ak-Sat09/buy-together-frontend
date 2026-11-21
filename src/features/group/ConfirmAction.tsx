import { useState, type ReactNode } from 'react'
import { Button } from '../../components/Button'

interface ConfirmActionProps {
  label: string
  question: ReactNode
  confirmLabel: string
  variant?: 'primary' | 'secondary' | 'danger'
  busy?: boolean
  onConfirm: () => void
}

/** Two-step button for actions that are hard to undo: the first click asks, the second does it. */
export function ConfirmAction({ label, question, confirmLabel, variant = 'secondary', busy, onConfirm }: ConfirmActionProps) {
  const [asking, setAsking] = useState(false)

  if (!asking) {
    return (
      <Button variant={variant} className="w-full" onClick={() => setAsking(true)}>
        {label}
      </Button>
    )
  }

  return (
    <div className="rounded-md bg-paper p-4 ring-1 ring-line">
      <p className="text-[15px] leading-relaxed">{question}</p>
      <div className="mt-3 flex gap-2">
        <Button variant={variant === 'secondary' ? 'primary' : variant} busy={busy} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="quiet" onClick={() => setAsking(false)} disabled={busy}>
          Not now
        </Button>
      </div>
    </div>
  )
}
