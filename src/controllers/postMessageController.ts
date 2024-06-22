import { Request, Response } from 'express'
import { getIp } from '../utils'
import { addMessage } from '../db/client'
import ErrorAPI from '../classes/ErrorAPI'

export default async function postMessageController (req: Request, res: Response): Promise<void> {
  try {
    const { message } = req.body
    if (typeof message !== 'string' || message.trim() === '') {
      throw new ErrorAPI('Message is required', 400)
    }
    if (message.length > 140) {
      throw new ErrorAPI('Message is too long', 400)
    }
    const ip = getIp(req.ip)
    if (ip === null) {
      throw new ErrorAPI('No service', 503)
    }
    if (!await addMessage(message, ip)) {
      throw new ErrorAPI('Internal error')
    }
    res.json({ info: 'Message received' })
  } catch (error) {
    if (error instanceof ErrorAPI) {
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Internal error' })
  }
}
