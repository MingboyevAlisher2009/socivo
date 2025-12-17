import { Inngest } from "inngest";
import pool from "./db.js";

export const inngest = new Inngest({ id: "socivo" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;
      let username = email_addresses[0].email_address.split("@")[0];

      const { rows } = await pool.query(
        `SELECT email FROM users WHERE clerk_id = $1`,
        [id]
      );

      if (username === rows[0].email.split("@")[0]) {
        username = `${username}-${Math.random().toString(36).slice(2, 8)}`;
      }

      await pool.query(
        `INSERT INTO users (clerk_id, username, email, first_name, last_name, avatar) VALUES($1, $2, $3, $4, $5, $6);`,
        [
          id,
          username,
          email_addresses[0].email_address,
          first_name,
          last_name,
          image_url,
        ]
      );
    } catch (error) {
      console.log(error);
    }
  }
);

const deleteUser = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    await pool.query(`DELETE FROM users WHERE clerk_id = $1;`, [id]);
  }
);

export const functions = [syncUser, deleteUser];
