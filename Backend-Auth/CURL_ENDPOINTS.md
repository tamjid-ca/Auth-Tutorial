# 📡 API Endpoint Testing Guide (cURL)

This document contains step-by-step `curl` commands and detailed annotations for testing every endpoint of the **Authentication API** from your terminal.

---

## 📌 Configuration & Prerequisites

- **Base URL:** `http://localhost:5000`
- **Content-Type:** `application/json` (for POST endpoints with payload)
- **Authentication Scheme:** `Bearer <JWT_ACCESS_TOKEN>` via the `Authorization` header

> [!NOTE]
> **Windows Users (PowerShell / CMD):**
> When running `curl` on Windows PowerShell, either use `curl.exe` with properly escaped quotes (`\"`) or use the single-line Windows variants provided below.

---

## 🗺️ Complete Endpoints Overview

| # | HTTP Method | Endpoint | Auth Required | Description |
|---|---|---|---|---|
| 1 | `POST` | `/api/auth/register` | ❌ None | Register a new user account |
| 2 | `POST` | `/api/auth/login` | ❌ None | Login and obtain access & refresh tokens |
| 3 | `GET` | `/api/users/profile` | 🔒 Access Token | Retrieve profile of the logged-in user |
| 4 | `POST` | `/api/auth/refresh` | 🔄 Refresh Token | Exchange refresh token for a new access token |
| 5 | `GET` | `/api/admin/dashboard` | 🛡️ Admin Role | Access admin-only protected dashboard |
| 6 | `POST` | `/api/auth/logout` | 🔄 Refresh Token | Invalidate the refresh token in the database |

---

## 🔍 Detailed Endpoint Documentation & cURL Commands

---

### 1. User Registration

Creates a new user document in MongoDB. The password is encrypted with `bcryptjs` (12 salt rounds) before saving.

