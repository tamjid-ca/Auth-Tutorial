/**
 * tests/rbac.test.js
 *
 * Tests for Role-Based Access Control (RBAC):
 *  - GET /api/admin/dashboard
 *    - Regular 'user' role → 403 Forbidden
 *    - 'admin' role → 200 OK
 *    - Unauthenticated → 401 Unauthorized
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });

const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { connectTestDB, clearDB, closeTestDB } = require('./setup');

let userAccessToken;
let adminAccessToken;

// ── Lifecycle ────────────────────────────────────────────────────────────

beforeAll(async () => {
  await connectTestDB();
  await clearDB();

  // Register and login a regular user
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Eve', email: 'eve@example.com', password: 'password123' });

  const userLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'eve@example.com', password: 'password123' });
  userAccessToken = userLogin.body.accessToken;

  // Register Frank, then promote to admin directly in the DB
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Frank', email: 'frank@example.com', password: 'password123' });

  await User.findOneAndUpdate({ email: 'frank@example.com' }, { role: 'admin' });

  // Login again so the token contains role: 'admin'
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'frank@example.com', password: 'password123' });
  adminAccessToken = adminLogin.body.accessToken;
});

afterAll(async () => {
  await closeTestDB();
});

// ── Tests ────────────────────────────────────────────────────────────────

describe('GET /api/admin/dashboard — Role-Based Access Control', () => {
  test('❌ Regular user should receive 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userAccessToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  test('✅ Admin user should receive 200 OK', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/admin dashboard/i);
    expect(res.body.admin.role).toBe('admin');
  });

  test('❌ Unauthenticated request should receive 401 Unauthorized', async () => {
    const res = await request(app).get('/api/admin/dashboard');

    expect(res.statusCode).toBe(401);
  });
});
