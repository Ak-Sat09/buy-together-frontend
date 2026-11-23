import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { useUpdateProfile } from '../api/hooks'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/Button'
import { Field, Input } from '../components/Form'
import { Notice } from '../components/Notice'
import { ApiError } from '../lib/api'
import { formatDay, formatPhone } from '../lib/format'

export function ProfilePage() {
  const { user, updateUser, signOut } = useAuth()
  const [params] = useSearchParams()
  const welcome = params.get('welcome') === '1'

  const [name, setName] = useState(user?.name ?? '')
  const [city, setCity] = useState(user?.city ?? '')
  const save = useUpdateProfile()

  if (!user) return null

  function submit(event: FormEvent) {
    event.preventDefault()
    save.mutate({ name: name.trim(), city: city.trim() || undefined }, { onSuccess: updateUser })
  }

  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}

  return (
    <div className="mx-auto max-w-md px-5 py-14">
      <h1 className="font-display text-4xl font-bold">{welcome ? 'Welcome to Buy Together' : 'Your profile'}</h1>
      <p className="mt-2 text-ink-soft">
        {welcome
          ? 'Add your name so people in your groups know who they are talking to.'
          : `Logged in as ${user.phone ? formatPhone(user.phone) : user.email}, member since ${formatDay(user.createdAt)}.`}
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-5 rounded-lg bg-surface p-6 ring-1 ring-line" noValidate>
        <Field label="Name" htmlFor="profile-name" error={fieldErrors.name}>
          <Input id="profile-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
        </Field>
        <Field label="City" htmlFor="profile-city" hint="Used to suggest groups near you." error={fieldErrors.city}>
          <Input id="profile-city" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} maxLength={60} />
        </Field>
        {save.isSuccess ? <Notice tone="success">Changes saved.</Notice> : null}
        {save.error && !Object.keys(fieldErrors).length ? <Notice tone="error">{save.error.message}</Notice> : null}
        <Button type="submit" busy={save.isPending} disabled={!name.trim()}>
          Save changes
        </Button>
      </form>

      <Button variant="quiet" className="mt-6 -ml-4" onClick={signOut}>
        Log out
      </Button>
    </div>
  )
}
