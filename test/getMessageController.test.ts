import { Request, Response } from 'express'
import getMessageController from '../src/controllers/getMessageController'

// import { getLastMessagePostedSinceDate, getLastMessageRead, getMessage, setMessageRead } from '../src/db/client'

jest.mock('../src/db/client', () => ({
  getMessage: jest.fn(),
  getLastMessageRead: jest.fn(),
  setMessageRead: jest.fn(),
  getLastMessagePostedSinceDate: jest.fn()
}))

describe('getMessageController', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let jsonMock: jest.Mock
  let statusMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    jsonMock = jest.fn()
    statusMock = jest.fn().mockReturnValue({ json: jsonMock })

    req = {
      body: { message: 'message' },
      ip: '127.0.0.1'
    }

    res = {
      status: statusMock,
      json: jsonMock
    }
  })

  it('should return 503 if IP is undefined', async () => {
    req.ip = undefined

    await getMessageController(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(503)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'No service' })
  })
})
