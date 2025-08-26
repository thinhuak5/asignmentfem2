// src/pages/admin/contact/ContactMessageID.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import adminApi from "../../../api/adminApi";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const ContactMessageID = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' | 'danger'

  const showToastMsg = (msg, type = "success", timeout = 3000) => {
    setToastType(type);
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), timeout);
  };

  useEffect(() => {
    const loadContact = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await adminApi.get(`/contact/${id}`);
        const payload = res.data;
        if (payload?.success && payload?.data) {
          setContact(payload.data);
        } else {
          setContact(payload?.data || payload);
        }
      } catch (err) {
        const http = err?.response?.status;
        if (http === 401 || http === 403) {
          navigate("/admin-login", { replace: true });
          return;
        }
        setError(
          err?.response?.data?.message || err.message || "Không thể tải phản hồi."
        );
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
      showToastMsg("Vui lòng nhập nội dung phản hồi.", "danger", 3500);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await adminApi.post(`/contact/reply/${id}`, { replyContent });
      showToastMsg("✅ Đã gửi phản hồi và email tới người dùng.", "success", 2000);
      setTimeout(() => navigate("/admin/contact"), 600);
    } catch (err) {
      const http = err?.response?.status;
      if (http === 401 || http === 403) {
        navigate("/admin-login", { replace: true });
        return;
      }
      const msg =
        err?.response?.data?.message || err.message || "Gửi phản hồi thất bại.";
      setError(msg);
      showToastMsg(`❌ ${msg}`, "danger", 4000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="container mt-4">Đang tải dữ liệu...</p>;
  if (error && !contact)
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  if (!contact) return <p className="container mt-4">Không tìm thấy phản hồi.</p>;

  return (
    <div className="container mt-4 position-relative">
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

      <h4>
        ✉️ Phản hồi tới: <strong>{contact.name}</strong>
      </h4>
      <p>
        <strong>Email:</strong> {contact.email}
      </p>
      <p>
        <strong>Tin nhắn:</strong> {contact.message}
      </p>

      {error && (
        <div className="alert alert-warning py-2">
          {error}
        </div>
      )}

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
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate("/admin/contact")}
          disabled={submitting}
        >
          Hủy
        </button>
      </form>
    </div>
  );
};

export default ContactMessageID;
