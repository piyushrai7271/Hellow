import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";
import ApiError from "../utils/ApiError.js";
import cookie from "cookie";

const socketAuth = async (socket, next) => {
  try {
    // Read cookie header manually
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new ApiError(401, "No cookies found"));
    }

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.accessToken;

    if (!token) {
      return next(new ApiError(401, "No access token"));
    }

    let decodedToken;

    try {
      //Verify token (same logic as REST)  
      decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      );
    } catch (err) {
      return next(new ApiError(401, "Invalid token"));
    }

    //Optional but recommended: check user exists
    const user = await User.findById(decodedToken._id)
      .select("_id fullName email");

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Attach user info to socket
    socket.user = user;
    socket.userId = user._id;

    next();

  } catch (error) {
    next(error);
  }
};

export default socketAuth;