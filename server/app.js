import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import cors from "cors";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import contactsRoutes from "./routes/contacts.routes.js";
import postRoutes from "./routes/posts.routes.js";
import messagessRoutes from "./routes/message.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import setupSocket from "./socket.js";
import { ExpressPeerServer } from "peer";
import path from "path";
import { createDatabases } from "./db/db.js";

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

app.use(errorMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messagessRoutes);
app.use("/api/notifications", notificationsRoutes);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, async () => {
  await createDatabases();
  console.log(`Server run on port: http://localhost:${PORT}`);
});

const peerApp = express();
peerApp.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

const PEER_PORT = 4001;
const peerServerInstance = peerApp.listen(PEER_PORT, () =>
  console.log(`PeerJS server running on ${PEER_PORT}`)
);

const peerServer = ExpressPeerServer(peerServerInstance, {
  path: "/",
  debug: true,
  allow_discovery: true,
});

peerApp.use("/peerjs", peerServer);

peerApp.get("/health", (req, res) => {
  res.json({ status: "PeerJS server is running" });
});

setupSocket(server);
