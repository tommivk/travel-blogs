const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const Blog = require('../models/blog')

let token
const newBlog = {
  title: 'blog title',
  description: 'blog description',
  content: 'blog content',
}

beforeEach(async () => {
  await User.deleteMany({})
  await api
    .post('/api/users')
    .send({ username: 'testuser', password: 'testpassword' })

  const res = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'testpassword' })
  token = `Bearer ${res.body.token}`
})

test('Creating new blog without token returns 401', async () => {
  await api.post('/api/blogs').send(newBlog).expect(401)
})
test('Creating new blog with token returns 200', async () => {
  await api
    .post('/api/blogs')
    .set('Authorization', token)
    .send(newBlog)
    .expect(200)
})
afterAll(async () => {
  mongoose.connection.close()
})
