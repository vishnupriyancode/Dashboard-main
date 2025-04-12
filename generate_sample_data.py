import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Set random seed for reproducibility
np.random.seed(42)

# Generate 500 records
n_records = 500

# Generate dates for the last 30 days
end_date = datetime.now()
start_date = end_date - timedelta(days=30)
dates = [start_date + timedelta(
    days=random.randint(0, 30),
    hours=random.randint(0, 23),
    minutes=random.randint(0, 59),
    seconds=random.randint(0, 59)
) for _ in range(n_records)]

# Categories with weighted probabilities
categories = ['Claims', 'Payments', 'Eligibility']
category_weights = [0.5, 0.3, 0.2]  # Claims more common than others
categories_data = np.random.choice(categories, n_records, p=category_weights)

# Status with weighted probabilities (85% success rate)
statuses = ['success', 'failed']
status_weights = [0.85, 0.15]
statuses_data = np.random.choice(statuses, n_records, p=status_weights)

# Generate response times (in milliseconds)
# Success: mean=200ms, std=50ms
# Failed: mean=500ms, std=150ms
response_times = []
for status in statuses_data:
    if status == 'success':
        response_time = abs(np.random.normal(200, 50))
    else:
        response_time = abs(np.random.normal(500, 150))
    response_times.append(round(response_time, 2))

# Create DataFrame
df = pd.DataFrame({
    'date': dates,
    'category': categories_data,
    'status': statuses_data,
    'responseTime': response_times
})

# Sort by date
df = df.sort_values('date')

# Save to Excel
output_file = 'api_responses.xlsx'
df.to_excel(output_file, index=False)

print(f"Generated {n_records} records and saved to {output_file}")
print("\nSample statistics:")
print(f"Total records: {len(df)}")
print(f"Success rate: {(df['status'] == 'success').mean()*100:.1f}%")
print("\nCategory distribution:")
print(df['category'].value_counts(normalize=True).round(3) * 100)
print("\nAverage response times:")
print(df.groupby('status')['responseTime'].mean().round(2)) 