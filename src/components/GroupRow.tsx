import { Link } from 'react-router'
import { formatDeadline, plural } from '../lib/format'
import type { Group } from '../lib/types'
import { CityPlate } from './CityPlate'
import { SeatStrip } from './SeatStrip'
import { StatusBadge } from './StatusBadge'

export function GroupRow({ group }: { group: Group }) {
  return (
    <li>
      <Link
        to={`/groups/${group.id}`}
        className="group grid gap-4 px-5 py-5 transition-colors hover:bg-paper sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="font-display text-2xl leading-none font-bold">
              {group.brandName} <span className="font-semibold text-ink-soft">{group.model}</span>
            </h3>
            {group.joined ? <span className="text-sm font-semibold text-go">You're in</span> : null}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-ink-soft">
            <CityPlate city={group.city} />
            {group.deadline ? <span>Buying by {formatDeadline(group.deadline)}</span> : <span>No fixed date</span>}
          </div>
          {group.note ? <p className="mt-2 line-clamp-1 max-w-[60ch] text-[15px] text-muted">{group.note}</p> : null}
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <SeatStrip taken={group.memberCount} total={group.targetSize} />
          <div className="flex items-center gap-3">
            <span className="text-sm whitespace-nowrap text-ink-soft">
              {group.status === 'OPEN' ? `${plural(group.spotsLeft, 'seat')} left` : plural(group.memberCount, 'buyer')}
            </span>
            <StatusBadge status={group.status} />
          </div>
        </div>
      </Link>
    </li>
  )
}

export function GroupList({ groups }: { groups: Group[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-lg bg-surface ring-1 ring-line">
      {groups.map((group) => (
        <GroupRow key={group.id} group={group} />
      ))}
    </ul>
  )
}
