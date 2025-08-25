import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import pool from "../db/db.js";
import BaseError from "../error/base.error.js";

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOtp(to) {
    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit otp
    console.log(otp);

    const hashedOtp = await bcrypt.hash(otp.toString(), 10);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS otp (
            email VARCHAR(100) NOT NULL,
            otp VARCHAR(100) NOT NULL,
            expireAt TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT now()
        );
    `);

    await pool.query(
      `INSERT INTO otp (email, otp, expireAt, created_at) VALUES ($1, $2, $3, $4)`,
      [to, hashedOtp, new Date(Date.now() + 5 * 60 * 1000), new Date()]
    );

    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Your OTP for Verification`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; color: #333333;">Email Verification</h2>
            <p style="font-size: 16px; color: #555555; text-align: center;">
              Use the OTP below to complete your verification. This code will expire in 5 minutes.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; font-size: 24px; font-weight: bold; background: #007BFF; color: white; padding: 10px 20px; border-radius: 6px; letter-spacing: 2px;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 14px; color: #888888; text-align: center;">
              If you did not request this, please ignore this email.
            </p>
          </div>
        </div>
  `,
    });
  }

  async verifyOtp(email, otp) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM otp WHERE email = $1 ORDER BY created_at DESC`,
        [email]
      );

      if (!rows || rows.length === 0) {
        throw BaseError.BadRequest("OTP not found");
      }

      const currentOtp = rows[0]; // latest OTP
      if (new Date(currentOtp.expire_at) < new Date()) {
        throw BaseError.BadRequest("Your OTP is expired");
      }

      const isValid = await bcrypt.compare(otp.toString(), currentOtp.otp);
      if (!isValid) {
        throw BaseError.BadRequest("Invalid OTP entered");
      }

      const result = await pool.query(
        `UPDATE users SET is_verified = true WHERE email = $1`,
        [email]
      );
      await pool.query(`DELETE FROM otp WHERE email = $1`, [email]);

      return true;
    } catch (error) {
      throw error instanceof BaseError
        ? error
        : new Error(error.message || "Something went wrong");
    }
  }
}

export default new MailService();
