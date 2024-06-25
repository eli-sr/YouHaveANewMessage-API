import { Request, Response } from 'express'
import getMessageController from '../src/controllers/getMessageController'

import * as client from '../src/db/client'
import { isCreatedAtWithinLastDay } from '../src/utils'
import ErrorAPI from '../src/classes/ErrorAPI'

jest.mock('../src/db/client', () => ({
  getMessage: jest.fn(),
  getLastMessageRead: jest.fn(),
  setMessageRead: jest.fn(),
  getLastMessagePostedSinceDate: jest.fn()
}))

jest.mock('../src/utils', () => ({
  getIp: jest.requireActual('../src/utils').getIp,
  isCreatedAtWithinLastDay: jest.fn()
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

  it('should return 404 if there is no message to read', async () => {
    const getMessageMock = client.getMessage as jest.Mock
    const getLastMessageReadMock = client.getLastMessageRead as jest.Mock
    getMessageMock.mockResolvedValue(null)
    getLastMessageReadMock.mockResolvedValue(null)

    await getMessageController(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(404)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'There is no message to read' })
  })

  it('should return 500 if setMessageRead fails', async () => {
    const getMessageMock = client.getMessage as jest.Mock
    const getLastMessageReadMock = client.getLastMessageRead as jest.Mock
    const setMessageReadMock = client.setMessageRead as jest.Mock
    getMessageMock.mockResolvedValue({ id: 1, content: 'message' })
    getLastMessageReadMock.mockResolvedValue(null)
    setMessageReadMock.mockImplementation(() => {
      throw new ErrorAPI('Internal Server Error')
    })

    await getMessageController(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal Server Error' })
  })

  it('should return last message read if there is no message posted', async () => {
    const getMessageMock = client.getMessage as jest.Mock
    const getLastMessageReadMock = client.getLastMessageRead as jest.Mock
    const getLastMessagePostedSinceDateMock = client.getLastMessagePostedSinceDate as jest.Mock
    getMessageMock.mockResolvedValue({
      id: 2,
      content: 'message'
    })
    getLastMessageReadMock.mockResolvedValue({
      id: 1,
      content: 'last message read'
    })
    getLastMessagePostedSinceDateMock.mockResolvedValue(null)

    await getMessageController(req as Request, res as Response)

    expect(jsonMock).toHaveBeenCalledWith({ wait: false, lastMessage: 'last message read' })
  })

  it('should return wait if last message posted is within last day', async () => {
    const getMessageMock = client.getMessage as jest.Mock
    const getLastMessageReadMock = client.getLastMessageRead as jest.Mock
    const getLastMessagePostedSinceDateMock = client.getLastMessagePostedSinceDate as jest.Mock
    const isCreatedAtWithinLastDayMock = isCreatedAtWithinLastDay as jest.Mock
    getMessageMock.mockResolvedValue({
      id: 2,
      content: 'message'
    })
    getLastMessageReadMock.mockResolvedValue({
      id: 1,
      content: 'last message read'
    })
    getLastMessagePostedSinceDateMock.mockResolvedValue({
      id: 3,
      content: 'last message posted'
    })
    isCreatedAtWithinLastDayMock.mockReturnValue(true)

    await getMessageController(req as Request, res as Response)

    expect(jsonMock).toHaveBeenCalledWith({ wait: true })
  })

  it('should return message if posted 1 day ago or more', async () => {
    const getMessageMock = client.getMessage as jest.Mock
    const getLastMessageReadMock = client.getLastMessageRead as jest.Mock
    const getLastMessagePostedSinceDateMock = client.getLastMessagePostedSinceDate as jest.Mock
    const isCreatedAtWithinLastDayMock = isCreatedAtWithinLastDay as jest.Mock
    const setMessageReadMock = client.setMessageRead as jest.Mock
    setMessageReadMock.mockResolvedValue(true)
    getMessageMock.mockResolvedValue({
      id: 2,
      content: 'message'
    })
    getLastMessageReadMock.mockResolvedValue({
      id: 1,
      content: 'last message read'
    })
    getLastMessagePostedSinceDateMock.mockResolvedValue({
      id: 3,
      content: 'last message posted'
    })
    isCreatedAtWithinLastDayMock.mockReturnValue(false)

    await getMessageController(req as Request, res as Response)

    expect(jsonMock).toHaveBeenCalledWith({ wait: false, lastMessage: 'message' })
  })
})
