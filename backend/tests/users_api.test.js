const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')


let token
let userID

let secondUserID

beforeAll(async () => {
  await User.deleteMany({})
  await api
    .post('/api/users')
    .send({ username: 'testuser', password: 'testpassword' })

  await api
    .post('/api/users')
    .send({ username: 'secondUser', password: 'testpassword' })

  const res = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'testpassword' })
  
  const res2 = await api
    .post('/api/login')
    .send({ username: 'secondUser', password: 'testpassword' })

  token = `Bearer ${res.body.token}`
  userID = res.body.id

  secondUserID = res2.body.id
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
    .send({ username: 'testuser2', password: 'testpassword2' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
})

test('creating new user that already exists returns 400', async () => {
  await api
    .post('/api/users')
    .send({ username: 'testuser', password: 'testpassword' })
    .expect(400)
})

test('get users returns json', async () => {
  await api.get('/api/users').expect(200).expect('Content-Type', /json/)
})

test('updating username without token returns 401', async () => {
  await api.put(`/api/users/${userID}`)
    .field('username', 'newUsername')
    .expect(401)
})

test('updating avatar without token returns 401', async () => {
  await api.put(`/api/users/${userID}`)
    .attach('image', 'images/testimage.jpg')
    .expect(401)
})

test('updating username and avatar without token returns 401', async () => {
  await api.put(`/api/users/${userID}`)
    .field('username', 'newUsername')
    .attach('image', 'images/testimage.jpg')
    .expect(401)
})

test('updating username with token returns 200', async () => {
  const res = await api.put(`/api/users/${userID}`)
    .set('Authorization', token)
    .field('username', 'newUsername')
    .expect(200)

    expect(res.body.username).toBe('newUsername')
})

test('updating avatar with token returns 200', async () => {
  const res = await api.put(`/api/users/${userID}`)
    .set('Authorization', token)
    .attach('image', 'images/testimage.jpg')
    .expect(200)

    expect(res.body.username).toBe('newUsername')
    expect(res.body.avatar).toBeDefined();
})

test('trying to update another user with own token returns 401', async () => {
  const res = await api.put(`/api/users/${secondUserID}`)
    .set('Authorization', token)
    .field('username', 'newUsername')
    .expect(401)
})

test('updating username and avatar with token returns 200', async () => {
  const res = await api.put(`/api/users/${userID}`)
    .set('Authorization', token)
    .field('username', 'newUser')
    .attach('image', 'images/testimage.jpg')
    .expect(200)

    expect(res.body.username).toBe('newUser')
    expect(res.body.avatar).toBeDefined();
})

test('subscribing without token returns 401', async () => {
  const res = await api.put(`/api/users/${secondUserID}/subscription`)
    .send({ "blogSubscription": true, "pictureSubscription": true })
    .expect(401)
})

test('subscribing with token returns 200', async () => {
  const res = await api.put(`/api/users/${secondUserID}/subscription`)
    .set('Authorization', token)
    .send({ "blogSubscription": true, "pictureSubscription": true })
    .expect(200)
})

test('subscribing to self returns 401', async () => {
  const res = await api.put(`/api/users/${userID}/subscription`)
    .set('Authorization', token)
    .send({ "blogSubscription": true, "pictureSubscription": true })
    .expect(401)
})

test('deleting user without token returns 401', async () => {
  const res = await api.delete(`/api/users/${userID}`)
    .expect(401)
})

test('deleting user with token returns 204', async () => {
  const res = await api.delete(`/api/users/${userID}`)
    .set('Authorization', token)
    .expect(204)
})

test('trying to delete another user with own token returns 401', async () => {
  const res = await api.delete(`/api/users/${secondUserID}`)
    .set('Authorization', token)
    .expect(401)
})


afterAll(() => {
  mongoose.connection.close()
})
