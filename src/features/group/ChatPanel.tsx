import clsx from 'clsx'
import { SendHorizontal } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useMessages, useSendMessage } from '../../api/hooks'
import { Notice } from '../../components/Notice'
import { ErrorState } from '../../components/States'
import { formatMessageTime } from '../../lib/format'

export function ChatPanel({ groupId, readOnly }: { groupId: string; readOnly: boolean }) {
  const { data, isLoading, error } = useMessages(groupId, true)
  const send = useSendMessage(groupId)
  const [text, setText] = useState('')
  const scroller = useRef<HTMLDivElement>(null)

  // The API returns newest first; a chat reads top to bottom
  const messages = useMemo(() => [...(data?.content ?? [])].reverse(), [data])
  const newestId = messages.at(-1)?.id

  useEffect(() => {
    const element = scroller.current
    if (element) element.scrollTop = element.scrollHeight
  }, [newestId])

  function submit(event?: FormEvent) {
    event?.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || send.isPending) return
    send.mutate(trimmed, { onSuccess: () => setText('') })
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <section aria-labelledby="chat-title" className="flex flex-col overflow-hidden rounded-lg bg-surface ring-1 ring-line">
      <h2 id="chat-title" className="border-b border-line px-5 py-4 font-display text-2xl font-bold">
        Group chat
      </h2>

      <div ref={scroller} className="h-[26rem] space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
        {isLoading ? <p className="text-ink-soft">Loading messages</p> : null}
        {error ? <ErrorState error={error} /> : null}
        {!isLoading && !error && messages.length === 0 ? (
          <p className="mx-auto max-w-[38ch] pt-24 text-center text-ink-soft">
            No messages yet. Suggest a showroom and a day that works for you.
          </p>
        ) : null}
        {messages.map((message) => (
          <div key={message.id} className={clsx('flex flex-col', message.mine ? 'items-end' : 'items-start')}>
            <div className="mb-1 flex items-baseline gap-2 text-[13px] text-muted">
              {message.mine ? null : <span className="font-semibold text-ink-soft">{message.senderName}</span>}
              <time dateTime={message.sentAt}>{formatMessageTime(message.sentAt)}</time>
            </div>
            <p
              className={clsx(
                'max-w-[34rem] rounded-lg px-3.5 py-2 text-[15px] leading-relaxed whitespace-pre-wrap break-words',
                message.mine ? 'rounded-tr-sm bg-ink text-white' : 'rounded-tl-sm bg-paper ring-1 ring-line',
              )}
            >
              {message.text}
            </p>
          </div>
        ))}
      </div>

      {readOnly ? (
        <div className="border-t border-line px-5 py-4">
          <Notice>This group is no longer active, so the chat is read only.</Notice>
        </div>
      ) : (
        <form onSubmit={submit} className="flex items-end gap-2 border-t border-line p-3">
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <textarea
            id="chat-input"
            rows={1}
            maxLength={1000}
            placeholder="Write a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-md bg-paper px-3 py-2.5 text-[15px] ring-1 ring-inset ring-line focus:outline-none focus:ring-2 focus:ring-ink"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!text.trim() || send.isPending}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-lane text-ink transition-colors hover:bg-[#e3ab00] disabled:opacity-40"
          >
            <SendHorizontal className="size-5" />
          </button>
        </form>
      )}
      {send.error ? (
        <div className="px-5 pb-4">
          <Notice tone="error">{send.error.message}</Notice>
        </div>
      ) : null}
    </section>
  )
}
