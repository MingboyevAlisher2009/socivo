

export interface IUser {
    id: string;
    username: string;
    email: string;
    first_name?: string
    last_name?: string;
    avatar?: string;
    bio?: string;
    followers: IUser[]
    following: IUser[]
    is_verified: boolean;
    created_at: string;
    posts?: Post[]
}

export interface Like {
    id: string
    user_id: string
    post_id: string
    username: string
    email: string;
    first_name?: string
    last_name?: string;
    avatar?: string;
    liked_at: string
    deleted: boolean
}

export interface Comment {
    id: string
    post_id: string
    user_id: string
    author: IUser
    comment: string
    created_at: string
}

export interface Post {
    id: string;
    user_id: string;
    content: string;
    image: string | null;
    created_at: string;
    likes_count: number
    comments_count: number
    likes: Like[]
    isLiked: boolean
    comments: Comment[]
    author: {
        email: string;
        username: string;
        first_name: string | null;
        last_name: string | null;
        avatar: string | null;
        bio: string | null;
        is_verified: boolean;
    };
};


export interface Notifications {
    id: string
    type: "like" | "comment" | "follow"
    post: Post
    sender: IUser
    receiver: IUser
    comment: Comment
    is_seen: boolean
    created_at: string
}