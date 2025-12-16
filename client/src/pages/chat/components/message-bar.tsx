import type React from "react";
import { useRef, useState } from "react";
import { Loader2, Plus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "@/components/image";
import type { ChatUser } from "@/types";
import useKeybord from "@/hooks/use-keyboard-hook";
import { useSocket } from "@/context/socket-context";

const MessageBar = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const socket: any = useSocket();
  const {
    userInfo,
    selectedChat,
    isSoundEnabled,
    reply,
    setReply,
    sendingMessageLoading,
    sendMessage,
    image,
    uploadImage,
    deleteImage,
    uploadImageLoading,
    deleteImageLoading,
  } = useAppStore();
  const { playRandomKeySound } = useKeybord();
  const [message, setMessage] = useState("");
  const chatId = localStorage.getItem("chatId");

  const handleSend = async () => {
    if (!message.trim() && !image) return;
    await sendMessage(message.trim());
    setMessage("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed!");
      return;
    }

    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast.error("Only image formats (jpg, png, gif, webp) are allowed!");
      return;
    }
    const formData = new FormData();
    formData.append("image", file);

    uploadImage(formData);
  };

  const getUserName = (user: ChatUser) => {
    const senderName = user.first_name
      ? `${user.first_name} ${user.last_name || ""}`
      : user.username;
    return senderName;
  };

  const onTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!socket) {
      return;
    }
    socket.emit("typing", {
      sender: userInfo,
      recipient: selectedChat,
      message: e.target.value,
    });
  };

  return (
    <div className="w-full mx-auto border-t p-3 space-y-3 bg-[#101012] sticky bottom-3">
      <div className="px-10">
        {uploadImageLoading && (
          <div className="flex justify-center items-center rounded-md bg-accent w-20 h-20">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {image && chatId === selectedChat?.id && (
          <div className="relative w-fit">
            <Button
              disabled={deleteImageLoading}
              onClick={deleteImage}
              size={"icon"}
              className="absolute -top-4 -right-4"
              variant={"ghost"}
            >
              <X />
            </Button>
            <Image
              url={image}
              className="w-20 h-20 rounded-md bg-center object-cover"
            />
          </div>
        )}
        {reply && (
          <div className="w-full flex justify-between items-center">
            <div className="space-y-1">
              <h3>
                Replying to{" "}
                <span
                  className={
                    userInfo?.id !== reply.sender.id ? "font-semibold" : ""
                  }
                >
                  {userInfo?.id === reply.sender.id
                    ? "yourself"
                    : getUserName(reply.sender)}
                </span>
              </h3>
              {reply.image && (
                <Image
                  className="rounded-md w-20 h-20 object-cover mb-2"
                  url={reply.image}
                />
              )}
              <p className="text-sm text-muted-foreground line-clamp-3 break-all">
                {reply.type === "call"
                  ? "Incoming voice call..."
                  : reply.type === "video_call" && "Incoming video call..."}
                {reply.message}
              </p>
            </div>
            <Button onClick={() => setReply(null)} variant={"ghost"}>
              <X />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-end gap-2">
        <Button
          disabled={uploadImageLoading || deleteImageLoading || !!image}
          onClick={() => inputRef.current?.click()}
          variant="ghost"
          className="rounded-full cursor-pointer"
        >
          <Plus className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        <Textarea
          value={message}
          onChange={(e) => {
            isSoundEnabled && playRandomKeySound();
            onTyping(e);
            setMessage(e.target.value);
          }}
          disabled={sendingMessageLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-2xl resize-none min-h-10 max-h-32 px-4 py-2"
        />

        <Button
          className="rounded-full shrink-0 text-white z-50 cursor-pointer"
          disabled={
            sendingMessageLoading ||
            uploadImageLoading ||
            deleteImageLoading ||
            (!message.trim() && !image)
          }
          onClick={handleSend}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageBar;
