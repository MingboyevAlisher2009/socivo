import { Pool } from "pg";
import "dotenv/config";

// const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  // host: process.env.DB_HOST,
  // port: process.env.DB_PORT,
  // user: process.env.DB_USER,
  // database: process.env.DB,
  // password: process.env.DB_PASS,
  // ssl: isProduction ? { rejectUnauthorized: false } : false,
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const createDatabases = async () => {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
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

    await pool.query(`CREATE TABLE IF NOT EXISTS messages (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       sender UUID REFERENCES users(id) ON DELETE CASCADE,
       recipient UUID REFERENCES users(id) ON DELETE CASCADE,
       reply UUID REFERENCES messages(id) ON DELETE CASCADE,
       message TEXT,
       image TEXT,
       read BOOLEAN DEFAULT false,
       type VARCHAR(10) CHECK(type IN ('video_call','call')),
       created_at TIMESTAMP DEFAULT now()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS posts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            image TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT now()
            );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS follow (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
      following_id UUID REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(follower_id, following_id)
   );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS likes (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES users(id) ON DELETE CASCADE,
              post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
              created_at TIMESTAMP DEFAULT now(),
              UNIQUE (user_id, post_id)
              );
            `);

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
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export default pool;
