import type { TranscriptMessage } from '../types'

interface Props {
  message: TranscriptMessage
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MessageBubble({ message }: Props) {
  const isAgent = message.role === 'agent'

  return (
    <div className={`flex gap-3 ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5 ${
          isAgent
            ? 'bg-accent-light text-accent'
            : 'bg-gray-100 text-text-secondary'
        }`}
      >
        {isAgent ? 'V' : 'G'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[72%] ${isAgent ? '' : 'items-end'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isAgent
              ? 'bg-accent-light text-text-primary rounded-tl-sm'
              : 'bg-gray-100 text-text-primary rounded-tr-sm'
          }`}
        >
          {message.message}
        </div>
        <span className="text-[11px] text-text-muted px-1">
          {formatTime(message.time_in_call_secs)}
        </span>
      </div>
    </div>
  )
}
