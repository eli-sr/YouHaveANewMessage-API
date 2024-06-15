/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { ApiResponse } from '../types'
import { getMessage, setMessageRead } from '../../db/client'

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

export default router
