// src/pages/admin/comment/AdminCommentList.jsx
import React, {useCallback, useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import adminApi from "../../../api/adminApi";

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

    const fetchReviews = useCallback(
        async (page = 1) => {
            setIsLoading(true);
            setError(null);
            try {
                const params = {
                    page,
                    limit: 10,
                };
                if (filterStatus) params.status = filterStatus;
                if (searchTerm) params.search = searchTerm;

                const res = await adminApi.get("/reviews", {params});
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
                    navigate("/admin-login", {replace: true});
                    return;
                }
                setError(err?.response?.data?.message || err.message || "Không thể tải dữ liệu");
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

    const handleDelete = async (reviewId) => {
        if (!window.confirm(`Bạn có chắc muốn xóa bình luận #${reviewId}?`)) return;
        try {
            await adminApi.delete(`/reviews/${reviewId}`);
            alert("Xóa thành công!");
            fetchReviews(pagination.currentPage);
        } catch (err) {
            const http = err?.response?.status;
            if (http === 401 || http === 403) {
                navigate("/admin-login", {replace: true});
                return;
            }
            alert(`Lỗi: ${err?.response?.data?.message || err.message}`);
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
                            <td style={{maxWidth: "300px"}}>
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
