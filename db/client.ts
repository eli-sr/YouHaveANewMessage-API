import { createClient } from '@libsql/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  url: process.env.DATABASE_URL ?? '',
  authToken: process.env.DATABASE_TOKEN ?? ''
})

export async function addMessage (content: string, ipUser: string): Promise<boolean> {
  const query = 'INSERT INTO message (content, ip_user) VALUES (?, ?)'
  const result = await client.execute({
    sql: query,
    args: [content, ipUser]
  })
  return result.rowsAffected === 1
}

export async function getMessage (): Promise<Object | boolean> {
  const query = 'SELECT * FROM message WHERE read = 1 ORDER BY created_at ASC LIMIT 1'
  const result = await client.execute({
    sql: query,
    args: []
  })
  return result.rows[0] ?? false
}
