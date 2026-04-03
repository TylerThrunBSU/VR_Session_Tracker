const Database = require('better-sqlite3');

const createSessionsTableSQL = `
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_name TEXT NOT NULL,
    headset TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    session_date TEXT NOT NULL,
    comfort_rating INTEGER,
    intensity_rating INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`;

function createDatabaseManager(dbPath) {
  const database = new Database(dbPath);
  console.log('Database manager created for:', dbPath);
  database.pragma('foreign_keys = ON');
  database.exec(createSessionsTableSQL);

  function ensureConnected() {
    if (!database.open) throw new Error('Database connection is not open');
  }

  return {
    dbHelpers: {

      clearDatabase: () => {
        if (process.env.NODE_ENV === 'test') {
          ensureConnected();
          database.prepare('DELETE FROM sessions').run();
        } else {
          console.warn('clearDatabase called outside of test environment.');
        }
      },

      seedTestData: () => {
        if (process.env.NODE_ENV === 'test') {
          ensureConnected();
          const insert = database.prepare(`
            INSERT INTO sessions (game_name, headset, duration_minutes, session_date, comfort_rating, intensity_rating, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)`);
          const testData = [
            ['Half-Life: Alyx', 'Meta Quest 3', 90, '2026-03-01', 4, 3, 'Great session'],
            ['Beat Saber', 'Meta Quest 3', 45, '2026-03-05', 5, 5, 'Arms are dead'],
            ['Superhot VR', 'Meta Quest 2', 30, '2026-03-10', 3, 4, ''],
          ];
          database.transaction((rows) => {
            for (const r of rows) insert.run(...r);
          })(testData);
        }
      },

      getAllSessions: ({ game, headset, sort } = {}) => {
        let query = 'SELECT * FROM sessions WHERE 1=1';
        const params = [];
        if (game) { query += ' AND game_name LIKE ?'; params.push(`%${game}%`); }
        if (headset) { query += ' AND headset = ?'; params.push(headset); }
        const sortMap = { date: 'session_date DESC', duration: 'duration_minutes DESC', comfort: 'comfort_rating DESC' };
        query += ` ORDER BY ${sortMap[sort] || 'session_date DESC'}`;
        return database.prepare(query).all(...params);
      },

      getSessionById: (id) => database.prepare('SELECT * FROM sessions WHERE id = ?').get(id),

      createSession: ({ game_name, headset, duration_minutes, session_date, comfort_rating, intensity_rating, notes }) => {
        const info = database.prepare(`
          INSERT INTO sessions (game_name, headset, duration_minutes, session_date, comfort_rating, intensity_rating, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(game_name, headset, duration_minutes, session_date, comfort_rating || null, intensity_rating || null, notes || '');
        return info.lastInsertRowid;
      },

      updateSession: (id, { comfort_rating, intensity_rating, notes }) => {
        const info = database.prepare(
          'UPDATE sessions SET comfort_rating = ?, intensity_rating = ?, notes = ? WHERE id = ?'
        ).run(comfort_rating || null, intensity_rating || null, notes || '', id);
        return info.changes;
      },

      deleteSession: (id) => database.prepare('DELETE FROM sessions WHERE id = ?').run(id).changes,

      getStats: () => {
        const total = database.prepare('SELECT COUNT(*) AS c FROM sessions').get().c;
        const totalMinutes = database.prepare('SELECT SUM(duration_minutes) AS s FROM sessions').get().s || 0;
        const avgDuration = database.prepare('SELECT ROUND(AVG(duration_minutes), 1) AS a FROM sessions').get().a || 0;
        const avgComfort = database.prepare('SELECT ROUND(AVG(comfort_rating), 1) AS a FROM sessions WHERE comfort_rating IS NOT NULL').get().a || 0;
        const topGames = database.prepare('SELECT game_name, COUNT(*) AS session_count FROM sessions GROUP BY game_name ORDER BY session_count DESC LIMIT 5').all();
        const byHeadset = database.prepare('SELECT headset, COUNT(*) AS session_count FROM sessions GROUP BY headset ORDER BY session_count DESC').all();
        return { total, totalMinutes, avgDuration, avgComfort, topGames, byHeadset };
      },

      getTotalSessions: () => database.prepare('SELECT COUNT(*) AS c FROM sessions').get().c,
    }
  };
}

module.exports = { createDatabaseManager };
