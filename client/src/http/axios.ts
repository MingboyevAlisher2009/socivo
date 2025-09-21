import axios from "axios";

export const BASE_URL = "http://192.168.100.22:4000"

const axiosInstance = axios.create({
    baseURL: `${BASE_URL}/api`,
    withCredentials: true,
});

export default axiosInstance;