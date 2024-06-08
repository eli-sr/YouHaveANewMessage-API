import { Router } from 'express'
import message from '../../mocks/message.json'
import { ApiResponse } from '../types'

const router = Router()

router.get('/message', (_req, res) => {
  const messageMock: ApiResponse = message
  res.send(messageMock)
})

export default router
