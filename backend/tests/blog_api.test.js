/* eslint-disable */
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const Blog = require('../models/blog');

const api = supertest(app);

const user = {
  username: 'testuser',
  password: 'testpassword',
};

let token;
let blogID;

const blog = {
  title: 'blog title',
  description: 'blog description',
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
};

beforeAll(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});
  await api
    .post('/api/users')
    .send({ username: user.username, password: user.password });

  const res = await api
    .post('/api/login')
    .send({ username: user.username, password: user.password });

  token = `Bearer ${res.body.token}`;
});

test('Creating new blog without token returns 401', async () => {
  await api
    .post('/api/blogs')
    .field('title', blog.title)
    .field('description', blog.description)
    .field('content', blog.content)
    .expect(401);
});

test('Creating new blog without cover image with token returns 200', async () => {
  const res = await api
    .post('/api/blogs')
    .set('Content-type', 'multipart/form-data')
    .set('Authorization', token)
    .field('title', blog.title)
    .field('description', blog.description)
    .field('content', blog.content)
    .expect(200);
});

test('Creating new blog with cover image token returns 200', async () => {
  const res = await api
    .post('/api/blogs')
    .set('Content-type', 'multipart/form-data')
    .set('Authorization', token)
    .field('title', blog.title)
    .field('description', blog.description)
    .field('content', blog.content)
    .attach('image', 'images/testimage.jpg')
    .expect(200);
});

test('Creating new blog with duplicate location returns 401', async () => {
  const locations = [
    { lat: 60.17556, lng: 24.93417, city: 'Helsinki', country: 'Finland' },
    { lat: 39.47, lng: -0.376388888, city: 'Valencia', country: 'Spain' },
    { lat: 60.17556, lng: 24.93417, city: 'Helsinki', country: 'Finland' },
    { lat: 40.833333333, lng: 14.25, city: 'Naples', country: 'Italy' },
  ];

  const res = await api
    .post('/api/blogs')
    .set('Content-type', 'multipart/form-data')
    .set('Authorization', token)
    .field('title', blog.title)
    .field('description', blog.description)
    .field('content', blog.content)
    .field('locations', JSON.stringify(locations))
    .attach('image', 'images/testimage.jpg')
    .expect(401);
});

test('Blog with 5 locations returns 200', async () => {
  const locations = [
    {lat: 53.466666666, lng: -2.233333333, city: "Manchester", country: "United Kingdom"},
    {lat: 48.15389, lng: 11.54806, city: "München", country: "Germany"},
    {lat: 35.689722222, lng: 139.692222222, city: "Tokyo", country: "Japan"},
    {lat: 40.67, lng: -73.94, city: "New York City", country: "United States of America"},
    {lat: 60.17556, lng: 24.93417, city: "Helsinki", country: "Finland"},
  ];

  const res = await api
    .post('/api/blogs')
    .set('Content-type', 'multipart/form-data')
    .set('Authorization', token)
    .field('title', blog.title)
    .field('description', blog.description)
    .field('content', blog.content)
    .field('locations', JSON.stringify(locations))
    .attach('image', 'images/testimage.jpg')
    .expect(200);
});

test('Blog with too many locations returns 400', async () => {
  const locations = [
    {lat: 53.466666666, lng: -2.233333333, city: "Manchester", country: "United Kingdom"},
    {lat: 48.15389, lng: 11.54806, city: "München", country: "Germany"},
    {lat: 35.689722222, lng: 139.692222222, city: "Tokyo", country: "Japan"},
    {lat: 40.67, lng: -73.94, city: "New York City", country: "United States of America"},
    {lat: 60.17556, lng: 24.93417, city: "Helsinki", country: "Finland"},
    {lat: 41.15556, lng: -8.62672, city: "Porto", country: "Portugal"},
  ];

  const res = await api
    .post('/api/blogs')
    .set('Content-type', 'multipart/form-data')
    .set('Authorization', token)
    .field('title', blog.title)
    .field('description', blog.description)
    .field('content', blog.content)
    .field('locations', JSON.stringify(locations))
    .attach('image', 'images/testimage.jpg')
    .expect(400);
});

