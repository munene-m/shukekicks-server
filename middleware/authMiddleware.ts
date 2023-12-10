import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import Auth from "../models/auth";
import rateLimit from "express-rate-limit";

interface DecodedToken extends JwtPayload {
  userId: string; // Adjust the structure as needed based on your token
}

// Define a rate limit middleware for authenticated users
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Maximum requests per windowMs per user
  keyGenerator: (req) => {
    // Generate a unique key based on the user's identifier (e.g., user ID)
    if (req.user) {
      return req.user.id.toString();
    }
    // Return a default key for unauthenticated users
    return "unauthenticated";
  },
  message: "Too many requests from this user, please try again later.",
});

const userProtect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as DecodedToken;

    const user = await Auth.findById(decoded.id).select("-password");
    if (user) {
      req.user = { id: user._id, ...user };
    }

    // Apply rate limiting for authenticated users
    authLimiter(req, res, (err: any) => {
      if (err) {
        return res
          .status(429)
          .json({ message: "Rate limit exceeded. Try again later." });
      }
      next();
    });
  } else {
    return res.status(401).json({ message: "Unauthorized attempt" });
  }
};

export default userProtect;
