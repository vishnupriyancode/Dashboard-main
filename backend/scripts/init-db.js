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
    ['Sample Data 1', 'Test Value 1', '2024-04-07 10:00:00', 'active'],
    ['Sample Data 2', 'Test Value 2', '2024-04-07 11:00:00', 'inactive'],
    ['Sample Data 3', 'Test Value 3', '2024-04-07 12:00:00', 'active']
  ];
  
  db.serialize(() => {
    // Create table with updated schema
    db.run(`
      CREATE TABLE IF NOT EXISTS sample_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name CHARACTER VARYING(255) NOT NULL,
        value CHARACTER VARYING(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status CHARACTER VARYING(50)
      )
    `);
    
    // Clear existing data
    db.run('DELETE FROM sample_data');
    
    // Insert new data with timestamp
    const stmt = db.prepare('INSERT INTO sample_data (name, value, timestamp, status) VALUES (?, ?, ?, ?)');
    sampleData.forEach(row => {
      stmt.run(row);
    });
    stmt.finalize();
    
    console.log('Sample data inserted successfully');
    db.close();
  });
}); 