import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

interface ImageProps {
  url: string;
  className?: string;
}

const Image = ({ url, className }: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div>
      {isLoading && <Skeleton className="w-full h-96" />}
      {!hasError && (
        <img
          className={(cn("w-full h-full object-cover"), className)}
          src={url}
          onLoad={handleLoad}
          onError={handleError}
          alt="dynamic"
        />
      )}
    </div>
  );
};

export default Image;
