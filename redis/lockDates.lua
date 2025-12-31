local current = tonumber(redis.call("GET", KEYS[1]) or "0")
local requested = tonumber(ARGV[1])
local total = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])

if (current + requested) > total then
  return 0
end

redis.call("INCRBY", KEYS[1], requested)
redis.call("SET", KEYS[2], requested, "EX", ttl)
redis.call("EXPIRE", KEYS[1], ttl)

return 1
