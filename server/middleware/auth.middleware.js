import { requireAuth } from "@clerk/express";
import pool from "../config/db.js";

export const AuthMiddleware = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;
      if (!clerkId)
        return res
          .status(401)
          .json({ message: "Unauthorized - invalid token" });

      const { rows } = await pool.query(
        `SELECT * FROM users WHERE clerk_id = $1;`,
        [clerkId]
      );

      const user = rows[0];
      if (!user) return res.status(404).json({ message: "User not found" });

      req.userId = user.id;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

export default AuthMiddleware;
