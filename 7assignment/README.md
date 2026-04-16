# Assignment 7 - Electronics E-commerce

"VoltStore" is an electronics e-commerce platform built as a full-stack project.

## Technologies

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Vite
- Authentication: JWT
- Styling: CSS
- Utilities: Axios, Stripe, Cloudinary, React Router, React Query, React Hot Toast

## Features

- Product listing with search and filters
- User account authentication and protected routes
- Cart and wishlist functionality
- Orders and checkout flow
- Admin dashboard for product/user/order management
- File upload support for product images
- Seed script to populate database with sample data

## Login Credentials

- Admin: `admin@voltstore.com` / `admin123`
- User: `john@example.com` / `user1234`

## Run Instructions

### 1. Backend

1. Open a terminal in `backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database:
   ```bash
   node seed.js
   ```
4. Start the API server:
   ```bash
   node server.js
   ```

The backend should run on:

- `http://localhost:5000`

### 2. Frontend

1. Open a terminal in `frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

The frontend should run on:

- `http://localhost:5173`

## Notes

- MongoDB must be running locally for the backend to connect.
- If port `5000` is already in use, stop the running process or update `backend/.env`.
- Backend environment variables are stored in `backend/.env`.

## Project Structure

- `backend/` - Express API, MongoDB models, routes, middleware, seed script
- `frontend/` - React app built with Vite
