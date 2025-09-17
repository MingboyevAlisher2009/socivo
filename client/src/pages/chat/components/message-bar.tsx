import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MessageBar = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Send:", message);
    setMessage("");
  };

  return (
    <div className="w-full border-t p-3 flex items-end gap-2 sticky bottom-0">
      <Button
        type="button"
        variant="ghost"
        className="rounded-full shrink-0 z-50"
      >
        <Plus className="h-5 w-5 text-muted-foreground" />
      </Button>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Type a message..."
        rows={4}
        className="flex-1 rounded-2xl resize-none overflow-hidden max-h-20 px-4 py-2"
      />

      <Button
        type="button"
        className="rounded-full shrink-0 text-white z-50"
        onClick={handleSend}
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MessageBar;
