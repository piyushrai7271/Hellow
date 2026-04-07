import express from "express";
import jwtValidation from "../middlewares/auth.middleware.js";
import {upload} from "../config/cloudinary.js";
import {
  getChatMessages,
  getUserChats,
  createNewChat,
  uploadMessageFile,
} from "../controllers/chat.controller.js";
const router = express.Router();

router.get("/messages/:chatId", jwtValidation, getChatMessages);
router.get("/allMessages", jwtValidation, getUserChats);
router.post("/create-new-chat", jwtValidation, createNewChat);
router.post(
  "/upload-message-file",
  jwtValidation,
  upload.single("message"),
  uploadMessageFile
);

export default router;
