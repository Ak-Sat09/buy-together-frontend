import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useCreateGroup, useSuggestions } from '../api/hooks'
import { useAuth } from '../auth/AuthContext'
import { BrandSelect } from '../components/BrandSelect'
import { Button } from '../components/Button'
import { Field, Input, Textarea } from '../components/Form'
import { GroupList } from '../components/GroupRow'
import { Notice } from '../components/Notice'
import { ErrorState, LoadingRows } from '../components/States'
import { ApiError } from '../lib/api'
import { plural, todayIso } from '../lib/format'
import type { GroupSuggestions } from '../lib/types'

interface Lookup {
  brand: string
  city: string
}

export function StartGroupPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const [brand, setBrand] = useState(params.get('brand') ?? '')
  const [city, setCity] = useState(params.get('city') ?? user?.city ?? '')
  const [lookup, setLookup] = useState<Lookup | null>(null)

  const suggestions = useSuggestions(lookup?.brand ?? '', lookup?.city ?? '', lookup !== null)

  function check(event: FormEvent) {
    event.preventDefault()
    setLookup({ brand, city: city.trim() })
  }

  const changed = lookup !== null && (lookup.brand !== brand || lookup.city !== city.trim())

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-4xl font-bold">Start a group</h1>
      <p className="mt-2 max-w-[60ch] text-ink-soft">
        One big group gets a better price than several small ones. So first we check whether people in your city are
        already buying this brand.
      </p>

      <form onSubmit={check} className="mt-8 rounded-lg bg-surface p-6 ring-1 ring-line">
        <h2 className="font-display text-2xl font-bold">Step 1: Brand and city</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Brand" htmlFor="start-brand">
            <BrandSelect id="start-brand" placeholder="Choose a brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
          </Field>
          <Field label="City" htmlFor="start-city">
            <Input id="start-city" placeholder="For example, Jaipur" value={city} onChange={(e) => setCity(e.target.value)} required />
          </Field>
          <Button type="submit" variant={lookup && !changed ? 'secondary' : 'primary'} className="h-11" disabled={!brand || !city.trim()}>
            Check for groups
          </Button>
        </div>
      </form>

      {lookup && !changed ? (
        <section className="mt-8" aria-live="polite">
          {suggestions.isLoading ? (
            <LoadingRows rows={2} />
          ) : suggestions.error ? (
            <ErrorState error={suggestions.error} />
          ) : suggestions.data ? (
            suggestions.data.canCreate ? (
              <CreateForm lookup={lookup} brandName={suggestions.data.brandName} onConflict={() => suggestions.refetch()} />
            ) : (
              <ExistingGroups suggestions={suggestions.data} />
            )
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

function ExistingGroups({ suggestions }: { suggestions: GroupSuggestions }) {
  return (
    <>
      <h2 className="font-display text-3xl font-bold">
        {plural(suggestions.peopleInterested, 'person is', 'people are')} already buying {suggestions.brandName} in{' '}
        {suggestions.city}
      </h2>
      <p className="mt-2 max-w-[60ch] text-ink-soft">
        Join their group instead of starting a new one. You'll negotiate together and get a better price. A new group can
        be started once this one is full.
      </p>
      <div className="mt-6">
        <GroupList groups={suggestions.openGroups} />
      </div>
    </>
  )
}

interface CreateFormProps {
  lookup: Lookup
  brandName: string
  onConflict: () => void
}

function CreateForm({ lookup, brandName, onConflict }: CreateFormProps) {
  const navigate = useNavigate()
  const create = useCreateGroup()
  const [model, setModel] = useState('')
  const [targetSize, setTargetSize] = useState('10')
  const [deadline, setDeadline] = useState('')
  const [note, setNote] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    create.mutate(
      {
        brand: lookup.brand,
        city: lookup.city,
        model: model.trim(),
        targetSize: Number(targetSize),
        deadline: deadline || undefined,
        note: note.trim() || undefined,
      },
      {
        onSuccess: (group) => navigate(`/groups/${group.id}`),
        onError: (error) => {
          if (error instanceof ApiError && error.code === 'OPEN_GROUP_EXISTS') onConflict()
        },
      },
    )
  }

  const fieldErrors = create.error instanceof ApiError ? create.error.fieldErrors : {}
  const generalError = create.error && Object.keys(fieldErrors).length === 0 ? create.error.message : null

  return (
    <form onSubmit={submit} className="rounded-lg bg-surface p-6 ring-1 ring-line" noValidate>
      <Notice tone="success">
        No open {brandName} group in {lookup.city} yet. You can start the first one.
      </Notice>

      <h2 className="mt-6 font-display text-2xl font-bold">Step 2: Group details</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <Field label="Model" htmlFor="model" hint="The car most of you want, like Thar or XUV700." error={fieldErrors.model}>
          <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} maxLength={60} required />
        </Field>
        <Field label="Group size" htmlFor="target-size" hint="How many buyers you want, between 2 and 50." error={fieldErrors.targetSize}>
          <Input
            id="target-size"
            type="number"
            min={2}
            max={50}
            value={targetSize}
            onChange={(e) => setTargetSize(e.target.value)}
            required
          />
        </Field>
        <Field label="Buying by" htmlFor="deadline" hint="Optional. The group expires after this date." error={fieldErrors.deadline}>
          <Input id="deadline" type="date" min={todayIso()} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
        <Field label="Note for others" htmlFor="note" hint="Optional. Variant, budget, or when you plan to visit." className="sm:col-span-2" error={fieldErrors.note}>
          <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
        </Field>
      </div>

      {generalError ? (
        <Notice tone="error" className="mt-5">
          {generalError}
        </Notice>
      ) : null}

      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" busy={create.isPending} disabled={!model.trim()}>
        Start group
      </Button>
    </form>
  )
}
