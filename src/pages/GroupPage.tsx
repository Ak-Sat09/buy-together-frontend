import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { useGroup } from '../api/hooks'
import { useAuth } from '../auth/AuthContext'
import { CityPlate } from '../components/CityPlate'
import { SeatStrip } from '../components/SeatStrip'
import { ErrorState } from '../components/States'
import { StatusBadge } from '../components/StatusBadge'
import { ChatPanel } from '../features/group/ChatPanel'
import { GroupActions } from '../features/group/GroupActions'
import { MembersList } from '../features/group/MembersList'
import { ReportForm } from '../features/group/ReportForm'
import { ApiError } from '../lib/api'
import { formatDay, formatDeadline, plural } from '../lib/format'
import { NotFoundPage } from './NotFoundPage'

export function GroupPage() {
  const { groupId = '' } = useParams()
  const { isLoggedIn } = useAuth()
  const { data: group, isLoading, error } = useGroup(groupId)

  if (error instanceof ApiError && error.status === 404) return <NotFoundPage />

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <Link to="/groups" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All groups
      </Link>

      {isLoading ? <GroupSkeleton /> : null}
      {error ? (
        <div className="mt-6">
          <ErrorState error={error} />
        </div>
      ) : null}

      {group ? (
        <>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <CityPlate city={group.city} />
                <StatusBadge status={group.status} />
              </div>
              <h1 className="mt-4 font-display text-5xl leading-[0.95] font-bold sm:text-display">
                {group.brandName}
                <span className="block text-ink-soft">{group.model}</span>
              </h1>
              <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
                <div className="flex gap-1.5">
                  <dt className="text-muted">Buying by</dt>
                  <dd className="font-semibold">{group.deadline ? formatDeadline(group.deadline) : 'No fixed date'}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-muted">Started</dt>
                  <dd className="font-semibold">{formatDay(group.createdAt)}</dd>
                </div>
              </dl>
              {group.note ? <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-ink-soft">{group.note}</p> : null}

              <div className="mt-8 rounded-lg bg-surface p-6 ring-1 ring-line">
                <p className="font-display text-3xl font-bold">
                  {group.memberCount} of {group.targetSize} buyers
                </p>
                <p className="mt-1 text-ink-soft">
                  {group.status === 'OPEN'
                    ? `${plural(group.spotsLeft, 'seat')} left before the group is full.`
                    : group.status === 'FULL'
                      ? 'The group is full. Members are planning the showroom visit.'
                      : 'This group is no longer taking members.'}
                </p>
                <SeatStrip taken={group.memberCount} total={group.targetSize} size="lg" className="mt-5" />
              </div>
            </div>

            <aside className="lg:pt-10">
              <div className="rounded-lg bg-surface p-5 ring-1 ring-line lg:sticky lg:top-6">
                <GroupActions group={group} />
              </div>
            </aside>
          </div>

          {group.joined ? (
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_22rem]">
              <ChatPanel groupId={group.id} readOnly={group.status !== 'OPEN' && group.status !== 'FULL'} />
              <MembersList groupId={group.id} />
            </div>
          ) : null}

          {isLoggedIn && !group.createdByMe ? (
            <div className="mt-10 max-w-md">
              <ReportForm groupId={group.id} />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function GroupSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading group" className="mt-6 space-y-4">
      <div className="h-6 w-40 rounded bg-ink/8" />
      <div className="h-14 w-72 rounded bg-ink/8" />
      <div className="h-32 rounded-lg bg-ink/6" />
    </div>
  )
}
