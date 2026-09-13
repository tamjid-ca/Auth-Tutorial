// Load environment variables FIRST before any other module
const path = require('path');
require('dotenv').config({
  path: path.resolve(
    __dirname,
    process.env.NODE_ENV === 'development' ? '.env.test' : '.env'
  ),
});

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
