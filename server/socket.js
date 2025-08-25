import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { verifyToken } from "./services/token.service.js";

let socketIo;
const userSocketMap = new Map();

const disconnect = (socket) => {
  console.log(`Disconnect user ${socket.id}`);
  for (const [userId, socketId] of userSocketMap.entries()) {
    if (socket.id === socketId) {
      userSocketMap.delete(userId);
      break;
    }
  }
};

export const sendNotifications = (message) => {
  const receiver_id = userSocketMap.get(message.receiver.id);
  console.log(receiver_id);

  if (!receiver_id) {
    console.log(`User ${message.receiver.id} not connected`);
    return;
  }

  socketIo.to(receiver_id).emit("notification", message);
};

export const sendLike = (message) => {
  if (!message.post_id) {
    console.log(`Message ${message.id} not found`);
    return;
  }

  socketIo.emit("like", message);
};

export const sendComment = (message) => {
  if (!message.id) {
    console.log(`Message ${message.id} not found`);
    return;
  }

  socketIo.emit("comment", message);
};

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  socketIo = io;

  io.use((socket, next) => {
    const req = socket.request;
    cookieParser()(req, {}, (err) => {
      if (err) return next(err);

      const token = req.cookies?.jwt;
      if (!token) {
        return next(new Error("No auth token"));
      }

      try {
        const payload = verifyToken(token);
        socket.userId = payload.userId;
        return next();
      } catch (err) {
        return next(new Error("Invalid token"));
      }
    });
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID ${socket.id}`);
    }

    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
