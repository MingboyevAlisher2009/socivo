import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { BASE_URL } from "@/http/axios";
import { Heart, Loader2, MessageCircle, Send, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import PostsFeedSkeleton from "./posts-feed-skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Comment } from "@/types";

export default function PostsFeed() {
  const {
    posts,
    handleLike,
    getPosts,
    isLoading,
    handleComment,
    commentLoading,
  } = useAppStore();

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  useEffect(() => {
    getPosts();
  }, []);

  const CommentForm = ({ post_id }: { post_id: string }) => {
    const [newComment, setNewComment] = useState("");
    return (
      <motion.form
        onSubmit={() => handleComment(post_id, newComment)}
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Textarea
          placeholder="Write your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <div className="flex justify-end">
          <Button
            disabled={commentLoading}
            type="submit"
            size="sm"
            className="gap-2 text-white"
          >
            {commentLoading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Comment
              </>
            )}
          </Button>
        </div>
      </motion.form>
    );
  };

  const CommentsList = ({ comments }: { comments: Comment[] }) => (
    <AnimatePresence mode="popLayout">
      {comments.length ? (
        comments.map((comment: any, index: number) => {
          const displayName =
            comment.author?.first_name && comment.author?.last_name
              ? `${comment.author.first_name} ${comment.author.last_name}`
              : comment.author?.username;

          const getInitials = () => {
            if (comment.author.first_name && comment.author.last_name) {
              return `${comment.author.first_name
                .charAt(0)
                .toUpperCase()}${comment.author.last_name
                .charAt(0)
                .toUpperCase()}`;
            }
            return comment.author.username?.charAt(0).toUpperCase() || "U";
          };

          return (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: index * 0.05,
              }}
              className="border-l-2 border-muted pl-4 pb-3"
            >
              <div className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={comment.author.avatar || "/placeholder.svg"}
                      alt={`@${comment.author.username}`}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        @{comment.author.username} •{" "}
                        {formatTimeAgo(comment.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{comment.comment}</p>
              </div>
            </motion.div>
          );
        })
      ) : (
        <p className="text-muted-foreground text-sm text-center py-4">
          No comments yet. Be the first to share your thoughts 💭
        </p>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-4">
      {isLoading && <PostsFeedSkeleton />}
      {!isLoading && posts && posts.length === 0 && (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          No posts found.
        </div>
      )}
      <AnimatePresence>
        {!isLoading &&
          posts &&
          posts &&
          posts.map((post, i) => {
            const displayName =
              post.author?.first_name && post.author?.last_name
                ? `${post.author.first_name} ${post.author.last_name}`
                : post.author?.username;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
              >
                <Card className="w-full">
                  <CardHeader>
                    <Link
                      to={`/profile/${post.author.username}`}
                      className="flex flex-row items-center gap-3 pb-4"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          className="object-cover"
                          src={`${BASE_URL}/${post.author.avatar}`}
                          alt={`@${post.author.username}`}
                        />
                        <AvatarFallback>
                          {post.author?.first_name && post.author?.last_name
                            ? `${post.author.first_name.charAt(
                                0
                              )}${post.author.last_name
                                .charAt(0)
                                .toUpperCase()}`
                            : post.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p className="text-sm font-medium leading-none">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(post.created_at)}
                        </p>
                      </div>
                    </Link>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <p className="text-sm">{post.content}</p>
                    {post.image && (
                      <img
                        src={`${BASE_URL}/${post.image}` || "/placeholder.svg"}
                        alt="Post image"
                        width={600}
                        height={400}
                        className="rounded-md object-cover w-full max-h-[40rem]"
                      />
                    )}
                  </CardContent>
                  <CardFooter className="flex items-center gap-4 pt-4 border-t">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary cursor-pointer"
                    >
                      <Heart
                        className={`${
                          post.isLiked && "text-primary  fill-primary"
                        } h-5 w-5`}
                      />
                      <span className="text-sm">{post.likes_count}</span>
                    </button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm">{post.comments_count}</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <MessageCircle className="h-5 w-5" />
                              Comments ({post.comments_count})
                            </DialogTitle>
                          </DialogHeader>
                          <div className="mt-4 space-y-4">
                            <CommentForm post_id={post.id} />
                            <div className="space-y-3">
                              <CommentsList comments={post.comments} />
                            </div>
                          </div>
                        </motion.div>
                      </DialogContent>
                    </Dialog>
                    <div className="flex items-center gap-1 text-muted-foreground hover:text-primary cursor-pointer">
                      <Share2 className="h-5 w-5" />
                      <span className="text-sm">Share</span>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}
