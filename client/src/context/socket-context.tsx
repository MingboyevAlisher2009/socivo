import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BASE_URL } from "@/http/axios";
import { useAppStore } from "@/store";
import type { Like, Comment, Notifications, Message } from "@/types";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="h-4 w-4 text-red-500" fill="currentColor" />;
    case "comment":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "follow":
      return <UserPlus className="h-4 w-4 text-primary" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const getNotificationMessage = (notification: any) => {
  const senderName =
    notification.sender.first_name && notification.sender.last_name
      ? `${notification.sender.first_name} ${notification.sender.last_name}`
      : notification.sender.username;

  switch (notification.type) {
    case "like":
      return `${senderName} liked your post`;
    case "comment":
      return `${senderName} commented on your post`;
    case "follow":
      return `${senderName} started following you`;
    default:
      return "New notification";
  }
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socket = useRef<any>(null);
  const {
    userInfo,
    selectedChat,
    setOnlineUsers,
    addNotification,
    addLike,
    addComment,
    addMessage,
    getReadMessages,
    setTyping,
  } = useAppStore();
  const notifSound = new Audio("/audio/notification.mp3");
  const selectedChatRef = useRef(selectedChat);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (userInfo) {
      socket.current = io(BASE_URL, {
        withCredentials: true,
      });

      socket.current.on("connect", () => {
        console.log("Connect to server");
      });

      socket.current.on("getOnlineUsers", (onlineUsers: string[]) =>
        setOnlineUsers(onlineUsers)
      );

      socket.current.on("notification", (notifcation: Notifications) => {
        addNotification(notifcation);
        notifSound.play();
        toast(
          <div className="rounded-xl flex items-center gap-4 transition-colors duration-300">
            <div className="relative">
              <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-[#18181b]">
                <AvatarImage src={notifcation.sender.avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {notifcation.sender.first_name?.[0] ||
                    notifcation.sender.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 p-1 bg-[#18181b] rounded-full">
                {getNotificationIcon(notifcation.type)}
              </div>
            </div>
            <div className="flex flex-col">
              <p className="font-medium">
                {getNotificationMessage(notifcation)}
              </p>
              {notifcation.created_at && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(notifcation.created_at).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        );
      });

      socket.current.on("like", (like: Like) => {
        addLike(like);
      });

      socket.current.on("comment", (comment: Comment) => {
        addComment(comment);
      });

      socket.current.on("reciveMessage", (message: Message) => {
        addMessage(message);
        setTyping(null);
        if (message.sender.id !== userInfo?.id) {
          notifSound.play();

          if (
            selectedChatRef.current?.id === message.sender.id ||
            selectedChatRef.current?.id === message.recipient.id
          ) {
            return;
          }

          const senderName =
            message.sender.first_name && message.sender.last_name
              ? `${message.sender.first_name} ${message.sender.last_name}`
              : message.sender.username;

          toast(
            <div className="rounded-xl flex items-center gap-4 transition-colors duration-300">
              <div className="relative">
                <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-[#18181b]">
                  <AvatarImage src={message.sender.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {message.sender.first_name?.[0] ||
                      message.sender.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 p-1 bg-[#18181b] rounded-full">
                  {getNotificationIcon("comment")}
                </div>
              </div>
              <div className="flex flex-col">
                <p className="font-medium">{senderName}</p>
                {message.created_at && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                    {message.image ? "Sent a image" : message.message}
                  </span>
                )}
              </div>
            </div>
          );
        }
      });

      socket.current.on("getTyping", (message: Message) => {
        if (selectedChatRef.current?.id === message.sender.id) {
          setTyping(message);
        }
      });

      socket.current.on("getReadMessages", getReadMessages);
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
