import axios from "axios";

export const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:4000" : import.meta.env.BASE_URL

const axiosInstance = axios.create({
    baseURL: `${BASE_URL}/api`,
    withCredentials: true,
});

export default axiosInstance;