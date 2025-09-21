import { Skeleton } from "@/components/ui/skeleton";

const MessageSkeleton = () => {
  const getRandomWidth = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  return (
    <div>
      {Array.from({ length: 10 }).map((_, i) => {
        const isOtherUser = i % 2;

        return (
          <div
            key={i}
            className={`flex ${
              !!isOtherUser ? "justify-start" : "justify-end"
            }`}
          >
            <div className="flex gap-2 items-center">
              {!!isOtherUser && <Skeleton className="h-8 w-8 rounded-full" />}
              <Skeleton
                className="rounded-2xl h-8"
                style={{ width: `${getRandomWidth(5, 15)}rem` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;
