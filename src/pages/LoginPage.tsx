import clsx from 'clsx'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { useGoogleLogin, useSendOtp, useVerifyOtp, type LoginChannel } from '../api/hooks'
import { useAuth } from '../auth/AuthContext'
import { GoogleButton, googleLoginEnabled } from '../auth/GoogleButton'
import { Button } from '../components/Button'
import { Field, Input } from '../components/Form'
import { Notice } from '../components/Notice'
import { ApiError } from '../lib/api'
import { formatPhone } from '../lib/format'
import type { LoginResponse } from '../lib/types'

function safeNext(value: string | null) {
  // Only allow paths inside this app, never a full URL to somewhere else
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

const channels: { value: LoginChannel; label: string }[] = [
  { value: 'phone', label: 'Mobile' },
  { value: 'email', label: 'Email' },
]

interface CodeTarget {
  channel: LoginChannel
  address: string
}

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : undefined
}

function looksSendable(channel: LoginChannel, value: string) {
  return channel === 'phone' ? value.replace(/\D/g, '').length >= 10 : /^\S+@\S+\.\S+$/.test(value.trim())
}

export function LoginPage() {
  const { isLoggedIn, signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))

  const [channel, setChannel] = useState<LoginChannel>('phone')
  const [addresses, setAddresses] = useState<Record<LoginChannel, string>>({ phone: '', email: '' })
  const [codeSentTo, setCodeSentTo] = useState<CodeTarget | null>(null)
  const [resendIn, setResendIn] = useState(0)

  const sendOtp = useSendOtp()
  const google = useGoogleLogin()

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  if (isLoggedIn) return <Navigate to={next} replace />

  function finish(response: LoginResponse) {
    signIn(response)
    navigate(response.newUser && !response.user.name ? '/profile?welcome=1' : next, { replace: true })
  }

  function requestCode(target: CodeTarget) {
    sendOtp.mutate(target, {
      onSuccess: (challenge) => {
        setCodeSentTo(target)
        setResendIn(challenge.resendAfterSeconds)
      },
    })
  }

  function switchChannel(value: LoginChannel) {
    sendOtp.reset()
    setChannel(value)
  }

  function submitAddress(event: FormEvent) {
    event.preventDefault()
    requestCode({ channel, address: addresses[channel].trim() })
  }

  const address = addresses[channel]
  const sendError = errorMessage(sendOtp.error)

  return (
    <div className="mx-auto max-w-md px-5 py-14">
      <h1 className="font-display text-4xl font-bold">Log in</h1>
      <p className="mt-2 text-ink-soft">We'll send you a one-time code. New here? This also creates your account.</p>

      <div className="mt-8 rounded-lg bg-surface p-6 ring-1 ring-line">
        {codeSentTo === null ? (
          <>
            <div role="tablist" aria-label="Log in with" className="mb-6 grid grid-cols-2 rounded-md bg-paper p-1 ring-1 ring-inset ring-line">
              {channels.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  id={`tab-${option.value}`}
                  aria-selected={channel === option.value}
                  aria-controls="login-form"
                  onClick={() => switchChannel(option.value)}
                  className={clsx(
                    'h-9 rounded text-[15px] font-semibold transition-colors',
                    channel === option.value ? 'bg-surface text-ink shadow-sm ring-1 ring-line' : 'text-ink-soft hover:text-ink',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <form
              id="login-form"
              role="tabpanel"
              aria-labelledby={`tab-${channel}`}
              onSubmit={submitAddress}
              className="grid gap-5"
              noValidate
            >
              {channel === 'phone' ? (
                <Field label="Mobile number" htmlFor="phone" error={sendError}>
                  <div className="flex">
                    <span className="inline-flex h-11 items-center rounded-l-md bg-paper px-3 text-[15px] font-semibold text-ink-soft ring-1 ring-inset ring-line">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="98765 43210"
                      className="rounded-l-none"
                      value={address}
                      onChange={(e) => setAddresses((all) => ({ ...all, phone: e.target.value }))}
                      aria-invalid={sendOtp.isError}
                      aria-describedby={sendOtp.isError ? 'phone-error' : undefined}
                      autoFocus
                      required
                    />
                  </div>
                </Field>
              ) : (
                <Field label="Email address" htmlFor="email" error={sendError}>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={address}
                    onChange={(e) => setAddresses((all) => ({ ...all, email: e.target.value }))}
                    aria-invalid={sendOtp.isError}
                    aria-describedby={sendOtp.isError ? 'email-error' : undefined}
                    autoFocus
                    required
                  />
                </Field>
              )}
              <Button type="submit" size="lg" busy={sendOtp.isPending} disabled={!looksSendable(channel, address)}>
                Send code
              </Button>
            </form>

            {googleLoginEnabled ? (
              <>
                <div className="my-6 flex items-center gap-3 text-sm text-muted" aria-hidden="true">
                  <span className="h-px flex-1 bg-line" />
                  or
                  <span className="h-px flex-1 bg-line" />
                </div>
                <GoogleButton onCredential={(credential) => google.mutate(credential, { onSuccess: finish })} />
                {google.isPending ? <p className="mt-3 text-center text-sm text-ink-soft">Logging you in…</p> : null}
                {google.isError ? (
                  <Notice tone="error" className="mt-3">
                    {errorMessage(google.error) ?? 'Google sign in failed, try again.'}
                  </Notice>
                ) : null}
              </>
            ) : null}
          </>
        ) : (
          <VerifyStep
            target={codeSentTo}
            resendIn={resendIn}
            resending={sendOtp.isPending}
            resendError={sendError}
            onResend={() => requestCode(codeSentTo)}
            onChangeAddress={() => {
              sendOtp.reset()
              setCodeSentTo(null)
            }}
            onVerified={finish}
          />
        )}
      </div>

      {import.meta.env.DEV ? (
        <p className="mt-4 text-sm text-muted">Testing: while the backend runs in log mode, the code is printed in its log.</p>
      ) : null}
    </div>
  )
}

interface VerifyStepProps {
  target: CodeTarget
  resendIn: number
  resending: boolean
  resendError?: string
  onResend: () => void
  onChangeAddress: () => void
  onVerified: (response: LoginResponse) => void
}

function VerifyStep({ target, resendIn, resending, resendError, onResend, onChangeAddress, onVerified }: VerifyStepProps) {
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const verify = useVerifyOtp()
  const codeInput = useRef<HTMLInputElement>(null)
  const byEmail = target.channel === 'email'

  function submit(event: FormEvent) {
    event.preventDefault()
    verify.mutate(
      { ...target, otp, name: name.trim() || undefined },
      {
        onSuccess: onVerified,
        onError: () => {
          setOtp('')
          codeInput.current?.focus()
        },
      },
    )
  }

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <p className="text-[15px] text-ink-soft">
        Code sent to{' '}
        <span className="font-semibold break-all text-ink">{byEmail ? target.address : formatPhone(target.address)}</span>.{' '}
        {byEmail ? 'Check your spam folder if it is not in your inbox. ' : null}
        <button type="button" onClick={onChangeAddress} className="font-semibold text-ink underline underline-offset-4">
          {byEmail ? 'Change email' : 'Change number'}
        </button>
      </p>

      <Field label="6-digit code" htmlFor="otp" error={errorMessage(verify.error)}>
        <Input
          ref={codeInput}
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="h-14 text-center font-display text-3xl font-bold tracking-[0.4em]"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          aria-invalid={verify.isError}
          aria-describedby={verify.isError ? 'otp-error' : undefined}
          autoFocus
        />
      </Field>

      <Field label="Your name" htmlFor="name" hint="Only needed the first time you log in. Group members see this name.">
        <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
      </Field>

      <Button type="submit" size="lg" busy={verify.isPending} disabled={otp.length !== 6}>
        Log in
      </Button>

      <div className="text-sm text-ink-soft">
        {resendIn > 0 ? (
          <span>You can ask for a new code in {resendIn}s.</span>
        ) : (
          <button type="button" onClick={onResend} disabled={resending} className="font-semibold text-ink underline underline-offset-4">
            Send a new code
          </button>
        )}
      </div>
      {resendError ? <Notice tone="error">{resendError}</Notice> : null}
    </form>
  )
}
