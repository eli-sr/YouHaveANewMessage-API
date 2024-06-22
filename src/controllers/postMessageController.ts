import { Request, Response } from 'express'
import { getIp } from '../utils'
import { addMessage } from '../db/client'

export default async function postMessageController (req: Request, res: Response): Promise<void> {
  const { message } = req.body
  if (typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'Message is required' })
    return
  }
  if (message.length > 140) {
    res.status(400).json({ error: 'Message is too long' })
    return
  }
  const ip = getIp(req.ip)
  if (ip === null) {
    res.status(503).json({ error: 'No service' })
    return
  }
  const result = await addMessage(message, ip)
  if (!result) {
    res.status(500).json({ error: 'Internal error' })
    return
  }
  res.json({ info: 'Message received' })
}
