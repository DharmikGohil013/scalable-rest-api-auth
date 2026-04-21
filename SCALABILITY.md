# Scalability Architecture & Best Practices

This document outlines strategies for scaling the REST API from a prototype to a production-grade, highly-scalable system handling millions of requests.

---

## 📊 Current Architecture

```
┌─────────────┐
│   React     │
│  Frontend   │
└──────┬──────┘
       │
       │ HTTP/HTTPS
       │
┌──────▼──────────────────────┐
│      Express.js API         │
│    (Single Process)         │
└──────┬───────────────────────┘
       │
       │ TCP Connection
       │
┌──────▼──────────────────────┐
│   MongoDB (Single Server)   │
└─────────────────────────────┘
```

**Current Limitations:**
- Single Node.js process (not utilizing multi-core systems)
- No horizontal scaling capability
- Single point of failure
- Limited caching
- No database indexing strategy
- No rate limiting
- No load distribution

---

## 🚀 Phase 1: Local Optimization (Quick Wins)

### 1.1 Database Indexing

Create indexes on frequently queried fields:

```javascript
// backend/models/User.js - Add indexes
userSchema.index({ email: 1 });  // For login queries
userSchema.index({ username: 1 }); // For username lookups

// backend/models/Task.js - Add indexes
taskSchema.index({ user: 1 }); // For user-specific queries
taskSchema.index({ status: 1 }); // For status filtering
taskSchema.index({ createdAt: -1 }); // For sorting by date
taskSchema.index({ user: 1, status: 1 }); // Composite index
```

**Impact:** 10-50x faster queries on large datasets.

### 1.2 Connection Pooling

```javascript
// backend/server.js - Optimize MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 20,        // Connection pool size
  minPoolSize: 10,        // Minimum connections
  socketTimeoutMS: 30000, // Socket timeout
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
});
```

### 1.3 Response Compression

```javascript
// backend/server.js
const compression = require('compression');

app.use(compression()); // Compress responses
```

### 1.4 Pagination Implementation

```javascript
// backend/controllers/taskController.js
exports.getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = req.user.role === 'admin'
      ? await Task.find().skip(skip).limit(limit)
      : await Task.find({ user: req.user.id }).skip(skip).limit(limit);

    const total = req.user.role === 'admin'
      ? await Task.countDocuments()
      : await Task.countDocuments({ user: req.user.id });

    res.json({
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

---

## 🔄 Phase 2: Caching Layer (Redis)

### 2.1 Redis Integration

```javascript
// backend/config/redis.js
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
});

client.on('error', (err) => console.log('Redis error:', err));
client.connect();

module.exports = client;
```

### 2.2 Cache User Tasks

```javascript
// backend/controllers/taskController.js
const redisClient = require('../config/redis');