test('Correct fields are returned after new blog submit', async () => {
  const locations = [
    { lat: 60.17556, lng: 24.93417, city: 'Helsinki', country: 'Finland' },
    { lat: 39.47, lng: -0.376388888, city: 'Valencia', country: 'Spain' },
  ];

  const response = await api
    .post('/api/blogs')
    .set('Authorization', token)
    .field('title', blog.title)
    .field('description', blog.description)
    .field('content', blog.content)
    .field('locations', JSON.stringify(locations))
    .expect(200);

  blogID = response.body.id;

  expect(response.body.stars).toBeDefined();
  expect(response.body.comments).toBeDefined();
  expect(response.body.description).toBeDefined();
  expect(response.body.date).toBeDefined();
  expect(response.body.content).toBeDefined();
  expect(response.body.locations).toBeDefined();
  expect(response.body.id).toBeDefined();
  expect(response.body.author).toBeDefined();
  expect(response.body.author.avatar).toBeDefined();
  expect(response.body.author.pictures).toBeDefined();
  expect(response.body.author.id).toBeDefined();
  expect(response.body.author.username).toBe('testuser');
  expect(response.body.headerImageURL).toBeDefined();
  expect(response.body.headerImageID).toBeDefined();

  expect(response.body.locations[0].lat).toBe(60.17556)
  expect(response.body.locations[0].lng).toBe(24.93417)
  expect(response.body.locations[0].city).toBe('Helsinki')
  expect(response.body.locations[0].country).toBe('Finland')

  expect(response.body.locations[1].lat).toBe(39.47)
  expect(response.body.locations[1].lng).toBe(-0.376388888)
  expect(response.body.locations[1].city).toBe('Valencia')
  expect(response.body.locations[1].country).toBe('Spain')
});

test('Blogs get request returns correct data', async () => {
  const response = await api.get('/api/blogs').expect(200);

  expect(response.body.length).toBe(4);

  expect(response.body[0].stars).toBeDefined();
  expect(response.body[0].comments).toBeDefined();
  expect(response.body[0].description).toBeDefined();
  expect(response.body[0].date).toBeDefined();
  expect(response.body[0].content).toBeDefined();
  expect(response.body[0].locations).toBeDefined();
  expect(response.body[0].id).toBeDefined();
  expect(response.body[0].author).toBeDefined();
  expect(response.body[0].author.avatar).toBeDefined();
  expect(response.body[0].author.pictures).toBeDefined();
  expect(response.body[0].author.id).toBeDefined();

  expect(response.body[1].stars).toBeDefined();
  expect(response.body[1].comments).toBeDefined();
  expect(response.body[1].description).toBeDefined();
  expect(response.body[1].date).toBeDefined();
  expect(response.body[1].content).toBeDefined();
  expect(response.body[1].locations).toBeDefined();
  expect(response.body[1].id).toBeDefined();
  expect(response.body[1].author).toBeDefined();
  expect(response.body[1].author.avatar).toBeDefined();
  expect(response.body[1].author.pictures).toBeDefined();
  expect(response.body[1].author.id).toBeDefined();
  expect(response.body[1].author.username).toBe('testuser');
  expect(response.body[1].headerImageURL).toBeDefined();
  expect(response.body[1].headerImageID).toBeDefined();
});

test('Correct fields are returned after blog comment submit', async () => {
  const response = await api
    .post(`/api/blogs/${blogID}/comments`)
    .set('Authorization', token)
    .send({ content: 'new comment' })
    .expect(200);

  expect(response.body.stars).toBeDefined();
  expect(response.body.comments).toBeDefined();
  expect(response.body.description).toBeDefined();
  expect(response.body.date).toBeDefined();
  expect(response.body.content).toBeDefined();
  expect(response.body.locations).toBeDefined();
  expect(response.body.id).toBeDefined();
  expect(response.body.author).toBeDefined();
  expect(response.body.author.avatar).toBeDefined();
  expect(response.body.author.pictures).toBeDefined();
  expect(response.body.author.id).toBeDefined();
  expect(response.body.author.username).toBe('testuser');
  expect(response.body.headerImageURL).toBeDefined();
  expect(response.body.headerImageID).toBeDefined();

  expect(response.body.comments[0].user).toBeDefined();
  expect(response.body.comments[0].date).toBeDefined();
  expect(response.body.comments[0].id).toBeDefined();
  expect(response.body.comments[0].content).toBe('new comment');

  expect(response.body.comments[0].user.avatar).toBeDefined();
  expect(response.body.comments[0].user.pictures).toBeDefined();
  expect(response.body.comments[0].user.id).toBeDefined();
  expect(response.body.comments[0].user.username).toBeDefined();
  expect(response.body.comments[0].user.username).toBe('testuser');

  console.log(response.body.comments[0].user);
  const blog = await Blog.findById(blogID);
  expect(blog.comments.length).toBe(1);
});

