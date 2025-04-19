const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/fetch-data-a', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sample_data');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports = router; 