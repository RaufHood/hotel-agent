import { useEffect, useState } from 'react'
import { fetchCalls } from '../api'
import type { ConversationSummary } from '../types'
import CallItem from './CallItem'

interface Props {
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function Sidebar({ selectedId, onSelect }: Props) {
  const [calls, setCalls] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCalls()
      .then(setCalls)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <aside className="w-72 shrink-0 flex flex-col border-r border-border bg-surface h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold">V</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary leading-none">Viktoria</p>
            <p className="text-[11px] text-text-muted mt-0.5">Control Center</p>
          </div>
        </div>
      </div>

      {/* Call list */}
      <div className="px-3 pt-3 pb-1">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-widest px-1 mb-2">
          Recent Calls
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1">
        {loading && (
          <div className="flex justify-center pt-8">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <p className="text-xs text-red-400 text-center pt-8 px-4">{error}</p>
        )}
        {!loading && !error && calls.length === 0 && (
          <p className="text-xs text-text-muted text-center pt-8">No calls yet.</p>
        )}
        {calls.map((call) => (
          <CallItem
            key={call.conversation_id}
            call={call}
            selected={selectedId === call.conversation_id}
            onClick={() => onSelect(call.conversation_id)}
          />
        ))}
      </div>
    </aside>
  )
}
