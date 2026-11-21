import { useState } from 'react'
import { useMyGroups } from '../api/hooks'
import { ButtonLink } from '../components/Button'
import { GroupList } from '../components/GroupRow'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, LoadingRows } from '../components/States'

export function MyGroupsPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading, error } = useMyGroups(page)

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl font-bold">My groups</h1>
      <p className="mt-1 text-ink-soft">Groups you started or joined, most recent first.</p>

      <div className="mt-6">
        {isLoading ? (
          <LoadingRows />
        ) : error ? (
          <ErrorState error={error} />
        ) : !data || data.content.length === 0 ? (
          <EmptyState title="You're not in any group yet" action={<ButtonLink to="/groups">Find a group</ButtonLink>}>
            Join a group for the brand you want to buy, or start one for your city.
          </EmptyState>
        ) : (
          <>
            <GroupList groups={data.content} />
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
