const taskController = require('../../../src/controllers/taskController')
const taskService = require('../../../src/services/taskService')
const { StatusCodes } = require('http-status-codes')

jest.mock('../../../src/services/taskService')

describe('Task Controller', () => {
  let mockRequest
  let mockResponse
  let mockNext

  beforeEach(() => {
    mockRequest = {
      body: {},
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const tasksData = [
    {
      id: '1',
      description: 'Task 1',
      status: 'todo',
      computer: 'host1',
    },
  ]

  describe('handleCreateTasks', () => {
    it('should call taskService.createTasks and return 201 with created tasks', async () => {
      const createdTasksResult = [{ id: '1', ...tasksData[0], computer: 'test-host' }]
      mockRequest.body = tasksData
      taskService.createTasks.mockResolvedValue(createdTasksResult)

      await taskController.handleCreateTasks(mockRequest, mockResponse, mockNext)

      expect(taskService.createTasks).toHaveBeenCalledWith(tasksData)
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.CREATED)
      expect(mockResponse.json).toHaveBeenCalledWith(createdTasksResult)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should call next with error if taskService.createTasks throws an error', async () => {
      const error = new Error('Service error')
      error.statusCode = 500
      mockRequest.body = tasksData
      taskService.createTasks.mockRejectedValue(error)

      await taskController.handleCreateTasks(mockRequest, mockResponse, mockNext)

      expect(taskService.createTasks).toHaveBeenCalledWith(tasksData)
      expect(mockNext).toHaveBeenCalledWith(error)
      expect(mockResponse.status).not.toHaveBeenCalled()
      expect(mockResponse.json).not.toHaveBeenCalled()
    })
  })

  describe('handleGetAllTasks', () => {
    it('should call taskService.getAllTasks and return 200 with tasks', async () => {
      const tasksResult = [{ id: '1', description: 'Task 1', status: 'todo', computer: 'host1' }]
      taskService.getAllTasks.mockResolvedValue(tasksResult)

      await taskController.handleGetAllTasks(mockRequest, mockResponse, mockNext)

      expect(taskService.getAllTasks).toHaveBeenCalledTimes(1)
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK)
      expect(mockResponse.json).toHaveBeenCalledWith(tasksResult)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should call next with error if taskService.getAllTasks throws an error', async () => {
      const error = new Error('Service error')
      taskService.getAllTasks.mockRejectedValue(error)

      await taskController.handleGetAllTasks(mockRequest, mockResponse, mockNext)

      expect(taskService.getAllTasks).toHaveBeenCalledTimes(1)
      expect(mockNext).toHaveBeenCalledWith(error)
      expect(mockResponse.status).not.toHaveBeenCalled()
    })
  })
})
