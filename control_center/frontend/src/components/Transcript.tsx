import { useEffect, useRef, useState } from 'react'
import { fetchCall } from '../api'
import type { ConversationDetail, Feedback } from '../types'
import FeedbackPanel from './FeedbackPanel'
import MessageBubble from './MessageBubble'

interface Props {
  conversationId: string
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s}s`
}

export default function Transcript({ conversationId }: Props) {
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setDetail(null)
    fetchCall(conversationId)
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [detail?.transcript])

  function handleFeedbackSaved(fb: Feedback) {
    setDetail((prev) => prev ? { ...prev, feedback: fb } : prev)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-text-muted">
        {error ?? 'Could not load conversation.'}
      </div>
    )
  }

  const startDate = new Date(detail.metadata.start_time_unix_secs * 1000)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-white flex items-center justify-between shrink-0">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {startDate.toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            {' · '}
            {startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {formatDuration(detail.metadata.call_duration_secs)} ·{' '}
            {detail.transcript.length} messages · {detail.status}
          </p>
        </div>
        <code className="text-[11px] text-text-muted bg-surface border border-border rounded-lg px-2 py-1">
          {conversationId}
        </code>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        {detail.transcript.length === 0 ? (
          <p className="text-sm text-text-muted text-center mt-8">No transcript available.</p>
        ) : (
          detail.transcript.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Feedback */}
      <FeedbackPanel
        conversationId={conversationId}
        initial={detail.feedback}
        onSaved={handleFeedbackSaved}
      />
    </div>
  )
}
