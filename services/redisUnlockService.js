const redis = require("../redisClient");
const fs = require("fs");
const path = require("path");

const luaScript = fs.readFileSync(
  path.join(__dirname, "../redis/unlockDate.lua"),
  "utf8"
);

async function unlockDate({ listingId, date, userId }) {
  const qtyKey = `qty:lock:${listingId}:${date}`;
  const userKey = `user:lock:${listingId}:${date}:${userId}`;

  await redis.eval(luaScript, 2, qtyKey, userKey);
}

module.exports = { unlockDate };
