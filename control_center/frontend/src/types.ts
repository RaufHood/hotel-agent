export interface Feedback {
  conversation_id: string
  rating: number | null
  comment: string | null
  created_at: string
  updated_at: string
}

export interface ConversationSummary {
  conversation_id: string
  agent_id: string
  status: string
  start_time_unix_secs: number
  call_duration_secs: number
  message_count: number
  feedback: Feedback | null
}

export interface TranscriptMessage {
  role: 'agent' | 'user'
  message: string
  time_in_call_secs: number
}

export interface ConversationDetail {
  conversation_id: string
  status: string
  transcript: TranscriptMessage[]
  metadata: {
    start_time_unix_secs: number
    call_duration_secs: number
  }
  feedback: Feedback | null
}
