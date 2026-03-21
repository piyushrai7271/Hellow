import express from "express";
import {authRateLimiter} from "../middlewares/rateLimiter.middleware.js";
import {
  registerUser,
  loginUser,
  logOutUser,
  changePassword,
  refreshAccessToken,
  getCurrentUser,
  uploadAvatar,
  updateAvatar,
  deleteAvatar,
} from "../controllers/auth.controller.js";
import { upload } from "../config/cloudinary.js";
import jwtValidation from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login",authRateLimiter, loginUser);
router.post("/logout", jwtValidation, logOutUser);
router.post("/change-password", jwtValidation, changePassword);
router.post("/refresh-token", refreshAccessToken);
router.get("/get-user-details", jwtValidation,authRateLimiter, getCurrentUser);
router.post("/addAvatar", jwtValidation, upload.single("avatar"), uploadAvatar);
router.put(
  "/updateAvatar",
  jwtValidation,
  upload.single("avatar"),
  updateAvatar
);
router.delete("/deleteAvatar", jwtValidation, deleteAvatar);

export default router;
