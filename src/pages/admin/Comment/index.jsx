// src/pages/admin/comment/AdminCommentList.jsx
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminApi from "../../../api/adminApi";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AdminCommentList = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const [filterStatus, setFilterStatus] = useState(""); // '', '0', '1', '2'
  const [searchTerm, setSearchTerm] = useState("");

  /* ====== Toast ====== */
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success"); // 'success' | 'danger'

  /* ====== Modal xác nhận xóa (style như Category) ====== */
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (reviewId) => {
    setDeleteTarget(reviewId);
    setShowModal(true);
  };
  const closeDeleteModal = () => {
    if (isDeleting) return;
    setShowModal(false);
    setDeleteTarget(null);
  };

  const fetchReviews = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = { page, limit: 10 };
        if (filterStatus) params.status = filterStatus;
        if (searchTerm) params.search = searchTerm;

        const res = await adminApi.get("/reviews", { params });
        const data = res.data;

        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setPagination({
          currentPage: Number(data.currentPage) || page,
          totalPages: Number(data.totalPages) || 1,
          totalItems: Number(data.totalItems) || 0,
        });
      } catch (err) {
        const http = err?.response?.status;
        if (http === 401 || http === 403) {
          navigate("/admin-login", { replace: true });
          return;
        }
        const msg = err?.response?.data?.message || err.message || "Không thể tải dữ liệu";
        setError(msg);

        // Toast lỗi
        setToastType("danger");
        setToastMessage(<>Lỗi tải dữ liệu: {msg}</>);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
      } finally {
        setIsLoading(false);
      }
    },
    [filterStatus, searchTerm, navigate]
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReviews(1);
  };

  const renderStatus = (status) => {
    switch (status) {
      case 0:
        return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
      case 1:
        return <span className="badge bg-success">Đã duyệt</span>;
      case 2:
        return <span className="badge bg-danger">Đã từ chối</span>;
      default:
        return <span className="badge bg-secondary">Không xác định</span>;
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.delete(`/reviews/${deleteTarget}`);
      setToastType("success");
      setToastMessage(<>Xóa bình luận #{deleteTarget} thành công!</>);
      setShowToast(true);
      closeDeleteModal();
      await fetchReviews(pagination.currentPage);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      const http = err?.response?.status;
      if (http === 401 || http === 403) {
        navigate("/admin-login", { replace: true });
        return;
      }
      setToastType("danger");
      setToastMessage(
        <>Lỗi xóa bình luận: {err?.response?.data?.message || err.message}</>
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } finally {
      setIsDeleting(false);
    }
  };

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

      <h2 className="mb-4">Quản lý Bình luận / Đánh giá</h2>

      {/* Form Lọc và Tìm kiếm */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3 align-items-end">
            <div className="col-md-5">
              <label htmlFor="searchTerm" className="form-label">
                Tìm kiếm
              </label>
              <input
                type="text"
                className="form-control"
                id="searchTerm"
                placeholder="Nhập tên người dùng, sản phẩm, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="filterStatus" className="form-label">
                Trạng thái
              </label>
              <select
                id="filterStatus"
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="1">Đã duyệt</option>
                <option value="0">Chờ duyệt</option>
                <option value="2">Đã từ chối</option>
              </select>
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-success  w-100">
                Lọc / Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Hiển thị lỗi tải dữ liệu (song song toast) */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Bảng dữ liệu */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Người dùng</th>
              <th>Sản phẩm</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center">Đang tải dữ liệu...</td>
              </tr>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.id}</td>
                  <td>
                    {review.user?.avatar && (
                      <img
                        src={review.user.avatar}
                        alt={review.user?.name || "user"}
                        className="rounded-circle me-2"
                        width="40"
                        height="40"
                      />
                    )}
                    {review.user?.name || "Không xác định"}
                  </td>
                  <td>{review.variation?.name || "Sản phẩm không xác định"}</td>
                  <td style={{ maxWidth: "300px" }}>
                    <div>
                      <strong>Sao: {review.rating} ★</strong>
                    </div>
                    <small>{review.comment}</small>
                  </td>
                  <td>{renderStatus(review.status)}</td>
                  <td>
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : ""}
                  </td>
                  <td>
                    <Link
                      to={`/admin/review_edit/${review.id}`}
                      className="btn btn-success btn-sm me-2"
                      title="Sửa trạng thái"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => openDeleteModal(review.id)}
                      className="btn btn-danger btn-sm"
                      title="Xóa"
                      disabled={isDeleting && deleteTarget === review.id}
                    >
                      {isDeleting && deleteTarget === review.id ? "Đang xóa..." : "Xóa"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  Không tìm thấy bình luận nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {pagination.totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            {[...Array(pagination.totalPages).keys()].map((num) => (
              <li
                key={num + 1}
                className={`page-item ${pagination.currentPage === num + 1 ? "active" : ""}`}
              >
                <button
                  onClick={() => fetchReviews(num + 1)}
                  className="page-link"
                >
                  {num + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Modal xác nhận xóa — bản sao phong cách Category */}
      {showModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block", background: "rgba(0,0,0,0.15)" }}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title">Xác nhận xóa</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    Bạn chắc chắn muốn xóa bình luận này?
                  </p>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn"
                    style={{ background: "#FFD600", color: "#333", minWidth: 70, fontWeight: 500 }}
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ background: "#f44e4e", color: "#fff", minWidth: 70, fontWeight: 500 }}
                    onClick={confirmDelete}
                    disabled={isDeleting || !deleteTarget}
                  >
                    {isDeleting ? "Đang xóa..." : "Xóa"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* backdrop */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default AdminCommentList;
