import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BASE_URL } from "@/http/axios";
import { useAppStore } from "@/store";
import type { Like, Comment, Notifications } from "@/types";
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
import useSound from "use-sound";

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
  const { userInfo, addNotification, addLike, addComment } = useAppStore();
  const [play] = useSound("/audio/notification.mp3");

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
        play();
        toast(
          <div className="rounded-xl flex items-center gap-4 transition-colors duration-300">
            <div className="relative">
              <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-gray-200">
                <AvatarImage src={notifcation.sender.avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {notifcation.sender.first_name?.[0] ||
                    notifcation.sender.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
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
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
