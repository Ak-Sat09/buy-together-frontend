import { useMembers } from '../../api/hooks'
import { ErrorState } from '../../components/States'
import { formatDay } from '../../lib/format'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function MembersList({ groupId }: { groupId: string }) {
  const { data, isLoading, error } = useMembers(groupId, true)

  return (
    <section aria-labelledby="members-title" className="rounded-lg bg-surface ring-1 ring-line">
      <h2 id="members-title" className="border-b border-line px-5 py-4 font-display text-2xl font-bold">
        Members
      </h2>
      {isLoading ? <p className="px-5 py-4 text-ink-soft">Loading members</p> : null}
      {error ? (
        <div className="p-4">
          <ErrorState error={error} />
        </div>
      ) : null}
      <ul className="divide-y divide-line">
        {data?.content.map((member) => (
          <li key={member.userId} className="flex items-center gap-3 px-5 py-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-paper font-display text-base font-bold ring-1 ring-line">
              {initials(member.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{member.name}</p>
              <p className="text-sm text-muted">
                {member.role === 'CREATOR' ? 'Started the group' : `Joined ${formatDay(member.joinedAt)}`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
