/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { MessageResponse } from '../types'
import { addMessage, getLastMessagePosted, getLastMessageRead, getMessage, setMessageRead } from '../db/client'
import { getIp, isCreatedAtWithinLastDay } from '../utils'

const router = Router()

router.get('/message', async (req, res) => {
  const response: MessageResponse = {
    wait: false
  }
  const ip = getIp(req.ip)
  if (ip === null) {
    res.status(503).json({ error: 'No service' })
    return
  }

  const lastMessageRead = await getLastMessageRead(ip)
  if (lastMessageRead === false) {
    const message = await getMessage()
    if (message === false) {
      res.status(404).json({ error: 'There is no message to read' })
      return
    }
    const result = await setMessageRead(message.id, ip)
    if (!result) {
      res.status(500).json({ error: 'Internal error' })
      return
    }
    response.lastMessage = message.content
    res.json(response)
    return
  }

  const lastMessagePosted = await getLastMessagePosted(ip)
  if (lastMessagePosted === false) {
    response.lastMessage = lastMessageRead.content
    res.json(response)
    return
  }

  if (isCreatedAtWithinLastDay(lastMessagePosted.created_at)) {
    response.wait = true
    res.json(response)
    return
  }

  const message = await getMessage()
  if (message === false) {
    res.status(404).json({ error: 'There is no message to read' })
    return
  }

  const result = await setMessageRead(message.id, ip)
  if (!result) {
    res.status(500).json({ error: 'Internal error' })
    return
  }
  response.lastMessage = message.content
  res.json(response)
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
