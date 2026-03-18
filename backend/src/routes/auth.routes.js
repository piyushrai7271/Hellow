import express from "express";
import {
    registerUser,
    loginUser,
    logOut,
    changePassword,
    refreshAccessToken,
    getUserDetails,
    addAvatar,
    updateAvatar,
    deleteAvatar
} from "../controllers/auth.controller.js";
const router = express.Router();


router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/logout",logOut);
router.post("/change-password",changePassword);
router.post("/refresh-token",refreshAccessToken);
router.get("/get-user-details",getUserDetails);
router.post("/addAvatar",addAvatar);
router.put("/updateAvatar",updateAvatar);
router.delete("/deleteAvatar",deleteAvatar);

export default router;