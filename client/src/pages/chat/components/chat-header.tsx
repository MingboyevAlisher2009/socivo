import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/socket-context";
import axiosInstance from "@/http/axios";
import { useAppStore } from "@/store";
import { AxiosError } from "axios";
import { Phone, Video, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ChatHeader = () => {
  const { userInfo, selectedChat, closeContact, onlineUsers, typing } =
    useAppStore();
  const navigate = useNavigate();
  const socket: any = useSocket();

  const displayName = selectedChat?.first_name
    ? `${selectedChat.first_name} ${selectedChat.last_name || ""}`
    : selectedChat?.username;

  const isOnlineUser = onlineUsers?.some(
    (onlineuser) => onlineuser === selectedChat?.id
  );

  const handleCall = async (type: "video_call" | "call") => {
    try {
      const { data } = await axiosInstance.post("/messages/send-message", {
        recipient: selectedChat,
        type,
      });
      navigate(`/room/${data.data.id}`);
      socket.emit("create-room", {
        roomId: data.data.id || "",
        sender: userInfo,
        recipient: selectedChat,
        type,
      });
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            "Something went wrong. Please try again."
          : "Something went wrong. Please try again.";

      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-between h-20 px-4 w-full border-b backdrop-blur-md bg-[#101012]">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage
            className="object-cover"
            src={selectedChat?.avatar}
            alt={`@${selectedChat?.username}`}
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {selectedChat?.first_name
              ? `${selectedChat.first_name.charAt(0)}${
                  selectedChat.last_name
                    ? selectedChat.last_name.charAt(0).toUpperCase()
                    : ""
                }`
              : selectedChat?.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground leading-none">
            {displayName}
          </h3>
          <p
            className={`text-sm ${
              isOnlineUser
                ? `text-primary ${typing?.message.trim() && "animate-pulse"}`
                : "text-muted-foreground"
            } mt-1`}
          >
            {isOnlineUser
              ? typing?.message.trim()
                ? "Typing..."
                : "Online"
              : "Last seen recently"}
          </p>
        </div>
      </div>
      <div className="">
        <Button
          className="cursor-pointer"
          onClick={() => handleCall("video_call")}
          variant={"ghost"}
        >
          <Video className="w-20 h-20" />
        </Button>
        <Button
          className="cursor-pointer"
          onClick={() => handleCall("call")}
          variant={"ghost"}
        >
          <Phone className="w-20 h-20" />
        </Button>
        <Button
          className="cursor-pointer"
          onClick={closeContact}
          variant={"ghost"}
        >
          <X className="w-20 h-20" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
