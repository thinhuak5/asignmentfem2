// src/pages/admin/login/AdminForgotPassword.jsx
import React, {useState} from "react";
import axios from "axios";
import Constanst from "../../../Constanst";

export default function AdminForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [err, setErr] = useState(null);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        setErr(null);
        try {
            const res = await axios.post(
                `${Constanst.DOMAIN_API}/api/admin/forgot-password`,
                {email: String(email).trim().toLowerCase()},
                {headers: {"Content-Type": "application/json"}}
            );
            setMsg(res.data?.message || "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn khôi phục.");
        } catch (e) {
            setErr(e?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5 col-xl-4">
                        <div className="card p-4 shadow-lg border-0 rounded-3">
                            <h3 className="mb-4 text-center fw-bold">Quên mật khẩu (Quản trị)</h3>
                            <form onSubmit={onSubmit}>
                                {msg && <div className="alert alert-success">{msg}</div>}
                                {err && <div className="alert alert-danger">{err}</div>}

                                <div className="mb-3 text-start">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>

                                <button className="btn btn-primary w-100" disabled={isLoading}>
                                    {isLoading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
                                </button>
                            </form>

                            <p className="mt-4 text-center">
                                <a href="/admin-login">← Quay lại đăng nhập quản trị</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
