import React, {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import emailjs from "@emailjs/browser";

const ContactMessageID = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState(null);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get(`http://localhost:3000/api/admin/contact/${id}`)
            .then((res) => {
                if (res.data.success) setContact(res.data.data);
            })
            .catch((err) => console.error("Lỗi khi tải phản hồi:", err));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // 🛑 Kiểm tra xem các trường có bị bỏ trống không
        if (!subject.trim() || !message.trim()) {
            setError("❗ Vui lòng nhập đầy đủ tiêu đề và nội dung phản hồi.");
            return;
        }

        try {
            // ✅ Gửi email
            await emailjs.send(
                "service_j7ecpgl",
                "template_5wpey53",
                {
                    to_name: contact.name,
                    to_email: contact.email,
                    subject: subject,
                    message: message,
                },
                "eI2hATDjbArRM5Snh"
            );

            // ✅ Cập nhật trạng thái đã phản hồi
            await axios.post(`http://localhost:3000/api/admin/contact/reply/${id}`, {
                replyContent: message,
            });

            alert("✅ Gửi phản hồi thành công!");
            navigate("/admin/contact");
        } catch (error) {
            console.error("Lỗi khi gửi:", error);
            alert("❌ Gửi phản hồi thất bại!");
        }
    };

    if (!contact) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="container mt-4">
            <h3>✉️ Trả lời phản hồi từ: <strong>{contact.name}</strong></h3>
            <p><strong>Email:</strong> {contact.email}</p>
            <p><strong>Tin nhắn:</strong> {contact.message}</p>

            {/* Thông báo lỗi */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label>Tiêu đề</label>
                    <input
                        type="text"
                        className="form-control"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Nhập tiêu đề"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Nội dung phản hồi</label>
                    <textarea
                        className="form-control"
                        rows="5"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nhập nội dung"
                        required
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-success">Gửi phản hồi</button>
            </form>
        </div>
    );
};

export default ContactMessageID;
