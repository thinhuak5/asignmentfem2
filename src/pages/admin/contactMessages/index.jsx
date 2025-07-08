import React, {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [showReplied, setShowReplied] = useState(false); // ✅ Trạng thái bật/tắt hiển thị phản hồi đã trả lời
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:3000/api/admin/contact")
            .then(res => {
                if (res.data.success) {
                    setMessages(res.data.data);
                }
            })
            .catch(err => {
                console.error("Lỗi khi tải danh sách liên hệ:", err);
            });
    }, []);

    const handleReply = (id) => {
        navigate(`/admin/contact/reply/${id}`);
    };

    const filteredMessages = showReplied
        ? messages
        : messages.filter(msg => !msg.replied); // ✅ Ẩn phản hồi đã trả lời

    return (
        <div className="container mt-5">
            <h2 className="mb-4">📬 Danh sách phản hồi từ người dùng</h2>

            <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => setShowReplied(!showReplied)}
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
                            <td>{msg.message}</td>
                            <td>
                                {msg.replied ? (
                                    <span className="text-success">Đã trả lời</span>
                                ) : (
                                    <span className="text-danger">Chưa trả lời</span>
                                )}
                            </td>
                            <td>{msg.replyContent || "—"}</td>
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
