import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axiosInstance, { BASE_URL } from "@/http/axios";
import { useAppStore } from "@/store";
import { format } from "date-fns";
import MessageSkeleton from "./message-skeleton";
import Image from "@/components/image";
import { useEffect, useRef } from "react";
import { CornerUpLeft } from "lucide-react";
import { useSocket } from "@/context/socket-context";
import type { Message } from "@/types";
import { Button } from "@/components/ui/button";
const MessageContainer = () => {
  const socket: any = useSocket();
  const { userInfo, messages, messageLoading, selectedChat, setReply, typing } =
    useAppStore();
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const onReadMessages = async (receiverMessages: Message[]) => {
    try {
      const { data } = await axiosInstance.post("/messages/message-read", {
        messages: receiverMessages,
      });

      if (socket && selectedChat) {
        socket.emit("readMessages", {
          messages: data.data,
          sender: userInfo,
          recipient: selectedChat,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleScroll = (messageId: string, isOtherUser: boolean) => {
    const element = document.getElementById(messageId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      element.classList.add(
        "scale-105",
        !!isOtherUser ? "translate-x-10" : "-translate-x-10",
        "transition-all",
        "duration-500"
      );

      setTimeout(() => {
        element.classList.remove(
          "scale-105",
          isOtherUser ? "translate-x-10" : "-translate-x-10"
        );
      }, 1500);
    }
  };

  useEffect(() => {
    const receiverMessages = (messages ?? []).filter(
      (message) =>
        message.recipient?.id === userInfo?.id && message.read === false
    );

    if (!typing?.message.trim && receiverMessages.length) {
      onReadMessages(receiverMessages);
    }

    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  return (
    <div className="flex-1 p-4 max-h-[45rem] space-y-10">
      {messageLoading && <MessageSkeleton />}
      {!messageLoading && messages?.length
        ? messages.map((message, i) => {
            const isOtherUser = message.sender.id !== userInfo?.id;

            return (
              <div
                key={i}
                id={message.id}
                className={`flex w-full items-end gap-2 mb-8 group ${
                  isOtherUser ? "justify-start" : "justify-end"
                }`}
              >
                <div className="max-w-[70%] space-y-2">
                  {/* Reply */}
                  {message.reply && (
                    <div
                      onClick={() =>
                        handleScroll(
                          message.reply?.id || "",
                          message.reply?.sender.id !== userInfo?.id
                        )
                      }
                      className={
                        isOtherUser
                          ? "border-l-4 pl-2 border-muted"
                          : "border-r-4 pr-2 border-muted"
                      }
                    >
                      <div
                        className={`relative cursor-pointer w-fit line-clamp-4 rounded-2xl px-3 opacity-[0.4] py-2 text-sm shadow-sm whitespace-pre-wrap break-all transition ${
                          message.reply.sender.id !== userInfo?.id
                            ? "bg-muted text-foreground"
                            : `bg-primary text-white`
                        }`}
                      >
                        {message.reply.image && (
                          <Image
                            className="rounded-2xl max-h-80 object-cover mb-2 cursor-pointer hover:opacity-90 transition"
                            url={`${BASE_URL}/${message.reply.image}`}
                          />
                        )}

                        {message.reply.message}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div
                    className={`flex gap-2 ${
                      isOtherUser ? "justify-start" : "justify-end"
                    } items-end`}
                  >
                    {isOtherUser && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage
                          className="object-cover"
                          src={`${BASE_URL}/${message?.sender.avatar}`}
                          alt={`@${message?.sender.username}`}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {message?.sender?.first_name &&
                          message?.sender?.last_name
                            ? `${message?.sender.first_name.charAt(
                                0
                              )}${message?.sender.last_name
                                .charAt(0)
                                .toUpperCase()}`
                            : message?.sender?.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`relative rounded-2xl px-3 py-2 text-sm shadow-sm whitespace-pre-wrap break-all transition ${
                        isOtherUser
                          ? "bg-muted text-foreground"
                          : `bg-gradient-to-r from-primary to-primary/80 text-white ${
                              !message.read &&
                              "shadow-primary/20 shadow-lg animate-pulse"
                            }`
                      }`}
                    >
                      {message.image && (
                        <Image
                          className="rounded-2xl max-h-80 object-cover mb-2 cursor-pointer hover:opacity-90 transition"
                          url={`${BASE_URL}/${message.image}`}
                        />
                      )}

                      {message.message}

                      <span
                        className={`absolute w-full -bottom-5 ${
                          isOtherUser ? "left-2" : "right-2 text-end"
                        } text-xs break-words text-muted-foreground/80`}
                      >
                        {format(new Date(message.created_at), "hh:mm")}
                      </span>

                      <div
                        className={`absolute top-1/2 transform -translate-y-1/2 ${
                          isOtherUser ? "-right-14" : "-left-14"
                        } hidden group-hover:flex gap-1`}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setReply(message)}
                          className="h-6 w-6 opacity-70 hover:opacity-100 transition"
                        >
                          <CornerUpLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        : ""}
      {typing?.message.trim() && (
        <div
          className={`flex w-full relative items-end gap-2 mb-8 ${
            typing.sender.id !== userInfo?.id ? "justify-start" : "justify-end"
          }
          }`}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage
              className="object-cover"
              src={`${BASE_URL}/${typing?.sender.avatar}`}
              alt={`@${typing?.sender.username}`}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {typing?.sender?.first_name && typing?.sender?.last_name
                ? `${typing?.sender.first_name.charAt(
                    0
                  )}${typing?.sender.last_name.charAt(0).toUpperCase()}`
                : typing?.sender?.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="rounded-2xl px-3 py-2 text-sm shadow-sm whitespace-pre-wrap break-all transition bg-muted text-foreground">
            {/* {typing.message} */}
            <div className="flex gap-1 p-1">
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      )}
      <div ref={messageEndRef} />
    </div>
  );
};

export default MessageContainer;
