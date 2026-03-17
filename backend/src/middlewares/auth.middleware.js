import User from "../models/auth.model.js";

const jwtValidation = (req,res,next) =>{
    try {
        // 1. Get token (cookie OR header)
        const token = req.cookies?.accessToken || 
           req.header("Authorization")?.replace("Bearer ", "");
           
    } catch (error) {
        
    }
}