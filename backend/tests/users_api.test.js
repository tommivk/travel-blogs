const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
})

test('creating new user without password returns 400', async () => {
  await api.post('/api/users').send({ username: 'testuser' }).expect(400)
})

test('creating user without username returns 400', async () => {
  await api.post('/api/users').send({ password: 'testpassword' }).expect(400)
})

test('creating user without username and password returns 400', async () => {
  await api.post('/api/users').send({}).expect(400)
})

test('creating new user returns 200 and json', async () => {
  await api
    .post('/api/users')
    .send({ username: 'testuser', password: 'testpassword' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
})

test('get users returns json', async () => {
  await api.get('/api/users').expect(200).expect('Content-Type', /json/)
})

afterAll(() => {
  mongoose.connection.close()
})
