/**
 * tests/refresh.test.js
 *
 * Tests for the token lifecycle:
 *  - POST /api/auth/refresh  (valid token → new access token, invalid token)
 *  - POST /api/auth/logout   (clears token; subsequent refresh is rejected)
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });

const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { connectTestDB, clearDB, closeTestDB } = require('./setup');

let refreshToken;
let accessToken;

// ── Lifecycle ────────────────────────────────────────────────────────────

beforeAll(async () => {
  await connectTestDB();
  await clearDB();

  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Dave', email: 'dave@example.com', password: 'password123' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'dave@example.com', password: 'password123' });

  accessToken = loginRes.body.accessToken;
  refreshToken = loginRes.body.refreshToken;
});

afterAll(async () => {
  await closeTestDB();
});

// ── Tests ────────────────────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  test('✅ Should issue a new access token for a valid refresh token (200)', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(typeof res.body.accessToken).toBe('string');
  });

  test('❌ Should reject an invalid or tampered refresh token (401)', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'tampered.invalid.token' });

    expect(res.statusCode).toBe(401);
  });

  test('❌ Should reject request with no refresh token (401)', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});

    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  test('✅ Should logout successfully (200)', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);
  });

  test('❌ After logout, the refresh token must be rejected (401)', async () => {
    // Token was cleared in the previous test — attempting to use it again must fail
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid|revoked/i);
  });
});
