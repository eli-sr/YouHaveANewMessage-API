/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import getMessageController from '../controllers/getMessageController'
import postMessageController from '../controllers/postMessageController'

const router = Router()

router.get('/message', getMessageController)
router.post('/message', postMessageController)

export default router
