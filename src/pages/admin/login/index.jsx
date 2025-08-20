// src/pages/admin/login/index.jsx
import React, {useState} from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {Link, useLocation, useNavigate} from "react-router-dom";
import Constanst from "../../../Constanst";
import {GoogleLogin, GoogleOAuthProvider} from "@react-oauth/google";

export default function AdminLogin() {
    const [form, setForm] = useState({email: "", password: ""});
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const finishAdminLogin = (token) => {
        localStorage.setItem("authToken", token);   // dùng cho API
        sessionStorage.setItem("adminAuthed", "1"); // cờ phiên admin
        const from = location.state?.from?.pathname || "/admin";
        navigate(from, {replace: true});
    };

    // --- Email/Password ---
    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            const res = await axios.post(`${Constanst.DOMAIN_API}/api/login`, form, {
                headers: {"Content-Type": "application/json"},
            });
            const token = res?.data?.token;
            if (!token) throw new Error("Không nhận được token");

            const decoded = jwtDecode(token);
            const isAdminRole = decoded.role === 0 || decoded.role === 1;
            if (!isAdminRole) {
                setErr("Bạn không có quyền truy cập khu vực quản trị.");
                return;
            }
            finishAdminLogin(token);
        } catch (e) {
            setErr(
                e?.response?.data?.message ||
                e?.message ||
                "Đăng nhập thất bại. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    // --- Google Login ---
    const onGoogleSuccess = async (googleResponse) => {
        setErr("");
        try {
            const credential = googleResponse?.credential;
            if (!credential) throw new Error("Không nhận được credential từ Google");

            const res = await axios.post(`${Constanst.DOMAIN_API}/api/login-google`, {
                tokenGoogle: credential,
            });

            const token = res?.data?.token;
            if (!token) throw new Error("Không nhận được token từ máy chủ");

            const decoded = jwtDecode(token);
            const isAdminRole = decoded.role === 0 || decoded.role === 1;
            if (!isAdminRole) {
                // BE của bạn đang tạo user Google mặc định role=2.
                // Muốn đăng nhập admin qua Google, hãy gán role 0/1 cho email admin trong DB.
                setErr("Tài khoản Google này không có quyền quản trị.");
                return;
            }

            finishAdminLogin(token);
        } catch (e) {
            setErr(
                e?.response?.data?.message ||
                e?.message ||
                "Đăng nhập Google thất bại, vui lòng thử lại."
            );
        }
    };

    const onGoogleError = () => {
        setErr("Không thể xác thực với Google. Vui lòng thử lại.");
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card p-4 shadow-sm" style={{minWidth: 360}}>
                <h3 className="fw-bold text-center mb-3">Admin Login</h3>
                {err && <div className="alert alert-danger">{err}</div>}

                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            className="form-control"
                            value={form.email}
                            onChange={(e) => setForm({...form, email: e.target.value})}
                            placeholder="admin@example.com"
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            className="form-control"
                            value={form.password}
                            onChange={(e) => setForm({...form, password: e.target.value})}
                            placeholder="••••••"
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    <button className="btn btn-primary w-100 mt-2" disabled={loading}>
                        {loading ? "Đang đăng nhập..." : "Đăng nhập quản trị"}
                    </button>
                </form>

                {/* Google Login */}
                <div className="mt-3 d-flex justify-content-center">
                    <GoogleOAuthProvider
                        clientId="174189579193-5an9p6b13u20aeut0qdhkrudiflha8gk.apps.googleusercontent.com">
                        <GoogleLogin
                            onSuccess={onGoogleSuccess}
                            onError={onGoogleError}
                            useOneTap={false}
                            text="signin_with"
                            shape="pill"
                            theme="outline"
                            size="large"
                            width="300"
                        />
                    </GoogleOAuthProvider>
                </div>

                <div className="text-center mt-3">
                    <Link to="/">← Về trang khách</Link>
                </div>
            </div>
        </div>
    );
}
