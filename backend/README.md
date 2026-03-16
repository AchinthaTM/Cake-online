# Cake Online Backend

This is the backend API for the Cake Online application.

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure MongoDB is running and the .env file is configured

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will run on http://localhost:5000

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Environment Variables

Create a `.env` file in the backend directory with:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
BCRYPT_ROUNDS=12
FRONTEND_URL=http://localhost:5173
```