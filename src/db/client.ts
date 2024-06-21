import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
import { Message, Reply, ReplyAndMessage } from '../types'

dotenv.config()

const client = createClient({
  url: process.env.DATABASE_URL ?? '',
  authToken: process.env.DATABASE_TOKEN ?? ''
})

export async function addMessage (content: string, ipUser: string): Promise<boolean> {
  const query = 'INSERT INTO message (content, ip_writer) VALUES (?, ?)'
  try {
    const result = await client.execute({
      sql: query,
      args: [content, ipUser]
    })
    return result.rowsAffected === 1
  } catch (error) {
    return false
  }
}

export async function getMessage (): Promise<Message | false> {
  const query = 'SELECT * FROM message WHERE read = 0 ORDER BY created_at ASC LIMIT 1'
  try {
    const result = await client.execute({
      sql: query,
      args: []
    })
    if (result.rows.length === 0) return false
    const message = result.rows[0] as unknown as Message
    return message
  } catch (error) {
    return false
  }
}

export async function setMessageRead (id: number, ipReader: string): Promise<boolean> {
  const query = 'UPDATE message SET read = 1, ip_reader = ? WHERE id = ?'
  try {
    const result = await client.execute({
      sql: query,
      args: [ipReader, id]
    })
    return result.rowsAffected === 1
  } catch (error) {
    return false
  }
}

export async function addReply (idMessage: number, content: string, ipUser: string): Promise<boolean> {
  const query = 'INSERT INTO reply (id_message, content, ip_user) VALUES (?, ?, ?)'
  try {
    const result = await client.execute({
      sql: query,
      args: [idMessage, content, ipUser]
    })
    return result.rowsAffected === 1
  } catch (error) {
    return false
  }
}

export async function getReply (idMessage: number): Promise<Reply | false> {
  const query = 'SELECT * FROM reply WHERE id_message = ?'
  try {
    const result = await client.execute({
      sql: query,
      args: [idMessage]
    })
    if (result.rows.length === 0) return false
    const reply = result.rows[0] as unknown as Reply
    return reply
  } catch (error) {
    return false
  }
}

export async function getReplyAndMessageByIp (ip: string): Promise<ReplyAndMessage | false> {
  const query = `
    SELECT M.id,M.content message,M.ip_user,R.content reply
    FROM message M
    JOIN reply R ON M.id = R.id_message
    WHERE M.ip_user = ?
    ORDER BY created_at ASC
    LIMIT 1
  `
  try {
    const result = await client.execute({
      sql: query,
      args: [ip]
    })
    if (result.rows.length === 0) return false
    const replyAndMessage = result.rows[0] as unknown as ReplyAndMessage
    return replyAndMessage
  } catch (error) {
    return false
  }
}

export async function checkIfWaited (ip: string): Promise<boolean> {
  const query = `
    SELECT COUNT(*) cont
    FROM (
      SELECT ip_user,created_at
      FROM message
      WHERE ip_user = ?
      ORDER BY created_at DESC
      LIMIT 1
    )
    WHERE created_at > DATETIME('now', '-1 day')
  `
  try {
    const result = await client.execute({
      sql: query,
      args: [ip]
    })
    const cont = result.rows[0].cont as number
    return cont === 0
  } catch (error) {
    return false
  }
}

export async function getLastMessagePosted (ip: string): Promise<Message | false> {
  const query = `
    SELECT * 
    FROM message 
    WHERE ip_writer = ? 
    ORDER BY created_at DESC 
    LIMIT 1;`
  try {
    const result = await client.execute({
      sql: query,
      args: [ip]
    })
    if (result.rows.length === 0) return false
    const message = result.rows[0] as unknown as Message
    return message
  } catch (error) {
    return false
  }
}

export async function getLastMessageRead (ip: string): Promise<Message | false> {
  const query = `
    SELECT * 
    FROM message 
    WHERE ip_reader = ? 
    ORDER BY created_at DESC 
    LIMIT 1;`
  try {
    const result = await client.execute({
      sql: query,
      args: [ip]
    })
    if (result.rows.length === 0) return false
    const message = result.rows[0] as unknown as Message
    return message
  } catch (error) {
    return false
  }
}
