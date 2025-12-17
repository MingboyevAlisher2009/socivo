import { useEffect, useRef } from "react";
import PostsFeedSkeleton from "./posts-feed-skeleton";
import { AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import PostCard from "./post-card";

export default function PostsFeed() {
  const { posts, getPosts, isLoading } = useAppStore();

  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <>
      <div className="space-y-4">
        <AnimatePresence>
          {isLoading && <PostsFeedSkeleton />}
          {!isLoading && posts && posts.length === 0 && (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              No posts found.
            </div>
          )}
          {!isLoading &&
            posts &&
            posts &&
            posts.map((post, i) => <PostCard post={post} i={i} />)}
          <div ref={loaderRef} />
        </AnimatePresence>
      </div>
    </>
  );
}
