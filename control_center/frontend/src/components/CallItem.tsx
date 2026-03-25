import type { ConversationSummary } from '../types'
import StarRating from './StarRating'

interface Props {
  call: ConversationSummary
  selected: boolean
  onClick: () => void
}

function formatDate(unix: number): string {
  const d = new Date(unix * 1000)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  if (diffH < 48) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function CallItem({ call, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-150 group relative ${
        selected
          ? 'bg-white shadow-card border border-border'
          : 'hover:bg-white/70 border border-transparent'
      }`}
    >
      {selected && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent rounded-r-full" />
      )}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {call.status === 'done' ? 'Completed' : call.status}
        </span>
        <span className="text-xs text-text-muted">
          {formatDate(call.start_time_unix_secs)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary truncate pr-2">
          {call.conversation_id.slice(0, 16)}…
        </span>
        <span className="text-xs text-text-muted shrink-0">
          {formatDuration(call.call_duration_secs)}
        </span>
      </div>
      <div className="mt-1.5">
        {call.feedback?.rating ? (
          <StarRating value={call.feedback.rating} readonly />
        ) : (
          <span className="text-xs text-text-muted">No rating yet</span>
        )}
      </div>
    </button>
  )
}
