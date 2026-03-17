import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware.js";
const app = express();

app.use(cors({
     origin:process.env.CORS_ORIGIN,
     credentials:true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// import routes..........
import userRouter from "./routes/auth.routes.js";

app.use("/api/user", userRouter);

// global error handler
app.use(errorMiddleware);

export default app;
