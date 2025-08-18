// src/pages/admin/contact/ContactMessages.jsx
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
// ⚠️ chỉnh path cho đúng vị trí file của bạn
import adminApi from "../../../api/adminApi";

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [showReplied, setShowReplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const loadContacts = async () => {
            setLoading(true);
            setErrMsg("");
            try {
                // GET /api/admin/contact (đã qua authenticateToken + isAdmin)
                const res = await adminApi.get("/contact");
                // Theo router bạn gửi: GET /admin/contact trả { success, data }
                const payload = res.data;
                const list = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
                setMessages(list);
            } catch (err) {
                const http = err?.response?.status;
                if (http === 401 || http === 403) {
                    navigate("/admin-login", {replace: true});
                    return;
                }
                setErrMsg(err?.response?.data?.message || err.message || "Không thể tải danh sách liên hệ.");
            } finally {
                setLoading(false);
            }
        };
        loadContacts();
    }, [navigate]);

    const handleReply = (id) => {
        navigate(`/admin/contact/reply/${id}`);
    };

    const filteredMessages = showReplied ? messages : messages.filter((m) => !m.replied);

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <h4>Đang tải dữ liệu...</h4>
            </div>
        );
    }

    if (errMsg) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{errMsg}</div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">📬 Danh sách phản hồi từ người dùng</h2>

            <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => setShowReplied((v) => !v)}
            >
                {showReplied ? "Ẩn phản hồi đã trả lời" : "Hiện phản hồi đã trả lời"}
            </button>

            {filteredMessages.length === 0 ? (
                <p>Không có phản hồi nào.</p>
            ) : (
                <table className="table table-bordered">
                    <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Tin nhắn</th>
                        <th>Trạng thái</th>
                        <th>Phản hồi</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredMessages.map((msg, index) => (
                        <tr key={msg.id}>
                            <td>{index + 1}</td>
                            <td>{msg.name}</td>
                            <td>{msg.email}</td>
                            <td style={{maxWidth: 380, whiteSpace: "pre-wrap"}}>{msg.message}</td>
                            <td>
                                {msg.replied ? (
                                    <span className="text-success">Đã trả lời</span>
                                ) : (
                                    <span className="text-danger">Chưa trả lời</span>
                                )}
                            </td>
                            <td style={{maxWidth: 380, whiteSpace: "pre-wrap"}}>
                                {msg.replyContent || "—"}
                            </td>
                            <td>
                                {msg.replied ? (
                                    <button className="btn btn-secondary btn-sm" disabled>
                                        Đã trả lời
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleReply(msg.id)}
                                    >
                                        Trả lời
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ContactMessages;
