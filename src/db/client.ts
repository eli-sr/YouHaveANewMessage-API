import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
import { Message, ReplyAndMessage } from '../types'
import ErrorAPI from '../classes/ErrorAPI'

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
    throw new ErrorAPI('Error adding message')
  }
}

export async function getMessage (): Promise<Message | null> {
  const query = 'SELECT * FROM message WHERE read = 0 ORDER BY created_at ASC LIMIT 1'
  try {
    const result = await client.execute({
      sql: query,
      args: []
    })
    if (result.rows.length === 0) return null
    const message = result.rows[0] as unknown as Message
    return message
  } catch (error) {
    throw new ErrorAPI('Error getting message')
  }
}

export async function setMessageRead (id: number, ipReader: string): Promise<void> {
  const query = 'UPDATE message SET read = 1, ip_reader = ?, read_at = datetime(\'now\',\'localtime\') WHERE id = ?'
  try {
    const result = await client.execute({
      sql: query,
      args: [ipReader, id]
    })
    if (result.rowsAffected !== 1) throw new ErrorAPI('Error setting message read')
  } catch (error) {
    console.log(error)
    throw new ErrorAPI('Internal Server Error')
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
    throw new ErrorAPI('Error adding reply')
  }
}

export async function getReplyAndMessageByIp (ip: string): Promise<ReplyAndMessage | null> {
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
    if (result.rows.length === 0) return null
    const replyAndMessage = result.rows[0] as unknown as ReplyAndMessage
    return replyAndMessage
  } catch (error) {
    throw new ErrorAPI('Error getting reply and message')
  }
}

export async function getLastMessagePostedSinceDate (ip: string, date: string): Promise<Message | null> {
  const query = `
    SELECT * 
    FROM message 
    WHERE ip_writer = ? AND created_at > ?
    ORDER BY created_at DESC 
    LIMIT 1;`
  try {
    const result = await client.execute({
      sql: query,
      args: [ip, date]
    })
    if (result.rows.length === 0) return null
    const message = result.rows[0] as unknown as Message
    return message
  } catch (error) {
    throw new ErrorAPI('Error getting last message posted')
  }
}

export async function getLastMessageRead (ip: string): Promise<Message | null> {
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
    if (result.rows.length === 0) return null
    const message = result.rows[0] as unknown as Message
    return message
  } catch (error) {
    throw new ErrorAPI('Error getting last message read')
  }
}
