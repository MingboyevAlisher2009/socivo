import { compare, hash } from "bcrypt";
import pool from "../db/db.js";
import BaseError from "../error/base.error.js";
import mailService from "../services/mail.service.js";
import { generateToken } from "../services/token.service.js";
import { existsSync, renameSync, unlinkSync } from "fs";

const validEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const errorResponse = (res, status, message) => {
  return res.status(status).json({
    status: "error",
    message,
  });
};

const successResponse = (res, status, data) => {
  return res.status(status).json({
    status: "success",
    data,
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email) {
      return BaseError.BadRequest("Email is required.");
    } else if (!validEmail.test(email)) {
      return BaseError.BadRequest("Invalid email format.");
    } else if (!password) {
      return BaseError.BadRequest("Password is required.");
    }

    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    const user = result.rows[0];

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    if (!user.is_verified) {
      await mailService.sendOtp(user.email);
      return successResponse(res, 200, {
        id: user.id,
        username: user.username,
        email: user.email,
        is_verified: user.is_verified,
        message: "Please verify your email.",
      });
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    generateToken(res, user.id);

    return successResponse(res, 200, {
      id: user.id,
      username: user.username,
      is_verified: user.is_verified,
      message: "Login successful",
    });
  } catch (error) {
    console.log("Login error:", error);

    next(error);
  }
};

export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return BaseError.BadRequest("Email is required.");
    }

    await mailService.sendOtp(email);

    return successResponse(res, 201, "Verification code sent.");
  } catch (error) {
    console.error("Error sending OTP:", error);
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    if (!email) {
      return BaseError.BadRequest("Email is required.");
    } else if (!validEmail.test(email)) {
      return BaseError.BadRequest("Invalid email format.");
    } else if (!otp) {
      return BaseError.BadRequest("OTP is required.");
    }

    await mailService.verifyOtp(email, otp);

    successResponse(res, 200, {
      message: "Account verified successfully.",
    });
  } catch (error) {
    console.log("Verify OTP error:", error);
    next(error);
  }
};

export const signUp = async (req, res, next) => {
  const { email, username, password } = req.body;
  console.log("Sign up request:", req.body);

  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar TEXT,
    bio TEXT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_verified BOOLEAN DEFAULT false
);`);
    if (!email) {
      return BaseError.BadRequest("Email is required.");
    } else if (!validEmail.test(email)) {
      return BaseError.BadRequest("Invalid email format.");
    }
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    const existingUser = result.rows[0];

    if (existingUser) {
      return errorResponse(res, 409, "User with this email already exists.");
    }

    const hashPassword = await hash(password, 10);

    await pool.query(
      `INSERT INTO users (email, username, password) VALUES ($1, $2, $3)`,
      [email, username, hashPassword]
    );

    await mailService.sendOtp(email);

    return successResponse(res, 201, {
      email: email,
      message: "User created successfully. Please verify your email.",
    });
  } catch (error) {
    console.log("Sign up error:", error);
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req;

  const identify = id.startsWith("me") ? userId : id;

  try {
    const result = await pool.query(
      `SELECT 
      u.id, 
      u.username, 
      u.email, 
      u.first_name, 
      u.last_name, 
      u.avatar, 
      u.bio,
      u.is_verified, 
      u.created_at,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'post_id', p.id,
            'content', p.content,
            'image', p.image,
            'created_at', p.created_at
          )
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'
      ) AS posts,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', fu.id,
            'first_name', fu.first_name,
            'last_name', fu.last_name,
            'email', fu.email,
            'username', fu.username,
            'avatar', fu.avatar
          )
        ) FILTER (WHERE f1.follower_id IS NOT NULL),
        '[]'
      ) AS followers,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', fo.id,
            'first_name', fo.first_name,
            'last_name', fo.last_name,
            'email', fo.email,
            'username', fo.username,
            'avatar', fo.avatar
          )
        ) FILTER (WHERE f2.following_id IS NOT NULL),
        '[]'
      ) AS following
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN follow f1 ON f1.following_id = u.id
    LEFT JOIN users fu ON fu.id = f1.follower_id
    LEFT JOIN follow f2 ON f2.follower_id = u.id
    LEFT JOIN users fo ON fo.id = f2.following_id
    WHERE u.id::text = $1 OR u.username = $1
    GROUP BY u.id;
    `,
      [identify]
    );

    const user = result.rows[0];

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    return successResponse(res, 200, user);
  } catch (error) {
    console.log("Get me error:", error);
    next(error);
  }
};

export const getSuggestedUsers = async (req, res, next) => {
  const { userId } = req;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE id <> $1 ORDER BY RANDOM() LIMIT 5;`,
      [userId]
    );
    successResponse(res, 200, rows);
  } catch (error) {
    console.log("Suggested error:", error);
    next(error);
  }
};

