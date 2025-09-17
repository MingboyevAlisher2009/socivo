import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/http/axios";
import { useAppStore } from "@/store";
import { X } from "lucide-react";

const ChatHeader = () => {
  const { userInfo } = useAppStore();

  const displayName =
    userInfo?.first_name && userInfo?.last_name
      ? `${userInfo.first_name} ${userInfo.last_name}`
      : userInfo?.username;
  return (
    <div className="flex items-center justify-between h-20 px-4 w-full border-b backdrop-blur-md bg-accent/10">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage
            className="object-cover"
            src={`${BASE_URL}/${userInfo?.avatar}`}
            alt={`@${userInfo?.username}`}
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {userInfo?.first_name && userInfo?.last_name
              ? `${userInfo.first_name.charAt(0)}${userInfo.last_name
                  .charAt(0)
                  .toUpperCase()}`
              : userInfo?.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground leading-none">
            {displayName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Last seen recently{" "}
          </p>
        </div>
      </div>
      <Button variant={"ghost"}>
        <X className="w-20 h-20" />
      </Button>
    </div>
  );
};

export default ChatHeader;
