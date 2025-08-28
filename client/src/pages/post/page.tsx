import Image from "@/components/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { BASE_URL } from "@/http/axios";
import { useAppStore } from "@/store";
import {
  Ellipsis,
  Heart,
  Loader2,
  MessageCircle,
  Send,
  Share2,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShareModal } from "@/components/share-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PostSkeleton from "./components/post-skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteModal from "./components/delete-modal";
import SeoHead from "@/components/hamlet";

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

const PostComponent = () => {
  const {
    userInfo,
    getUserInfo,
    handleLike,
    handleComment,
    commentLoading,
    getPost,
    setPost,
    post,
    postLoading: isLoading,
    deletingLoading,
    handleDeletePost,
  } = useAppStore();
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [deleteModal, setdeleteModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (!id) return;
    getPost(id);

    return () => {
      setPost(null);
    };
  }, [id]);

  const handleAddCommnet = () => {
    handleComment(post?.id || "", commentText);
    setCommentText("");
  };

  const handleDelete = async () => {
    await handleDeletePost(post?.id || "");
    setdeleteModal(false);
    getUserInfo();
  };

  const displayName =
    post?.author?.first_name && post.author?.last_name
      ? `${post.author.first_name} ${post.author.last_name}`
      : post?.author?.username;

  if (isLoading) {
    return <PostSkeleton />;
  }

  return (
    <>
      <SeoHead
        title={"Post"}
        image={`${BASE_URL}/${post?.image}`}
        description={post?.content}
      />
      <DeleteModal
        isOpen={deleteModal}
        onClose={() => setdeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={deletingLoading}
      />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 grid-cols-1 gap-8">
          <div className="lg:col-span-2 col-span-1 space-y-6">
            <Card className="overflow-hidden shadow-sm border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-6 border-b border-border/50">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                    <AvatarImage
                      className="object-cover"
                      src={`${BASE_URL}/${post?.author.avatar}`}
                      alt={`@${post?.author.username}`}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {post?.author?.first_name && post.author?.last_name
                        ? `${post.author.first_name.charAt(
                            0
                          )}${post.author.last_name.charAt(0).toUpperCase()}`
                        : post?.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground leading-none">
                      {displayName}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      @{post?.author.username} •{" "}
                      {formatTimeAgo(post?.created_at || "")}
                    </p>
                  </div>
                  {userInfo?.id === post?.author.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Ellipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setdeleteModal(true)}>
                          <Trash />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="relative overflow-hidden">
                  <Image
                    className="w-full aspect-square object-cover"
                    url={`${BASE_URL}/${post?.image}`}
                  />
                </div>

                <div className="flex items-center gap-1 p-6 border-b border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post?.id || "")}
                    className={`flex items-center gap-1 text-muted-foreground hover:text-primary cursor-pointer`}
                  >
                    <Heart
                      className={`${
                        post?.isLiked && "text-primary  fill-primary"
                      } h-5 w-5`}
                    />
                    <span className="font-medium">{post?.likes_count}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">{post?.comments_count}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary cursor-pointer"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="font-medium">Share</span>
                  </Button>
                </div>

                <div className="p-6">
                  <p className="text-foreground leading-relaxed text-pretty">
                    {post?.content}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-6 text-foreground">
                  Comments
                </h4>

                <div className="mb-8">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                      <AvatarImage
                        className="object-cover"
                        src={`${BASE_URL}/${post?.author.avatar}`}
                        alt={`@${post?.author.username}`}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {post?.author?.first_name && post.author?.last_name
                          ? `${post.author.first_name.charAt(
                              0
                            )}${post.author.last_name.charAt(0).toUpperCase()}`
                          : post?.author.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={commentLoading}
                        className="resize-none max-h-32 border-border/50 focus:border-primary/50 bg-background/50"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={handleAddCommnet}
                      size="sm"
                      disabled={!commentText.trim() || commentLoading}
                      className="gap-2 bg-primary hover:bg-primary/90 shadow-sm text-white"
                    >
                      {commentLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Post Comment
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {post?.comments.length ? (
                    post.comments.map((comment) => {
                      const displayName =
                        comment?.author?.first_name && comment.author?.last_name
                          ? `${comment.author.first_name} ${comment.author.last_name}`
                          : comment?.author?.username;

                      const getInitials = () => {
                        if (
                          comment.author.first_name &&
                          comment.author.last_name
                        ) {
                          return `${comment.author.first_name
                            .charAt(0)
                            .toUpperCase()}${comment.author.last_name
                            .charAt(0)
                            .toUpperCase()}`;
                        }
                        return (
                          comment.author.username?.charAt(0).toUpperCase() ||
                          "U"
                        );
                      };

                      return (
                        <div
                          key={comment.id}
                          className="border-l-2 border-muted pl-4 pb-3"
                        >
                          <div className="flex flex-col items-start gap-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                                <AvatarImage
                                  src={
                                    comment.author.avatar || "/placeholder.svg"
                                  }
                                  alt={`@${comment.author.username}`}
                                />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                  {getInitials()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-col gap-2">
                                  <p className="text-sm font-medium">
                                    {displayName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    @{comment.author.username} •{" "}
                                    {formatTimeAgo(comment.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm leading-relaxed">
                              {comment.comment}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm">
                        No comments yet. Be the first to share your thoughts! 💭
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-sm border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <Avatar className="h-20 w-20 mx-auto ring-4 ring-primary/10">
                      <AvatarImage
                        className="object-cover"
                        src={`${BASE_URL}/${post?.author.avatar}`}
                        alt={`@${post?.author.username}`}
                      />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
                        {post?.author.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg text-foreground">
                        {displayName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        @{post?.author.username}
                      </p>
                    </div>

                    {post?.author.bio && (
                      <p className="text-sm text-muted-foreground leading-relaxed px-2">
                        {post.author.bio}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">
                    Post Engagement
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border-red-100">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Likes</span>
                      </div>
                      <span className="font-semibold">{post?.likes_count}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Comments</span>
                      </div>
                      <span className="font-semibold">
                        {post?.comments_count}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      <ShareModal
        isOpen={open}
        onOpenChange={() => setOpen(false)}
        title={post?.content}
        imageUrl={`${BASE_URL}/${post?.image}`}
        url={`${window.location.href}/post/${post?.id}`}
      />
    </>
  );
};

export default PostComponent;
