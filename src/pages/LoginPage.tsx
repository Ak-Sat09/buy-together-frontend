import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { useSendOtp, useVerifyOtp } from '../api/hooks'
import { useAuth } from '../auth/AuthContext'
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

export function LoginPage() {
  const { isLoggedIn, signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))

  const [phone, setPhone] = useState('')
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0)

  const sendOtp = useSendOtp()

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  if (isLoggedIn) return <Navigate to={next} replace />

  function requestCode(targetPhone: string) {
    sendOtp.mutate(targetPhone, {
      onSuccess: (challenge) => {
        setCodeSentTo(targetPhone)
        setResendIn(challenge.resendAfterSeconds)
      },
    })
  }

  function submitPhone(event: FormEvent) {
    event.preventDefault()
    requestCode(phone)
  }

  return (
    <div className="mx-auto max-w-md px-5 py-14">
      <h1 className="font-display text-4xl font-bold">Log in</h1>
      <p className="mt-2 text-ink-soft">
        Use your mobile number. We'll send a one-time code. New here? This also creates your account.
      </p>

      <div className="mt-8 rounded-lg bg-surface p-6 ring-1 ring-line">
        {codeSentTo === null ? (
          <form onSubmit={submitPhone} className="grid gap-5" noValidate>
            <Field
              label="Mobile number"
              htmlFor="phone"
              error={sendOtp.error instanceof ApiError ? sendOtp.error.message : undefined}
            >
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={sendOtp.isError}
                  aria-describedby={sendOtp.isError ? 'phone-error' : undefined}
                  autoFocus
                  required
                />
              </div>
            </Field>
            <Button type="submit" size="lg" busy={sendOtp.isPending} disabled={phone.replace(/\D/g, '').length < 10}>
              Send code
            </Button>
          </form>
        ) : (
          <VerifyStep
            phone={codeSentTo}
            resendIn={resendIn}
            resending={sendOtp.isPending}
            resendError={sendOtp.error instanceof ApiError ? sendOtp.error.message : undefined}
            onResend={() => requestCode(codeSentTo)}
            onChangeNumber={() => {
              sendOtp.reset()
              setCodeSentTo(null)
            }}
            onVerified={(response) => {
              signIn(response)
              navigate(response.newUser && !response.user.name ? '/profile?welcome=1' : next, { replace: true })
            }}
          />
        )}
      </div>

      {import.meta.env.DEV ? (
        <p className="mt-4 text-sm text-muted">Local development: the code is printed in the backend log.</p>
      ) : null}
    </div>
  )
}

interface VerifyStepProps {
  phone: string
  resendIn: number
  resending: boolean
  resendError?: string
  onResend: () => void
  onChangeNumber: () => void
  onVerified: (response: LoginResponse) => void
}

function VerifyStep({ phone, resendIn, resending, resendError, onResend, onChangeNumber, onVerified }: VerifyStepProps) {
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const verify = useVerifyOtp()
  const codeInput = useRef<HTMLInputElement>(null)

  function submit(event: FormEvent) {
    event.preventDefault()
    verify.mutate(
      { phone, otp, name: name.trim() || undefined },
      {
        onSuccess: onVerified,
        onError: () => {
          setOtp('')
          codeInput.current?.focus()
        },
      },
    )
  }

  const error = verify.error instanceof ApiError ? verify.error.message : undefined

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <p className="text-[15px] text-ink-soft">
        Code sent to <span className="font-semibold text-ink">{formatPhone(phone)}</span>.{' '}
        <button type="button" onClick={onChangeNumber} className="font-semibold text-ink underline underline-offset-4">
          Change number
        </button>
      </p>

      <Field label="6-digit code" htmlFor="otp" error={error}>
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
