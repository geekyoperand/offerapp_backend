const redis = require('redis');

// const config = require('./config');
const logger = require('./logger');

const redisClient = redis.createClient(6379);
redisClient
  .connect()
  .then(() => logger.info('Redis Connected'))
  .catch((err) => logger.info(`Error while connecting to Redis server ${err}`));
module.exports = redisClient;
