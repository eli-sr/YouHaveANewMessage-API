/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { MessageResponse } from '../types'
import { addMessage, getLastMessagePosted, getLastMessageRead, getMessage, setMessageRead } from '../db/client'
import { getIp, isCreatedAtWithinLastDay } from '../utils'
import ErrorAPI from '../classes/ErrorAPI'

const router = Router()

router.get('/message', async (req, res) => {
  try {
    const response: MessageResponse = {
      wait: false
    }
    const ip = getIp(req.ip)
    if (ip === null) {
      throw new ErrorAPI('No service', 503)
    }

    const message = await getMessage()

    const lastMessageRead = await getLastMessageRead(ip)
    if (lastMessageRead === null) {
      if (message === null) {
        throw new ErrorAPI('There is no message to read', 404)
      }
      if (!await setMessageRead(message.id, ip)) {
        throw new ErrorAPI('Internal error')
      }
      response.lastMessage = message.content
      res.json(response)
      return
    }

    const lastMessagePosted = await getLastMessagePosted(ip)
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
    if (!await setMessageRead(message.id, ip)) {
      throw new ErrorAPI('Internal error')
    }

    response.lastMessage = message.content
    res.json(response)
  } catch (error) {
    if (error instanceof ErrorAPI) {
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Internal error' })
  }
})

router.post('/message', async (req, res) => {
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
})

export default router
