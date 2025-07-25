import React, {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Constanst from "../../../../Constanst";

const AdminCommentEdit = () => {
    const {reviewId} = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const [review, setReview] = useState(null);
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchReviewDetails = useCallback(async () => {
        try {
            const res = await fetch(
                `${Constanst.DOMAIN_API}/api/admin/reviews/${reviewId}`,
                {
                    headers: {Authorization: `Bearer ${token}`},
                }
            );
            if (!res.ok) throw new Error("Không thể tải chi tiết bình luận");
            const data = await res.json();
            setReview(data);
            setStatus(data.status.toString());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [reviewId, token]);

    useEffect(() => {
        fetchReviewDetails();
    }, [fetchReviewDetails]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(
                `${Constanst.DOMAIN_API}/api/admin/reviews/${reviewId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({status: parseInt(status, 10)}),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            alert("Cập nhật trạng thái thành công!");
            navigate("/admin/comment");
        } catch (err) {
            alert(`Lỗi: ${err.message}`);
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <p>Đang tải...</p>;
    if (error) return <p className="alert alert-danger">{error}</p>;
    if (!review) return <p>Không tìm thấy bình luận.</p>;

    return (
        <div className="container mt-4">
            <h3>Chỉnh sửa trạng thái Bình luận #{review.id}</h3>
            <div className="card">
                <div className="card-body">
                    <p>
                        <strong>Người dùng:</strong> {review.user.name}
                    </p>
                    <p>
                        <strong>Sản phẩm:</strong> {review.product.name}
                    </p>
                    <p>
                        <strong>Đánh giá:</strong> {review.rating} ★
                    </p>
                    <p>
                        <strong>Nội dung:</strong> {review.comment}
                    </p>
                    {review.images && review.images.length > 0 && (
                        <div>
                            <strong>Hình ảnh:</strong>
                            <div className="d-flex gap-2 mt-2">
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
                                <strong>Cập nhật trạng thái:</strong>
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
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
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
