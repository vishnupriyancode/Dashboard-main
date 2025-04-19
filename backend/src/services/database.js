const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sample_data',
    password: 'vishnu1995',
    port: 5432,
});

const fetchMetricsData = async () => {
    try {
        const query = `
            SELECT 
                id,
                name,
                value,
                timestamp,
                status
            FROM metrics_data
            ORDER BY timestamp DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching metrics data:', error);
        throw error;
    }
};

module.exports = {
    fetchMetricsData
};