const request = require('supertest');
const app = require('../src/app');

// Helper to create a session
const createSession = (overrides = {}) =>
  request(app).post('/sessions').send({
    game_name: 'Orion Drift',
    headset: 'Meta Quest 3',
    duration_minutes: '45',
    session_date: '2026-04-01',
    comfort_rating: '4',
    intensity_rating: '5',
    notes: 'Test session',
    ...overrides,
  });

const getSessionIdByGame = async (gameName) => {
  const res = await request(app).get(`/sessions?game=${encodeURIComponent(gameName)}`);
  const match = res.text.match(/href="\/sessions\/(\d+)"/);
  return match ? match[1] : null;
};

beforeEach(async () => {
  await request(app).post('/__test/clear');
});

describe('Log Session Form', () => {

  test('GET /sessions/new returns 200', async () => {
    const res = await request(app).get('/sessions/new');
    expect(res.status).toBe(200);
  });

  test('GET /sessions/new contains form fields', async () => {
    const res = await request(app).get('/sessions/new');
    expect(res.text).toContain('name="game_name"');
    expect(res.text).toContain('name="headset"');
    expect(res.text).toContain('name="duration_minutes"');
    expect(res.text).toContain('name="session_date"');
    expect(res.text).toContain('name="comfort_rating"');
    expect(res.text).toContain('name="intensity_rating"');
    expect(res.text).toContain('name="notes"');
  });

  test('POST /sessions with valid data redirects to /sessions', async () => {
    const res = await createSession();
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/sessions');
  });

  test('POST /sessions with missing required fields returns 200 with error', async () => {
    const res = await request(app).post('/sessions').send({ game_name: '', headset: '', duration_minutes: '', session_date: '' });
    expect(res.status).toBe(200);
    expect(res.text).toContain('required');
  });

});

describe('Session History', () => {

  test('GET /sessions returns 200', async () => {
    const res = await request(app).get('/sessions');
    expect(res.status).toBe(200);
  });

  test('GET /sessions shows created session', async () => {
    await createSession({ game_name: 'Half-Life: Alyx' });
    const res = await request(app).get('/sessions');
    expect(res.text).toContain('Half-Life: Alyx');
  });

  test('GET /sessions?game= filters by game name', async () => {
    await createSession({ game_name: 'Beat Saber' });
    await createSession({ game_name: 'Superhot VR' });
    const res = await request(app).get('/sessions?game=Beat+Saber');
    expect(res.text).toContain('Beat Saber');
    expect(res.text).not.toContain('Superhot VR');
  });

  test('GET /sessions?headset= filters by headset', async () => {
    await createSession({ game_name: 'Game A', headset: 'Meta Quest 3' });
    await createSession({ game_name: 'Game B', headset: 'Valve Index' });
    const res = await request(app).get('/sessions?headset=Valve+Index');
    expect(res.text).toContain('Game B');
    expect(res.text).not.toContain('Game A');
  });

  test('GET /sessions with no results shows empty state', async () => {
    const res = await request(app).get('/sessions?game=zzznomatch999');
    expect(res.text).toContain('No sessions match your filters');
  });

});

describe('Session Detail', () => {

  test('GET /sessions/:id returns 200 for valid session', async () => {
    const gameName = 'Orion Drift Detail Test';
    await createSession({ game_name: gameName });
    const id = await getSessionIdByGame(gameName);
    const res = await request(app).get(`/sessions/${id}`);
    expect(res.status).toBe(200);
    expect(res.text).toContain(gameName);
  });

  test('GET /sessions/:id returns 404 for invalid id', async () => {
    const res = await request(app).get('/sessions/99999');
    expect(res.status).toBe(404);
  });

  test('POST /sessions/:id/update updates notes and redirects', async () => {
    const gameName = 'Orion Drift Update Test';
    await createSession({ game_name: gameName });
    const id = await getSessionIdByGame(gameName);
    const res = await request(app)
      .post(`/sessions/${id}/update`)
      .send({ comfort_rating: '3', intensity_rating: '2', notes: 'Updated note' });
    expect(res.status).toBe(302);
    const detail = await request(app).get(`/sessions/${id}`);
    expect(detail.text).toContain('Updated note');
  });

  test('POST /sessions/:id/delete removes session and redirects', async () => {
    const gameName = 'Orion Drift Delete Test';
    await createSession({ game_name: gameName });
    const id = await getSessionIdByGame(gameName);
    const res = await request(app).post(`/sessions/${id}/delete`);
    expect(res.status).toBe(302);
    const detail = await request(app).get(`/sessions/${id}`);
    expect(detail.status).toBe(404);
  });

});

describe('Stats Dashboard', () => {

  test('GET /stats returns 200', async () => {
    const res = await request(app).get('/stats');
    expect(res.status).toBe(200);
  });

  test('GET /stats shows stat cards', async () => {
    const res = await request(app).get('/stats');
    expect(res.text).toMatch(/total sessions/i);
    expect(res.text).toMatch(/time played/i);
    expect(res.text).toMatch(/avg duration/i);
    expect(res.text).toMatch(/avg comfort/i);
  });

  test('GET /stats reflects created sessions', async () => {
    await createSession({ game_name: 'Beat Saber', duration_minutes: '60' });
    const res = await request(app).get('/stats');
    expect(res.text).toContain('Beat Saber');
  });

});

describe('404 Page', () => {

  test('unknown route returns 404', async () => {
    const res = await request(app).get('/this-does-not-exist');
    expect(res.status).toBe(404);
  });

  test('404 page contains return home link', async () => {
    const res = await request(app).get('/this-does-not-exist');
    expect(res.text).toContain('404');
    expect(res.text).toMatch(/return to home/i);
  });

});
