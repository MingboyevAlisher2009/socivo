import axiosInstance from "@/http/axios";
import type { Like, Post, Comment } from "@/types";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type { StateCreator } from "zustand";


export interface PostsSlice {
    posts: Post[] | null
    isLoading: boolean
    commentLoading: boolean
    setPosts: (posts: Post[]) => void
    setIsLoading: (isLoading: boolean) => void

    getPosts: () => Promise<void>
    handleLike: (post_id: string) => Promise<void>
    addLike: (like: Like) => void
    addComment: (comment: Comment) => void
    handleComment: (post_id: string, comment: string) => Promise<void>
}

const postsSlice: StateCreator<PostsSlice> = (set, get) => ({
    posts: null,
    isLoading: false,
    commentLoading: false,
    setPosts: (posts) => set({ posts }),
    setIsLoading: (isLoading) => set({ isLoading }),

    getPosts: async () => {
        set({ isLoading: true })
        try {
            const { data } = await axiosInstance.get<{ data: Post[] }>("/posts");
            set({ posts: data.data });
        } catch (error) {
            set({ posts: null });
        } finally {
            set({ isLoading: false });
        }
    },

    handleLike: async (post_id) => {
        const currentPosts = get().posts;

        const originalPosts = currentPosts ? [...currentPosts] : [];

        const updatedPosts = currentPosts?.map(post => {
            if (post.id === post_id) {
                const isLiked = !post.isLiked;
                const likes_count = isLiked
                    ? Number(post.likes_count) + 1
                    : Number(post.likes_count) - 1;
                return { ...post, isLiked, likes_count };
            }
            return post;
        });

        set({ posts: updatedPosts });

        try {
            await axiosInstance.post("/posts/like", { post_id });
        } catch (error) {
            set({ posts: originalPosts });
            console.error("Failed to like post:", error);
        }
    },

    addLike: (like) => {
        const posts = get().posts ?? [];
        const store: any = get();
        const user = store.userInfo;

        const updatedPosts = posts.map(post => {
            if (post.id !== like.post_id) return post;

            if (like.user_id === user.id) return post;
            if (like.deleted) {
                return {
                    ...post,
                    likes_count: Math.max(Number(post.likes_count ?? 0) - 1, 0),
                    likes: post.likes.filter(l => l.user_id !== like.user_id),
                };
            }


            return {
                ...post,
                likes_count: Number(post.likes_count ?? 0) + 1,
                likes: [...post.likes, like],
            };
        });

        set({ posts: updatedPosts });
    },

    handleComment: async (post_id, comment) => {
        set({ commentLoading: true })
        try {
            await axiosInstance.post("/posts/comment", { post_id, comment })
        } catch (error) {
            const message =
                error instanceof AxiosError
                    ? error.response?.data?.message || "Something went wrong. Please try again."
                    : "Something went wrong. Please try again.";

            toast.error(message);
        } finally {
            set({ commentLoading: false })
        }
    },

    addComment: (comment) => {
        const posts = get().posts ?? [];

        const updatedPosts = posts.map(post => {
            if (post.id === comment.post_id) {
                console.log(post.comments);

                const existsComment = post.comments.some(c => c.id === comment.id);

                if (existsComment) return post

                return {
                    ...post,
                    comments: [comment, ...post.comments],
                    comments_count: Number(post.comments_count) + 1
                }
            }
            return post
        })

        set({ posts: updatedPosts })
    }
})

export default postsSlice