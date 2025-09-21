import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BASE_URL } from "@/http/axios";
import { useAppStore } from "@/store";
import { useEffect, useState } from "react";
import ContactListSkeleton from "./contact-list-skeleton";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeOff } from "lucide-react";

const ContactsList = () => {
  const {
    userInfo,
    onlineUsers,
    getContacts,
    contactLoading,
    contacts,
    getMessages,
    selectedChat,
    isSoundEnabled,
    toggleSound,
  } = useAppStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    getContacts();
  }, []);

  const filteredContacts =
    contacts &&
    contacts.filter(
      (contact) =>
        contact.email.toLowerCase().includes(query.toLowerCase()) ||
        contact.username.toLowerCase().includes(query.toLowerCase())
    );

  return (
    <div className="w-full lg:w-96 h-full border-r px-4 pt-10 overflow-hidden">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xl">{userInfo?.username}</h1>
          <Button variant={"ghost"} onClick={toggleSound}>
            {isSoundEnabled ? <VolumeOff /> : <Volume2 />}
          </Button>
        </div>
        <Input
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
        />
      </div>
      <div className="mt-5 space-y-3">
        <h1>Messages</h1>
        <ScrollArea className="h-[40rem]">
          {contactLoading && <ContactListSkeleton />}
          {!contactLoading && filteredContacts && filteredContacts.length ? (
            filteredContacts.map((contact, i) => {
              const displayName =
                contact?.first_name && contact?.last_name
                  ? `${contact.first_name} ${contact.last_name}`
                  : contact?.username;

              const isOnlineUser = onlineUsers?.some(
                (onlineuser) => onlineuser === contact?.id
              );

              const notification =
                contact.lastMessage?.recipient.id === userInfo?.id &&
                !contact.lastMessage?.read;

              return (
                <div
                  key={i}
                  onClick={() => getMessages(contact)}
                  className={`flex items-center gap-4 p-4 ${
                    contact.id === selectedChat?.id && "bg-accent"
                  } hover:bg-accent/30 rounded-md cursor-pointer`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        className="object-cover"
                        src={`${BASE_URL}/${contact?.avatar}`}
                        alt={`@${contact?.username}`}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {contact?.first_name && contact?.last_name
                          ? `${contact.first_name.charAt(0)}${contact.last_name
                              .charAt(0)
                              .toUpperCase()}`
                          : contact?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isOnlineUser && (
                      <div className="absolute bottom-0 right-0 z-50 w-3 h-3 ring-2 bg-primary ring-[#101012] rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground leading-none">
                      {displayName}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {contact.lastMessage
                        ? contact.lastMessage?.image
                          ? "Image"
                          : contact.lastMessage.message
                        : "No message yet"}
                    </p>
                  </div>
                  {notification && (
                    <span className="relative flex size-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex size-3 rounded-full bg-primary"></span>
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center mt-5 text-muted-foreground">
              Contacts not found
            </p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ContactsList;
