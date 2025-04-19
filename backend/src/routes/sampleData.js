const express = require('express');
const router = express.Router();
const { fetchMetricsData } = require('../services/database');

router.get('/metrics', async (req, res) => {
    try {
        const data = await fetchMetricsData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch metrics data' });
    }
});

module.exports = router; 