import React, {useCallback, useEffect, useState} from "react";
import {Link} from "react-router-dom"; // Sử dụng react-router-dom
import Constanst from "../../../Constanst"; // Đường dẫn tới file hằng số của bạn

const AdminCommentList = () => {
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
    const token = localStorage.getItem("authToken");

    // Hàm để lấy dữ liệu từ API
    const fetchReviews = useCallback(
        async (page = 1) => {
            setIsLoading(true);
            setError(null);
      try {
          const params = new URLSearchParams({
              page: page,
              limit: 10,
          });
          if (filterStatus) params.append("status", filterStatus);
          if (searchTerm) params.append("search", searchTerm);

          const res = await fetch(
              `${Constanst.DOMAIN_API}/api/admin/reviews?${params.toString()}`,
              {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              }
          );

          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || "Không thể tải dữ liệu");
          }

          const data = await res.json();
          setReviews(data.reviews);
          setPagination({
              currentPage: data.currentPage,
              totalPages: data.totalPages,
              totalItems: data.totalItems,
          });
      } catch (err) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
        },
        [token, filterStatus, searchTerm]
    );

  useEffect(() => {
      if (token) {
          fetchReviews(1); // Lấy trang đầu tiên khi component mount hoặc filter thay đổi
      } else {
          setError("Vui lòng đăng nhập với tài khoản Admin.");
          setIsLoading(false);
      }
  }, [fetchReviews, token]);

    // Hàm xử lý khi nhấn nút tìm kiếm
    const handleSearch = (e) => {
        e.preventDefault();
        fetchReviews(1); // Quay về trang 1 khi tìm kiếm mới
    };

    // Hàm render trạng thái với màu sắc
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

    // Hàm xóa review
    const handleDelete = async (reviewId) => {
        if (!window.confirm(`Bạn có chắc muốn xóa bình luận #${reviewId}?`)) return;

        try {
            const res = await fetch(
                `${Constanst.DOMAIN_API}/api/admin/reviews/${reviewId}`,
                {
                    method: "DELETE",
                    headers: {Authorization: `Bearer ${token}`},
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            alert("Xóa thành công!");
            fetchReviews(pagination.currentPage); // Tải lại trang hiện tại
        } catch (err) {
            alert(`Lỗi: ${err.message}`);
    }
  };

    if (isLoading)
        return (
            <div className="container text-center mt-5">
                <h4>Đang tải dữ liệu...</h4>
            </div>
        );
    if (error)
        return <div className="container alert alert-danger mt-5">{error}</div>;

  return (
      <div className="container mt-4">
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
                          <button type="submit" className="btn btn-primary w-100">
                              Lọc / Tìm kiếm
                          </button>
                      </div>
                  </form>
              </div>
          </div>

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
              {reviews.length > 0 ? (
                  reviews.map((review) => (
                      <tr key={review.id}>
                          <td>{review.id}</td>
                          <td>
                              <img
                                  src={review.user.avatar}
                                  alt={review.user.name}
                                  className="rounded-circle me-2"
                                  width="40"
                                  height="40"
                              />
                              {review.user.name}
                          </td>
                          <td>{review.variation.name || "Sản phẩm không xác định"}</td>
                          <td style={{maxWidth: "300px"}}>
                              <div>
                                  <strong>Sao: {review.rating} ★</strong>
                              </div>
                              <small>{review.comment}</small>
                          </td>
                          <td>{renderStatus(review.status)}</td>
                          <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                          <td>
                              <Link
                                  to={`/admin/review_edit/${review.id}`}
                                  className="btn btn-primary btn-sm me-2"
                                  title="Sửa trạng thái"
                              >
                                  Sửa
                              </Link>
                  <button
                      onClick={() => handleDelete(review.id)}
                      className="btn btn-danger btn-sm"
                      title="Xóa"
                  >
                    Xóa
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

          {/* Phân trang */}
          {pagination.totalPages > 1 && (
              <nav>
                  <ul className="pagination justify-content-center">
                      {[...Array(pagination.totalPages).keys()].map((num) => (
                          <li
                              key={num + 1}
                              className={`page-item ${
                                  pagination.currentPage === num + 1 ? "active" : ""
                              }`}
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
    </div>
  );
};

export default AdminCommentList;
