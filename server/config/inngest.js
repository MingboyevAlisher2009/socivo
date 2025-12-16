import { Inngest } from "inngest";
import pool from "./db.js";

export const inngest = new Inngest({ id: "socivo" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    await pool.query(
      `INSERT INTO users (clerk_id, email, first_name, last_name, avatar) VALUES($1, $2, $3, $4, $5);`,
      [id, email_addresses[0].email_address, first_name, last_name, image_url]
    );
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
