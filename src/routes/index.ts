/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { ApiResponse } from '../types'
import { addMessage, getMessage, setMessageRead } from '../../db/client'
import { getIp } from '../utils'

const router = Router()

router.get('/message', async (_req, res) => {
  const response: ApiResponse = {
    sentMessage: false
  }
  const message = await getMessage()
  if (message === false) {
    res.status(404).json({ error: 'There is no message to read' })
    return
  }
  const result = await setMessageRead(message.id)
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
