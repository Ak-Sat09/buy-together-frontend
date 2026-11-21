import clsx from 'clsx'
import type { GroupStatus } from '../lib/types'

const styles: Record<GroupStatus, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-go-wash text-go' },
  FULL: { label: 'Full', className: 'bg-lane-wash text-[#7a5a00]' },
  COMPLETED: { label: 'Deal done', className: 'bg-ink text-white' },
  CLOSED: { label: 'Cancelled', className: 'bg-ink/8 text-ink-soft' },
  EXPIRED: { label: 'Expired', className: 'bg-ink/8 text-ink-soft' },
}

export function StatusBadge({ status, className }: { status: GroupStatus; className?: string }) {
  const { label, className: tone } = styles[status]
  return (
    <span className={clsx('inline-flex h-6 items-center rounded-full px-2.5 text-[13px] font-semibold', tone, className)}>
      {label}
    </span>
  )
}

export function statusLabel(status: GroupStatus) {
  return styles[status].label
}
