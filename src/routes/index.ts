/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { addMessage } from '../db/client'
import { getIp } from '../utils'
import getMessageController from '../controllers/getMessageController'

const router = Router()

router.get('/message', getMessageController)

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
