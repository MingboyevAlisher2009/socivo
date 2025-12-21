import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import axios from "axios";

interface ImageProps {
  url: string;
  className?: string;
}

const Image = ({ url, className }: ImageProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchImage = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(url, { responseType: "blob" });
      const src = URL.createObjectURL(data);
      setImageUrl(src);
    } catch (error) {
      setHasError(true);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImage();
  }, [url]);

  return (
    <div>
      {isLoading && (
        <Skeleton className={cn("w-full h-full bg-[#202020c7]", className)} />
      )}
      {!isLoading && !hasError && (
        <img
          className={cn("w-full h-full object-cover", className)}
          src={imageUrl}
          alt="dynamic"
          loading="lazy"
        />
      )}
    </div>
  );
};

export default Image;
