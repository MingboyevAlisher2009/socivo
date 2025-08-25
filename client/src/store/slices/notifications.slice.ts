import axiosInstance from "@/http/axios";
import type { Notifications } from "@/types";
import type { StateCreator } from "zustand";

export interface NotificationSlice {
    notifications: Notifications[] | null
    notificatoinLoading: boolean
    setNotifications: (notifications: Notifications[]) => void

    getNotifications: () => Promise<void>
    addNotification: (notification: Notifications) => void
}

const notificationsSlice: StateCreator<NotificationSlice> = (set, get) => ({
    notifications: null,
    notificatoinLoading: false,
    setNotifications: (notifications) => set({ notifications }),

    getNotifications: async () => {
        set({ notificatoinLoading: true })
        try {
            const { data } = await axiosInstance.get("/notifications")
            set({ notifications: data.data })

        } catch (error) {
            console.log(error);
        } finally {
            set({ notificatoinLoading: false })
        }
    },

    addNotification: (notification) => {
        const notifications = get().notifications

        set({ notifications: [notification, ...(notifications ?? [])] })
    }
})

export default notificationsSlice