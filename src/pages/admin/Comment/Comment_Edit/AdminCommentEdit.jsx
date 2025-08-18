// src/pages/admin/comment/AdminCommentEdit.jsx
import React, {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import adminApi from "../../../../api/adminApi";

const AdminCommentEdit = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviewDetails = useCallback(async () => {
    try {
        const res = await adminApi.get(`/reviews/${reviewId}`);
        const data = res.data;
      setReview(data);
        setStatus(String(data.status ?? "0"));
    } catch (err) {
        const http = err?.response?.status;
        if (http === 401 || http === 403) {
            navigate("/admin-login", {replace: true});
            return;
        }
        setError(err?.response?.data?.message || err.message || "Không thể tải chi tiết bình luận");
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
            alert("Cập nhật trạng thái thành công!");
            navigate("/admin/comment");
        }
    } catch (err) {
        const http = err?.response?.status;
        if (http === 401 || http === 403) {
            navigate("/admin-login", {replace: true});
            return;
        }
        alert(`Lỗi: ${err?.response?.data?.message || err.message}`);
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;
  if (!review) return <p>Không tìm thấy bình luận.</p>;

  return (
      <div className="container mt-4">
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

                  <hr/>
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
