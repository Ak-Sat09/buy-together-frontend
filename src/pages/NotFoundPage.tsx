import { ButtonLink } from '../components/Button'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-display text-5xl font-bold">Wrong turn</h1>
      <p className="mt-3 text-ink-soft">This page doesn't exist. It may have been a group that was removed after its deal was done.</p>
      <ButtonLink to="/groups" className="mt-8">
        Browse groups
      </ButtonLink>
    </div>
  )
}
