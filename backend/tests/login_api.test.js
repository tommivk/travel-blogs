const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
  await api
    .post('/api/users')
    .send({ username: 'testuser', password: 'testpassword' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
})

test('login in return 200', async () => {
  await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'testpassword' })
    .expect(200)
})

afterAll(async () => {
  mongoose.connection.close()
})
