const Redis = require('async-redis');
require('dotenv').config();

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: false,
    rejectUnauthorized: false,
  }
});

redisClient.on('error', (error) => {
  console.error(`Redis Error: ${error}`);
});

module.exports = redisClient;
