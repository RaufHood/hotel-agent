import type { ConversationDetail, ConversationSummary, Feedback } from './types'

const BASE = ''

export async function fetchCalls(): Promise<ConversationSummary[]> {
  const res = await fetch(`${BASE}/calls`)
  if (!res.ok) throw new Error('Failed to fetch calls')
  const data = await res.json()
  return data.conversations ?? []
}

export async function fetchCall(id: string): Promise<ConversationDetail> {
  const res = await fetch(`${BASE}/calls/${id}`)
  if (!res.ok) throw new Error('Failed to fetch call')
  return res.json()
}

export async function submitFeedback(
  id: string,
  rating: number | null,
  comment: string | null,
): Promise<Feedback> {
  const res = await fetch(`${BASE}/calls/${id}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, comment }),
  })
  if (!res.ok) throw new Error('Failed to submit feedback')
  return res.json()
}
