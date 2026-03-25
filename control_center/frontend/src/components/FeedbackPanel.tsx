import { useState } from 'react'
import { submitFeedback } from '../api'
import type { Feedback } from '../types'
import StarRating from './StarRating'

interface Props {
  conversationId: string
  initial: Feedback | null
  onSaved: (fb: Feedback) => void
}

export default function FeedbackPanel({ conversationId, initial, onSaved }: Props) {
  const [rating, setRating] = useState<number | null>(initial?.rating ?? null)
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const fb = await submitFeedback(conversationId, rating, comment || null)
      onSaved(fb)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-t border-border bg-white px-6 py-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-4">
        Feedback
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">Rating</span>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <textarea
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment about this call…"
          className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
        />
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs text-emerald-600 font-medium">Saved</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || (rating === null && !comment)}
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save feedback'}
          </button>
        </div>
      </div>
    </div>
  )
}
