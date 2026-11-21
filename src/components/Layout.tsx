import clsx from 'clsx'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { buttonClass } from './Button'

function navClass({ isActive }: { isActive: boolean }) {
  return clsx(
    'rounded-md px-3 py-2 text-[15px] font-semibold transition-colors',
    isActive ? 'text-ink' : 'text-ink-soft hover:text-ink',
  )
}

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Buy Together home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect width="32" height="32" rx="6" className="fill-ink" />
        <path d="M8 22V13a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v9z" className="fill-lane" />
        <path d="M17 22V13a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v9z" className="fill-lane" />
      </svg>
      <span className="font-display text-[1.6rem] leading-none font-bold">Buy Together</span>
    </Link>
  )
}

export function Layout() {
  const { isLoggedIn, user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setMenuOpen(false), [location.pathname])

  const links = (
    <>
      <NavLink to="/groups" end className={navClass}>
        Browse groups
      </NavLink>
      <NavLink to="/groups/new" className={navClass}>
        Start a group
      </NavLink>
      {isLoggedIn ? (
        <NavLink to="/me/groups" className={navClass}>
          My groups
        </NavLink>
      ) : null}
    </>
  )

  const account = isLoggedIn ? (
    <NavLink to="/profile" className={navClass}>
      {user?.name || 'Profile'}
    </NavLink>
  ) : (
    <Link to="/login" className={buttonClass('secondary')}>
      Log in
    </Link>
  )

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Wordmark />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links}
          </nav>
          <div className="hidden md:block">{account}</div>
          <button
            type="button"
            className="-mr-2 rounded-md p-2 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
        {menuOpen ? (
          <nav id="mobile-menu" aria-label="Main" className="flex flex-col gap-1 border-t border-line px-3 py-3 md:hidden">
            {links}
            <div className="px-3 pt-2">{account}</div>
          </nav>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-muted sm:flex-row sm:justify-between">
          <p>Buy Together connects buyers. It doesn't sell cars or take payments.</p>
          <p>Meet only at the showroom or other public places.</p>
        </div>
      </footer>
    </div>
  )
}
