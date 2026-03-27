import { LOCK_TIME, MAX_LOGIN_ATTEMPTS } from "../config/constant.js";
import redisClient from "../config/redis.js";

const getLockKeys = (email) => ({
  lockKey: `login:lock:${email}`,
  failKey: `login:fail:${email}`,
});

// Check if account is locked
const isAccountLocked = async (email) => {
  // if redis not available → skip lock check
  if (!redisClient) return false;

  const { lockKey } = getLockKeys(email);
  return await redisClient.get(lockKey);
};

// Record failed attempt with improved security
const recordFailedAttempt = async (email) => {
  // if redis not available → skip tracking
  if (!redisClient) return false;

  const { lockKey, failKey } = getLockKeys(email);

  const attempts = await redisClient.incr(failKey);

  // ✅ 1. Longer tracking window (IMPORTANT)
  if (attempts === 1) {
    await redisClient.expire(failKey, 60 * 60); // 1 hour tracking
  }

  // ✅ 2. Progressive lock (VERY IMPORTANT 🔥)
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    // increase lock time based on attempts
    const dynamicLockTime =
      LOCK_TIME * Math.ceil(attempts / MAX_LOGIN_ATTEMPTS);

    await redisClient.set(lockKey, "1", { EX: dynamicLockTime });

    return true; // account locked
  }

  return false;
};

// ✅ 3. Reset on successful login (VERY IMPORTANT)
const clearLoginAttempts = async (email) => {
  // if redis not available → nothing to clear
  if (!redisClient) return;

  const { lockKey, failKey } = getLockKeys(email);
  await redisClient.del(lockKey);
  await redisClient.del(failKey);
};

export { isAccountLocked, recordFailedAttempt, clearLoginAttempts };















// import { LOCK_TIME, MAX_LOGIN_ATTEMPTS } from "../config/constant.js";
// import redisClient from "../config/redis.js";

// const getLockKeys = (email) => ({
//   lockKey: `login:lock:${email}`,
//   failKey: `login:fail:${email}`,
// });

// // Check if account is locked
// const isAccountLocked = async (email) => {
//   const { lockKey } = getLockKeys(email);
//   return await redisClient.get(lockKey);
// };

// // Record failed attempt with improved security
// const recordFailedAttempt = async (email) => {
//   const { lockKey, failKey } = getLockKeys(email);

//   const attempts = await redisClient.incr(failKey);

//   // ✅ 1. Longer tracking window (IMPORTANT)
//   if (attempts === 1) {
//     await redisClient.expire(failKey, 60 * 60); // 1 hour tracking
//   }

//   // ✅ 2. Progressive lock (VERY IMPORTANT 🔥)
//   if (attempts >= MAX_LOGIN_ATTEMPTS) {
//     // increase lock time based on attempts
//     const dynamicLockTime =
//       LOCK_TIME * Math.ceil(attempts / MAX_LOGIN_ATTEMPTS);

//     await redisClient.set(lockKey, "1", { EX: dynamicLockTime });

//     return true; // account locked
//   }

//   return false;
// };

// // ✅ 3. Reset on successful login (VERY IMPORTANT)
// const clearLoginAttempts = async (email) => {
//   const { lockKey, failKey } = getLockKeys(email);
//   await redisClient.del(lockKey);
//   await redisClient.del(failKey);
// };

// export { isAccountLocked, recordFailedAttempt, clearLoginAttempts };
