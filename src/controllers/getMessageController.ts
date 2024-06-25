import { Request, Response } from 'express'
import { MessageResponse } from '../types'
import { getLastMessagePostedSinceDate, getLastMessageRead, getMessage, setMessageRead } from '../db/client'
import { getIp, isCreatedAtWithinLastDay } from '../utils'
import ErrorAPI from '../classes/ErrorAPI'

export default async function getMessageController (req: Request, res: Response): Promise<void> {
  try {
    const response: MessageResponse = {
      wait: false
    }
    if (req.ip === undefined) {
      throw new ErrorAPI('Client disconnected', 400)
    }
    const ip = getIp(req.ip)

    const message = await getMessage()

    const lastMessageRead = await getLastMessageRead(ip)
    if (lastMessageRead === null) {
      if (message === null) {
        throw new ErrorAPI('There is no message to read', 404)
      }
      await setMessageRead(message.id, ip)
      response.lastMessage = message.content
      res.json(response)
      return
    }

    const lastMessagePosted = await getLastMessagePostedSinceDate(ip, lastMessageRead.read_at)
    if (lastMessagePosted === null) {
      response.lastMessage = lastMessageRead.content
      res.json(response)
      return
    }
    if (isCreatedAtWithinLastDay(lastMessagePosted.created_at)) {
      response.wait = true
      res.json(response)
      return
    }

    if (message === null) {
      throw new ErrorAPI('There is no message to read', 404)
    }
    await setMessageRead(message.id, ip)
    response.lastMessage = message.content
    res.json(response)
  } catch (error) {
    if (error instanceof ErrorAPI) {
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Internal error' })
  }
}
