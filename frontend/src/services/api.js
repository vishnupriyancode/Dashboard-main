const API_BASE_URL = 'http://localhost:5001/api';

export const fetchDataA = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/fetch-data-a`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};