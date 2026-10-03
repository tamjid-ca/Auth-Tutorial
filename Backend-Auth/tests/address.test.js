/**
 * tests/address.test.js
 *
 * Tests for /api/users/addresses (CRUD, validation, ownership, default handling)
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });

const request = require('supertest');
const app = require('../app');
const { connectTestDB, clearDB, closeTestDB } = require('./setup');

const base = '/api/users/addresses';
const valid = {
  label: 'home',
  fullName: 'Dave Smith',
  phone: '+1 555-123-4567',
  addressLine1: '12 Main Street',
  city: 'Austin',
  state: 'TX',
  postalCode: '78701',
  country: 'USA',
};

let tokenA;
let tokenB;

const registerAndLogin = async (name, email) => {
  await request(app).post('/api/auth/register').send({ name, email, password: 'password123' });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
  return res.body.accessToken;
};

beforeAll(async () => {
  await connectTestDB();
  await clearDB();
  tokenA = await registerAndLogin('Dave', 'dave@example.com');
  tokenB = await registerAndLogin('Erin', 'erin@example.com');
});

afterAll(async () => {
  await closeTestDB();
});

const auth = (t) => ({ Authorization: `Bearer ${t}` });

describe('Addresses', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get(base);
    expect(res.statusCode).toBe(401);
  });

  it('rejects invalid payloads', async () => {
    const res = await request(app).post(base).set(auth(tokenA)).send({ ...valid, postalCode: '!!', phone: 'abc' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app).post(base).set(auth(tokenA)).send({});
    expect(res.statusCode).toBe(400);
  });

  let firstId;
  let secondId;

  it('creates first address as default', async () => {
    const res = await request(app).post(base).set(auth(tokenA)).send(valid);
    expect(res.statusCode).toBe(201);
    expect(res.body.address.isDefault).toBe(true);
    firstId = res.body.address._id;
  });

  it('new default address replaces the old default', async () => {
    const res = await request(app)
      .post(base).set(auth(tokenA))
      .send({ ...valid, label: 'work', isDefault: true });
    expect(res.statusCode).toBe(201);
    secondId = res.body.address._id;

    const list = await request(app).get(base).set(auth(tokenA));
    expect(list.body.count).toBe(2);
    expect(list.body.addresses.filter((a) => a.isDefault)).toHaveLength(1);
    expect(list.body.addresses[0]._id).toBe(secondId);
  });

  it('updates an address partially', async () => {
    const res = await request(app).patch(`${base}/${firstId}`).set(auth(tokenA)).send({ city: 'Dallas' });
    expect(res.statusCode).toBe(200);
    expect(res.body.address.city).toBe('Dallas');
    expect(res.body.address.fullName).toBe('Dave Smith');
  });

  it('rejects empty update and invalid id', async () => {
    const empty = await request(app).patch(`${base}/${firstId}`).set(auth(tokenA)).send({});
    expect(empty.statusCode).toBe(400);
    const bad = await request(app).get(`${base}/not-an-id`).set(auth(tokenA));
    expect(bad.statusCode).toBe(400);
  });

  it('prevents unsetting the default directly', async () => {
    const res = await request(app).patch(`${base}/${secondId}`).set(auth(tokenA)).send({ isDefault: false });
    expect(res.statusCode).toBe(400);
  });

  it("hides other users' addresses", async () => {
    const get = await request(app).get(`${base}/${firstId}`).set(auth(tokenB));
    const patch = await request(app).patch(`${base}/${firstId}`).set(auth(tokenB)).send({ city: 'Hack' });
    const del = await request(app).delete(`${base}/${firstId}`).set(auth(tokenB));
    expect([get.statusCode, patch.statusCode, del.statusCode]).toEqual([404, 404, 404]);
  });

  it('promotes another address when the default is deleted', async () => {
    const del = await request(app).delete(`${base}/${secondId}`).set(auth(tokenA));
    expect(del.statusCode).toBe(200);
    const list = await request(app).get(base).set(auth(tokenA));
    expect(list.body.count).toBe(1);
    expect(list.body.addresses[0].isDefault).toBe(true);
  });

  it('returns 404 for already deleted address', async () => {
    const res = await request(app).delete(`${base}/${secondId}`).set(auth(tokenA));
    expect(res.statusCode).toBe(404);
  });

  it('enforces the maximum number of addresses', async () => {
    for (let i = 0; i < 9; i += 1) {
      await request(app).post(base).set(auth(tokenA)).send(valid);
    }
    const res = await request(app).post(base).set(auth(tokenA)).send(valid);
    expect(res.statusCode).toBe(400);
  });
});
