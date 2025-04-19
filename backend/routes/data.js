const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/fetch-data-a', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sample_data ORDER BY timestamp DESC');
    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports = router; 