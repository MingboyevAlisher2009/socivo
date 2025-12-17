import axiosInstance from "@/http/axios";
import type { Like, Post, Comment } from "@/types";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type { StateCreator } from "zustand";


export interface PostsSlice {
    posts: Post[] | null
    post: Post | null
    sentPostIds: string[];
    hasMore: boolean
    isLoading: boolean
    commentLoading: boolean
    postLoading: boolean
    deletingLoading: boolean
    setPosts: (posts: Post[]) => void
    setPost: (post: Post | null) => void
    setIsLoading: (isLoading: boolean) => void

    getPosts: () => Promise<void>
    getPost: (id: string) => Promise<void>
    fetchMorePosts: () => Promise<void>
    handleLike: (post_id: string) => Promise<void>
    addLike: (like: Like) => void
    addComment: (comment: Comment) => void
    handleComment: (post_id: string, comment: string) => Promise<void>
    handleDeletePost: (post_id: string) => Promise<void>
}

const postsSlice: StateCreator<PostsSlice> = (set, get) => ({
    posts: null,
    post: null,
    sentPostIds: [],
    hasMore: true,
    isLoading: false,
    commentLoading: false,
    postLoading: false,
    deletingLoading: false,
    setPosts: (posts) => set({ posts }),
    setPost: (post) => set({ post }),
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

    getPost: async (id) => {
        set({ postLoading: true });
        try {
            const { data } = await axiosInstance.get(`/posts/${id}`);
            set({ post: data.data });
        } catch (error) {
            console.log(error);
        } finally {
            set({ postLoading: false });
        }
    },

    fetchMorePosts: async () => {
        const { posts = [], sentPostIds, isLoading, hasMore } = get();
        if (isLoading || !hasMore) return;

        set({ isLoading: true });

        try {
            const exclude = sentPostIds.join(",");
            const { data } = await axiosInstance.get<{
                data: Post[];
            }>(`/posts?exclude=${exclude}&limit=10`);

            if (data.data.length > 0) return

            set({
                posts: [...posts as any, ...data.data],
                sentPostIds: [...sentPostIds, ...data.data.map((p) => p.id)],
                hasMore: data.data.length > 0,
            });
        } catch (error) {
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },

    handleLike: async (post_id) => {
        const currentPosts = get().posts;
        const post = get().post

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
        if (post && post.id === post_id) {
            const isLiked = !post?.isLiked;
            const likes_count = isLiked
                ? Number(post?.likes_count) + 1
                : Number(post?.likes_count) - 1;
            set({ post: { ...post, likes_count, isLiked } })
        }
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
        const post = get().post

        const updatedPosts = posts.map(post => {
            if (post.id === comment.post_id) {
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

        if (post && post.id === comment.post_id) {
            const existsComment = post.comments.some(c => c.id === comment.id);

            if (existsComment) return post

            set({
                post: {
                    ...post,
                    comments: [comment, ...post.comments],
                    comments_count: Number(post.comments_count) + 1
                }
            })
        }

        set({ posts: updatedPosts })
    },

    handleDeletePost: async (post_id) => {
        set({ deletingLoading: true })
        try {
            await axiosInstance.delete(`/posts/${post_id}`)
            history.back()
        } catch (error) {
            const message =
                error instanceof AxiosError
                    ? error.response?.data?.message || "Something went wrong. Please try again."
                    : "Something went wrong. Please try again.";

            toast.error(message);
        } finally {
            set({ deletingLoading: false })
        }
    }

})

export default postsSlice