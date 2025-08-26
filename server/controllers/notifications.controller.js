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

export const getNotifications = async (req, res, next) => {
  const { userId } = req;
  try {
    const { rows } = await pool.query(
      `SELECT 
        'id', n.id,
        'type', n.type, 
        'is_seen', n.is_seen,
        'created_at', n.created_at,
        json_build_object(
            'id',  p.id,
            'image', p.image,
            'content', p.content,
            'created_at', p.created_at
        ) as post,

        json_build_object(
            'id',  s.id,
            'username', s.username,
            'email', s.email,
            'first_name', s.first_name,
            'last_name', s.last_name,
            'avatar', s.avatar
        ) as sender,
        
        json_build_object(
            'id',  s.id,
            'username', s.username,
            'email', s.email,
            'first_name', s.first_name,
            'last_name', s.last_name,
            'avatar', s.avatar
        ) as receiver,

       COALESCE(
         json_build_object(
            'id', c.id,
            'comment', c.comment,
            'created_at', c.created_at
          ),
            null
        ) AS comment
      
      FROM notifications n 
      LEFT JOIN posts p ON n.post_id = p.id 
      LEFT JOIN users s ON n.sender_id = s.id
      LEFT JOIN users r ON n.receiver_id = r.id
      LEFT JOIN comments c ON n.comment_id = c.id
      WHERE n.receiver_id = $1 ORDER BY n.created_at DESC;`,
      [userId]
    );

    return successResponse(res, 200, rows);
  } catch (error) {
    console.log("Getting notifications error:", error);
    next(error);
  }
};

export const notificationRead = async (req, res, next) => {
  const { id } = req.params;
  try {
    await pool.query(`UPDATE notifications SET is_seen = true WHERE id = $1`, [
      id,
    ]);

    successResponse(res, 200, "Updated succesfully");
  } catch (error) {
    console.log("Notification read error:", error);
    next(error);
  }
};
