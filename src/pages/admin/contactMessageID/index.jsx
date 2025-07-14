import React, {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";

const ContactMessageID = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:3000/api/admin/contact/${id}`)
        .then(res => res.data.success && setContact(res.data.data))
        .catch(err => console.error("Lỗi khi tải phản hồi:", err));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return setError("❗ Vui lòng nhập nội dung phản hồi.");

    try {
      await axios.post(`http://localhost:3000/api/admin/contact/reply/${id}`, {
        replyContent
      });

      alert("✅ Phản hồi đã được gửi và email đã được gửi tới người dùng.");
      navigate("/admin/contact");
    } catch (err) {
      console.error("Lỗi khi gửi phản hồi:", err);
      alert("❌ Gửi phản hồi thất bại!");
    }
  };

  if (!contact) return <p>Đang tải dữ liệu...</p>;

  return (
      <div className="container mt-4">
        <h4>✉️ Phản hồi tới: <strong>{contact.name}</strong></h4>
        <p><strong>Email:</strong> {contact.email}</p>
        <p><strong>Tin nhắn:</strong> {contact.message}</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
        <textarea
            className="form-control mb-3"
            rows="5"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Nhập nội dung phản hồi"
            required
        ></textarea>
          <button type="submit" className="btn btn-success">Gửi phản hồi</button>
        </form>
      </div>
  );
};

export default ContactMessageID;
