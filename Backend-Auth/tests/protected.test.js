/**
 * tests/protected.test.js
 *
 * Tests for protected routes:
 *  - GET /api/users/profile  (valid token, no token, malformed token)
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });

const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { connectTestDB, clearDB, closeTestDB } = require('./setup');

let accessToken;

// ── Lifecycle ────────────────────────────────────────────────────────────

beforeAll(async () => {
  await connectTestDB();
  await clearDB();

  // Register + login to obtain a valid access token
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Carol', email: 'carol@example.com', password: 'password123' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'carol@example.com', password: 'password123' });

  accessToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await closeTestDB();
});

// ── Tests ────────────────────────────────────────────────────────────────

describe('GET /api/users/profile', () => {
  test('✅ Should return profile for authenticated user (200)', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('carol@example.com');
    // Sensitive fields must be excluded
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user).not.toHaveProperty('refreshToken');
  });

  test('❌ Should block requests with no token (401)', async () => {
    const res = await request(app).get('/api/users/profile');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/no token/i);
  });

  test('❌ Should block requests with a malformed/invalid token (401)', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer this.is.not.a.valid.jwt');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });
});
