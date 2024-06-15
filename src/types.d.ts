
export interface ApiResponse {
  sentMessage: boolean
  hasReply?: boolean
  lastMessage?: string
  reply?: string
}

export interface Message {
  id: number
  content: string
  ip_user: string
  read: boolean
  created_at: Date
}

export interface Reply {
  content: string
  id_message: number
  ip_user: string
}
