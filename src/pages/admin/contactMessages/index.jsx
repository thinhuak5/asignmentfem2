// src/pages/admin/contact/ContactMessages.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../../../api/adminApi";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [showReplied, setShowReplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToastMsg = (msg, type = "success", timeout = 3000) => {
    setToastType(type === "error" ? "danger" : type);
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), timeout);
  };

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      try {
        const res = await adminApi.get("/contact");
        const payload = res.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setMessages(list);
      } catch (err) {
        const http = err?.response?.status;
        if (http === 401 || http === 403) {
          navigate("/admin-login", { replace: true });
          return;
        }
        const msg =
          err?.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách liên hệ.";
        showToastMsg(`Lỗi: ${msg}`, "error", 4000);
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, [navigate]);

  const handleReply = (id) => {
    navigate(`/admin/contact/reply/${id}`);
  };

  const filteredMessages = showReplied
    ? messages
    : messages.filter((m) => !m.replied);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h4>Đang tải dữ liệu...</h4>
      </div>
    );
  }

  return (
    <div className="container mt-5 position-relative">
      {/* Toast góc phải */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="position-fixed"
        style={{ zIndex: 1070, top: 20, right: 20, minWidth: 340 }}
      >
        {showToast && (
          <div
            className="d-flex align-items-center shadow rounded-3 px-4 py-2 mb-2 position-relative"
            style={{
              background: toastType === "success" ? "#25b864" : "#f44e4e",
              color: "#fff",
              minHeight: 46,
            }}
          >
            {toastType === "success" ? (
              <FaCheckCircle className="me-2 fs-5" />
            ) : (
              <FaTimesCircle className="me-2 fs-5" />
            )}
            <div style={{ flex: 1 }}>{toastMessage}</div>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: 18,
                cursor: "pointer",
              }}
              onClick={() => setShowToast(false)}
            >
              ×
            </button>
          </div>
        )}
      </div>

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
                <td style={{ maxWidth: 380, whiteSpace: "pre-wrap" }}>
                  {msg.message}
                </td>
                <td>
                  {msg.replied ? (
                    <span className="text-success">Đã trả lời</span>
                  ) : (
                    <span className="text-danger">Chưa trả lời</span>
                  )}
                </td>
                <td style={{ maxWidth: 380, whiteSpace: "pre-wrap" }}>
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
