const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const db = require('./bin/db');
const fs = require('fs');

const index = require('./routes/index');

const app = express();

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const dbFileName = process.env.DB_NAME || 'database.sqlite';
const dbPath = path.join(dataDir, dbFileName);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const databaseManager = db.createDatabaseManager(dbPath);

app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'static')));

app.use((req, res, next) => {
  req.db = databaseManager.dbHelpers;
  next();
});

app.use('/', index);

// Test helper — clears DB between tests, only active in test environment
if (process.env.NODE_ENV === 'test') {
  app.post('/__test/clear', (req, res) => {
    req.db.clearDatabase();
    res.sendStatus(200);
  });
}

// 404 fallback
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found', currentPage: '' });
});

module.exports = app;
