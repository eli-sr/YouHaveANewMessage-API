import { Request, Response } from 'express'
import { getIp, isCreatedAtWithinLastDay } from '../utils'
import { addMessage, getLastMessagePostedSinceDate, getLastMessageRead } from '../db/client'
import ErrorAPI from '../classes/ErrorAPI'

export default async function postMessageController (req: Request, res: Response): Promise<void> {
  try {
    const ip = getIp(req.ip)
    if (ip === null) {
      throw new ErrorAPI('No service', 503)
    }
    const lastMessageRead = await getLastMessageRead(ip)
    if (lastMessageRead === null) {
      throw new ErrorAPI('You must read a message before posting', 403)
    }
    if (lastMessageRead !== null) {
      const lastMessagePosted = await getLastMessagePostedSinceDate(ip, lastMessageRead.read_at)
      console.log({ lastMessagePosted })
      if (lastMessagePosted !== null && isCreatedAtWithinLastDay(lastMessagePosted.created_at)) {
        throw new ErrorAPI('You must wait 24 hours to post a new message', 403)
      }
    }

    const { message } = req.body
    if (typeof message !== 'string' || message.trim() === '') {
      throw new ErrorAPI('Message is required', 400)
    }
    if (message.length > 140) {
      throw new ErrorAPI('Message is too long', 400)
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
