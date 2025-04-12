# Management Dashboard Web Application

A modern management dashboard built with Angular and Node.js.

## Features

- Summary Cards displaying key metrics
- Status Charts (Pie/Bar charts)
- Timeline Charts for project progress
- Response Tables with pagination and search
- Chat Panel for team communication
- Responsive design

## Prerequisites

- Node.js (v16 or higher)
- Angular CLI (for frontend development)
- npm (Node Package Manager)

## Setup

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

### Backend Setup
1. Open a new terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Accessing the Application

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

## Project Structure

```
.
├── frontend/              # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   └── services/     # API services
│   │   └── ...
│   └── ...
└── backend/               # Node.js backend application
    ├── src/
    │   ├── routes/       # API routes
    │   └── ...
    └── ...
```

## API Endpoints

- GET /api/metrics - Get dashboard metrics
- GET /api/status - Get status data for charts
- GET /api/timeline - Get timeline data
- GET /api/table - Get table data
- GET /api/chat - Get chat messages

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 