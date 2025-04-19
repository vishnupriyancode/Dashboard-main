const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/dashboard.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS sample_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT
      )
    `);
  }
});

module.exports = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows });
        }
      });
    });
  }
}; 