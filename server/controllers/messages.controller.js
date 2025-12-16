import path from "path";
import pool from "../config/db.js";
import { sendSocketMessage } from "../socket.js";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "fs";

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

export const getMessages = async (req, res, next) => {
  const { userId } = req;
  const { recipientId } = req.params;

  try {
    if (!recipientId) {
      return errorResponse(res, 400, "Recipient id is required.");
    }

    const { rows } = await pool.query(
      `SELECT m.id, m.message, m.image, m.read, m.type, m.created_at, 
       json_build_object(
          'id', sender.id,
          'username', sender.username,
          'email', sender.email,
          'first_name', sender.first_name,
          'last_name', sender.last_name,
          'avatar', sender.avatar
        ) AS sender,

        json_build_object(
          'id', recipient.id,
          'username', recipient.username,
          'email', recipient.email,
          'first_name', recipient.first_name,
          'last_name', recipient.last_name,
          'avatar', recipient.avatar
        ) AS recipient,

        CASE 
        WHEN r.id IS NOT NULL THEN json_build_object(
          'id', r.id,
          'message', r.message,
          'image', r.image,
          'type', r.type,
          'created_at', r.created_at,
          'sender', json_build_object(
              'id', rs.id,
              'username', rs.username,
              'email', rs.email,
              'first_name', rs.first_name,
              'last_name', rs.last_name,
              'avatar', rs.avatar
          ),
          'recipient', json_build_object(
              'id', rr.id,
              'username', rr.username,
              'email', rr.email,
              'first_name', rr.first_name,
              'last_name', rr.last_name,
              'avatar', rr.avatar
          )
        )
        ELSE NULL
      END AS reply

      FROM messages m
      LEFT JOIN users sender ON sender.id = m.sender
      LEFT JOIN users recipient ON recipient.id = m.recipient
      LEFT JOIN messages r ON r.id = m.reply
      LEFT JOIN users rs ON rs.id = r.sender
      LEFT JOIN users rr ON rr.id = r.recipient
      WHERE (m.sender = $1 AND m.recipient = $2) OR (m.sender = $2 AND m.recipient = $1) 
      ORDER BY m.created_at;`,
      [userId, recipientId]
    );

    successResponse(res, 200, rows);
  } catch (error) {
    console.log("Getting Messages error:", error);
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  const { userId } = req;
  const { recipient, reply, message, image, type = null } = req.body;

  try {
    if (!recipient) {
      return errorResponse(res, 400, "Recipient id is required.");
    }

    const { rows } = await pool.query(
      `WITH inserted AS (
            INSERT INTO messages (sender, recipient, reply, message, image, type)
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING id, sender, recipient, reply, message, image, read, type, created_at
        )
        
        SELECT i.id, i.message, i.image, i.read, i.type, i.created_at,  
        json_build_object(
          'id', sender.id,
          'username', sender.username,
          'email', sender.email,
          'first_name', sender.first_name,
          'last_name', sender.last_name,
          'avatar', sender.avatar
        ) AS sender,

        json_build_object(
          'id', recipient.id,
          'username', recipient.username,
          'email', recipient.email,
          'first_name', recipient.first_name,
          'last_name', recipient.last_name,
          'avatar', recipient.avatar
        ) AS recipient,

        CASE 
        WHEN r.id IS NOT NULL THEN json_build_object(
          'id', r.id,
          'message', r.message,
          'image', r.image,
          'type', r.type,
          'created_at', r.created_at,
          'sender', json_build_object(
              'id', rs.id,
              'username', rs.username,
              'email', rs.email,
              'first_name', rs.first_name,
              'last_name', rs.last_name,
              'avatar', rs.avatar
          ),
          'recipient', json_build_object(
              'id', rr.id,
              'username', rr.username,
              'email', rr.email,
              'first_name', rr.first_name,
              'last_name', rr.last_name,
              'avatar', rr.avatar
          )
        )
        ELSE NULL
        END AS reply

        FROM inserted i
        LEFT JOIN users sender ON sender.id = i.sender 
        LEFT JOIN users recipient ON recipient.id = i.recipient
        LEFT JOIN messages r ON r.id = i.reply
        LEFT JOIN users rs ON rs.id = r.sender
        LEFT JOIN users rr ON rr.id = r.recipient;
        `,
      [userId, type ? recipient.id : recipient, reply, message, image, type]
    );

    sendSocketMessage(rows[0]);

    successResponse(res, 201, {
      id: rows[0].id,
      status: "Message succesully sent",
    });
  } catch (error) {
    console.log("Creating message error:", error);
    next(error);
  }
};

export const messageRed = async (req, res, next) => {
  const { messages } = req.body;
  const allMessages = [];

  try {
    if (!messages || !messages.length) {
      return errorResponse(res, 400, "Messages not found");
    }

    for (const message of messages) {
      const { rows } = await pool.query(
        `WITH inserted AS (
          UPDATE messages SET read = $2 WHERE id = $1
          RETURNING id, sender, recipient, reply, message, image, read, type, created_at
        )
          
        SELECT i.id, i.message, i.image, i.read, i.type, i.created_at,  
        json_build_object(
          'id', sender.id,
          'username', sender.username,
          'email', sender.email,
          'first_name', sender.first_name,
          'last_name', sender.last_name,
          'avatar', sender.avatar
        ) AS sender,

        json_build_object(
          'id', recipient.id,
          'username', recipient.username,
          'email', recipient.email,
          'first_name', recipient.first_name,
          'last_name', recipient.last_name,
          'avatar', recipient.avatar
        ) AS recipient,

        CASE 
        WHEN r.id IS NOT NULL THEN json_build_object(
          'id', r.id,
          'message', r.message,
          'image', r.image,
          'created_at', r.created_at,
          'sender', json_build_object(
              'id', rs.id,
              'username', rs.username,
              'email', rs.email,
              'first_name', rs.first_name,
              'last_name', rs.last_name,
              'avatar', rs.avatar
          ),
          'recipient', json_build_object(
              'id', rr.id,
              'username', rr.username,
              'email', rr.email,
              'first_name', rr.first_name,
              'last_name', rr.last_name,
              'avatar', rr.avatar
          )
        )
        ELSE NULL
        END AS reply

        FROM inserted i
        LEFT JOIN users sender ON sender.id = i.sender 
        LEFT JOIN users recipient ON recipient.id = i.recipient
        LEFT JOIN messages r ON r.id = i.reply
        LEFT JOIN users rs ON rs.id = r.sender
        LEFT JOIN users rr ON rr.id = r.recipient;`,
        [message.id, true]
      );

      allMessages.push(rows[0]);
    }

    successResponse(res, 200, allMessages);
  } catch (error) {
    console.log("Read message error:", error);

    next(error);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required." });
    }

    const date = Date.now();
    let imageDie = `uploads/images/${date}`;
    let imageName = `${imageDie}/${req.file.originalname}`;

    mkdirSync(imageDie, { recursive: true });

    renameSync(req.file.path, imageName);

    successResponse(res, 201, `${process.env.SERVER_URL}/${imageName}`);
  } catch (error) {
    console.log("Uploading image error:", error);
    next(error);
  }
};

export const deleteImage = (req, res, next) => {
  const { image } = req.query;
  try {
    const imagePath = image
      ? `uploads${image.split("uploads").pop() || ""}`
      : null;
    if (existsSync(imagePath)) {
      rmSync(imagePath, { force: true });
      console.log(`File deleted: ${imagePath}`);
    }

    const folderPath = path.dirname(imagePath);

    if (existsSync(folderPath) && !readdirSync(folderPath).length) {
      rmSync(folderPath, { recursive: true, force: true });
      console.log(`Folder deleted: ${folderPath}`);
    }

    successResponse(res, 200, "Image succesfully deleted");
  } catch (error) {
    console.error("Deleting image error:", error);
    next(error);
  }
};
