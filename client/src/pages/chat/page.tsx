import SeoHead from "@/components/hamlet";
import ContactsList from "./components/contacts-list";
import ChatContainer from "./components/chat-container";
import { useAppStore } from "@/store";
import EmpatyChatContainer from "./components/empty-chat-container";

const Chat = () => {
  const { selectedChat } = useAppStore();
  return (
    <>
      <SeoHead
        title="Inbox | Direct Messages"
        description="View and manage your direct messages in one place. Stay connected, chat instantly, and never miss a conversation."
      />
      <div className="flex w-full h-[50rem] rounded-2xl bg-card/50 relative">
        <ContactsList />
        {selectedChat ? <ChatContainer /> : <EmpatyChatContainer />}
      </div>
    </>
  );
};

export default Chat;
