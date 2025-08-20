// src/api/adminApi.js
import axios from "axios";
import Constanst from "../Constanst";

// Axios instance riêng cho khu vực ADMIN
const adminApi = axios.create({
    baseURL: `${Constanst.DOMAIN_API}/api/admin`,
    timeout: 15000,
    withCredentials: false,
});

// Gắn token vào mọi request
adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Bắt lỗi 401/403 để FE chủ động điều hướng
adminApi.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
            // Hết phiên hoặc không đủ quyền ở khu vực admin:
            // - Xoá cờ phiên admin
            // - Điều hướng về trang đăng nhập admin
            try {
                sessionStorage.removeItem("adminAuthed");
            } catch {
            }
            // (Tuỳ chọn) Nếu muốn đăng xuất luôn cả client, bỏ comment dòng dưới:
            // localStorage.removeItem("authToken");
            if (typeof window !== "undefined") {
                window.location.href = "/admin-login";
            }
        }
        return Promise.reject(err);
    }
);

export default adminApi;
