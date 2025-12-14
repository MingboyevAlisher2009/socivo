import pool from "../db/db.js";

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

export const getContacts = async (req, res, next) => {
  const { userId } = req;
  try {
    const { rows } = await pool.query(
      `SELECT
      contact.id,
      contact.username,
      contact.email,
      contact.first_name,
      contact.last_name,
      contact.avatar,
      MAX(m.created_at) AS last_message_time
      FROM (
        SELECT following_id AS contact_id
        FROM follow
        WHERE follower_id = $1

        UNION

        SELECT CASE WHEN sender = $1 THEN recipient ELSE sender END AS contact_id
        FROM messages
        WHERE sender = $1 OR recipient = $1
      ) c
      JOIN users contact ON contact.id = c.contact_id
      LEFT JOIN messages m
        ON (
          (m.sender = $1 AND m.recipient = contact.id)
          OR
          (m.sender = contact.id AND m.recipient = $1)
        )
      GROUP BY contact.id
      ORDER BY last_message_time DESC NULLS LAST;`,
      [userId]
    );

    const allContacts = rows;

    for (const contact of allContacts) {
      const { rows: lastMessage } = await pool.query(
        `SELECT m.id, m.reply, m.message, m.image, m.read, m.type, m.created_at, 
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
            ) AS recipient
          FROM messages m
          LEFT JOIN users sender ON sender.id = m.sender
          LEFT JOIN users recipient ON recipient.id = m.recipient
          WHERE (m.sender = $1 AND m.recipient = $2) 
          OR (m.sender = $2 AND m.recipient = $1)
          ORDER BY m.created_at DESC 
          LIMIT 1;`,
        [userId, contact.id]
      );

      contact.lastMessage = lastMessage[0];
    }

    successResponse(res, 200, allContacts);
  } catch (error) {
    console.log("Getting vonracts error:", error);
    next(error);
  }
};
