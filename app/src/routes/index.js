const express = require('express');
const router = express.Router();

const HEADSETS = ['Meta Quest 3', 'Meta Quest 2', 'Valve Index', 'HTC Vive', 'PlayStation VR2', 'Other'];

// Landing page
router.get('/', (req, res) => {
  const total = req.db.getTotalSessions();
  res.render('index', { title: 'VR Session Tracker', total, currentPage: 'home' });
});

// Log session form
router.get('/sessions/new', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.render('log-session', { title: 'Log a Session', headsets: HEADSETS, today, currentPage: 'log', error: null });
});

// Create session
router.post('/sessions', (req, res) => {
  const { game_name, headset, duration_minutes, session_date, comfort_rating, intensity_rating, notes } = req.body;
  if (!game_name || !headset || !duration_minutes || !session_date) {
    const today = new Date().toISOString().split('T')[0];
    return res.render('log-session', {
      title: 'Log a Session', headsets: HEADSETS, today, currentPage: 'log',
      error: 'Game name, headset, duration, and date are required.'
    });
  }
  req.db.createSession({ game_name, headset, duration_minutes: parseInt(duration_minutes), session_date, comfort_rating, intensity_rating, notes });
  res.redirect('/sessions');
});

// Session history
router.get('/sessions', (req, res) => {
  const { game, headset, sort } = req.query;
  const sessions = req.db.getAllSessions({ game, headset, sort });
  res.render('history', { title: 'Session History', sessions, headsets: HEADSETS, game, headset, sort, currentPage: 'history' });
});

// Session detail
router.get('/sessions/:id', (req, res) => {
  const session = req.db.getSessionById(req.params.id);
  if (!session) return res.status(404).render('404', { title: '404', currentPage: '' });
  res.render('session-detail', { title: `Session #${session.id}`, session, currentPage: 'history' });
});

// Update session
router.post('/sessions/:id/update', (req, res) => {
  const session = req.db.getSessionById(req.params.id);
  if (!session) return res.status(404).render('404', { title: '404', currentPage: '' });
  const { comfort_rating, intensity_rating, notes } = req.body;
  req.db.updateSession(req.params.id, { comfort_rating, intensity_rating, notes });
  res.redirect(`/sessions/${req.params.id}`);
});

// Delete session
router.post('/sessions/:id/delete', (req, res) => {
  req.db.deleteSession(req.params.id);
  res.redirect('/sessions');
});

// Stats dashboard
router.get('/stats', (req, res) => {
  const stats = req.db.getStats();
  res.render('stats', { title: 'Stats Dashboard', stats, currentPage: 'stats' });
});

// 404 catch-all
router.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found', currentPage: '' });
});

module.exports = router;
