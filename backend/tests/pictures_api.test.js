const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Picture = require('../models/picture')
const User = require('../models/user')

let token
let pictureID

const user = {
  username: 'testuser',
  password: 'testpassword',
}

const picture = {
    title: 'new picture',
    imgURL: 'pictureurl',
    firebaseID: 'firebaseid',
    public: true,
    location: {lat: 60.1699, lng: 24.9384, city: 'Helsinki', country: 'Finland'},
}

beforeAll(async () => {
    await User.deleteMany({})
    await Picture.deleteMany({})
    await api
      .post('/api/users')
      .send({ username: user.username, password: user.password })
  
    const res = await api
      .post('/api/login')
      .send({ username: user.username, password: user.password })
  
    token = `Bearer ${res.body.token}`
    user.id = res.body.id
  })

  test('Posting picture returns 401 without token', async () => {
    await api.post('/api/pictures').send(picture).expect(401)
  })

  test('Posting picture returns 200 and correct data with token', async () => {
      const response = await api.post('/api/pictures').set('Authorization', token).send(picture).expect(200)

      pictureID = response.body.id

      expect(response.body.title).toBe('new picture')
      expect(response.body.imgURL).toBe('pictureurl')
      expect(response.body.firebaseID).toBe('firebaseid')
      expect(response.body.public).toBe(true)
      expect(response.body.voteResult).toBe(0)
      expect(response.body.location).toStrictEqual({ "lat": 60.1699, "lng": 24.9384, "city": 'Helsinki', "country": 'Finland' })
      expect(response.body.date).toBeDefined()
      expect(response.body.comments).toBeDefined()
      expect(response.body.id).toBeDefined()
      expect(response.body.user.username).toBe(user.username)
      expect(response.body.user.avatar).toBeDefined()
      expect(response.body.user.blogs).toBeDefined()
      expect(response.body.user.pictures).toBeDefined()
      expect(response.body.user.joinDate).toBeDefined()
      expect(response.body.user.id).toBe(user.id)
  })

  test('Pictures get request returns correct data', async () => {
    const response = await api.get('/api/pictures').expect(200)
      expect(response.body.length).toBe(1)
      expect(response.body[0].title).toBe('new picture')
      expect(response.body[0].imgURL).toBe('pictureurl')
      expect(response.body[0].firebaseID).toBe('firebaseid')
      expect(response.body[0].public).toBe(true)
      expect(response.body[0].voteResult).toBe(0)
      expect(response.body[0].location).toStrictEqual({ "lat": 60.1699, "lng": 24.9384, "city": 'Helsinki', "country": 'Finland' })
      expect(response.body[0].date).toBeDefined()
      expect(response.body[0].comments).toBeDefined()
      expect(response.body[0].id).toBeDefined()
      expect(response.body[0].user.username).toBe(user.username)
      expect(response.body[0].user.avatar).toBeDefined()
      expect(response.body[0].user.blogs).toBeDefined()
      expect(response.body[0].user.pictures).toBeDefined()
      expect(response.body[0].user.joinDate).toBeDefined()
      expect(response.body[0].user.id).toBe(user.id)
  })

  test('Deleting picture without token returns 401', async () => {
    await api.delete(`/api/pictures/${pictureID}`).expect(401)
  })

  test('Deleting picture with token works in mongo', async () => {
    let pictures = await Picture.find({})
    expect(pictures.length).toBe(1)
    await api.delete(`/api/pictures/${pictureID}`).set('Authorization', token).expect(204)
    pictures = await Picture.find({})
    expect(pictures.length).toBe(0)
  })

  afterAll(async () => {
    mongoose.connection.close()
  })  