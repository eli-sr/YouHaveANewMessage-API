
export interface MessageResponse {
  wait: boolean
  lastMessage?: string
}

export interface Message {
  id: number
  content: string
  ip_writer: string
  ip_reader: string
  read: boolean
  read_at: string
  created_at: string
}

export interface Reply {
  content: string
  id_message: number
  ip_user: string
}

export interface ReplyAndMessage {
  id: number
  ip_user: string
  message: string
  reply: string
}
