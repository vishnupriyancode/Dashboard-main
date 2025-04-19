-- Clear existing data
TRUNCATE TABLE sample_data RESTART IDENTITY;

-- Insert sample data
INSERT INTO sample_data (name, value, timestamp, status) VALUES
    ('Transaction Latency', '120ms', '2024-07-04 17:30:00', 'active'),
    ('Transaction Volume', '2500', '2024-07-04 17:15:00', 'active'),
    ('Transaction Success', '99.8%', '2024-07-04 17:00:00', 'active'),
    ('CPU Usage', '45%', '2024-07-04 16:15:00', 'active'),
    ('Memory Usage', '65%', '2024-07-04 16:15:00', 'warning'),
    ('Disk Usage', '78%', '2024-07-04 16:15:00', 'warning'),
    ('User Sessions', '1500', '2024-07-04 16:00:00', 'active'),
    ('User Sessions', '980', '2024-07-04 15:30:00', 'active'),
    ('User Sessions', '1250', '2024-07-04 15:00:00', 'active'),
    ('Error Rate', '2.5%', '2024-07-04 14:30:00', 'inactive'),
    ('Error Rate', '1.2%', '2024-07-04 14:15:00', 'warning'),
    ('Error Rate', '0.5%', '2024-07-04 14:00:00', 'active'); 