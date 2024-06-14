import { ResultSet, createClient } from '@libsql/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  url: process.env.DATABASE_URL ?? '',
  authToken: process.env.DATABASE_TOKEN ?? ''
})

export async function addMessage (content: string, ipUser: string): Promise<ResultSet> {
  const query = 'INSERT INTO message (content, ip_user) VALUES (?, ?)'
  const result = await client.execute({
    sql: query,
    args: [content, ipUser]
  })
  return result
}
