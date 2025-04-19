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

router.get('/daily-report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = `
      SELECT 
        name,
        value,
        timestamp,
        status
      FROM sample_data
    `;
    
    if (startDate && endDate) {
      query += ` WHERE timestamp BETWEEN ? AND ?`;
    }
    
    query += ` ORDER BY timestamp DESC`;
    
    const params = startDate && endDate ? [startDate, endDate] : [];
    const result = await db.query(query, params);
    
    // Group the data by metric type
    const groupedData = result.reduce((acc, row) => {
      if (!acc[row.name]) {
        acc[row.name] = [];
      }
      acc[row.name].push({
        value: row.value,
        timestamp: row.timestamp,
        status: row.status
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedData
    });
  } catch (error) {
    console.error('Error fetching daily report data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch daily report data' 
    });
  }
});

module.exports = router; 