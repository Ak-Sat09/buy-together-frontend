import { useState, type FormEvent } from 'react'
import { useReportGroup } from '../../api/hooks'
import { Button } from '../../components/Button'
import { Field, Select, Textarea } from '../../components/Form'
import { Notice } from '../../components/Notice'
import type { ReportReason } from '../../lib/types'

const reasons: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: 'Spam or advertising' },
  { value: 'FAKE', label: 'Fake or misleading' },
  { value: 'ABUSIVE', label: 'Abusive or unsafe' },
  { value: 'OTHER', label: 'Something else' },
]

export function ReportForm({ groupId }: { groupId: string }) {
  const report = useReportGroup(groupId)
  const [reason, setReason] = useState<ReportReason>('SPAM')
  const [details, setDetails] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    report.mutate({ reason, details: details.trim() || undefined })
  }

  if (report.isSuccess) {
    return <Notice tone="success">Thanks. This group has been reported and will be reviewed.</Notice>
  }

  return (
    <details className="group rounded-lg ring-1 ring-line open:bg-surface">
      <summary className="cursor-pointer list-none px-5 py-3 text-[15px] font-semibold text-ink-soft hover:text-ink">
        Report this group
      </summary>
      <form onSubmit={submit} className="grid gap-4 px-5 pb-5">
        <Field label="What's wrong?" htmlFor="report-reason">
          <Select id="report-reason" value={reason} onChange={(e) => setReason(e.target.value as ReportReason)}>
            {reasons.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Details" htmlFor="report-details" hint="Optional.">
          <Textarea id="report-details" maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} />
        </Field>
        {report.error ? <Notice tone="error">{report.error.message}</Notice> : null}
        <Button type="submit" variant="danger" busy={report.isPending} className="justify-self-start">
          Send report
        </Button>
      </form>
    </details>
  )
}
