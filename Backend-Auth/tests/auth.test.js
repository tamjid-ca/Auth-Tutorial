/**
 * tests/auth.test.js
 *
 * Tests for:
 *  - POST /api/auth/register  (success, validation failures, duplicate email)
 *  - POST /api/auth/login     (success, wrong password, non-existent email)
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });

const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { connectTestDB, clearDB, closeTestDB } = require('./setup');

// ── Lifecycle ────────────────────────────────────────────────────────────

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeTestDB();
});

// ── Registration ─────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  const validUser = {
    name: 'Alice',
    email: 'alice@example.com',
    password: 'password123',
  };

  test('✅ Should register a new user successfully (201)', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(validUser.email);
    // Confirm password is NOT returned
    expect(res.body.user).not.toHaveProperty('password');
  });

  test('✅ Should store a hashed password — not plain text', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const dbUser = await User.findOne({ email: validUser.email });
    expect(dbUser).not.toBeNull();
    expect(dbUser.password).not.toBe(validUser.password);
    expect(dbUser.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
  });

  test('❌ Should reject an invalid email format (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('❌ Should reject a password shorter than 6 characters (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('❌ Should reject registration with a duplicate email (409)', async () => {
    // Register once
    await request(app).post('/api/auth/register').send(validUser);

    // Try to register again with the same email
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already registered/i);
  });
});

// ── Login ────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  const credentials = { email: 'bob@example.com', password: 'secret123' };

  beforeEach(async () => {
    // Pre-register a user to log in as
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', ...credentials });
  });

  test('✅ Should login successfully and return access + refresh tokens (200)', async () => {
    const res = await request(app).post('/api/auth/login').send(credentials);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(typeof res.body.accessToken).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
  });

  test('❌ Should reject login with incorrect password (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('❌ Should reject login with non-existent email (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'secret123' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });
});
