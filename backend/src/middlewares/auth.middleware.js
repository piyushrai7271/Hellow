import User from "../models/auth.model.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const jwtValidation = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized: access token missing");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user; // use when you only need read data
    req.userId = decodedToken._id; // use when you need to update sensitive data not only read

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }

    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid access token");
    }

    throw new ApiError(401, "Unauthorized access");
  }
};

export default jwtValidation;
