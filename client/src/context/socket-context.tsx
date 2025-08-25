import { BASE_URL } from "@/http/axios";
import { useAppStore } from "@/store";
import type { Like, Comment, Notifications } from "@/types";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socket = useRef<any>(null);
  const { userInfo, addNotification, addLike, addComment } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      socket.current = io(BASE_URL, {
        withCredentials: true,
      });

      socket.current.on("connect", () => {
        console.log("Connect to server");
      });

      socket.current.on("notification", (notifcation: Notifications) => {
        addNotification(notifcation);
      });

      socket.current.on("like", (like: Like) => {
        addLike(like);
      });

      socket.current.on("comment", (comment: Comment) => {
        addComment(comment);
      });
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
