const express = require('express');
const cors = require('cors');
const sampleDataRoutes = require('./routes/sampleData');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Add the new route
app.use('/api', sampleDataRoutes);

// ... existing code ...

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 