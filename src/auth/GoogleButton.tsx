import { useEffect, useRef, useState } from 'react'
import { Notice } from '../components/Notice'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const SCRIPT_URL = 'https://accounts.google.com/gsi/client'

/** Google login shows only when the frontend is built with a client id. */
export const googleLoginEnabled = Boolean(CLIENT_ID)

interface GoogleId {
  initialize(options: { client_id: string; callback: (response: { credential: string }) => void; ux_mode?: 'popup' }): void
  renderButton(parent: HTMLElement, options: Record<string, string | number>): void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } }
  }
}

let scriptLoading: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  scriptLoading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptLoading = null
      reject(new Error('Google sign in could not load'))
    }
    document.head.appendChild(script)
  })
  return scriptLoading
}

/**
 * Google's own "Continue with Google" button. It hands us an ID token (credential),
 * which the backend checks before logging the user in.
 */
export function GoogleButton({ onCredential }: { onCredential: (credential: string) => void }) {
  const container = useRef<HTMLDivElement>(null)
  const latestCallback = useRef(onCredential)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    latestCallback.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelled = false
    loadGoogleScript()
      .then(() => {
        const target = container.current
        if (cancelled || !target || !window.google) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => latestCallback.current(response.credential),
          ux_mode: 'popup',
        })
        window.google.accounts.id.renderButton(target, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: Math.min(400, target.offsetWidth),
        })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!CLIENT_ID) return null
  if (failed) return <Notice tone="error">Google sign in could not load. Check your connection, or use your mobile or email.</Notice>
  return <div ref={container} className="flex min-h-11 justify-center" />
}
