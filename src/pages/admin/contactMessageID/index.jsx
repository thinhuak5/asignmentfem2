// src/pages/admin/contact/ContactMessageID.jsx
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
// ⚠️ Điều chỉnh đường dẫn dưới đây cho đúng với cây thư mục của bạn
import adminApi from "../../../api/adminApi";

const ContactMessageID = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [contact, setContact] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadContact = async () => {
            try {
                // GET /api/admin/contact/:id (đã được bảo vệ bởi authenticateToken + isAdmin)
                const res = await adminApi.get(`/contact/${id}`);
                // Theo router bạn đưa: GET /admin/contact/:id trả { success, data }
                const payload = res.data;
                if (payload?.success && payload?.data) {
                    setContact(payload.data);
                } else {
                    // Nếu backend trả trực tiếp object
                    setContact(payload?.data || payload);
                }
            } catch (err) {
                const http = err?.response?.status;
                if (http === 401 || http === 403) {
                    navigate("/admin-login", {replace: true});
                    return;
                }
                setError(err?.response?.data?.message || err.message || "Không thể tải phản hồi.");
            } finally {
                setLoading(false);
            }
        };
        loadContact();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) {
            setError("❗ Vui lòng nhập nội dung phản hồi.");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            // POST /api/admin/contact/reply/:id  { replyContent }
            await adminApi.post(`/contact/reply/${id}`, {replyContent});
            alert("✅ Phản hồi đã được gửi và email đã được gửi tới người dùng.");
            navigate("/admin/contact");
        } catch (err) {
            const http = err?.response?.status;
            if (http === 401 || http === 403) {
                navigate("/admin-login", {replace: true});
                return;
            }
            alert("❌ Gửi phản hồi thất bại!");
            setError(err?.response?.data?.message || err.message || "Gửi phản hồi thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="container mt-4">Đang tải dữ liệu...</p>;
    if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;
    if (!contact) return <p className="container mt-4">Không tìm thấy phản hồi.</p>;

    return (
        <div className="container mt-4">
            <h4>✉️ Phản hồi tới: <strong>{contact.name}</strong></h4>
            <p><strong>Email:</strong> {contact.email}</p>
            <p><strong>Tin nhắn:</strong> {contact.message}</p>

            <form onSubmit={handleSubmit}>
        <textarea
            className="form-control mb-3"
            rows="5"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Nhập nội dung phản hồi"
            required
        />
                <button type="submit" className="btn btn-success" disabled={submitting}>
                    {submitting ? "Đang gửi..." : "Gửi phản hồi"}
                </button>
            </form>
        </div>
    );
};

export default ContactMessageID;
