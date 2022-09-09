const mongoose = require('mongoose');
const util = require('util');
const client = require('../config/redis');

// client.hGet = util.promisify(client.hGet);
const { exec } = mongoose.Query.prototype;

mongoose.Query.prototype.cache = function (options = { time: 60, useCache: true }) {
  this.useCache = true;
  this.time = options.time;
  this.hashKey = JSON.stringify(options.key || this.mongooseCollection.name);

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify({
    ...this.getQuery(),
  });

  const cacheValue = await client.hGet(this.hashKey, key);
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);

    console.log('Response from Redis');
    return doc;
  }

  const result = await exec.apply(this, arguments);
  console.log(result, arguments);
  console.log(this.time);
  client.hSet(this.hashKey, key, JSON.stringify(result));
  client.expire(this.hashKey, this.time);

  console.log('Response from MongoDB');
  return result;
};

module.exports = {
  clearKey(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
