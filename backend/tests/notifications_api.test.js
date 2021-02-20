const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Notification = require('../models/notification');
const User = require('../models/user');

let token;
let userID;

let secondUserID;

let notificationID;

beforeAll(async () => {
  await User.deleteMany({});
  await Notification.deleteMany({});

  await api
    .post('/api/users')
    .send({ username: 'testuser', password: 'testpassword' });

  await api
    .post('/api/users')
    .send({ username: 'secondUser', password: 'testpassword' });

  const res = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'testpassword' });

  const res2 = await api
    .post('/api/login')
    .send({ username: 'secondUser', password: 'testpassword' });

  token = `Bearer ${res.body.token}`;
  userID = res.body.id;

  secondUserID = res2.body.id;
});

test('Get request to notifications returns json data', async () => {
  await api
    .get('/api/notifications')
    .expect(200)
    .expect('Content-Type', /json/);
});

test('User is sent welcome notification', async () => {
  const res = await api
    .get(`/api/notifications/user/${userID}`)
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res.body[0].content.message).toBe('Welcome to travelblogs testuser!');
  expect(res.body[0].content.contentType).toBe('welcome');
});

test('User is sent welcome notification', async () => {
  const res = await api
    .get(`/api/notifications/user/${userID}`)
    .expect(200)
    .expect('Content-Type', /json/);

  expect(res.body[0].content.message).toBe('Welcome to travelblogs testuser!');
  expect(res.body[0].content.contentType).toBe('welcome');

  notificationID = res.body[0].id;
});

test('Put request without token returns 401', async () => {
    const res = await api
      .put(`/api/notifications/${notificationID}`)
      .expect(401)
  });

test('User can set notification as read', async () => {
    const res = await api
      .put(`/api/notifications/${notificationID}`)
      .set('Authorization', token)
      .expect(200)

    expect(res.body.readBy[0].id).toBe(userID);
  });

afterAll(() => {
  mongoose.connection.close();
});
