import { config } from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";


const auth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({msg:'No token, authorization denied'});
    }

    const token = authHeader.split(' ')[1];

    try {

        const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);

        req.user = await User.findById(decoded.id).select('-password'); // Attach user to request

        next();

    } catch (e) {
        console.error("Token verification error:", e.message);
        res.status(401).json({msg:'Token is not valid'});
    }
};


const adminAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({msg:'No token, authorization denied'});
    }

    const token = authHeader.split(' ')[1];

    try {

        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);

        req.user = await Admin.findById(decoded.id).select('-password'); // Attach user to request

        next();

    } catch (e) {
        console.error("Token verification error:", e.message);
        res.status(401).json({msg:'Token is not valid'});
    }
};

export { auth , adminAuth };