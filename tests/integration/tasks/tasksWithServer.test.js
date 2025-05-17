const { db } = require('../../../src/config/firebase')
const { startServer, closeServer, getAgent } = require('../../helpers/serverAgent')

jest.mock('../../../src/config/firebase', () => {
  const mockFirestoreBatch = {
    set: jest.fn(),
    commit: jest.fn().mockResolvedValue({}),
  }
  const mockFirestoreCollection = {
    doc: jest.fn(() => ({ set: jest.fn() })),
    get: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
  }
  return {
    db: {
      collection: jest.fn(() => mockFirestoreCollection),
      batch: jest.fn(() => mockFirestoreBatch),
    },
  }
})

describe('Task API Endpoints with HTTP server', () => {
  beforeAll(startServer)
  afterAll(closeServer)

  it('should handle Firestore errors gracefully during insert', async () => {
    const agent = getAgent()

    const specificError = new Error('Firestore commit error')
    const mockCommit = jest.fn().mockRejectedValueOnce(specificError)
    db.batch.mockImplementation(() => ({
      set: jest.fn(),
      commit: mockCommit,
    }))

    const tasksPayload = [{ description: 'Task to fail', responsable: 'Tester', status: 'todo' }]
    const response = await agent.post('/insert-tasks').send(tasksPayload)

    expect(response.statusCode).toBe(500)
    expect(response.body.message).toBe('Firestore commit error')
  })

  it('should handle Firestore errors gracefully during get', async () => {
    const agent = getAgent()
    db.collection().get.mockRejectedValueOnce(new Error('Firestore get error'))
    const response = await agent.get('/get-tasks')

    expect(response.statusCode).toBe(500)
    expect(response.body.message).toContain('Firestore get error')
  })

  it('should handle server errors gracefully', async () => {
    const agent = getAgent()
    const specificError = new Error()
    db.collection().get.mockRejectedValueOnce(specificError)
    const response = await agent.get('/get-tasks')

    expect(response.statusCode).toBe(500)
    expect(response.body.message).toContain('Ocorreu um erro interno no servidor.')
  })
})
