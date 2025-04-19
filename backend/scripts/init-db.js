const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/dashboard.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  
  console.log('Connected to SQLite database');
  
  // Insert sample data
  const sampleData = [
    ['API Request 1', '200ms', 'success'],
    ['API Request 2', '150ms', 'success'],
    ['API Request 3', '500ms', 'failed'],
    ['API Request 4', '300ms', 'success'],
    ['API Request 5', '450ms', 'pending']
  ];
  
  db.serialize(() => {
    // Create table
    db.run(`
      CREATE TABLE IF NOT EXISTS sample_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT
      )
    `);
    
    // Clear existing data
    db.run('DELETE FROM sample_data');
    
    // Insert new data
    const stmt = db.prepare('INSERT INTO sample_data (name, value, status) VALUES (?, ?, ?)');
    sampleData.forEach(row => {
      stmt.run(row);
    });
    stmt.finalize();
    
    console.log('Sample data inserted successfully');
    db.close();
  });
}); 