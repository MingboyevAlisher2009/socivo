import pool from "../db/db.js";
import BaseError from "../error/base.error.js";
import { existsSync, renameSync, unlinkSync } from "fs";
import { sendComment, sendLike, sendNotifications } from "../socket.js";

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

export const getPosts = async (req, res, next) => {
  const { userId } = req;
  const { page = 1, limit = 20 } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const offset = (pageNumber - 1) * limitNumber;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
      posts.*, 
      users.email AS author_email,
      users.username AS author_username,
      users.first_name AS author_first_name,
      users.last_name AS author_last_name,
      users.avatar AS author_avatar,
      users.bio AS author_bio,
      users.is_verified AS author_is_verified,

       COALESCE(
       json_agg(
          DISTINCT jsonb_build_object(
        'id', likes.id,
        'user_id', like_users.id,
        'username', like_users.username,
        'email', like_users.email,
        'first_name', like_users.first_name,
        'last_name', like_users.last_name,
        'avatar', like_users.avatar,
        'liked_at', likes.created_at
      )
    ) FILTER (WHERE likes.id IS NOT NULL),
      '[]'
    ) AS likes,

      COALESCE(
        json_agg(
         DISTINCT jsonb_build_object(
          'id', comments.id,
          'author', json_build_object (
          'user_id', comment_users.id,
          'username', comment_users.username,
          'email', comment_users.email,
          'first_name', comment_users.first_name,
          'last_name', comment_users.last_name,
          'avatar', comment_users.avatar
          ),
          'comment', comments.comment, 
          'created_at', comments.created_at
          ) 
      ) FILTER (WHERE comments.id IS NOT NULL), '[]'
      ) AS comments


      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON posts.id = likes.post_id
      LEFT JOIN comments ON posts.id = comments.post_id
      LEFT JOIN users AS like_users ON like_users.id = likes.user_id
      LEFT JOIN users AS comment_users ON comment_users.id = comments.user_id

      GROUP BY posts.id, users.id
      ORDER BY RANDOM()
      LIMIT $1 OFFSET $2;
     `,
      [limitNumber, offset]
    );

    const posts = rows.map((post) => {
      const {
        author_email,
        author_username,
        author_first_name,
        author_last_name,
        author_avatar,
        author_bio,
        author_is_verified,
        ...rest
      } = post;

      return {
        ...rest,
        likes_count: post.likes.length,
        isLiked: !!post.likes.some((l) => l.user_id === userId),
        comments_count: post.comments.length,
        author: {
          email: author_email,
          username: author_username,
          first_name: author_first_name,
          last_name: author_last_name,
          avatar: author_avatar,
          bio: author_bio,
          is_verified: author_is_verified,
        },
      };
    });

    return successResponse(res, 200, posts);
  } catch (error) {
    console.error("Getting posts error: ", error);
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  const { userId } = req;
  const { id } = req.params;

  try {
    if (!id) {
      return errorResponse(res, 404, "Post id is required.");
    }

    const { rows } = await pool.query(
      `SELECT 
        posts.*, 
        json_build_object(
          'id', users.id,
          'username', users.username,
          'email', users.email,
          'first_name', users.first_name,
          'last_name', users.last_name,
          'avatar', users.avatar,
          'bio', users.bio
        ) AS author,

        COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
          'id', likes.id,
          'user_id', like_users.id,
          'username', like_users.username,
          'email', like_users.email,
          'first_name', like_users.first_name,
          'last_name', like_users.last_name,
          'avatar', like_users.avatar,
          'liked_at', likes.created_at
        )
      ) FILTER (WHERE likes.id IS NOT NULL),
        '[]'
      ) AS likes,

        COALESCE(
          json_agg(
          DISTINCT jsonb_build_object(
            'id', comments.id,
            'author', json_build_object (
            'user_id', comment_users.id,
            'username', comment_users.username,
            'email', comment_users.email,
            'first_name', comment_users.first_name,
            'last_name', comment_users.last_name,
            'avatar', comment_users.avatar
            ),
            'comment', comments.comment, 
            'created_at', comments.created_at
            ) 
        ) FILTER (WHERE comments.id IS NOT NULL), '[]'
        ) AS comments 
      FROM posts 
      LEFT JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON posts.id = likes.post_id
      LEFT JOIN users AS like_users ON like_users.id = likes.user_id
      LEFT JOIN comments ON posts.id = comments.post_id
      LEFT JOIN users AS comment_users ON comment_users.id = comments.user_id
      WHERE posts.id = $1
      GROUP BY posts.id, users.id
      ;`,
      [id]
    );
    const post = rows[0];
    const formatedPost = {
      ...post,
      isLiked: post.likes.some((like) => like.user_id === userId),
      likes_count: post.likes.length,
      comments_count: post.comments.length,
    };

    successResponse(res, 200, formatedPost);
  } catch (error) {
    console.log("Getting post error: ", error);
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  const { userId } = req;
  const { content } = req.body;
  const file = req.file;

  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS posts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES person(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT now()
        );`);
    if (!content) {
      return BaseError.BadRequest(
        "Content is required. Please enter your preferences."
      );
    } else if (!file) {
      return BaseError.BadRequest("Please share your photo. ");
    }

    const date = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `uploads/posts/${date}-${file.originalname}`;

    if (file.path && existsSync(file.path)) {
      renameSync(file.path, filename);
    } else {
      return errorResponse(res, 500, "Photo upload failed");
    }

    await pool.query(
      `INSERT INTO posts (user_id, content, image) VALUES ($1, $2, $3);`,
      [userId, content, filename]
    );

    return successResponse(res, 201, "Post created succefully.");
  } catch (error) {
    console.log("Creating post error:", error);
    next(error);
  }
};

