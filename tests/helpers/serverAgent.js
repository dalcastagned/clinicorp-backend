const http = require('http')
const request = require('supertest')
const app = require('../../src/app')

let server
let agent

const startServer = done => {
  server = http.createServer(app)
  server.listen(0, () => {
    agent = request.agent(server)
    done()
  })
}

const closeServer = done => {
  return server.close(done)
}

const getAgent = () => {
  return agent
}

module.exports = {
  startServer,
  closeServer,
  getAgent,
}
