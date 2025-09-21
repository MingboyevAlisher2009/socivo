import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { verifyToken } from "./services/token.service.js";

let socketIo;
const userSocketMap = new Map();

const disconnect = (socket) => {
  console.log(`Disconnect user ${socket.id}`);

  for (const [userId, sockets] of userSocketMap.entries()) {
    if (sockets.has(socket.id)) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        userSocketMap.delete(userId);
      }
      break;
    }
  }
  socketIo.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
};

export const sendNotifications = (message) => {
  const recipientSockets = userSocketMap.get(message.receiver.id);

  if (!recipientSockets) {
    console.log(`User ${message.receiver.id} not connected`);
    return;
  }

  if (recipientSockets) {
    recipientSockets.forEach((sid) =>
      socketIo.to(sid).emit("notification", message)
    );
  }
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

export const sendSocketMessage = (message) => {
  const senderSockets = userSocketMap.get(message.sender.id);
  const recipientSockets = userSocketMap.get(message.recipient.id);

  if (senderSockets) {
    senderSockets.forEach((sid) =>
      socketIo.to(sid).emit("reciveMessage", message)
    );
  }
  if (recipientSockets) {
    recipientSockets.forEach((sid) =>
      socketIo.to(sid).emit("reciveMessage", message)
    );
  }
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

    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId)?.add(socket.id);
    console.log(`User connected: ${userId} with socket ID ${socket.id}`);

    console.log(userSocketMap.entries());

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    socket.on("readMessages", ({ sender, recipient, messages }) => {
      const senderSockets = userSocketMap.get(sender.id);
      const recipientSockets = userSocketMap.get(recipient.id);

      if (senderSockets) {
        senderSockets.forEach((sid) =>
          io.to(sid).emit("getReadMessages", messages)
        );
      }
      if (recipientSockets) {
        recipientSockets.forEach((sid) =>
          io.to(sid).emit("getReadMessages", messages)
        );
      }
    });

    socket.on("typing", ({ sender, recipient, message }) => {
      const recipientSockets = userSocketMap.get(recipient.id);

      if (recipientSockets) {
        recipientSockets.forEach((sid) =>
          io.to(sid).emit("getTyping", { sender, message })
        );
      }
    });

    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
