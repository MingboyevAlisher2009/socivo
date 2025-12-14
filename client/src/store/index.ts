import { create } from "zustand";
import authSlice from "./slices/auth.slice";

import type { AuthSlice } from "./slices/auth.slice";
import type { PostsSlice } from "./slices/posts.slice";
import postsSlice from "./slices/posts.slice";
import type { NotificationSlice } from "./slices/notifications.slice";
import notificationsSlice from "./slices/notifications.slice";
import chatSlice, { type ChatSlice } from "./slices/chat.slice";

type AppStore = AuthSlice & PostsSlice & NotificationSlice & ChatSlice;

export const useAppStore = create<AppStore>()((...args) => ({
    ...authSlice(...args),
    ...postsSlice(...args),
    ...notificationsSlice(...args),
    ...chatSlice(...args),
}));
