import { createClient } from '@libsql/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  url: process.env.DATABASE_URL ?? '',
  authToken: process.env.DATABASE_TOKEN ?? ''
})

export async function addMessage (content: string, ipUser: string): Promise<boolean> {
  const query = 'INSERT INTO message (content, ip_user) VALUES (?, ?)'
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

export async function getMessage (): Promise<Object | boolean> {
  const query = 'SELECT * FROM message WHERE read = 0 ORDER BY created_at ASC LIMIT 1'
  try {
    const result = await client.execute({
      sql: query,
      args: []
    })
    return result.rows[0] ?? false
  } catch (error) {
    return false
  }
}

export async function setMessageRead (id: number): Promise<boolean> {
  const query = 'UPDATE message SET read = 1 WHERE id = ?'
  try {
    const result = await client.execute({
      sql: query,
      args: [id]
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

export async function getReply (idMessage: number): Promise<Object | boolean> {
  const query = 'SELECT * FROM reply WHERE id_message = ?'
  try {
    const result = await client.execute({
      sql: query,
      args: [idMessage]
    })
    return result.rows[0] ?? false
  } catch (error) {
    return false
  }
}
