import ChatHeader from "./chat-header";
import MessageBar from "./message-bar";
import MessageContainer from "./message-container";

const ChatContainer = () => {
  return (
    <div className="fixed z-50 bg-card top-0 h-full w-screen flex flex-col md:static md:flex-1">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageContainer />
      </div>

      <MessageBar />
    </div>
  );
};

export default ChatContainer;
