-- Create the sample_data table
CREATE TABLE IF NOT EXISTS sample_data (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'warning', 'inactive')) NOT NULL
); 