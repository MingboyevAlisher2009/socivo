import axiosInstance from "@/http/axios";
import type { IUser } from "@/types";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type { StateCreator } from "zustand";

export interface AuthSlice {
    userInfo: IUser | null;
    onlineUsers: string[] | null
    suggestedUsers: IUser[] | null
    loading: boolean;
    suggestedLoading: boolean;
    loginLoading: boolean;
    signUpLoading: boolean;
    logoutLoading: boolean
    verificationLoading: boolean;
    getUserInfo: (identify?: string) => Promise<IUser | null>;
    getSuggestedUsers: () => Promise<IUser[] | null>
    setUserInfo: (userInfo: IUser) => void;
    setOnlineUsers: (onlineUsers: string[]) => void
    setLoading: (loading: boolean) => void;
    setLoginLoading: (loading: boolean) => void;
    setSignUpLoading: (loading: boolean) => void;
    setVerificationLoading: (loading: boolean) => void;
    login: (email: string, password: string) => Promise<void>;
    verification: (email: string, otp: string) => Promise<void>;
    signUp: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>
}

const authSlice: StateCreator<AuthSlice> = (set, get) => ({
    userInfo: null,
    onlineUsers: null,
    suggestedUsers: null,
    loading: false,
    suggestedLoading: false,
    loginLoading: false,
    signUpLoading: false,
    logoutLoading: false,
    verificationLoading: false,

    setLoading: (loading) => set({ loading }),
    setUserInfo: (userInfo) => set({ userInfo }),
    setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
    setLoginLoading: (loading) => set({ loginLoading: loading }),
    setSignUpLoading: (loading) => set({ signUpLoading: loading }),
    setVerificationLoading: (loading) => set({ verificationLoading: loading }),


    login: async (email, password) => {
        set({ loginLoading: true });
        try {
            const { data } = await axiosInstance.post("/auth/login", {
                email,
                password,
            });

            const isVerified = data.data.is_verified;

            if (!isVerified) {
                toast.info(`Please verify your email to continue. OTP has been sent to ${data.data.email}`);
                window.location.replace("/auth/verification");
                return;
            }

            get().getUserInfo();
        } catch (error) {
            const message =
                error instanceof AxiosError
                    ? error.response?.data?.message || "Something went wrong. Please try again."
                    : "Something went wrong. Please try again.";

            toast.error(message);
        } finally {
            set({ loginLoading: false });
        }
    },

    signUp: async (username, email, password) => {
        set({ signUpLoading: true });
        try {
            const { data } = await axiosInstance.post("/auth/sign-up", {
                username,
                email,
                password,
            });
            sessionStorage.setItem("email", email);
            const message = `Please verify your email to continue. OTP has been sent to ${data.data.email}`
            toast.success(message);
            window.location.replace("/auth/verification");
        } catch (error) {
            const message =
                error instanceof AxiosError
                    ? error.response?.data?.message || "Something went wrong. Please try again."
                    : "Something went wrong. Please try again.";

            toast.error(message);
        } finally {
            set({ signUpLoading: false });
        }
    },

    logout: async () => {
        set({ logoutLoading: true })
        try {
            await axiosInstance.post("/auth/logout")
            window.location.replace("/auth/login")
        } catch (error) {
            console.log(error);

        } finally {
            set({ logoutLoading: false })
        }
    },

    verification: async (email, otp) => {
        set({ verificationLoading: true });
        try {
            await axiosInstance.post("/auth/verify", {
                email,
                otp,
            });

            toast.success("Verification successful! You can now log in.");
            window.location.replace("/auth/login");
        } catch (error) {
            const message =
                error instanceof AxiosError
                    ? error.response?.data?.message || "Something went wrong. Please try again."
                    : "Something went wrong. Please try again.";

            toast.error(message);
        } finally {
            set({ verificationLoading: false });
        }
    },

    getUserInfo: async (identify) => {
        set({ loading: true });
        try {
            const { data } = await axiosInstance.get<{ data: IUser }>(`/auth/${identify ? identify : "me"}`);
            set({ userInfo: data.data });
            return data.data;
        } catch (error) {
            console.error("Error fetching user info:", error);
            return null;
        } finally {
            set({ loading: false });
        }
    },

    getSuggestedUsers: async () => {
        set({ suggestedLoading: true })
        try {
            const { data } = await axiosInstance.get("/auth/suggested-users")
            set({ suggestedUsers: data.data })
            return data.data
        } catch (error) {
            console.log(error);
            set({ suggestedUsers: null })
        } finally {
            set({ suggestedLoading: false })
        }
    }
});

export default authSlice;
