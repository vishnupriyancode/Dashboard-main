# Dashboard Project

This project consists of a full-stack application with a Node.js backend and a React frontend. Below is a detailed explanation of the project structure and setup instructions.

## Project Structure

### Backend (`/backend`)

The backend is built with Node.js and includes the following key components:

- `index.js`: Main entry point for the backend application
- `server.js`: Server configuration and setup
- `routes/`: API route definitions
- `models/`: Database models and schemas
- `config/`: Configuration files
- `prisma/`: Database schema and migrations
- `scripts/`: Utility scripts
- `data/`: Sample data and data management
- `.env`: Environment variables

### Frontend (`/frontend`)

The frontend is built with React and includes:

- `src/`: Source code directory
- `public/`: Static assets
- `vite.config.js`: Vite configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration
- `index.html`: Main HTML file

## Environment Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Python 3.8+ (for data generation scripts)
- PostgreSQL (for database)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables with your configuration

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

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
   npm run dev
   ```

## Development Workflow

1. The backend runs on `http://localhost:3000` by default
2. The frontend runs on `http://localhost:5173` by default
3. API endpoints are prefixed with `/api`
4. The frontend communicates with the backend through these API endpoints

## Data Generation

The project includes a Python script for generating sample data:

```bash
python generate_sample_data.py
```

This will create sample data in the `api_responses.xlsx` file.

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### Frontend
- `VITE_API_URL`: Backend API URL
- `VITE_ENV`: Environment (development/production)

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License. 