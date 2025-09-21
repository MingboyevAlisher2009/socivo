import { Skeleton } from "@/components/ui/skeleton";

const ContactListSkeleton = () => {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="flex items-center gap-4 p-4" key={i}>
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-10 h-2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactListSkeleton;
