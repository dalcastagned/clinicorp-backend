const request = require('supertest')
const app = require('../../../src/app')
const { db } = require('../../../src/config/firebase')
const os = require('os')

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

jest.mock('os')
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'integration-test-uuid'),
}))

describe('Task API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2025-05-17T00:00:00.000Z'))
    os.hostname.mockReturnValue('test-server-hostname')
  })

  describe('POST /insert-tasks', () => {
    it('should create tasks and return 201 with the created tasks', async () => {
      const tasksPayload = [
        { description: 'Integration Test Task 1', responsable: 'Tester', status: 'todo' },
        { description: 'Integration Test Task 2', responsable: 'Tester', status: 'doing' },
      ]

      const response = await request(app).post('/insert-tasks').send(tasksPayload)

      expect(response.statusCode).toBe(201)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(tasksPayload.length)
      expect(response.body[0].description).toBe(tasksPayload[0].description)
      expect(response.body[0].computer).toBe('test-server-hostname')
      expect(response.body[0].id).toBe('integration-test-uuid')
      expect(db.batch().commit).toHaveBeenCalledTimes(1)
    })

    it('should return 400 if payload is invalid (e.g., empty array)', async () => {
      const response = await request(app).post('/insert-tasks').send([])

      expect(response.statusCode).toBe(400)
      expect(response.body.message).toBe('Erro de validação.')
      expect(response.body.details).toContain('É necessário enviar pelo menos uma tarefa')
    })

    it('should return 400 if a task in payload is invalid (e.g., missing description)', async () => {
      const tasksPayload = [{ responsable: 'Tester', status: 'todo' }]
      const response = await request(app).post('/insert-tasks').send(tasksPayload)

      expect(response.statusCode).toBe(400)
      expect(response.body.message).toBe('Erro de validação.')
      expect(response.body.details).toContain('O campo descrição é obrigatório')
    })
  })

  describe('GET /get-tasks', () => {
    it('should return 200 with an array of tasks', async () => {
      const mockTasks = [
        {
          id: 'task1',
          description: 'Fetched Task 1',
          computer: 'test-server-hostname',
          status: 'todo',
        },
        {
          id: 'task2',
          description: 'Fetched Task 2',
          computer: 'test-server-hostname',
          status: 'doing',
        },
      ]

      db.collection().get.mockResolvedValue({
        empty: false,
        docs: mockTasks.map(task => ({ id: task.id, data: () => task })),
        forEach: function (callback) {
          this.docs.forEach(callback)
        },
      })

      const response = await request(app).get('/get-tasks')

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(mockTasks.length)
      expect(response.body[0].description).toBe(mockTasks[0].description)
      expect(db.collection().orderBy).toHaveBeenCalledWith('createdAt', 'desc')
    })

    it('should return 200 with an empty array if no tasks exist', async () => {
      db.collection().get.mockResolvedValue({
        empty: true,
        docs: [],
        forEach: function (callback) {
          this.docs.forEach(callback)
        },
      })

      const response = await request(app).get('/get-tasks')

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual([])
    })
  })
})
