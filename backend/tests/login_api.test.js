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

test('login returns 401 with incorrect password', async () => {
  await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'testpassword2' })
    .expect(401)
})

test('login returns 401 with incorrect username', async () => {
  await api
    .post('/api/login')
    .send({ username: 'testuser2', password: 'testpassword' })
    .expect(401)
})

test('login returns 401 with empty password', async () => {
  await api
    .post('/api/login')
    .send({ username: 'testuser', password: '' })
    .expect(401)
})

test('login returns 401 with empty fields', async () => {
  await api
    .post('/api/login')
    .send({ username: '', password: '' })
    .expect(401)
})

test('login returns 401 without password field', async () => {
  await api.post('/api/login').send({ username: 'testuser' }).expect(401)
})

test('login returns 401 without username field', async () => {
  await api.post('/api/login').send({ password: 'testpassword' }).expect(401)
})

test('login returns 401 without credentials', async () => {
  await api.post('/api/login').send({}).expect(401)
})

test('login returns 200 with correct credentials', async () => {
  await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'testpassword' })
    .expect(200)
})

test('login returns correct fields', async () => {
  const response = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'testpassword' })
    .expect(200)

  expect(response.body.passwordHash).not.toBeDefined()
  expect(response.body.username).toBeDefined()
  expect(response.body.token).toBeDefined()
  expect(response.body.avatar).toBeDefined()
  expect(response.body.id).toBeDefined()
  expect(response.body.pictures).toBeDefined()
  expect(response.body.blogs).toBeDefined()
  expect(response.body.joinDate).toBeDefined()

  expect(response.body.username).toEqual('testuser')
})

afterAll(async () => {
  mongoose.connection.close()
})
