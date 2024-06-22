import { Request, Response } from 'express'
import postMessageController from '../src/controllers/postMessageController'

import { addMessage } from '../src/db/client'

jest.mock('../src/db/client', () => ({
  addMessage: jest.fn()
}))

describe('postMessageController', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let jsonMock: jest.Mock
  let statusMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    jsonMock = jest.fn()
    statusMock = jest.fn().mockReturnValue({ json: jsonMock })

    req = {
      body: {},
      ip: '127.0.0.1'
    }

    res = {
      status: statusMock,
      json: jsonMock
    }
  })

  it('should return 400 if message is not provided', async () => {
    req.body = { message: '' }

    await postMessageController(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Message is required' })
  })

  it('should return 400 if message is too long', async () => {
    req.body = { message: 'a'.repeat(141) }

    await postMessageController(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Message is too long' })
  })

  it('should return 503 if IP is undefined', async () => {
    req.body = { message: 'message' }
    req.ip = undefined

    await postMessageController(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(503)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'No service' })
  })

  it('should return 500 if addMessage fails', async () => {
    (addMessage as jest.Mock).mockResolvedValue(false)

    req.body = { message: 'message' }

    await postMessageController(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal error' })
  })

  it('should return 200 if message is received', async () => {
    (addMessage as jest.Mock).mockResolvedValue(true)

    req.body = { message: 'message' }

    await postMessageController(req as Request, res as Response)

    expect(jsonMock).toHaveBeenCalledWith({ info: 'Message received' })
  })
})
