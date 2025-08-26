import axios from "axios";

export const BASE_URL = "http://localhost:4000"

const axiosInstance = axios.create({
    baseURL: `${BASE_URL}/api`,
    withCredentials: true,
});

export default axiosInstance;