import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

const registerUser = asyncHandler(async (req, res) =>{});
const loginUser = asyncHandler(async (req, res) => {});
const logOut = asyncHandler(async (req, res) => {});

export { registerUser, loginUser, logOut };