export const toggleFollow = async (req, res, next) => {
  const { userId } = req;
  const { id } = req.body;

  try {
    if (!id) {
      return errorResponse(res, 400, "Following id reqiured");
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS follow (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
      following_id UUID REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(follower_id, following_id)
   );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
          receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
          post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
          comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
          type VARCHAR(10) CHECK(notifications.type = 'like' OR notifications.type = 'comment' OR notifications.type = 'follow'),
          created_at TIMESTAMP DEFAULT now(),
          is_seen BOOLEAN DEFAULT false
        );`);

    const { rows } = await pool.query(
      `SELECT * FROM follow WHERE follower_id = $1 AND following_id = $2;`,
      [userId, id]
    );

    if (rows.length) {
      const { rows: user } = await pool.query(
        `WITH inserted AS (
          DELETE FROM follow WHERE id = $1
          RETURNING follower_id, following_id
        )
        SELECT f.id, f.username, f.email, f.first_name, f.last_name, f.avatar, f.bio 
        FROM inserted 
        LEFT JOIN users AS f ON inserted.following_id = f.id;`,
        [rows[0].id]
      );

      return successResponse(res, 200, { ...user[0], type: "unfollow" });
    } else {
      const { rows: user } = await pool.query(
        `WITH inserted AS (
        INSERT INTO follow (follower_id, following_id) VALUES ($1, $2) RETURNING follower_id, following_id
        )
        
        SELECT f.id, f.username, f.email, f.first_name, f.last_name, f.avatar, f.bio FROM inserted 
        LEFT JOIN users f ON inserted.following_id = f.id;`,
        [userId, id]
      );

      const { rows } = await pool.query(
        `WITH inserted AS (
          INSERT INTO notifications (sender_id, receiver_id, type)
          VALUES ($1, $2, $3)
          RETURNING id, type, is_seen, created_at, sender_id, receiver_id
          )
        SELECT 
          i.id,
          i.type,
          i.is_seen,
          i.created_at,
          json_build_object(
            'id',  s.id,
            'username', s.username,
            'email', s.email,
            'first_name', s.first_name,
            'last_name', s.last_name,
            'avatar', s.avatar
          ) AS sender,
          json_build_object(
            'id',  r.id,
            'username', r.username,
            'email', r.email,
            'first_name', r.first_name,
            'last_name', r.last_name,
            'avatar', r.avatar
          ) AS receiver
        FROM inserted i
        LEFT JOIN users s ON i.sender_id = s.id
        LEFT JOIN users r ON i.receiver_id = r.id;`,
        [userId, id, "follow"]
      );

      sendNotifications(rows[0]);
      return successResponse(res, 201, { ...user[0], type: "follow" });
    }
  } catch (error) {
    console.log("Toggle following error:", error);
    next(error);
  }
};

export const like = async (req, res, next) => {
  const { userId } = req;
  const { post_id } = req.body;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS likes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT now(),
      UNIQUE (user_id, post_id)
      );
    `);

    await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
          receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
          post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
          comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
          type VARCHAR(10) CHECK(notifications.type = 'like' OR notifications.type = 'comment' OR notifications.type = 'follow'),
          created_at TIMESTAMP DEFAULT now(),
          is_seen BOOLEAN DEFAULT false
        );`);

    const { rows: likes } = await pool.query(
      `SELECT * FROM likes WHERE post_id = $1 AND user_id = $2;`,
      [post_id, userId]
    );

    if (likes.length) {
      await pool.query(
        `DELETE FROM likes WHERE post_id = $1 AND user_id = $2;`,
        [post_id, userId]
      );

      sendLike({ post_id, user_id: userId, deleted: true });

      return successResponse(res, 200, { liked: false });
    } else {
      const { rows } = await pool.query(
        `WITH inserted AS (
          INSERT INTO likes (user_id, post_id)
          VALUES ($1, $2)
          RETURNING id, user_id, post_id, created_at
        )
      SELECT 
        i.id,
        i.post_id,
        i.created_at AS liked_at,
        u.id AS user_id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.avatar,
        json_build_object(
          'id',  a.id,
          'username', a.username,
          'email', a.email,
          'first_name', a.first_name,
          'last_name', a.last_name,
          'avatar', a.avatar
        ) AS author
      FROM inserted i
      JOIN posts p ON i.post_id = p.id
      JOIN users a ON p.user_id = a.id
      JOIN users u ON i.user_id = u.id;`,
        [userId, post_id]
      );
      console.log(rows);

      sendLike({
        ...rows[0],
        isLiked: rows[0].user_id === userId,
        deleted: false,
      });

      if (rows[0].author.id !== userId) {
        const { rows: notifications } = await pool.query(
          `WITH inserted AS (
            INSERT INTO notifications (sender_id, receiver_id, type, post_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, type, is_seen, created_at, sender_id, receiver_id, post_id
          )
          SELECT 
            i.id,
            i.type,
            i.is_seen,
            i.created_at,
            i.post_id,
            json_build_object(
              'id',  s.id,
              'username', s.username,
              'email', s.email,
              'first_name', s.first_name,
              'last_name', s.last_name,
              'avatar', s.avatar
            ) AS sender,
            json_build_object(
              'id', r.id,
              'username', r.username,
              'email', r.email,
              'first_name', r.first_name,
              'last_name', r.last_name,
              'avatar', r.avatar
            ) AS receiver,
            json_build_object(
              'id', p.id,
              'content', p.content,
              'image', p.image,
              'created_at', p.created_at
            ) as post
          FROM inserted i
          LEFT JOIN users s ON i.sender_id = s.id
          LEFT JOIN users r ON i.receiver_id = r.id
          LEFT JOIN posts p ON i.post_id = p.id;`,
          [userId, rows[0].author.id, "like", post_id]
        );

        sendNotifications(notifications[0]);
      }

      return successResponse(res, 201, { liked: true });
    }
  } catch (error) {
    console.log("Like error:", error);
    next(error);
  }
};

export const comment = async (req, res, next) => {
  const { userId } = req;
  const { post_id, comment } = req.body;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS comments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
      );
    `);

    await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
          receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
          post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
          comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
          type VARCHAR(10) CHECK(notifications.type = 'like' OR notifications.type = 'comment' OR notifications.type = 'follow'),
          created_at TIMESTAMP DEFAULT now(),
          is_seen BOOLEAN DEFAULT false
        );`);

    const { rows } = await pool.query(
      `WITH inserted AS (
        INSERT INTO comments (user_id, post_id, comment)
        VALUES ($1, $2, $3)
        RETURNING id, post_id, comment, created_at, user_id
        )
        
        SELECT 
          i.id,
          i.post_id,
          i.user_id,
          i.comment,
          i.created_at,
          
          json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'avatar', u.avatar
            ) as author,
            
            json_build_object(
              'id', a.id,
              'username', a.username,
              'email', a.email
              ) as p_author
        FROM inserted i
        LEFT JOIN posts p ON i.post_id = p.id
        LEFT JOIN users a ON p.user_id = a.id
        LEFT JOIN users u ON i.user_id = u.id
        `,
      [userId, post_id, comment]
    );
    sendComment(rows[0]);
    console.log(rows[0]);
    if (rows[0].p_author.id !== userId) {
      const { rows: notifications } = await pool.query(
        `WITH inserted AS (
            INSERT INTO notifications (sender_id, receiver_id, type, post_id, comment_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, type, is_seen, created_at, sender_id, receiver_id, post_id, comment_id
          )
          SELECT 
            i.id,
            i.type,
            i.is_seen,
            i.created_at,
            i.post_id,
            json_build_object(
              'id',  s.id,
              'username', s.username,
              'email', s.email,
              'first_name', s.first_name,
              'last_name', s.last_name,
              'avatar', s.avatar
            ) AS sender,
  
            json_build_object(
              'id',  r.id,
              'username', r.username,
              'email', r.email,
              'first_name', r.first_name,
              'last_name', r.last_name,
              'avatar', r.avatar
            ) AS receiver,
            
             json_build_object(
              'id', p.id,
              'content', p.content,
              'image', p.image,
              'created_at', p.created_at
            ) as post,
  
            json_build_object(
            'id', c.id,
            'author', json_build_object (
            'user_id', comment_users.id,
            'username', comment_users.username,
            'email', comment_users.email,
            'first_name', comment_users.first_name,
            'last_name', comment_users.last_name,
            'avatar', comment_users.avatar
            ),
            'comment', c.comment, 
            'created_at', c.created_at
            ) AS comment
          FROM inserted i
          LEFT JOIN users s ON i.sender_id = s.id
          LEFT JOIN users r ON i.receiver_id = r.id
          LEFT JOIN posts p ON i.post_id = p.id
          LEFT JOIN comments c ON i.comment_id = c.id
          LEFT JOIN users comment_users ON c.user_id = comment_users.id;`,
        [userId, rows[0].p_author.id, "comment", post_id, rows[0].id]
      );

      sendNotifications(notifications[0]);
    }

    return successResponse(res, 201, rows[0]);
  } catch (error) {
    console.log("Comment error:", error);
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  const { userId } = req;
  const { id } = req.params;

  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1;`, [
      userId,
    ]);
    const user = rows[0];

    const { rows: posts } = await pool.query(
      `SELECT * FROM posts WHERE id = $1;`,
      [id]
    );
    const post = posts[0];

    if (!post) {
      return errorResponse(res, 404, "Post doesn't exist.");
    }

    if (user.id !== post.user_id) {
      return errorResponse(res, 403, "Author can delete this post.");
    }

    await pool.query(`DELETE FROM posts WHERE id = $1`, [id]);

    return successResponse(res, 201, "Deleting post failed.");
  } catch (error) {
    console.log("Deleting post error:", error);
    next(error);
  }
};
