import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BASE_URL } from "@/http/axios";
import { useAppStore } from "@/store";

const MessageContainer = () => {
  const { userInfo } = useAppStore();
  return (
    <div className="flex-1 p-4 w-full max-h-[45rem] space-y-4">
      {Array.from({ length: 10 }).map((_, i) => {
        const isOtherUser = i % 2 === 0;

        return (
          <div
            key={i}
            className={`flex ${isOtherUser ? "justify-start" : "justify-end"}`}
          >
            <div className="flex flex-col max-w-[70%]">
              <div
                className={`flex items-end gap-2 ${
                  isOtherUser ? "" : "flex-row-reverse"
                }`}
              >
                {isOtherUser && (
                  <Avatar className="h-8 w-8 shrink-0">
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
                )}

                <div
                  className={`rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap break-words ${
                    isOtherUser ? "bg-muted text-foreground" : "bg-primary"
                  }`}
                >
                  Hello 👋
                </div>
              </div>

              <p
                className={`text-xs text-muted-foreground mt-1 ${
                  isOtherUser ? "text-start ml-10" : "text-end"
                }`}
              >
                23:10
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageContainer;
