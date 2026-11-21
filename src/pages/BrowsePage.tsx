import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { useGroups } from '../api/hooks'
import { BrandSelect, useBrandName } from '../components/BrandSelect'
import { Button, ButtonLink } from '../components/Button'
import { Field, Input, Select } from '../components/Form'
import { GroupList } from '../components/GroupRow'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, LoadingRows } from '../components/States'
import { query } from '../lib/api'
import type { GroupStatus } from '../lib/types'

const STATUSES: GroupStatus[] = ['OPEN', 'FULL', 'COMPLETED']
const STATUS_TEXT: Partial<Record<GroupStatus, string>> = { OPEN: 'Open', FULL: 'Full', COMPLETED: 'Completed' }

export function BrowsePage() {
  const [params, setParams] = useSearchParams()
  const brand = params.get('brand') ?? ''
  const city = params.get('city') ?? ''
  const status = (params.get('status') as GroupStatus | null) ?? 'OPEN'
  const page = Number(params.get('page') ?? 0)

  const [cityDraft, setCityDraft] = useState(city)
  useEffect(() => setCityDraft(city), [city])

  const { data, isLoading, isFetching, error } = useGroups({ brand: brand || undefined, city: city || undefined, status, page })
  const brandName = useBrandName(brand)

  function update(next: Record<string, string | number | undefined>) {
    const merged = { brand, city, status: status === 'OPEN' ? undefined : status, ...next }
    setParams(new URLSearchParams(query(merged)))
  }

  function submitCity(event: FormEvent) {
    event.preventDefault()
    update({ city: cityDraft.trim(), page: undefined })
  }

  const statusText = STATUS_TEXT[status] ?? 'Open'

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Browse groups</h1>
          <p className="mt-1 text-ink-soft">
            {statusText} groups for {brandName || 'all brands'}
            {city ? ` in ${city}` : ''}
          </p>
        </div>
        <ButtonLink to={`/groups/new${query({ brand, city })}`}>Start a group</ButtonLink>
      </div>

      <form
        onSubmit={submitCity}
        className="mt-6 grid gap-4 rounded-lg bg-surface p-4 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-[1fr_1fr_12rem_auto] lg:items-end"
      >
        <Field label="Brand" htmlFor="filter-brand">
          <BrandSelect
            id="filter-brand"
            placeholder="All brands"
            value={brand}
            onChange={(e) => update({ brand: e.target.value, page: undefined })}
          />
        </Field>
        <Field label="City" htmlFor="filter-city">
          <Input
            id="filter-city"
            placeholder="Any city"
            value={cityDraft}
            onChange={(e) => setCityDraft(e.target.value)}
            onBlur={() => cityDraft.trim() !== city && update({ city: cityDraft.trim(), page: undefined })}
          />
        </Field>
        <Field label="Status" htmlFor="filter-status">
          <Select
            id="filter-status"
            value={status}
            onChange={(e) => update({ status: e.target.value === 'OPEN' ? undefined : e.target.value, page: undefined })}
          >
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_TEXT[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" variant="secondary" className="h-11">
          Search
        </Button>
      </form>

      <div className={isFetching && !isLoading ? 'mt-6 opacity-60 transition-opacity' : 'mt-6'}>
        {isLoading ? (
          <LoadingRows />
        ) : error ? (
          <ErrorState error={error} />
        ) : !data || data.content.length === 0 ? (
          <EmptyState
            title={`No ${statusText.toLowerCase()} groups found`}
            action={
              status === 'OPEN' ? <ButtonLink to={`/groups/new${query({ brand, city })}`}>Start a group</ButtonLink> : null
            }
          >
            {status === 'OPEN'
              ? 'Nobody has started a group for this yet. Start one and others buying the same brand can join you.'
              : 'Try a different brand or city.'}
          </EmptyState>
        ) : (
          <>
            <GroupList groups={data.content} />
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(next) => update({ page: next || undefined })} />
          </>
        )}
      </div>
    </div>
  )
}
