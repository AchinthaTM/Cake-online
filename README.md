# Cake Online

A full-stack e-commerce application for cakes and bouquets with separate frontend and backend.

## Project Structure

This project is organized as a monorepo with separate frontend and backend applications:

```
cake-online/
├── backend/          # Express.js API server
│   ├── server.js     # Main server file
│   ├── server/       # Server code
│   ├── package.json
│   ├── README.md
│   └── .env
├── src/              # React frontend
├── public/           # Static assets
├── package.json      # Frontend dependencies
└── vite.config.js    # Frontend build config
```

## Frontend Setup

The frontend is built with React and Vite.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on http://localhost:5176 and proxy API calls to the backend.

## Backend Setup

See the [backend README](./backend/README.md) for detailed setup instructions.

## Development

To run both frontend and backend simultaneously:

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the frontend:
   ```bash
   npm run dev
   ```

## Features

- User authentication (buyer/seller/admin roles)
- Product management (cakes and bouquets)
- Shopping cart functionality
- Seller dashboard
- Admin dashboard
- Responsive design

## Tech Stack

### Frontend
- React 19
- React Router
- Vite
- CSS Modules

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcrypt for password hashing
