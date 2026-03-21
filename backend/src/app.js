import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {globalRateLimiter} from "./middlewares/rateLimiter.middleware.js"
import { errorMiddleware } from "./middlewares/error.middleware.js";
const app = express();

app.use(cors({
     origin:process.env.CORS_ORIGIN,
     credentials:true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// trust proxy (very Importent in production)
app.set("trust proxy",1); // help to find correct ip important
app.use(globalRateLimiter);

// import routes..........
import userRouter from "./routes/auth.routes.js";

app.use("/api/user", userRouter);

// global error handler
app.use(errorMiddleware);

export default app;
