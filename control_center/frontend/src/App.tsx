import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Transcript from './components/Transcript'
import Ripple from './components/Ripple'

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar selectedId={selectedId} onSelect={setSelectedId} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedId ? (
          <Transcript key={selectedId} conversationId={selectedId} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center gap-3 text-center px-8 bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 overflow-hidden">
      <Ripple />
      <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center mb-1">
        <span className="text-accent text-xl font-bold">V</span>
      </div>
      <p className="relative z-10 text-base font-semibold text-text-primary">Select a call</p>
      <p className="relative z-10 text-sm text-text-muted max-w-xs">
        Choose a conversation from the sidebar to view the full transcript and leave feedback.
      </p>
    </div>
  )
}
