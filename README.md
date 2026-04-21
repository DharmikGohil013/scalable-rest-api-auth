# Scalable REST API with Authentication

A modern, production-ready REST API with JWT authentication, role-based access control, and complete CRUD operations. Built with Node.js, Express, MongoDB, and React.

**GitHub Repository:** [scalable-rest-api-auth](https://github.com/yourusername/scalable-rest-api-auth)

---

## 🎯 Features

- ✅ User registration and login with JWT authentication
- ✅ Role-based access control (user and admin roles)
- ✅ Complete CRUD operations for tasks
- ✅ Secure password hashing with bcrypt
- ✅ Input validation with express-validator
- ✅ Error handling and logging
- ✅ React frontend with responsive UI
- ✅ API documentation with Swagger/OpenAPI
- ✅ Postman collection for API testing
- ✅ Production-ready scalability architecture

---

## 🏗️ Technology Stack

### Backend
- **Runtime:** Node.js (v14+)
- **Framework:** Express.js 4.18
- **Database:** MongoDB with Mongoose 7.5
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcryptjs for password hashing
- **Validation:** express-validator
- **Dev Tools:** Nodemon for hot reload

### Frontend
- **Framework:** React 18.2
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Styling:** CSS3

### DevOps & Deployment
- Git & GitHub
- MongoDB Atlas (Cloud)
- Environment variables (.env)

---

## 📋 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Task CRUD Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tasks` | Get all tasks | Required |
| POST | `/api/tasks` | Create new task | Required |
| PUT | `/api/tasks/:id` | Update task | Required |
| DELETE | `/api/tasks/:id` | Delete task | Required |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (Atlas or local)
- Git

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/scalable-rest-api-auth.git
   cd scalable-rest-api-auth/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/backend-assignment
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Run the backend:**
   ```bash
   npm run dev
   ```
   Server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API endpoint in `src/App.js`:**
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   Frontend will open on `http://localhost:3000`

### Database Setup (MongoDB Atlas)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Add database user (username/password)
4. Get connection string and update `MONGO_URI` in `.env`

---

## 📖 API Documentation

### Detailed API Docs
- **Swagger UI:** Access at `/api-docs` (when running backend)
- **Postman Collection:** Import `postman-collection.json` into Postman
- **OpenAPI Spec:** See `openapi.json` in root directory

### Example Requests

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project",
    "description": "Finish the scalable API project"
  }'
```

---

## 🔐 Authentication Flow

1. User registers with username, email, and password
2. Password is hashed using bcrypt (10 salt rounds)
3. User logs in with email and password
4. Backend validates credentials and returns JWT token
5. Client stores token in localStorage
6. Token is sent in `Authorization: Bearer <token>` header for protected routes
7. Middleware verifies token before allowing access
8. Token expires in 1 hour (configurable)

---

## 👥 Role-Based Access Control

- **User Role:** Can only see and manage their own tasks
- **Admin Role:** Can see all tasks and manage any task

---

## 📁 Project Structure

```
scalable-rest-api-auth/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js
│   │   └── roleAuth.js
│   ├── models/          # Database models
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   └── tasks.js
│   ├── .env             # Environment variables
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Dashboard.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── .gitignore           # Git ignore file
├── README.md            # This file
├── openapi.json         # Swagger/OpenAPI specification
├── postman-collection.json  # Postman API collection
└── SCALABILITY.md       # Scalability notes
```

---

## 🧪 Testing the API

### Using Postman
1. Import `postman-collection.json` into Postman
2. Test each endpoint with provided sample data
3. Use tokens from login response in subsequent requests

### Using cURL
See examples above in API Documentation section

### Using Frontend UI
1. Open `http://localhost:3000`
2. Register a new account
3. Login with credentials
4. Create, read, update, delete tasks from dashboard

---

## 🔒 Security Best Practices Implemented

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Environment variables for secrets
- ✅ HTTP-only cookie support (for future enhancement)
- ✅ Rate limiting ready (for production)

---

## 📈 Scalability Notes

For detailed information on scaling this application, see [SCALABILITY.md](./SCALABILITY.md)

Key scalability aspects covered:
- Microservices architecture
- Database optimization and indexing
- Caching strategies (Redis)
- Load balancing
- Horizontal scaling
- API rate limiting
- Database sharding

---

## 🚨 Troubleshooting

### MongoDB Connection Error
- Verify `MONGO_URI` in `.env` is correct
- Check MongoDB Atlas IP whitelist includes your IP
- Ensure database user has correct permissions

### JWT Token Errors
- Token may have expired (1 hour lifespan)
- Ensure `Authorization` header is in correct format: `Bearer <token>`
- Check `JWT_SECRET` matches in backend

### CORS Errors
- Frontend and backend URLs must be correct
- Backend CORS is configured for all origins in development
- For production, restrict to specific domains

### Port Already in Use
- Default ports: Backend `5000`, Frontend `3000`
- Change in `.env` (backend) or `package.json` (frontend)

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [React Documentation](https://react.dev/)

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 Author

Backend Developer Intern Assignment - 2026

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Last Updated:** April 2026

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