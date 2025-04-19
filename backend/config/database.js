const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/dashboard.sqlite');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
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
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        process.exit(1);
      }
      console.log('Table created or already exists');
    });
  }
});

module.exports = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      console.log('Executing query:', sql);
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Query error:', err);
          reject(err);
        } else {
          console.log('Query successful, rows:', rows);
          resolve(rows);
        }
      });
    });
  }
}; 