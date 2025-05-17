const taskService = require('../../../src/services/taskService')
const { db, admin } = require('../../../src/config/firebase')

jest.mock('../../../src/config/firebase', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    batch: jest.fn(() => ({
      set: jest.fn(),
      commit: jest.fn().mockResolvedValue({}),
    })),
  },
}))

jest.mock('os', () => ({
  hostname: jest.fn(() => 'test-hostname'),
}))

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}))

describe('Task Service', () => {
  let mockBatch
  let mockCollectionRef

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2025-05-17T00:00:00.000Z'))

    mockBatch = {
      set: jest.fn(),
      commit: jest.fn().mockResolvedValue({}),
    }
    db.batch.mockReturnValue(mockBatch)

    const mockDocRef = { set: jest.fn() }
    mockCollectionRef = {
      doc: jest.fn().mockReturnValue(mockDocRef),
      get: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
    }
    db.collection.mockImplementation(collectionName => {
      if (collectionName === 'tasks') {
        return mockCollectionRef
      }
      return {
        doc: jest.fn().mockReturnThis(),
        set: jest.fn(),
        get: jest.fn(),
        orderBy: jest.fn().mockReturnThis(),
      }
    })
  })

  describe('createTasks', () => {
    it('should insert tasks with hostname and generated ID, then commit batch', async () => {
      const tasksData = [
        { description: 'Test Task 1', responsable: 'User A', status: 'todo' },
        { description: 'Test Task 2', responsable: 'User B', status: 'doing' },
      ]

      const expectedHostname = 'test-hostname'
      const expectedTaskId = 'mock-uuid-1234'

      const result = await taskService.createTasks(tasksData)

      expect(db.collection).toHaveBeenCalledWith('tasks')
      expect(mockCollectionRef.doc).toHaveBeenCalledTimes(tasksData.length)
      expect(require('uuid').v4).toHaveBeenCalledTimes(tasksData.length)

      expect(mockBatch.set).toHaveBeenCalledTimes(tasksData.length)
      expect(mockBatch.set).toHaveBeenNthCalledWith(1, expect.anything(), {
        id: expectedTaskId,
        description: tasksData[0].description,
        responsable: tasksData[0].responsable,
        status: tasksData[0].status,
        computer: expectedHostname,
        createdAt: '2025-05-17T00:00:00.000Z',
      })
      expect(mockBatch.set).toHaveBeenNthCalledWith(2, expect.anything(), {
        id: expectedTaskId,
        description: tasksData[1].description,
        responsable: tasksData[1].responsable,
        status: tasksData[1].status,
        computer: expectedHostname,
        createdAt: '2025-05-17T00:00:00.000Z',
      })
      expect(mockBatch.commit).toHaveBeenCalledTimes(1)

      expect(result).toHaveLength(tasksData.length)
      expect(result[0]).toHaveProperty('id', expectedTaskId)
      expect(result[0].computer).toBe(expectedHostname)
      expect(result[0]).toHaveProperty('createdAt')
    })

    it('should throw error if tasksData is empty', async () => {
      try {
        await taskService.createTasks([])
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toBe('Erro de validação.')
        expect(err.details).toBe('É necessário enviar pelo menos uma tarefa')
      }
    })

    it('should throw validation error if a task is missing required fields', async () => {
      const tasksData = [{ description: 'Valid Task', responsable: 'User' }]

      try {
        await taskService.createTasks(tasksData)
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toBe('Erro de validação.')
        expect(err.details).toBe('O campo status é obrigatório')
      }
    })
  })

  describe('getAllTasks', () => {
    it('should return all tasks from Firestore', async () => {
      const mockTasks = [
        {
          id: '1',
          description: 'Task 1',
          status: 'todo',
          computer: 'host1',
        },
        {
          id: '2',
          description: 'Task 2',
          status: 'doing',
          computer: 'host2',
        },
      ]
      mockCollectionRef.get.mockResolvedValue({
        empty: false,
        docs: mockTasks.map(task => ({ id: task.id, data: () => task })),
        forEach: function (callback) {
          this.docs.forEach(callback)
        },
      })

      const tasks = await taskService.getAllTasks()

      expect(db.collection).toHaveBeenCalledWith('tasks')
      expect(mockCollectionRef.orderBy).toHaveBeenCalledWith('createdAt', 'desc')
      expect(mockCollectionRef.get).toHaveBeenCalledTimes(1)
      expect(tasks).toEqual(mockTasks)
    })

    it('should return an empty array if no tasks are found', async () => {
      mockCollectionRef.get.mockResolvedValue({
        empty: true,
        docs: [],
        forEach: function (callback) {
          this.docs.forEach(callback)
        },
      })
      const tasks = await taskService.getAllTasks()
      expect(tasks).toEqual([])
    })
  })
})
