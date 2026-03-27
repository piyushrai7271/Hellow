import { createClient } from "redis";

let redisClient = null;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,

    // ❗ disable infinite retry spam
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 2) {
          console.log("❌ Redis retry limit reached");
          return new Error("Retry limit reached");
        }
        return 1000; // retry after 1 sec
      },
    },
  });

  redisClient.on("error", (err) => {
    console.log("⚠️ Redis not available, using memory fallback");
  });

  try {
    await redisClient.connect();
    console.log("✅ Redis connected");
  } catch (err) {
    console.log("❌ Redis connection failed");
    redisClient = null;
  }
} else {
  console.log("⚠️ No REDIS_URL, using memory rate limiter");
}

export default redisClient;





















// import { createClient } from "redis";

// let redisClient = null;

// if (process.env.REDIS_URL) {
//   redisClient = createClient({
//     url: process.env.REDIS_URL,
//   });

//   redisClient.on("error", (err) => {
//     console.error("Redis Client Error :", err);
//   });

//   try {
//     await redisClient.connect();
//     console.log("✅ Redis connected Successfully !!");
//   } catch (err) {
//     console.log("❌ Redis connection failed");
//     redisClient = null;
//   }
// } else {
//   console.log("⚠️ No REDIS_URL, using memory rate limiter");
// }

// export default redisClient;