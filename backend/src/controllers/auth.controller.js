import User from "../models/auth.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import generateAccessAndRefreshToken from "../services/auth.service.js";
import {uploadOnCloudinary,deleteFromCloudinary} from "../config/cloudinary.js";
import {getAccessTokenOptions,getRefreshTokenOptions} from "../utils/cookieOptions.js";
import { isAccountLocked, recordFailedAttempt, clearLoginAttempts } from "../services/loginSecurity.service.js";


const registerUser = asyncHandler(async (req, res) => {
  // take input from body
  const { fullName, email, mobileNumber, bio, gender, password } = req.body;

  // validate comming input
  if (!fullName || !email || !mobileNumber || !bio || !gender || !password) {
    throw new ApiError(400, "Please provide all required fields");
  }

  // check gender match or not
  if (!["Male", "Female", "Other"].includes(gender)) {
    throw new ApiError(400, "Please provide valid gender");
  }

  // check if user already exist with that email if not than only create user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "user already exist with this email");
  }

  // creating user if already not exist
  const user = await User.create({
    fullName,
    email,
    mobileNumber,
    bio,
    gender,
    password, // password is hashed in model
  });

  // removing sensitive data from user
  user.password = undefined;
  user.refreshToken = undefined;

  // return success response
  return res
    .status(201)
    .json(new ApiResponse(201, user, "User created successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  // take login details
  const { email, password } = req.body;

  // validate comming input
  if (!email || !password) {
    throw new ApiError(400, "email or password is missing");
  }

  // 1. Check if account is locked (VERY IMPORTANT)
  const isLocked = await isAccountLocked(email);
  if (isLocked) {
    throw new ApiError(403, "Account is temporarily locked. Try again later.");
  }

  // find user with email
  const user = await User.findOne({ email });

  if (!user) {
    // record failed attempt
    await recordFailedAttempt(email);
    throw new ApiError(401, "Invalid email or password");
  }

  // if user found validate password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    //record failed attempt
    const locked = await recordFailedAttempt(email);

    //if account just got locked
    if (locked) {
      throw new ApiError(403, "Account locked due to too many failed attempts");
    }

    throw new ApiError(401, "Invalid email or password");
  }

  // 2. RESET attempts on success (VERY IMPORTANT 🔥)
  await clearLoginAttempts(email);

  // if password is correct generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // removing password and refreshToken from user before sending
  user.password = undefined;
  user.refreshToken = undefined;

  // return response with token
  return res
    .status(200)
    .cookie("accessToken", accessToken, getAccessTokenOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenOptions())
    .json(new ApiResponse(200, user, "User logged in successfully !!"));
});
const logOutUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User is not found");
  }

  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully !!"));
});
const changePassword = asyncHandler(async (req, res) => {
  // take input currentPassword, newPassword, confirmPassword
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.userId;

  // validate comming input
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "Please provide all required fields");
  }

  // user id from middleware
  if (!userId) {
    throw new ApiError(401, "Unauthorized access !!");
  }

  // check that newPassword and confirmPassword is equal or not
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "newPassword is not equal to confirm password");
  }

  // check newPassword and current password should not same
  if(currentPassword === newPassword){
    throw new ApiError(400, "please provide unique new password")
  }

  // find user with userId using middleware
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found with user id");
  }

  // check current password is good or not
  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is invalid");
  }
  // if current password is correct than update the password
  user.password = newPassword;
  await user.save();

  //return response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password is changed successfully !!"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  // token comming from cookies or body
  const incommingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorize access");
  }
  try {
    // decoding token with jwt
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new ApiError(402, "Decoded token is not comming");
    }

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(404, "Invalid refreshToken");
    }

    // compair saved refreshToken with incomming refreshToken
    if (incommingRefreshToken !== user.refreshToken) {
      throw new ApiError(405, "Refresh token is expired or used");
    }

    // generating new refresh and access token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // return response
    return res
      .status(200)
      .cookie("accessToken", accessToken, getAccessTokenOptions)
      .cookie("refreshToken", refreshToken, getRefreshTokenOptions)
      .json(new ApiResponse(200, {}, "Access token refreshed !!"));
  } catch (error) {
    throw new ApiError(500, "Internal server error");
  }
});
const getCurrentUser = asyncHandler(async (req, res) => {
  // comming from middleware
  const user = req.user;

  // return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        bio: user.bio,
        avatar: user.avatar,
      },
      "User data fetched successfully !!"
    )
  );
});
const uploadAvatar = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!req.file) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Store old public_id
  const oldPublicId = user.avatar?.public_id;

  // 1️⃣ Upload new avatar
  const uploadResult = await uploadOnCloudinary(req.file, "avatars");

  if (!uploadResult) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  // 2️⃣ Update DB FIRST
  user.avatar = {
    url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
  };

  await user.save();

  // 3️⃣ Delete old avatar AFTER success
  if (oldPublicId) {
    try {
      await deleteFromCloudinary(oldPublicId);
    } catch (error) {
      console.error("Old avatar deletion failed:", error);
      // Don't break request
    }
  }

  // 4️⃣ Response
  return res.status(200).json(
    new ApiResponse(
      200,
      { avatar: user.avatar },
      "Avatar updated successfully"
    )
  );
});
const updateAvatar = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!req.file) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Store old public_id (for later deletion)
  const oldPublicId = user.avatar?.public_id;

  // Upload new avatar FIRST (safe step)
  const uploadResult = await uploadOnCloudinary(req.file, "avatars");

  if (!uploadResult) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  // Update DB with new avatar
  user.avatar = {
    url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
  };

  await user.save();

  // Delete old avatar (AFTER success)
  if (oldPublicId) {
    try {
      await deleteFromCloudinary(oldPublicId);
    } catch (error) {
      console.error("Old avatar deletion failed:", error);
      // ❗ Don't throw error (user already updated)
    }
  }

  // Response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { avatar: user.avatar },
        "Avatar updated successfully"
      )
    );
});
const deleteAvatar = asyncHandler(async (req, res) => {
  // comming from middleware
  const user = req.user; 

  // Check if avatar exists
  if (!user.avatar?.public_id) {
    throw new ApiError(400, "No avatar to delete");
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(user.avatar.public_id);

  // Remove from DB
  user.avatar = {
    url: "",
    public_id: "",
  };

  await user.save();

  // Response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Avatar deleted successfully"));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  changePassword,
  refreshAccessToken,
  getCurrentUser,
  uploadAvatar,
  updateAvatar,
  deleteAvatar,
};
