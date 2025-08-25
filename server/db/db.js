import { Pool } from "pg";
import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB,
  password: process.env.DB_PASS,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export default pool;
