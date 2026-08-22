/**
 * tests/setup.js
 *
 * Shared test helpers using mongodb-memory-server.
 * This spins up an in-process MongoDB instance so tests require
 * NO local MongoDB installation — making them fully self-contained.
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

/**
 * Start an in-memory MongoDB server and connect Mongoose to it.
 * Call this in beforeAll().
 */
const connectTestDB = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
};

/**
 * Drop all collections (used between tests for isolation).
 * Call this in beforeEach() if needed.
 */
const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Drop the database, close the Mongoose connection, and stop the server.
 * Call this in afterAll().
 */
const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

module.exports = { connectTestDB, clearDB, closeTestDB };
