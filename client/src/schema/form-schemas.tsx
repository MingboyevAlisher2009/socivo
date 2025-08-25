import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address",
  }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const signUpSchema = z.object({
  username: z
    .string({
      message: "Username is required.",
    })
    .trim(),
  email: z.email({
    message: "Please enter a valid email address",
  }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const verificationSchema = z.object({
  code: z.string().length(6, { message: "OTP must be 6 digits." }),
});

export const userSchema = z.object({
  first_name: z.string({ message: "Please enter your firstname." }),
  last_name: z.string({ message: "Please enter your lastname." }),
  username: z.string({ message: "Please enter your username." }),
  bio: z.optional(z.string({ message: "Please enter your bio." })),
});
