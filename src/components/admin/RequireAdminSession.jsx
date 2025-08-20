// src/components/admin/RequireAdminSession.jsx
import React from "react";
import {Navigate, Outlet, useLocation} from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const isTokenValidAdmin = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return {ok: false, reason: "NO_TOKEN"};

    try {
        const decoded = jwtDecode(token);
        const expired = decoded.exp * 1000 <= Date.now();
        const isAdminRole = decoded.role === 0 || decoded.role === 1; // tuỳ hệ thống của bạn
        if (expired) return {ok: false, reason: "EXPIRED"};
        return {ok: isAdminRole, reason: isAdminRole ? "OK" : "NOT_ADMIN"};
    } catch {
        return {ok: false, reason: "INVALID_TOKEN"};
    }
};

export default function RequireAdminSession() {
    const location = useLocation();

    // BẮT BUỘC: đã “đăng nhập admin” (đã qua admin-login)
    const adminAuthed = sessionStorage.getItem("adminAuthed") === "1";
    if (!adminAuthed) {
        return <Navigate to="/admin-login" state={{from: location}} replace/>;
    }

    // Thêm lớp bảo vệ: chỉ role admin (0/1) mới được vào
    const check = isTokenValidAdmin();
    if (!check.ok) {
        // Nếu token hết hạn/không phải admin -> quay về admin-login
        return <Navigate to="/admin-login" state={{from: location}} replace/>;
    }

    return <Outlet/>;
}
