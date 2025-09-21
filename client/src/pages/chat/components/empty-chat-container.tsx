import Lottie from "react-lottie";
import animationData from "@/assets/lottie-json.json";

const animationDefaultOptions = {
  loop: true,
  autoPlay: true,
  animationData,
};

const EmpatyChatContainer = () => {
  return (
    <div className="flex-1 lg:flex flex-col justify-center items-center hidden duration-1000 transition-all">
      <Lottie
        isClickToPauseDisabled={true}
        height={200}
        width={200}
        options={animationDefaultOptions}
      />
      <div
        className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl
     text-3xl transition-all duration-300 text-center"
      >
        <h3 className="poppins-medium">Start a conversation</h3>
        <p className="text-lg text-muted-foreground max-w-md">
          Connect with your contacts by sending your first message.
        </p>
      </div>
    </div>
  );
};

export default EmpatyChatContainer;
