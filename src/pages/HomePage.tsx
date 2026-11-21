import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useGroups } from '../api/hooks'
import { BrandSelect } from '../components/BrandSelect'
import { Button, ButtonLink } from '../components/Button'
import { Field, Input } from '../components/Form'
import { GroupList } from '../components/GroupRow'
import { EmptyState, ErrorState, LoadingRows } from '../components/States'
import { query } from '../lib/api'

const steps = [
  {
    title: 'Pick your brand and city',
    body: 'See who else near you is buying the same brand this season.',
  },
  {
    title: 'Join a group, or start one',
    body: 'If a group is already open for your brand and city, you join it so everyone ends up in one big group.',
  },
  {
    title: 'Plan the visit together',
    body: 'Agree on a showroom and a date in the group chat, then walk in together and ask for a group price.',
  },
]

export function HomePage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.15fr_1fr] md:items-end md:py-20">
          <div>
            <h1 className="max-w-[15ch] font-display text-[2.75rem] leading-[0.95] font-bold tracking-tight sm:text-display">
              Ten buyers get a better price than one.
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
              Dealers give better deals when they sell more cars at once. Buy Together helps people in your city who
              want the same brand find each other, plan one showroom visit, and negotiate as a group.
            </p>
          </div>
          <GroupFinder />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold">Open right now</h2>
          <Link to="/groups" className="text-[15px] font-semibold text-ink underline decoration-lane decoration-2 underline-offset-4">
            See all groups
          </Link>
        </div>
        <LatestGroups />
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="font-display text-3xl font-bold">How it works</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t-4 border-ink pt-4">
                <span className="font-display text-xl font-bold text-ink-soft">Step {index + 1}</span>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 max-w-[40ch] leading-relaxed text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}

function GroupFinder() {
  const navigate = useNavigate()
  const [brand, setBrand] = useState('')
  const [city, setCity] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    navigate(`/groups${query({ brand, city: city.trim() })}`)
  }

  return (
    <form onSubmit={submit} className="rounded-lg bg-paper p-6 ring-1 ring-line md:p-7">
      <p className="font-display text-2xl font-bold">Which car are you buying?</p>
      <div className="mt-5 grid gap-4">
        <Field label="Brand" htmlFor="finder-brand">
          <BrandSelect id="finder-brand" placeholder="Any brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </Field>
        <Field label="City" htmlFor="finder-city">
          <Input
            id="finder-city"
            placeholder="For example, Jaipur"
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Field>
        <Button type="submit" size="lg" className="mt-1">
          Find groups
        </Button>
      </div>
    </form>
  )
}

function LatestGroups() {
  const { data, isLoading, error } = useGroups({ status: 'OPEN' }, 5)

  if (isLoading) return <LoadingRows />
  if (error) return <ErrorState error={error} />
  if (!data || data.content.length === 0) {
    return (
      <EmptyState
        title="No open groups yet"
        action={<ButtonLink to="/groups/new">Start the first group</ButtonLink>}
      >
        Be the first in your city. Others buying the same brand will find your group here.
      </EmptyState>
    )
  }
  return <GroupList groups={data.content} />
}