test('Adding star works correctly and correct fields are returned', async () => {
  const response = await api
    .put(`/api/blogs/${blogID}/star`)
    .set('Authorization', token)
    .send({ action: 'add' })
    .expect(200);

  expect(response.body.stars.length).toBe(1);

  expect(response.body.stars).toBeDefined();
  expect(response.body.comments).toBeDefined();
  expect(response.body.description).toBeDefined();
  expect(response.body.date).toBeDefined();
  expect(response.body.content).toBeDefined();
  expect(response.body.locations).toBeDefined();
  expect(response.body.id).toBeDefined();
  expect(response.body.author).toBeDefined();
  expect(response.body.author.avatar).toBeDefined();
  expect(response.body.author.pictures).toBeDefined();
  expect(response.body.author.id).toBeDefined();
  expect(response.body.author.username).toBe('testuser');
  expect(response.body.headerImageURL).toBeDefined();
  expect(response.body.headerImageID).toBeDefined();

  expect(response.body.comments[0].user).toBeDefined();
  expect(response.body.comments[0].date).toBeDefined();
  expect(response.body.comments[0].id).toBeDefined();
  expect(response.body.comments[0].content).toBe('new comment');
  expect(response.body.comments[0].user.avatar).toBeDefined();
  expect(response.body.comments[0].user.pictures).toBeDefined();
  expect(response.body.comments[0].user.id).toBeDefined();
  expect(response.body.comments[0].user.username).toBeDefined();
  expect(response.body.comments[0].user.username).toBe('testuser');
});

test('Adding multiple stars not allowed', async () => {
  await api
    .put(`/api/blogs/${blogID}/star`)
    .set('Authorization', token)
    .send({ action: 'add' })
    .expect(401);
});

test('Removing star works correctly and correct fields are returned', async () => {
  const response = await api
    .put(`/api/blogs/${blogID}/star`)
    .set('Authorization', token)
    .send({ action: 'remove' })
    .expect(200);

  expect(response.body.stars.length).toBe(0);

  expect(response.body.stars).toBeDefined();
  expect(response.body.comments).toBeDefined();
  expect(response.body.description).toBeDefined();
  expect(response.body.date).toBeDefined();
  expect(response.body.content).toBeDefined();
  expect(response.body.locations).toBeDefined();
  expect(response.body.id).toBeDefined();
  expect(response.body.author).toBeDefined();
  expect(response.body.author.avatar).toBeDefined();
  expect(response.body.author.pictures).toBeDefined();
  expect(response.body.author.id).toBeDefined();
  expect(response.body.author.username).toBe('testuser');
  expect(response.body.headerImageURL).toBeDefined();
  expect(response.body.headerImageID).toBeDefined();

  expect(response.body.comments[0].user).toBeDefined();
  expect(response.body.comments[0].date).toBeDefined();
  expect(response.body.comments[0].id).toBeDefined();
  expect(response.body.comments[0].content).toBe('new comment');
  expect(response.body.comments[0].user.avatar).toBeDefined();
  expect(response.body.comments[0].user.pictures).toBeDefined();
  expect(response.body.comments[0].user.id).toBeDefined();
  expect(response.body.comments[0].user.username).toBeDefined();
  expect(response.body.comments[0].user.username).toBe('testuser');
});

test('Removing star that does not exist returns 401', async () => {
  await api
    .put(`/api/blogs/${blogID}/star`)
    .set('Authorization', token)
    .send({ action: 'remove' })
    .expect(401);
});

test('Adding star without token returns 401', async () => {
  await api
    .put(`/api/blogs/${blogID}/star`)
    .send({ action: 'add' })
    .expect(401);
});

test('Removing star without token returns 401', async () => {
  await api
    .put(`/api/blogs/${blogID}/star`)
    .send({ action: 'remove' })
    .expect(401);
});

test('Invalid star action returns 401', async () => {
  await api
    .put(`/api/blogs/${blogID}/star`)
    .send({ action: 'asd' })
    .expect(401);
});

test('Missing star action returns 401', async () => {
  await api.put(`/api/blogs/${blogID}/star`).expect(401);
});

test('Deleting blog works in mongo', async () => {
  let blogs = await Blog.find({});
  expect(blogs.length).toBe(4);
  await api
    .delete(`/api/blogs/${blogID}`)
    .set('Authorization', token)
    .expect(204);
  blogs = await Blog.find({});
  expect(blogs.length).toBe(3);
});

afterAll(async () => {
  mongoose.connection.close();
});
