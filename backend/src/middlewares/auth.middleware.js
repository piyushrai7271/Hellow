import User from "../models/auth.model.js";
import jwt from "jsonwebtoken";

const jwtValidation = async (req, res, next) => {
  try {
    // 1. Get token (cookie OR header)
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // 2. if token missing give error
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: access token missing",
      });
    }
    // 3. decode token to get user id which is added in token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 4. find user with decoded token it
    const user = await User.findById(decodedToken._id || decodedToken.id);

    // 5. Attach decoded data to request
    req.user = user;
    req.userId = user._id;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: invalid or expired token",
    });
  }
};

export default jwtValidation;
