import SeoHead from "@/components/hamlet";
import ContactsList from "./components/contacts-list";
import ChatContainer from "./components/chat-container";

const Chat = () => {
  return (
    <>
      <SeoHead
        title="Inbox | Direct Messages"
        description="View and manage your direct messages in one place. Stay connected, chat instantly, and never miss a conversation."
      />
      <div className="flex w-full h-[51.5rem] rounded-2xl bg-card/50 relative">
        <ContactsList />
        <ChatContainer />
      </div>
    </>
  );
};

export default Chat;
