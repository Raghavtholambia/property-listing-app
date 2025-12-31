-- KEYS[1] = qty lock key
-- KEYS[2] = user lock key

local userQty = tonumber(redis.call("GET", KEYS[2]) or "0")

if userQty == 0 then
  return 0
end

-- Decrease total locked quantity
local remaining = redis.call("DECRBY", KEYS[1], userQty)

-- Remove user-specific lock
redis.call("DEL", KEYS[2])

-- Cleanup qty key if no locks left
if tonumber(remaining) <= 0 then
  redis.call("DEL", KEYS[1])
end

return 1
