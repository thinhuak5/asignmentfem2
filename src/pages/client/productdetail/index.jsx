import React, {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router";
import Constanst from "../../../Constanst";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faMinus,
    faMoneyBillWave,
    faPlus,
    faShieldAlt,
    faShoppingCart,
    faStar as faStarSolid,
    faTruck
} from '@fortawesome/free-solid-svg-icons'; // Thêm faExchangeAlt nếu cần
import {faStar as faStarRegular} from '@fortawesome/free-regular-svg-icons';
import "../../../assets/css/productdetail.css";
import "../../../assets/css/review.css";

const ProductDetail = () => {
    const {id: productId} = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState('');

    // --- STATE CHO REVIEW (GIỮ NGUYÊN) ---
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [reviewStats, setReviewStats] = useState({1: 0, 2: 0, 3: 0, 4: 0, 5: 0});
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewEligibilityMessage, setReviewEligibilityMessage] = useState('');
    const [eligibleOrderItems, setEligibleOrderItems] = useState([]);
    const [selectedOrderItemId, setSelectedOrderItemId] = useState('');
    const [isLoadingEligibility, setIsLoadingEligibility] = useState(false);

    const token = localStorage.getItem("authToken");

    // --- HÀM GỌI API (GIỮ NGUYÊN) ---
    const fetchProductDetailCallback = useCallback(async () => {
        // ... (code giữ nguyên)
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${productId}`);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({message: "Lỗi không xác định khi lấy chi tiết sản phẩm"}));
                throw new Error(errorData.message || "Lỗi khi lấy dữ liệu chi tiết sản phẩm");
            }
            const data = await res.json();
            setProduct(data);
            if (data.images) {
                const imagesArray = data.images.split(',');
                if (imagesArray.length > 0) setMainImage(imagesArray[0].trim());
            }
        } catch (err) {
            console.error("Lỗi fetch product detail:", err.message);
        }
    }, [productId]);

    const fetchProductReviewsCallback = useCallback(async () => {
        // ... (code giữ nguyên)
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${productId}/reviews`);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({message: "Lỗi không xác định khi lấy đánh giá"}));
                throw new Error(errorData.message || "Lỗi khi lấy đánh giá sản phẩm");
            }
            const data = await res.json();
            setReviews(data.reviews || []);
            setAverageRating(data.averageRating || 0);
            setTotalReviews(data.totalReviews || 0);
            calculateReviewStats(data.reviews || []);
        } catch (err) {
            console.error("Lỗi fetch product reviews:", err.message);
        }
    }, [productId]);

    const fetchEligibleOrderItemsForReviewCallback = useCallback(async (showAlerts = false) => {
        // ... (code giữ nguyên)
        if (!token || !productId) {
            const msg = !token ? "Vui lòng đăng nhập." : "Thiếu thông tin sản phẩm.";
            if (showAlerts && !token) alert(msg);
            setReviewEligibilityMessage(msg);
            return {success: false, message: msg};
        }
        setIsLoadingEligibility(true);
        setReviewEligibilityMessage('');
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/products/eligible-for-review/${productId}`, {
                headers: {"Authorization": `Bearer ${token}`}
            });
            const data = await res.json();

            if (!res.ok) {
                const message = data.message || `Lỗi ${res.status}: Không thể kiểm tra quyền đánh giá.`;
                if (showAlerts) alert(message);
                setReviewEligibilityMessage(message);
                setEligibleOrderItems([]);
                return {success: false, message: message};
            }

            if (data.eligibleItems && data.eligibleItems.length > 0) {
                setEligibleOrderItems(data.eligibleItems);
                setSelectedOrderItemId(data.eligibleItems[0].id);
                return {success: true, items: data.eligibleItems, message: data.message};
            } else {
                const message = data.message || "Bạn không có mục nào đủ điều kiện để đánh giá cho sản phẩm này.";
                // if (showAlerts) alert(message); // Bỏ alert ở đây để message tự hiển thị
                setReviewEligibilityMessage(message);
                setEligibleOrderItems([]);
                return {success: false, message: message};
            }
        } catch (err) {
            console.error("Lỗi khi gọi API kiểm tra mục đơn hàng có thể đánh giá:", err);
            const message = "Lỗi kết nối khi kiểm tra quyền đánh giá. Vui lòng thử lại.";
            if (showAlerts) alert(message);
            setReviewEligibilityMessage(message);
            setEligibleOrderItems([]);
            return {success: false, message: message};
        } finally {
            setIsLoadingEligibility(false);
        }
    }, [token, productId]);

    useEffect(() => {
        fetchProductDetailCallback();
        fetchProductReviewsCallback();
    }, [fetchProductDetailCallback, fetchProductReviewsCallback]);

    const calculateReviewStats = (currentReviews) => {
        // ... (code giữ nguyên)
        const stats = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        if (currentReviews && currentReviews.length > 0) {
            currentReviews.forEach(review => {
                if (review.rating >= 1 && review.rating <= 5) {
                    stats[review.rating] = (stats[review.rating] || 0) + 1;
                }
            });
        }
        setReviewStats(stats);
    };
    const handleAddToCart = useCallback(async () => {
        // ... (code giữ nguyên)
        if (!product) return;
        try {
            // const token = localStorage.getItem("authToken"); // Đã có ở trên
            const res = await fetch(`${Constanst.DOMAIN_API}/api/cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: quantity,
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            alert("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    }, [product, quantity, token]);

    const handleQuantityChange = (action) => {
        // ... (code giữ nguyên)
        if (action === "increase" && quantity < (product?.quantity || 10)) { // Giới hạn số lượng mua là 10 hoặc product.quantity
            setQuantity(prevQuantity => prevQuantity + 1);
        } else if (action === "decrease" && quantity > 1) { // Số lượng tối thiểu là 1
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    const handleWriteReviewClick = async () => {
        // ... (code giữ nguyên)
        if (!token) {
            alert("Vui lòng đăng nhập để viết đánh giá.");
            return;
        }
        const eligibilityResult = await fetchEligibleOrderItemsForReviewCallback(false);

        if (eligibilityResult.success && eligibilityResult.items && eligibilityResult.items.length > 0) {
            setShowReviewForm(true);
            setReviewEligibilityMessage('');
        } else {
            setShowReviewForm(false);
        }
    };

    const handleRatingChange = (rate) => {
        setUserRating(rate);
    };

    const handleSubmitReview = async (e) => {
        // ... (code giữ nguyên)
        e.preventDefault();
        if (!token) {
            alert("Vui lòng đăng nhập.");
            return;
        }
        if (userRating === 0) {
            alert("Vui lòng chọn số sao đánh giá.");
            return;
        }
        if (!selectedOrderItemId) {
            alert("Lỗi: Không xác định được mục đơn hàng để đánh giá. Vui lòng thử làm mới trang.");
            return;
        }
        setIsSubmittingReview(true);
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${productId}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: userRating,
                    comment: userComment,
                    order_item_id: selectedOrderItemId
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || "Gửi đánh giá thành công!");
                setShowReviewForm(false);
                setUserRating(0);
                setUserComment("");
                fetchProductReviewsCallback();
                const updatedEligibleItems = eligibleOrderItems.filter(item => item.id !== selectedOrderItemId);
                setEligibleOrderItems(updatedEligibleItems);
                if (updatedEligibleItems.length > 0) {
                    setSelectedOrderItemId(updatedEligibleItems[0].id);
                } else {
                    setSelectedOrderItemId('');
                    setReviewEligibilityMessage("Bạn đã đánh giá tất cả các mục hợp lệ cho sản phẩm này.");
                }
            } else {
                alert(data.message || "Có lỗi xảy ra khi gửi đánh giá.");
            }
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            alert("Có lỗi kết nối khi gửi đánh giá.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (!product) return <div className="text-center">Đang tải...</div>;
    const productImages = product.images ? product.images.split(',').map(img => img.trim()) : [];

    // Sử dụng thông tin từ product nếu có, hoặc giữ placeholder
    const publisherName = product.publisher?.name || product.supplier || 'Fahasa'; // Ví dụ
    const authorName = product.author || 'Nhiều tác giả';

    const renderStars = (rating) => {
        // ... (code giữ nguyên)
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FontAwesomeIcon key={i} icon={i <= rating ? faStarSolid : faStarRegular} className="star-icon"/>
            );
        }
        return stars;
    };

    // --- JSX ---
    return (
        <div className="product-detail-container container">
            {/* Product Info Section */}
            <div className="row product-info-wrapper">
                <div className="col-md-5 mb-4">
                    <div className="product-image-gallery">
                        <img
                            src={mainImage ? `${Constanst.DOMAIN_API}/uploads/${mainImage}` : "/images/default-book.jpg"}
                            alt={product.name}
                            className="img-fluid main-product-image"
                        />
                        {productImages.length > 1 && (
                            <div className="thumbnail-container">
                                {productImages.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail-item ${mainImage === img ? 'active' : ''}`}
                                        onClick={() => setMainImage(img)}
                                    >
                                        <img src={`${Constanst.DOMAIN_API}/uploads/${img}`} alt={`Thumbnail ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-md-7">
                    <div className="product-main-details">
                        {/* GIỮ NGUYÊN GIAO DIỆN BAN ĐẦU CHO PHẦN NÀY */}
                        <p className="product-meta">Nhà cung cấp: <strong>{product.supplier || publisherName}</strong>
                        </p>
                        <p className="product-meta">Nhà xuất bản: <strong>{publisherName}</strong></p>
                        <p className="product-meta">Tác giả: <strong>{authorName}</strong></p>
                        <h1 className="mb-2 product-title-custom">{product.name}</h1> {/* Thêm class để custom nếu cần */}

                        <div className="product-price-section">
                            <span className="current-price">
                                {product.price ? product.price.toLocaleString() : 'N/A'} VNĐ
                            </span>
                            {product.discount_price && product.discount_price < product.price && (
                                <>
                                    <span className="original-price">
                                        {product.price.toLocaleString()} VNĐ
                                    </span>
                                    <span className="discount-tag">
                                        -{(((product.price - product.discount_price) / product.price) * 100).toFixed(0)}%
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="quantity-control mb-4">
                            <button className="quantity-btn" onClick={() => handleQuantityChange("decrease")}>
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <span className="quantity-display">{quantity}</span>
                            <button className="quantity-btn" onClick={() => handleQuantityChange("increase")}>
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>

                        <button className="add-to-cart-btn mb-2" onClick={handleAddToCart}>
                            <FontAwesomeIcon icon={faShoppingCart} className="me-2" /> Thêm vào giỏ hàng
                        </button>
                        <button className="buy-now-btn">Mua ngay</button>
                    </div>
                </div>
            </div>

            {/* Delivery & Promotion Section - GIỮ NGUYÊN GIAO DIỆN BAN ĐẦU */}
            <div className="delivery-promo-section">
                <h5>Thông tin vận chuyển & Ưu đãi</h5>
                <div className="row">
                    <div className="col-md-6">
                        <div className="delivery-item">
                            <FontAwesomeIcon icon={faTruck} />
                            <span>Giao hàng đến: <strong>{product.user_address || "Địa chỉ mặc định, Quận 1, TP.HCM"}</strong> <a
                                href="#" className="delivery-link">Thay đổi</a></span>
                        </div>
                        <div className="delivery-item">
                            <FontAwesomeIcon icon={faTruck} />
                            <span>Giao hàng tiêu chuẩn: Dự kiến giao <strong>Thứ Sáu - 23/05</strong> (Ví dụ)</span>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="promo-item">
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                            <span>Ưu đãi liên quan: <a href="#" className="delivery-link">Xem thêm</a></span>
                        </div>
                        <div className="promo-item">
                            <FontAwesomeIcon icon={faShieldAlt} />
                            <span>Chính sách đổi trả: <strong>Đổi trả miễn phí toàn quốc trong 30 ngày</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Details Table Section - GIỮ NGUYÊN GIAO DIỆN BAN ĐẦU */}
            <div className="product-details-table-section">
                <h5>Thông tin chi tiết</h5>
                <table className="product-details-table">
                    <tbody>
                    <tr>
                        <td>Mã hàng</td>
                        <td>{product.product_code || product.id || 'Đang cập nhật'}</td>
                    </tr>
                    <tr>
                        <td>Nhà cung cấp</td>
                        <td>{product.supplier || publisherName}</td>
                    </tr>
                    <tr>
                        <td>Tác giả</td>
                        <td>{authorName}</td>
                    </tr>
                    <tr>
                        <td>NXB</td>
                        <td>{publisherName}</td>
                    </tr>
                    <tr>
                        <td>Trọng lượng (gr)</td>
                        <td>{product.weight_g || '300'}</td>
                    </tr>
                    <tr>
                        <td>Kích thước bao bì</td>
                        <td>{product.dimensions || '20 x 14 x 2 cm'}</td>
                    </tr>
                    <tr>
                        <td>Số trang</td>
                        <td>{product.pages || '250'}</td>
                    </tr>
                    <tr>
                        <td>Hình thức</td>
                        <td>{product.format || 'Bìa mềm'}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            {/* Product Description Section - GIỮ NGUYÊN */}
            <div className="product-description-section">
                <h5>Mô tả sản phẩm</h5>
                <div className="product-description-content"
                     dangerouslySetInnerHTML={{__html: product.description || 'Hiện chưa có mô tả cho sản phẩm này.'}}></div>
            </div>


            {/* Product Review Section - PHẦN NÀY ĐÃ HOẠT ĐỘNG, GIỮ NGUYÊN */}
            <div className="product-review-section">
                <h5>Đánh giá sản phẩm ({totalReviews} đánh giá)</h5>
                {totalReviews > 0 && (
                    <div className="review-summary">
                        <div className="average-rating-display">
                            <div className="rating-score">{averageRating.toFixed(1)}/5</div>
                            <div className="star-rating">{renderStars(averageRating)}</div>
                        </div>
                        <div className="review-breakdown">
                            {[5, 4, 3, 2, 1].map(star => (
                                <div className="review-row" key={star}>
                                    <span className="stars">{star} sao</span>
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar"
                                            style={{width: totalReviews > 0 && reviewStats[star] > 0 ? `${(reviewStats[star] / totalReviews) * 100}%` : '0%'}}
                                        ></div>
                                    </div>
                                    <span className="percentage">
                                        {totalReviews > 0 && reviewStats[star] > 0 ? ((reviewStats[star] / totalReviews) * 100).toFixed(0) : 0}%
                                        ({reviewStats[star] || 0})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!showReviewForm && (
                    <>
                        {token && (
                            <button
                                className="view-reviews-btn"
                                onClick={handleWriteReviewClick}
                                disabled={isLoadingEligibility}
                            >
                                {isLoadingEligibility ? "Đang kiểm tra..." : "Viết đánh giá"}
                            </button>
                        )}
                        {reviewEligibilityMessage && !isLoadingEligibility && (
                            <p className="info-text error-text"
                               style={{color: eligibleOrderItems.length > 0 ? 'initial' : 'red'}}>
                                {reviewEligibilityMessage}
                            </p>
                        )}
                        {!token && (
                            <p className="info-text">Vui lòng <a href="/login">đăng nhập</a> để viết đánh giá.</p>
                        )}
                    </>
                )}

                {showReviewForm && eligibleOrderItems.length > 0 && (
                    <form onSubmit={handleSubmitReview} className="review-form">
                        <h5>Viết đánh giá của bạn</h5>
                        {eligibleOrderItems.length > 1 && (
                            <div className="form-group">
                                <label htmlFor="orderItemSelect">Đánh giá cho mục trong đơn hàng:</label>
                                <select
                                    id="orderItemSelect"
                                    className="form-control"
                                    value={selectedOrderItemId}
                                    onChange={(e) => setSelectedOrderItemId(e.target.value)}
                                >
                                    {eligibleOrderItems.map(item => (
                                        <option key={item.id} value={item.id}>
                                            Đơn hàng #{item.order_id} - Ngày
                                            mua: {new Date(item.order_date).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {eligibleOrderItems.length === 1 && selectedOrderItemId && (
                            <p className="info-text">
                                Đánh giá cho sản phẩm bạn đã mua (Đơn hàng
                                #{eligibleOrderItems.find(it => it.id === selectedOrderItemId)?.order_id}
                                ,
                                ngày {new Date(eligibleOrderItems.find(it => it.id === selectedOrderItemId)?.order_date).toLocaleDateString()}).
                            </p>
                        )}
                        <div className="form-group">
                            <label>Đánh giá của bạn:</label>
                            <div className="star-rating-input">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FontAwesomeIcon
                                        key={star}
                                        icon={star <= userRating ? faStarSolid : faStarRegular}
                                        className={`star-icon interactive ${star <= userRating ? 'selected' : ''}`}
                                        onClick={() => handleRatingChange(star)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="userComment">Bình luận của bạn (tùy chọn):</label>
                            <textarea
                                id="userComment"
                                className="form-control"
                                rows="4"
                                value={userComment}
                                onChange={(e) => setUserComment(e.target.value)}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isSubmittingReview}>
                            {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                        <button type="button" className="btn btn-secondary ms-2" onClick={() => {
                            setShowReviewForm(false);
                            setReviewEligibilityMessage('');
                        }}>
                            Hủy
                        </button>
                    </form>
                )}

                <div className="reviews-list">
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review.id} className="review-item">
                                <div className="review-author">
                                    <img
                                        src={review.user?.avatar ? `${Constanst.DOMAIN_API}/uploads/${review.user.avatar}` : "/images/default-avatar.png"}
                                        alt={review.user?.name || "User"}
                                        className="reviewer-avatar"
                                    />
                                    <strong>{review.user?.name || "Người dùng ẩn danh"}</strong>
                                    <span
                                        className="review-date"> - {new Date(review.review_date || review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="star-rating">{renderStars(review.rating)}</div>
                                {review.comment && <p className="review-comment">{review.comment}</p>}
                            </div>
                        ))
                    ) : (
                        !showReviewForm && <p className="info-text">Chưa có đánh giá nào cho sản phẩm này.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;