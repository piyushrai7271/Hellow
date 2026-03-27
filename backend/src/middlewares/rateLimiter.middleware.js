import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis.js";
import rateLimitHandler from "../utils/rateLimitHandler.js";

// helper function to conditionally create Redis store
const getRedisStore = (prefix) => {
  if (!redisClient) return undefined;

  return new RedisStore({
    // used for making different limiter in one redis store
    prefix,
    // all the variable store in key value so, to run them we need sendCommand
    sendCommand: (...args) => redisClient.sendCommand(args),
  });
};

// GLOBAL limiter
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  // method to generate custom identifer for client
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip);

    // Before login → only IP
    return ip;
  },
  // this help to avoid adding rate limiting on health check api's
  skip: (req) => {
    // skip health checks
    if (req.path === "/health") return true;

    // skip internal services
    if (req.headers["x-internal-api"] === "true") return true;

    return false;
  },
  // help to unable new header stander
  standardHeaders: true,
  // help to block previous header of x-Header
  legacyHeaders: false,
  // this line is for giving proper message in response
  handler: rateLimitHandler,

  // this is for storing attampts (Redis if available, else memory)
  ...(getRedisStore("rl:global:") && {
    store: getRedisStore("rl:global:"),
  }),
});

// LOGIN / AUTH limiter (strict)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,

  // method to generate custom identifer for client
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip);
    const email = req.body?.email;

    // During login → email + IP
    return email ? `${email}:${ip}` : ip;
  },

  standardHeaders: true,
  legacyHeaders: false,

  // this line is for giving proper message in response
  handler: (req, res, options) =>
    rateLimitHandler(req, res, {
      ...options,
      message: "Too many login attempts. Try again later.",
    }),

  ...(getRedisStore("rl:auth:") && {
    store: getRedisStore("rl:auth:"),
  }),
});

// AFTER LOGIN limiter (optional but advanced)
const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // can be higher for authenticated users

  // method to generate custom identifer for client
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip);

    // After login → use userId if available
    return req.userId ? `${req.userId}` : ip;
  },

  standardHeaders: true,
  legacyHeaders: false,

  // this line is for giving proper message in response
  handler: rateLimitHandler,

  ...(getRedisStore("rl:user:") && {
    store: getRedisStore("rl:user:"),
  }),
});

export { 
  globalRateLimiter,
  authRateLimiter, 
  userRateLimiter 
};
























// import rateLimit, { ipKeyGenerator } from "express-rate-limit";
// import RedisStore from "rate-limit-redis";
// import redisClient from "../config/redis.js";
// import rateLimitHandler from "../utils/rateLimitHandler.js";

// // GLOBAL limiter
// const globalRateLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   // method to generate custom identifer for client
//   keyGenerator: (req) => {
//     const ip = ipKeyGenerator(req.ip);

//     // Before login → only IP
//     return ip;
//   },
//   // this help to avoid adding rate limiting on health check api's
//   skip: (req) => {
//     // skip health checks
//     if (req.path === "/health") return true;

//     // skip internal services
//     if (req.headers["x-internal-api"] === "true") return true;

//     return false;
//   },
//   // help to unable new header stander
//   standardHeaders: true,
//   // help to block previous header of x-Header
//   legacyHeaders: false,
//   // this line is for giving proper message in response
//   handler: rateLimitHandler,
//   // this is for storing attampts
//   store: new RedisStore({
//     // used for making different limiter in one redis store
//     prefix: "rl:global:",
//     // all the variable store in key value so, to run them we need sendCommand
//     sendCommand: (...args) => redisClient.sendCommand(args),
//   }),
// });

// // LOGIN / AUTH limiter (strict)
// const authRateLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,

//   // method to generate custom identifer for client
//   keyGenerator: (req) => {
//     const ip = ipKeyGenerator(req.ip);
//     const email = req.body?.email;

//     // During login → email + IP
//     return email ? `${email}:${ip}` : ip;
//   },

//   standardHeaders: true,
//   legacyHeaders: false,

//   // this line is for giving proper message in response
//   handler: (req, res, options) =>
//     rateLimitHandler(req, res, {
//       ...options,
//       message: "Too many login attempts. Try again later.",
//     }),

//   store: new RedisStore({
//     prefix: "rl:auth:",
//     sendCommand: (...args) => redisClient.sendCommand(args),
//   }),
// });

// // AFTER LOGIN limiter (optional but advanced)
// const userRateLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200, // can be higher for authenticated users

//   // method to generate custom identifer for client
//   keyGenerator: (req) => {
//     const ip = ipKeyGenerator(req.ip);

//     // After login → use userId if available
//     return req.userId ? `${req.userId}` : ip;
//   },

//   standardHeaders: true,
//   legacyHeaders: false,

//   // this line is for giving proper message in response
//   handler: rateLimitHandler,

//   store: new RedisStore({
//     prefix: "rl:user:",
//     sendCommand: (...args) => redisClient.sendCommand(args),
//   }),
// });

// export { 
//   globalRateLimiter,
//   authRateLimiter, 
//   userRateLimiter 
// };
