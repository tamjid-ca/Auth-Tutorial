# 🔐 Authentication API

A professional **Node.js + Express + MongoDB** REST API demonstrating secure user authentication and role-based authorization — built for teaching purposes.

---

## 📚 Concepts Covered

| Concept | Implementation |
|---|---|
| Password hashing | `bcryptjs` with salt rounds = 12 |
| JWT authentication | Short-lived access tokens (15m) |
| Token refresh cycle | Long-lived refresh tokens (7d) stored in DB |
| Token revocation | Logout clears the refresh token from MongoDB |
| Role-based authorization | `requireRole('admin')` middleware |
| Input validation | `express-validator` on registration & login |
| Environment config | `dotenv` loading from `.env` |
| Automated testing | `jest` + `supertest` with isolated test DB |

---

## 📁 Project Structure

```
AuthenticationAPI/
├── config/
│   └── db.js                  # Mongoose connection
├── controllers/
│   ├── authController.js      # register, login, refresh, logout
│   └── userController.js      # profile, adminDashboard
├── middleware/
│   ├── authMiddleware.js      # protect — verifies JWT
│   └── roleMiddleware.js      # requireRole — checks user.role
├── models/
│   └── User.js                # Mongoose User schema
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   ├── userRoutes.js          # /api/users/*
│   └── adminRoutes.js         # /api/admin/*
├── tests/
│   ├── auth.test.js           # Registration & login
│   ├── protected.test.js      # Protected route access
│   ├── refresh.test.js        # Token refresh & logout
│   └── rbac.test.js           # Role-based authorization
├── .env                       # Dev secrets (do NOT commit)
├── .env.example               # Template (safe to commit)
├── .env.test                  # Test secrets (do NOT commit)
├── app.js                     # Express app (no listen)
└── server.js                  # Entry point
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port 27017

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and fill in your values (MongoDB URI, JWT secrets)

# 3. Start the development server
npm run dev
```

The API will be available at `http://localhost:5000`.

---

## 🌐 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and receive tokens | No |
| `POST` | `/api/auth/refresh` | Get a new access token | No (refresh token in body) |
| `POST` | `/api/auth/logout` | Revoke the refresh token | No (refresh token in body) |

### Users — `/api/users`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users/profile` | Get authenticated user's profile | ✅ Bearer token |

### Admin — `/api/admin`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin-only dashboard | ✅ Bearer token + `admin` role |

---

## 📋 Example Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

Response:
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

### Access Protected Route
```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <accessToken>"
```

### Refresh Access Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

---

## 🧪 Running Tests

```bash
npm test
```

Tests connect to a **separate** `auth_api_test` MongoDB database (configured in `.env.test`) and drop it after the suite completes — your development data is never affected.

Expected output:
```
 PASS  tests/auth.test.js
 PASS  tests/protected.test.js
 PASS  tests/refresh.test.js
 PASS  tests/rbac.test.js

Test Suites: 4 passed, 4 total
Tests:       18 passed, 18 total
```

---

## 🔒 Security Notes

- **Never store plain-text passwords.** Always hash with bcrypt before saving.
- **Access tokens are short-lived (15 min)** to limit the blast radius of a compromised token.
- **Refresh tokens are stored in the database** so they can be invalidated server-side on logout.
- **Secrets must stay in `.env`** — never commit them to version control.
- To make a user an admin, set their `role` field to `"admin"` directly in MongoDB.

---

## 📄 License

MIT — free to use for educational purposes.
