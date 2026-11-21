import clsx from 'clsx'

interface SeatStripProps {
  taken: number
  total: number
  size?: 'sm' | 'lg'
  className?: string
}

/**
 * Group progress drawn as a row of car seats: filled seats are people who joined.
 * Reads faster than a percentage bar, and makes "3 seats left" feel concrete.
 */
// Beyond this many seats a small strip stops reading as seats, so list rows switch to a bar
const MAX_SMALL_SEATS = 15

export function SeatStrip({ taken, total, size = 'sm', className }: SeatStripProps) {
  const seats = Array.from({ length: total }, (_, index) => index < taken)
  const label = `${taken} of ${total} seats taken`

  if (size === 'sm' && total > MAX_SMALL_SEATS) {
    return (
      <div role="img" aria-label={label} className={clsx('h-4 w-40 overflow-hidden rounded-[3px] bg-surface ring-1 ring-inset ring-ink/20', className)}>
        <div className="h-full bg-lane shadow-[inset_0_-3px_0_var(--color-lane-deep)]" style={{ width: `${(taken / total) * 100}%` }} />
      </div>
    )
  }

  return (
    <div role="img" aria-label={label} className={clsx('flex', size === 'lg' ? 'flex-wrap gap-1.5' : 'gap-1', className)}>
      {seats.map((filled, index) => (
        <span
          key={index}
          className={clsx(
            'origin-bottom',
            size === 'lg' ? 'h-7 w-6 rounded-t-[9px] rounded-b-[3px]' : 'h-4 w-3.5 rounded-t-[6px] rounded-b-[2px]',
            filled ? 'bg-lane shadow-[inset_0_-3px_0_var(--color-lane-deep)]' : 'bg-surface ring-1 ring-inset ring-ink/20',
            filled && size === 'lg' && 'animate-[seat-in_400ms_ease-out_both]',
          )}
          style={filled && size === 'lg' ? { animationDelay: `${index * 35}ms` } : undefined}
        />
      ))}
    </div>
  )
}
