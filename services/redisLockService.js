const redis = require("../redisClient");
const fs = require("fs");
const path = require("path");

const luaScript = fs.readFileSync(
  path.join(__dirname, "../redis/lockDates.lua"),
  "utf8"
);

async function lockDate({
  listingId,
  date,
  userId,
  quantity,
  totalQuantity
}) {
  const qtyKey = `qty:lock:${listingId}:${date}`;
  const userKey = `user:lock:${listingId}:${date}:${userId}`;

  const result = await redis.eval(
    luaScript,
    2,
    qtyKey,
    userKey,
    quantity,
    totalQuantity,
    300
  );

  return result === 1;
}

module.exports = { lockDate };
