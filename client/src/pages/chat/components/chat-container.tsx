import ChatHeader from "./chat-header";
import MessageBar from "./message-bar";
import MessageContainer from "./message-container";

const ChatContainer = () => {
  return (
    <div className="fixed z-50 lg:z-40 bg-[#101012] top-0 h-full w-screen flex flex-col lg:static lg:flex-1">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <MessageContainer />
      </div>

      <MessageBar />
    </div>
  );
};

export default ChatContainer;
