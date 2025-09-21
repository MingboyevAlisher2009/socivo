import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/http/axios";
import { useAppStore } from "@/store";
import { X } from "lucide-react";

const ChatHeader = () => {
  const { selectedChat, closeContact, onlineUsers } = useAppStore();

  const displayName =
    selectedChat?.first_name && selectedChat?.last_name
      ? `${selectedChat.first_name} ${selectedChat.last_name}`
      : selectedChat?.username;

  const isOnlineUser = onlineUsers?.some(
    (onlineuser) => onlineuser === selectedChat?.id
  );

  return (
    <div className="flex items-center justify-between h-20 px-4 w-full border-b backdrop-blur-md bg-[#101012]">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage
            className="object-cover"
            src={`${BASE_URL}/${selectedChat?.avatar}`}
            alt={`@${selectedChat?.username}`}
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {selectedChat?.first_name && selectedChat?.last_name
              ? `${selectedChat.first_name.charAt(0)}${selectedChat.last_name
                  .charAt(0)
                  .toUpperCase()}`
              : selectedChat?.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground leading-none">
            {displayName}
          </h3>
          <p
            className={`text-sm ${
              isOnlineUser ? "text-primary" : "text-muted-foreground"
            } mt-1`}
          >
            {isOnlineUser ? "Online" : "Last seen recently"}
          </p>
        </div>
      </div>
      <Button
        className="cursor-pointer"
        onClick={closeContact}
        variant={"ghost"}
      >
        <X className="w-20 h-20" />
      </Button>
    </div>
  );
};

export default ChatHeader;
