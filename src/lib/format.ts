const dayMonth = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })
const dayMonthYear = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const time = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' })

/** "2026-12-31" (a calendar date from the API) without any timezone shift. */
function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDeadline(value: string) {
  const date = parseLocalDate(value)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return (sameYear ? dayMonth : dayMonthYear).format(date)
}

export function formatDay(value: string) {
  return dayMonthYear.format(new Date(value))
}

export function formatMessageTime(value: string) {
  const date = new Date(value)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  return isToday ? time.format(date) : `${dayMonth.format(date)}, ${time.format(date)}`
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-10)
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`
}

export function todayIso() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
