import axiosInstance from "@/http/axios";
import type { ChatUser, Contacts, Message } from "@/types";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type { StateCreator } from "zustand";


export interface ChatSlice {
    contacts: Contacts[] | null
    messages: Message[] | null
    reply: Message | null
    image: string | null,
    selectedChat: ChatUser | null
    typing: Message | null
    isMuted: boolean
    isVideoOff: boolean
    isUserMuted: boolean
    isUserVideoOff: boolean
    isSoundEnabled: boolean
    contactLoading: boolean
    messageLoading: boolean
    sendingMessageLoading: boolean
    uploadImageLoading: boolean
    deleteImageLoading: boolean

    setSelectedChat: (selectedChat: ChatUser) => void
    setMessages: (messages: Message[]) => void
    setReply: (reply: Message | null) => void
    setTyping: (typing: Message | null) => void

    getContacts: () => Promise<void>
    getMessages: (selectedChat: ChatUser) => Promise<void>
    setIsMuted: (isMuted: boolean) => void
    setIsVideoOff: (isVideoOff: boolean) => void
    setIsUserMuted: (isUserMuted: boolean) => void
    setisUserVideoOff: (isUserVideoOff: boolean) => void
    sendMessage: (message: string) => Promise<void>
    uploadImage: (file: any) => Promise<void>
    deleteImage: () => Promise<void>,
    addMessage: (message: Message) => void
    getReadMessages: (messages: Message[]) => void
    toggleSound: () => void
    closeContact: () => void
}

const chatSlice: StateCreator<ChatSlice> = (set, get) => ({
    contacts: null,
    messages: null,
    reply: null,
    image: localStorage.getItem("image"),
    selectedChat: null,
    typing: null,
    isMuted: false,
    isVideoOff: false,
    isUserMuted: false,
    isUserVideoOff: false,
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled") as any) === true,
    contactLoading: false,
    messageLoading: false,
    sendingMessageLoading: false,
    uploadImageLoading: false,
    deleteImageLoading: false,

    setSelectedChat: (selectedChat) => set({ selectedChat }),
    setMessages: (messages) => set({ messages }),
    setReply: (reply) => set({ reply }),
    setTyping: (typing) => set({ typing }),
    setIsMuted: (isMuted) => set({ isMuted }),
    setIsVideoOff: (isVideoOff) => set({ isVideoOff }),
    setIsUserMuted: (isUserMuted) => set({ isUserMuted }),
    setisUserVideoOff: (isUserVideoOff) => set({ isUserVideoOff }),

    getContacts: async () => {
        set({ contactLoading: true })
        try {
            const { data } = await axiosInstance.get("/contacts")
            set({ contacts: data.data })
        } catch (error) {
            console.log(error);
            set({ contacts: null })
        } finally {
            set({ contactLoading: false })
        }
    },

    getMessages: async (selectedChat) => {
        if (selectedChat.id === get().selectedChat?.id) {
            return
        }
        const contacts = get().contacts || []
        set({ selectedChat, messageLoading: true })
        sessionStorage.setItem("selected-chat-data", JSON.stringify(selectedChat))
        try {
            const { data } = await axiosInstance.get(`/messages/${selectedChat.id}`)
            set({ messages: data.data })
            const filtreedContacts = contacts.map((item: any) => {
                const message = data.data.find((msg: any) => msg.id === item.lastMessage?.id && item.lastMessage?.read === false)
                return message ? { ...item, lastMessage: { ...item.lastMessage, read: true } } : item
            }) || []

            set({ contacts: filtreedContacts })
        } catch (error) {
            console.log(error);
            set({ messages: null })
        } finally {
            set({ messageLoading: false })
        }
    },

    sendMessage: async (message) => {
        set({ sendingMessageLoading: true })
        const recipient = get().selectedChat?.id
        const reply = get().reply?.id
        const image = get().image
        try {
            await axiosInstance.post("/messages/send-message", { recipient, reply, message, image })
            set({ image: null, reply: null })
            localStorage.removeItem("image")
            localStorage.removeItem("chatId")
        } catch (error) {
            const message =
                error instanceof AxiosError
                    ? error.response?.data?.message || "Something went wrong. Please try again."
                    : "Something went wrong. Please try again.";

            toast.error(message);
        } finally {
            set({ sendingMessageLoading: false })
        }
    },

    uploadImage: async (file) => {
        set({ uploadImageLoading: true });

        try {
            const { data } = await axiosInstance.post("/messages/upload-image", file)
            localStorage.setItem("image", data.data)
            localStorage.setItem("chatId", get().selectedChat?.id || "")
            set({ image: data.data })
        } catch (error) {
            const message =
                error instanceof AxiosError
                    ? error.response?.data?.message || "Something went wrong. Please try again."
                    : "Something went wrong. Please try again.";
            localStorage.removeItem("image")
            set({ image: null })
            toast.error(message);
        } finally {
            set({ uploadImageLoading: false })
        }
    },

    deleteImage: async () => {
        const image = get().image

        if (!image) {
            set({ image: null })
            return
        }
        set({ deleteImageLoading: true })
        try {
            await axiosInstance.delete(`/messages/delete-image/${Date.now()}?image=${image}`)
            localStorage.removeItem("image")
            localStorage.removeItem("chatId")
            set({ image: null })
        } catch (error) {
            console.log(error);
            const message =
                error instanceof AxiosError
                    ? error.response?.data?.message || "Something went wrong. Please try again."
                    : "Something went wrong. Please try again.";
            toast.error(message);
        } finally {
            set({ deleteImageLoading: false })
        }
    },

    addMessage: (message) => {
        const messages = get().messages || [];
        const contacts = get().contacts || [];
        const selectedChat = get().selectedChat
        const store: any = get();
        const userId = store.userInfo.id;

        set({ messages: [...messages, message] });

        const fromId =
            message.sender.id === userId
                ? message.recipient.id
                : message.sender.id;
        const fromData =
            message.sender.id === userId ? { ...message.recipient, lastMessage: message } : { ...message.sender, lastMessage: { ...message, read: selectedChat?.id === message.sender.id ? true : message.read } };

        const updatedDirectMessages = [
            fromData,
            ...contacts.filter((contact) => contact.id !== fromId),
        ];


        set({ contacts: updatedDirectMessages });
    },

    getReadMessages: (messages) => {
        const oldMessages = get().messages || []

        const filteredMessages = oldMessages?.map(item => {
            const message = messages.find(msg => msg.id === item.id)
            return message ? { ...message, read: true } : item
        })

        set({ messages: filteredMessages })
    },

    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled as any);
        set({ isSoundEnabled: !get().isSoundEnabled });
    },

    closeContact: () => {
        set({ selectedChat: null })
        sessionStorage.removeItem("selected-chat-data")
    }
})

export default chatSlice