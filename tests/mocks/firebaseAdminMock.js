const mockBatch = {
  set: jest.fn(),
  commit: jest.fn().mockResolvedValue({}),
}

const mockDoc = data => ({
  id: data.id || 'mock-id',
  data: jest.fn(() => data),
})

const mockCollection = (docs = []) => ({
  doc: jest.fn(id => {
    const existingDoc = docs.find(d => d.id === id)
    return {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(mockDoc(existingDoc || { id, ...defaultDocDataForGet })),
    }
  }),
  get: jest.fn().mockResolvedValue({
    empty: docs.length === 0,
    docs: docs.map(docData => mockDoc(docData)),
    forEach: callback => docs.map(docData => mockDoc(docData)).forEach(callback),
  }),
  orderBy: jest.fn().mockReturnThis(),
})

let defaultDocDataForGet = {}

const mockFirestore = {
  collection: jest.fn(collectionName => {
    if (collectionName === 'tasks') {
      return mockCollection()
    }
    return mockCollection()
  }),
  batch: jest.fn(() => mockBatch),
}

const mockAdmin = {
  initializeApp: jest.fn(),
  firestore: jest.fn(() => mockFirestore),
}

module.exports = {
  mockAdmin,
  mockFirestore,
  mockBatch,
  mockCollection,
  setMockDocDataForGet: data => {
    defaultDocDataForGet = data
  },
}
