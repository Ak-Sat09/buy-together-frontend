import { useGroupAction } from '../../api/hooks'
import { useAuth } from '../../auth/AuthContext'
import { Button, ButtonLink } from '../../components/Button'
import { Notice } from '../../components/Notice'
import { query } from '../../lib/api'
import type { Group } from '../../lib/types'
import { ConfirmAction } from './ConfirmAction'

const finishedText: Partial<Record<Group['status'], string>> = {
  COMPLETED: 'Deal done. This group is now read only and will be removed 30 days after it finished.',
  CLOSED: 'The person who started this group cancelled it. It will be removed after 30 days.',
  EXPIRED: 'The buying date for this group has passed. It will be removed after 30 days.',
}

export function GroupActions({ group }: { group: Group }) {
  const { isLoggedIn } = useAuth()
  const action = useGroupAction(group.id)
  const active = group.status === 'OPEN' || group.status === 'FULL'
  const newGroupLink = `/groups/new${query({ brand: group.brand, city: group.city })}`

  const error = action.error ? <Notice tone="error">{action.error.message}</Notice> : null

  if (!active) {
    return <Notice>{finishedText[group.status]}</Notice>
  }

  if (!isLoggedIn) {
    return group.status === 'OPEN' ? (
      <div className="grid gap-3">
        <ButtonLink to={`/login${query({ next: `/groups/${group.id}` })}`} size="lg">
          Log in to join
        </ButtonLink>
        <p className="text-sm text-ink-soft">Members can see who else joined and plan the visit in the group chat.</p>
      </div>
    ) : (
      <FullGroup newGroupLink={newGroupLink} brandName={group.brandName} />
    )
  }

  if (group.createdByMe) {
    return (
      <div className="grid gap-3">
        <p className="text-[15px] text-ink-soft">You started this group.</p>
        <ConfirmAction
          label="Mark deal as done"
          variant="primary"
          question="Did your group buy the cars? The group becomes read only and is removed after 30 days."
          confirmLabel="Yes, deal done"
          busy={action.isPending && action.variables === 'complete'}
          onConfirm={() => action.mutate('complete')}
        />
        <ConfirmAction
          label="Cancel group"
          variant="danger"
          question="Cancel this group for everyone? Members can't join or chat after this."
          confirmLabel="Cancel group"
          busy={action.isPending && action.variables === 'close'}
          onConfirm={() => action.mutate('close')}
        />
        {error}
      </div>
    )
  }

  if (group.joined) {
    return (
      <div className="grid gap-3">
        <Notice tone="success">You're in this group. Use the chat below to plan the visit.</Notice>
        <ConfirmAction
          label="Leave group"
          question="Leave this group? Your seat opens up for someone else."
          confirmLabel="Leave group"
          variant="danger"
          busy={action.isPending}
          onConfirm={() => action.mutate('leave')}
        />
        {error}
      </div>
    )
  }

  if (group.status === 'FULL') {
    return <FullGroup newGroupLink={newGroupLink} brandName={group.brandName} />
  }

  return (
    <div className="grid gap-3">
      <Button size="lg" busy={action.isPending} onClick={() => action.mutate('join')}>
        Join this group
      </Button>
      <p className="text-sm text-ink-soft">You can leave any time before the visit.</p>
      {error}
    </div>
  )
}

function FullGroup({ newGroupLink, brandName }: { newGroupLink: string; brandName: string }) {
  return (
    <div className="grid gap-3">
      <p className="text-[15px] text-ink-soft">This group is full. You can start the next {brandName} group in this city.</p>
      <ButtonLink to={newGroupLink} variant="secondary">
        Start a new group
      </ButtonLink>
    </div>
  )
}
