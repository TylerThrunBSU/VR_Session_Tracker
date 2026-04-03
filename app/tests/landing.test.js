const request = require('supertest');
const app = require('../src/app');

describe('Landing Page', () => {

  test('GET / returns 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  test('GET / contains app title', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('VR SESSION TRACKER');
  });

  test('GET / contains session count card', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('TOTAL SESSIONS LOGGED');
  });

  test('GET / contains nav links', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('href="/sessions/new"');
    expect(res.text).toContain('href="/sessions"');
    expect(res.text).toContain('href="/stats"');
  });

  test('GET / contains footer with course info', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('CS 408');
  });

});