- **Route:** `POST /api/auth/register`
- **Source File:** [`routes/authRoutes.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/routes/authRoutes.js#L35)
- **Controller:** [`controllers/authController.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/controllers/authController.js#L42)

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Validation Rules
- `name`: Required, non-empty string.
- `email`: Required, must be a valid email format.
- `password`: Required, minimum 6 characters long.

#### cURL Command (Bash / Linux / macOS)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### cURL Command (Windows PowerShell / CMD)
```powershell
curl.exe -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

#### Expected Responses
- **`201 Created`** (Success)
  ```json
  {
    "message": "User registered successfully.",
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2026-09-13T16:45:00.000Z"
    }
  }
  ```
- **`400 Bad Request`** (Validation failed - e.g. short password or invalid email)
- **`409 Conflict`** (Email already registered)

---

### 2. User Login

Authenticates the user's email and password. On success, returns an **Access Token** (expires in 15 minutes) and a **Refresh Token** (expires in 7 days).

- **Route:** `POST /api/auth/login`
- **Source File:** [`routes/authRoutes.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/routes/authRoutes.js#L38)
- **Controller:** [`controllers/authController.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/controllers/authController.js#L95)

#### Request Body
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### cURL Command (Bash / Linux / macOS)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### cURL Command (Windows PowerShell / CMD)
```powershell
curl.exe -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

#### Expected Responses
- **`200 OK`** (Success)
  ```json
  {
    "message": "Login successful.",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```
- **`401 Unauthorized`** (Invalid email or password)

---

### 3. Get User Profile (Protected Route)

Returns the authenticated user's profile details. Excludes sensitive fields (`password`, `refreshToken`).

- **Route:** `GET /api/users/profile`
- **Source File:** [`routes/userRoutes.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/routes/userRoutes.js#L7)
- **Middleware:** [`middleware/authMiddleware.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/middleware/authMiddleware.js#L13) (`protect`)
- **Controller:** [`controllers/userController.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/controllers/userController.js#L11)

#### Required Headers
- `Authorization: Bearer <ACCESS_TOKEN>`

#### cURL Command (Bash / Linux / macOS)
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

#### cURL Command (Windows PowerShell / CMD)
```powershell
curl.exe -X GET http://localhost:5000/api/users/profile -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

#### Expected Responses
- **`200 OK`** (Success)
  ```json
  {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2026-09-13T16:45:00.000Z",
      "updatedAt": "2026-09-13T16:45:00.000Z"
    }
  }
  ```
- **`401 Unauthorized`** (Missing token or token expired/invalid)
  ```json
  {
    "message": "Access denied. No token provided."
  }
  ```

---

### 4. Refresh Access Token

Issues a new access token when the current access token expires, without requiring the user to re-enter their credentials.

- **Route:** `POST /api/auth/refresh`
- **Source File:** [`routes/authRoutes.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/routes/authRoutes.js#L41)
- **Controller:** [`controllers/authController.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/controllers/authController.js#L149)

#### Request Body
```json
{
  "refreshToken": "<YOUR_REFRESH_TOKEN>"
}
```

#### cURL Command (Bash / Linux / macOS)
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<YOUR_REFRESH_TOKEN>"
  }'
```

#### cURL Command (Windows PowerShell / CMD)
```powershell
curl.exe -X POST http://localhost:5000/api/auth/refresh -H "Content-Type: application/json" -d "{\"refreshToken\":\"<YOUR_REFRESH_TOKEN>\"}"
```

#### Expected Responses
- **`200 OK`** (Success)
  ```json
  {
    "message": "Access token refreshed.",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```
- **`401 Unauthorized`** (Invalid, expired, or revoked refresh token)

---

### 5. Admin Dashboard (Role-Based Access Control)

Restricted endpoint that requires both a valid JWT access token and `role === 'admin'`.

- **Route:** `GET /api/admin/dashboard`
- **Source File:** [`routes/adminRoutes.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/routes/adminRoutes.js#L8)
- **Middleware:** [`middleware/authMiddleware.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/middleware/authMiddleware.js#L13) (`protect`) & [`middleware/roleMiddleware.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/middleware/roleMiddleware.js#L1) (`requireRole('admin')`)
- **Controller:** [`controllers/userController.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/controllers/userController.js#L32)

#### Required Headers
- `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`

#### cURL Command (Bash / Linux / macOS)
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer <YOUR_ADMIN_ACCESS_TOKEN>"
```

#### cURL Command (Windows PowerShell / CMD)
```powershell
curl.exe -X GET http://localhost:5000/api/admin/dashboard -H "Authorization: Bearer <YOUR_ADMIN_ACCESS_TOKEN>"
```

#### Expected Responses
- **`200 OK`** (Admin User)
  ```json
  {
    "message": "Welcome to the admin dashboard.",
    "admin": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "role": "admin"
    }
  }
  ```
- **`403 Forbidden`** (Logged in as standard `user` role)
  ```json
  {
    "message": "Access denied: insufficient permissions. Required role: admin."
  }
  ```

> [!TIP]
> To grant admin privileges for testing, update the user's role to `'admin'` directly in MongoDB Compass or the Mongo shell:
> `db.users.updateOne({ email: "john@example.com" }, { $set: { role: "admin" } })`

---

### 6. User Logout (Token Revocation)

Revokes the refresh token by removing it from the user's document in MongoDB. Once logged out, the old refresh token can no longer be used to obtain new access tokens.

- **Route:** `POST /api/auth/logout`
- **Source File:** [`routes/authRoutes.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/routes/authRoutes.js#L44)
- **Controller:** [`controllers/authController.js`](file:///C:/Users/alfez/Downloads/Auth-Tutorial/Backend-Auth/controllers/authController.js#L189)

#### Request Body
```json
{
  "refreshToken": "<YOUR_REFRESH_TOKEN>"
}
```

#### cURL Command (Bash / Linux / macOS)
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<YOUR_REFRESH_TOKEN>"
  }'
```

#### cURL Command (Windows PowerShell / CMD)
```powershell
curl.exe -X POST http://localhost:5000/api/auth/logout -H "Content-Type: application/json" -d "{\"refreshToken\":\"<YOUR_REFRESH_TOKEN>\"}"
```

#### Expected Responses
- **`200 OK`** (Success)
  ```json
  {
    "message": "Logged out successfully."
  }
  ```
- **`400 Bad Request`** (Refresh token missing in body)

---

## ⚡ Automated PowerShell Test Script

You can copy and run this full snippet directly in your Windows PowerShell terminal to test all endpoints end-to-end automatically:

```powershell
$BASE_URL = "http://localhost:5000"
$EMAIL = "testuser_$([guid]::NewGuid().ToString().Substring(0,8))@example.com"
$PASSWORD = "password123"

Write-Host "`n1. Registering user ($EMAIL)..." -ForegroundColor Cyan
$regRes = Invoke-RestMethod -Method Post -Uri "$BASE_URL/api/auth/register" -ContentType "application/json" -Body (@{ name="Test User"; email=$EMAIL; password=$PASSWORD } | ConvertTo-Json)
$regRes | Format-List

Write-Host "2. Logging in..." -ForegroundColor Cyan
$loginRes = Invoke-RestMethod -Method Post -Uri "$BASE_URL/api/auth/login" -ContentType "application/json" -Body (@{ email=$EMAIL; password=$PASSWORD } | ConvertTo-Json)
$ACCESS_TOKEN = $loginRes.accessToken
$REFRESH_TOKEN = $loginRes.refreshToken
Write-Host "Tokens received successfully!" -ForegroundColor Green

Write-Host "`n3. Fetching User Profile (Protected)..." -ForegroundColor Cyan
$profileRes = Invoke-RestMethod -Method Get -Uri "$BASE_URL/api/users/profile" -Headers @{ Authorization = "Bearer $ACCESS_TOKEN" }
$profileRes.user | Format-List

Write-Host "4. Refreshing Access Token..." -ForegroundColor Cyan
$refreshRes = Invoke-RestMethod -Method Post -Uri "$BASE_URL/api/auth/refresh" -ContentType "application/json" -Body (@{ refreshToken=$REFRESH_TOKEN } | ConvertTo-Json)
$NEW_ACCESS_TOKEN = $refreshRes.accessToken
Write-Host "New Access Token: $NEW_ACCESS_TOKEN" -ForegroundColor Green

Write-Host "`n5. Logging out..." -ForegroundColor Cyan
$logoutRes = Invoke-RestMethod -Method Post -Uri "$BASE_URL/api/auth/logout" -ContentType "application/json" -Body (@{ refreshToken=$REFRESH_TOKEN } | ConvertTo-Json)
$logoutRes | Format-List

Write-Host "All tests completed successfully!" -ForegroundColor Green
```


