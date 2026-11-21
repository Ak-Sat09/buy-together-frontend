const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')

/** Error body the backend sends (RFC 7807 problem+json with a stable `code`). */
interface Problem {
  status?: number
  detail?: string
  code?: string
  fieldErrors?: Record<string, string>
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: Record<string, string>

  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

let readToken: () => string | null = () => null
let onUnauthorized: () => void = () => {}

export function configureApi(options: { readToken: () => string | null; onUnauthorized: () => void }) {
  readToken = options.readToken
  onUnauthorized = options.onUnauthorized
}

export async function api<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const token = readToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'NETWORK', "Can't reach the server. Check your connection and try again.")
  }

  if (response.status === 401 && token) onUnauthorized()

  if (!response.ok) {
    const problem: Problem = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      problem.code ?? 'UNKNOWN',
      problem.detail ?? 'Something went wrong. Try again.',
      problem.fieldErrors,
    )
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function query(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}
