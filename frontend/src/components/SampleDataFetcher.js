import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SampleDataFetcher.css';

const MetricsTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:5001/api/metrics');
            setData(response.data);
        } catch (err) {
            setError('Failed to fetch metrics data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        // Refresh data every 5 minutes
        const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'status-active';
            case 'warning':
                return 'status-warning';
            case 'inactive':
                return 'status-inactive';
            default:
                return '';
        }
    };

    return (
        <div className="metrics-container">
            <div className="metrics-header">
                <h2>System Metrics</h2>
                <button 
                    onClick={fetchMetrics}
                    className="refresh-button"
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="metrics-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Value</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.id}>
                                <td>{row.id}</td>
                                <td>{row.name}</td>
                                <td>{row.value}</td>
                                <td>{new Date(row.timestamp).toLocaleString()}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(row.status)}`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MetricsTable; 