const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API Routes
app.get('/api/fetch-data-a', async (req, res) => {
  try {
    console.log('Fetching data from database...');
    const result = await db.query('SELECT * FROM sample_data ORDER BY timestamp DESC');
    console.log('Query result:', result);
    if (!result || result.length === 0) {
      console.log('No data found in database');
      return res.json({ data: [] });
    }
    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
}); 