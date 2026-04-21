# Backend Developer Intern Assignment

This project implements a scalable REST API with user authentication, role-based access control, and CRUD operations for tasks. It includes a React frontend for interacting with the API.

## Features

- User registration and login with JWT authentication
- Role-based access control (user and admin roles)
- CRUD operations for tasks
- Secure password hashing with bcrypt
- Input validation and error handling
- React frontend with login, register, and dashboard pages

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation

### Frontend
- React
- Axios for API calls
- React Router for navigation

## Setup Instructions

### Database Setup (MongoDB Atlas - Recommended)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and create a free account
2. Create a new cluster (free tier)
3. Create a database user with read/write permissions
4. Get your connection string from "Connect" > "Connect your application"
5. Update the `MONGO_URI` in `backend/.env` with your connection string

### Alternative: Local MongoDB
If you prefer local MongoDB:
1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Update `backend/.env` to use `MONGO_URI=mongodb://localhost:27017/backend-assignment`

### Running the Application
1. **Backend:**
   ```
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend:**
   ```
   cd frontend
   npm install
   npm start
   ```

3. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Tasks
- GET /api/tasks - Get all tasks (admin sees all, user sees own)
- POST /api/tasks - Create a new task
- PUT /api/tasks/:id - Update a task
- DELETE /api/tasks/:id - Delete a task

## Usage

1. Register a new user or login with existing credentials
2. Access the dashboard to view, create, edit, and delete tasks
3. Admins can view all tasks, users can only see their own

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Role-based access control ensures users can only access their own resources (except admins)
- Input validation prevents malicious data