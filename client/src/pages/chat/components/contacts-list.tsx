import Image from "@/components/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BASE_URL } from "@/http/axios";
import { useAppStore } from "@/store";

const ContactsList = () => {
  const { userInfo } = useAppStore();

  const displayName =
    userInfo?.first_name && userInfo?.last_name
      ? `${userInfo.first_name} ${userInfo.last_name}`
      : userInfo?.username;

  return (
    <div className="w-64 lg:w-96 h-full border-r px-4 pt-10">
      <div className="space-y-3">
        <h1 className="text-xl">{userInfo?.username}</h1>
        <Input placeholder="Search" />
      </div>
      <div className="mt-5 space-y-3">
        <h1>Messages</h1>
        <ScrollArea className="h-[40rem]">
          <div className="flex items-center gap-4 p-4 hover:bg-accent/30 rounded-md cursor-pointer">
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
                No message yet{" "}
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ContactsList;
