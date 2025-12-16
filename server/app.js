import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import cors from "cors";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import contactsRoutes from "./routes/contacts.routes.js";
import postRoutes from "./routes/posts.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import setupSocket from "./socket.js";
import path from "path";
import { createDatabases } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { functions, inngest } from "./config/inngest.js";

const __dirname = path.resolve();
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   limit: 100,
//   standardHeaders: "draft-8",
//   legacyHeaders: false,
//   ipv6Subnet: 56,
// });

// app.use(limiter);
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(clerkMiddleware());
app.use(errorMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/contacts", contactsRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/notifications", notificationsRoutes);

const PORT = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, "client/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

const server = app.listen(PORT, async () => {
  await createDatabases();
  console.log(`Server run on port: http://localhost:${PORT}`);
});

setupSocket(server);
