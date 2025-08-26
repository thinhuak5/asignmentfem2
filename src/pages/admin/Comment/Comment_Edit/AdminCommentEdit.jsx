// src/pages/admin/comment/AdminCommentEdit.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import adminApi from "../../../../api/adminApi";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AdminCommentEdit = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success"); // 'success' | 'danger'

  const showToastMsg = (msg, type = "success", timeout = 3000) => {
    setToastType(type === "error" ? "danger" : type);
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), timeout);
  };

  const fetchReviewDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.get(`/reviews/${reviewId}`);
      const data = res.data;
      setReview(data);
      setStatus(String(data.status ?? "0"));
    } catch (err) {
      const http = err?.response?.status;
      if (http === 401 || http === 403) {
        navigate("/admin-login", { replace: true });
        return;
      }
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Không thể tải chi tiết bình luận";
      setError(msg);
      showToastMsg(`Lỗi tải chi tiết: ${msg}`, "error", 3500);
    } finally {
      setIsLoading(false);
    }
  }, [reviewId, navigate]);

  useEffect(() => {
    fetchReviewDetails();
  }, [fetchReviewDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await adminApi.patch(`/reviews/${reviewId}/status`, {
        status: parseInt(status, 10),
      });
      if (res.status >= 200 && res.status < 300) {
        showToastMsg("Cập nhật trạng thái thành công!", "success", 2000);
        // điều hướng sau 500ms cho UX mượt
        setTimeout(() => navigate("/admin/comment"), 500);
      }
    } catch (err) {
      const http = err?.response?.status;
      if (http === 401 || http === 403) {
        navigate("/admin-login", { replace: true });
        return;
      }
      const msg = err?.response?.data?.message || err.message || "Cập nhật thất bại";
      showToastMsg(`Lỗi: ${msg}`, "error", 3500);
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;
  if (!review) return <p>Không tìm thấy bình luận.</p>;

  return (
    <div className="container mt-4 position-relative">
      {/* Toast (góc phải trên) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="position-fixed"
        style={{ zIndex: 1070, top: 20, right: 20, minWidth: 340 }}
      >
        {showToast && (
          <div
            className={`d-flex align-items-center shadow rounded-3 px-4 py-2 mb-2 position-relative`}
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

      <h3>Chỉnh sửa Bình luận #{review.id}</h3>
      <div className="card">
        <div className="card-body">
          <p>
            <strong>Người dùng:</strong> {review.user?.name || "Không xác định"}
          </p>
          <p>
            <strong>Biến thể:</strong> {review.variation?.name || "không xác định"}
          </p>
          <p>
            <strong>Sao:</strong> {review.rating} ★
          </p>
          <p>
            <strong>Nội dung:</strong> {review.comment}
          </p>

          {Array.isArray(review.images) && review.images.length > 0 && (
            <div>
              <strong>Hình ảnh:</strong>
              <div className="d-flex gap-2 mt-2 flex-wrap">
                {review.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt="review"
                    width="100"
                    className="img-thumbnail"
                  />
                ))}
              </div>
            </div>
          )}

          <hr />
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="status" className="form-label">
                <strong>Trạng thái:</strong>
              </label>
              <select
                id="status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="1">Đã duyệt</option>
                <option value="0">Chờ duyệt</option>
                <option value="2">Từ chối</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/comment")}
              className="btn btn-secondary ms-2"
              disabled={isSubmitting}
            >
              Hủy
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCommentEdit;
