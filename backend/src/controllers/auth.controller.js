import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import User from "../models/auth.model.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(
      "somthing went worng while generating access and refresh token"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  // take input from body
  const { fullName, email, mobileNumber, bio, gender, password } = req.body;

  // validate comming input
  if (!fullName || !email || !mobileNumber || !bio || !gender || !password) {
    throw new ApiError(404, "Please provide all the required field");
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

  // fetch created user without sensitive data
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Somthing went wrong");
  }

  // return success response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  // take login details
  const { email, password } = req.body;

  // validate comming input
  if (!email || !password) {
    throw new ApiError(400, "email or password is missing");
  }

  // find user with email
  const user = await User.find({ email });
  if (!user) {
    throw new ApiError(404, "User not found !!");
  }

  // if user found validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Please provide valid password");
  }

  // if password is correct generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // handle cookie options to send token inside it
  const isProduction = process.env.NODE_DEV === "PRODUCTION";

  const accessTokenOption = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000
  }

  const refreshTokenOption = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  // fetched logedin user
  const logedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // return response with token
  return res
     .status(200)
     .cookie("accessToken",accessToken,accessTokenOption)
     .cookie("refreshToken",refreshToken, refreshTokenOption)
     .json(
        new ApiResponse(200, "User logged in successfully !!")
     );
});
const logOut = asyncHandler(async (req, res) => {
    // take user from middleware
    const user = req.user;

    // check user is there or not
    if(!user){
        throw new ApiError(404,"User is not found");
    }

    // Invalidate refreshToken in db
    user.refreshToken = undefined;
    await user.save({validateBeforeSave: false});

    // cleare cookies of access and refresh token with response
  const isProduction = process.env.NODE_ENV === "PRODUCTION";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };

  // clear cookies
  return res
     .status(200)
     .clearCookie("accessToken",cookieOptions)
     .clearCookie("refreshToken", cookieOptions)
     .json(new ApiResponse(200, "User logged out successfully !!"))
});
const changePassword = asyncHandler(async (req, res) => {
});
const refreshAccessToken = asyncHandler(async (req, res) => {});
const getUserDetails = asyncHandler(async (req, res) => {});
const addAvatar = asyncHandler(async (req, res) => {});
const updateAvatar = asyncHandler(async (req, res) => {});
const deleteAvatar = asyncHandler(async (req, res) => {});

export {
  registerUser,
  loginUser,
  logOut,
  changePassword,
  refreshAccessToken,
  getUserDetails,
  addAvatar,
  updateAvatar,
  deleteAvatar,
};
