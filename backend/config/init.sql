-- Create sample_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS sample_data (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);

-- Insert sample data
INSERT INTO sample_data (name, value, status) VALUES
    ('API Request 1', '200ms', 'success'),
    ('API Request 2', '150ms', 'success'),
    ('API Request 3', '500ms', 'failed'),
    ('API Request 4', '300ms', 'success'),
    ('API Request 5', '450ms', 'pending'); 