exports.getTasks = async (req, res) => {
  try {
    const cacheKey = `tasks:${req.user.id}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const tasks = await Task.find({ user: req.user.id });

    // Cache for 5 minutes
    await redisClient.setex(cacheKey, 300, JSON.stringify(tasks));

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

### 2.3 Cache Invalidation

```javascript
// Invalidate cache on update/delete
exports.updateTask = async (req, res) => {
  try {
    // ... update logic ...
    const task = await Task.findByIdAndUpdate(req.params.id, {...}, { new: true });

    // Invalidate cache
    await redisClient.del(`tasks:${req.user.id}`);

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

**Benefits:**
- 100-1000x faster for cached reads
- Reduces database load
- Improves user experience

---

## ⚖️ Phase 3: Load Balancing

### 3.1 PM2 Cluster Mode (Local)

```bash
npm install --save-dev pm2
```

```javascript
// backend/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'api',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

```bash
pm2 start ecosystem.config.js
```

### 3.2 Nginx Reverse Proxy (Production)

```nginx
# /etc/nginx/sites-available/api
upstream api_servers {
  server 127.0.0.1:5001;
  server 127.0.0.1:5002;
  server 127.0.0.1:5003;
  server 127.0.0.1:5004;
  keepalive 32;
}

server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://api_servers;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

**Achieves:**
- Horizontal scaling to multiple cores/servers
- Load distribution
- Request isolation

---

## 🛡️ Phase 4: Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 auth attempts per 15 minutes
  skipSuccessfulRequests: true,
});

module.exports = { limiter, authLimiter };
```

```javascript
// backend/server.js
const { limiter, authLimiter } = require('./middleware/rateLimiter');

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

---

## 📈 Phase 5: Microservices Architecture

### 5.1 Service Decomposition

```
┌──────────────────────────────────────────────────┐
│              API Gateway                         │
│      (Rate Limiting, Authentication)             │
└────┬─────────────────────────────────────────────┘
     │
  ┌──┴──────────────────────────┬──────────────────┐
  │                             │                  │
  ▼                             ▼                  ▼
┌────────────────┐    ┌─────────────────┐   ┌──────────────┐
│ Auth Service   │    │ Task Service    │   │ User Service │
│ (Port 5001)    │    │ (Port 5002)     │   │ (Port 5003)  │
└────────────────┘    └─────────────────┘   └──────────────┘
  │                             │                  │
  │                             │                  │
  └──────────────┬──────────────┴──────────────────┘
                 │
                 ▼
        ┌──────────────────┐
        │  Shared Database │
        │    (MongoDB)     │
        └──────────────────┘
```

### 5.2 API Gateway Implementation

```javascript
// backend/gateway/server.js
const express = require('express');
const { createProxyMiddleware } = require('express-http-proxy');

const app = express();

// Route to auth service
app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
}));

// Route to task service
app.use('/api/tasks', createProxyMiddleware({
  target: 'http://localhost:5002',
  changeOrigin: true,
}));

// Route to user service
app.use('/api/users', createProxyMiddleware({
  target: 'http://localhost:5003',
  changeOrigin: true,
}));

app.listen(3000);
```

---

## 💾 Phase 6: Database Optimization

### 6.1 Database Sharding Strategy

Shard by `user_id` to distribute load:

```
Shard 1 (User IDs A-M)  → MongoDB Instance 1
Shard 2 (User IDs N-Z)  → MongoDB Instance 2
Shard 3 (User IDs AA-ZZ) → MongoDB Instance 3
```

### 6.2 Replica Sets for High Availability

```javascript
mongoose.connect(
  'mongodb+srv://user:password@cluster0.mongodb.net/database?replicaSet=rs0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
```

### 6.3 Time Series Optimization (if needed)

For logging/analytics:

```javascript
// Create time-series collection
db.createCollection("taskMetrics", {
  timeseries: {
    timeField: "timestamp",
    metaField: "metadata",
    granularity: "hours"
  }
});
```

---

## 🐳 Phase 7: Containerization & Orchestration

### 7.1 Docker Setup

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
```

### 7.2 Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: api:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: mongo-uri
        - name: REDIS_HOST
          value: redis-service
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## 📊 Scaling Benchmarks

### Expected Performance Improvements

| Phase | Requests/sec | Latency (ms) | Cost |
|-------|-------------|-------------|------|
| Current | 100 | 200-500 | Low |
| Phase 1 (Indexes) | 500 | 50-100 | Low |
| Phase 2 (Caching) | 2,000 | 20-50 | Medium |
| Phase 3 (Load Balance) | 5,000 | 15-30 | Medium |
| Phase 4 (Rate Limit) | 5,000+ | 10-20 | Medium |
| Phase 5 (Microservices) | 10,000+ | 10-20 | High |
| Phase 6 (Sharding) | 50,000+ | 5-15 | High |
| Phase 7 (K8s) | 100,000+ | 5-10 | High |

---

## 🔍 Monitoring & Observability

### 7.1 Application Monitoring

```bash
npm install winston
```

```javascript
// backend/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;
```

### 7.2 Performance Monitoring Tools

- **PM2 Plus** - Real-time monitoring
- **DataDog** - APM and monitoring
- **New Relic** - Application performance monitoring
- **Prometheus + Grafana** - Open-source monitoring stack

---

## 🎯 Scaling Recommendations

### For 100K Users:
1. ✅ Implement database indexing
2. ✅ Add Redis caching
3. ✅ Use PM2 cluster mode
4. ✅ Implement rate limiting
5. ✅ Set up monitoring

### For 1M Users:
1. ✅ All above steps
2. ✅ Implement microservices
3. ✅ Use Kubernetes
4. ✅ Implement database sharding
5. ✅ Use CDN for static assets

### For 10M+ Users:
1. ✅ All above steps
2. ✅ Multi-region deployment
3. ✅ Advanced caching strategies
4. ✅ Database replication across regions
5. ✅ Event-driven architecture (Kafka/RabbitMQ)

---

## 📚 Quick Reference: Implementation Order

1. **Week 1:** Database indexing + pagination
2. **Week 2:** Redis caching + compression
3. **Week 3:** PM2 clustering + Nginx setup
4. **Week 4:** Rate limiting + monitoring
5. **Week 5-6:** Microservices architecture
6. **Week 7-8:** Kubernetes deployment

---

## 🔗 Resources

- [MongoDB Optimization Guide](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [Redis Best Practices](https://redis.io/topics/optimization)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance-guidance/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nginx Load Balancing](https://nginx.org/en/docs/http/load_balancing.html)

---

**Last Updated:** April 2026

*For questions or improvements, please refer to the main README.md or create an issue on GitHub.*