export const search = async (req, res, next) => {
  const { userId } = req;
  const { identify } = req.params;

  if (!identify?.trim()) {
    return successResponse(res, 200, []);
  }

  try {
    const searchTerm = `%${identify.trim()}%`;

    const { rows: users } = await pool.query(
      `SELECT id, username, email, first_name, last_name, avatar, is_verified, created_at
       FROM users
       WHERE email ILIKE $1 OR username ILIKE $1;`,
      [searchTerm]
    );

    const filteredUsers = users.filter((user) => user.id !== userId);
    return successResponse(res, 200, filteredUsers);
  } catch (error) {
    console.error("Searching error: ", error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { userId } = req;
  const { username, first_name, last_name, bio } = req.body;

  try {
    const { rowCount: usernameExists } = await pool.query(
      `SELECT 1 FROM users WHERE username = $1 AND id <> $2 LIMIT 1`,
      [username, userId]
    );

    if (usernameExists) {
      return errorResponse(res, 400, "This username already exists.");
    }

    const { rows } = await pool.query(
      `UPDATE users
       SET username = $1,
           first_name = $2,
           last_name = $3,
           bio = $4
       WHERE id = $5
       RETURNING id, username, first_name, last_name, bio`,
      [username, first_name, last_name, bio, userId]
    );

    if (!rows.length) {
      return errorResponse(res, 404, "User not found.");
    }

    return successResponse(
      res,
      200,
      "Profile information updated successfully",
      rows[0]
    );
  } catch (error) {
    console.error("Updating user error:", error);
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  const { userId } = req;

  try {
    const file = req.file;

    const { rows: users } = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );
    const user = users[0];

    if (!file) {
      return BaseError.BadRequest("Avatar file is required.");
    }

    const date = Date.now();
    const fileName = `uploads/avatars/${date}-${file.originalname}`;

    try {
      renameSync(file.path, fileName);
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Error saving image");
    }

    if (!existsSync(fileName)) {
      return BaseError.BadRequest("File upload failed.");
    }

    const { rows } = await pool.query(
      `UPDATE users SET avatar = $1 WHERE id = $2;`,
      [fileName, userId]
    );

    if (!rows) {
      unlinkSync(fileName);
      return errorResponse(res, 404, "User not found");
    }

    if (user.avatar && existsSync(user.avatar)) {
      unlinkSync(user.avatar);
      return;
    }

    return successResponse(res, 200, {
      imageUrl: fileName,
      message: "Profile image updated successfully",
    });
  } catch (error) {
    console.log("Update avatar error:", error);
    if (req.file && existsSync(req.file.path)) {
      unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const deleteAvatar = async (req, res, next) => {
  const { userId } = req;

  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1;`, [
      userId,
    ]);

    const user = rows[0];

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    if (user.avatar && existsSync(user.avatar)) {
      try {
        unlinkSync(user.avatar);
      } catch (error) {
        console.error("File deletion error:", error);
        return errorResponse(res, 500, "Error removing image file");
      }
    } else {
      return errorResponse(res, 404, "No profile image to remove");
    }

    await pool.query(`UPDATE users SET avatar = null WHERE id = $1;`, [userId]);

    return successResponse(res, 201, "Profile image removed successfully");
  } catch (error) {
    console.log("Romove avatar error: ", error);
    next(error);
  }
};
