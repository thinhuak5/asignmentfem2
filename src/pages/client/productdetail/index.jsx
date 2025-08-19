// src/pages/client/products/ProductDetail.jsx
import React, {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Constants from "../../../Constanst";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faMinus,
    faPlus,
    faShieldAlt,
    faShoppingCart,
    faStar as faStarSolid,
    faTruck,
} from "@fortawesome/free-solid-svg-icons";
import {faStar as faStarRegular} from "@fortawesome/free-regular-svg-icons";

import "../../../assets/css/product-detail-new.css";

const ProductDetail = () => {
    const {id: productId} = useParams();
    const token = localStorage.getItem("authToken");

    // --- State ---
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState("");
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [productVariations, setProductVariations] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [reviewStats, setReviewStats] = useState({1: 0, 2: 0, 3: 0, 4: 0, 5: 0});
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewEligibilityMessage, setReviewEligibilityMessage] = useState("");
    const [eligibleOrderItems, setEligibleOrderItems] = useState([]);
    const [selectedOrderItemId, setSelectedOrderItemId] = useState("");
    const [isLoadingEligibility, setIsLoadingEligibility] = useState(false);
    const [reviewImages, setReviewImages] = useState([]);
    const [editingReview, setEditingReview] = useState(null);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    // --- Current user ---
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    setCurrentUser({id: payload.id, name: payload.name});
                } catch (e) {
                    console.error("Invalid token", e);
                    localStorage.removeItem("authToken");
                }
            }
        };
        fetchUser();
    }, [token]);

    // --- Fetch product ---
    const fetchProductDetail = useCallback(async () => {
        try {
            const res = await fetch(`${Constants.DOMAIN_API}/api/products/${productId}`);
            if (!res.ok) throw new Error(`Failed to fetch product details: ${res.statusText}`);
            const data = await res.json();
            setProduct(data);

            // Map biến thể (kèm specs cho từng biến thể)
            const variants = (data.variations || []).map((v) => ({
                id: v.id,
                name: v.name || v.value,
                price: v.price,
                quantity: Number(v.quantity) || 0,
                images: (v.productImages || []).map((img) => img.image_url),
                specs: (v.specs || []).map((s) => ({
                    id: s.id,
                    label: s.label,
                    value: s.value,
                    sort_order: s.sort_order ?? 0,
                })),
            }));

            // ✅ luôn có ít nhất 1 phần tử để hiển thị selector
            if (variants.length > 0) {
                setProductVariations(variants);
                const firstInStock = variants.find((v) => (Number(v.quantity) || 0) > 0);
                const def = firstInStock || variants[0];
                setSelectedVariant(def);
                setMainImage(def.images[0] || "");
            } else {
                // Fallback khi không có biến thể từ API
                const fallback = {
                    id: data.id,
                    name: data.name,
                    price: data.price,
                    quantity: Number(data.quantity) || 0,
                    images: (data.productImages || []).map((img) => img.image_url),
                    specs: [],
                };
                setProductVariations([fallback]); // ✅ để vẫn render selector
                setSelectedVariant(fallback);
                setMainImage(fallback.images[0] || "");
            }
        } catch (error) {
            console.error(error);
        }
    }, [productId]);

    // --- Reviews ---
    const fetchProductReviews = useCallback(async () => {
        if (!selectedVariant?.id) return;
        try {
            const res = await fetch(
                `${Constants.DOMAIN_API}/api/variationId/${selectedVariant.id}/reviews`
            );
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({message: "Unknown error"}));
                throw new Error(errorData.message || "Error fetching product reviews");
            }
            const data = await res.json();
            setReviews(data.reviews || []);
            setAverageRating(data.averageRating || 0);
            setTotalReviews(data.totalReviews || 0);
            calculateReviewStats(data.reviews || []);
        } catch {
            /* ignore */
        }
    }, [selectedVariant]);

    // ✅ FIX CHÍNH: gọi đúng endpoint & mapping đúng field trả về
    const fetchEligibleOrderItemsForReview = useCallback(
        async (showAlerts = false) => {
            if (!token) {
                const msg = "Vui lòng đăng nhập.";
                if (showAlerts) alert(msg);
                setReviewEligibilityMessage(msg);
                return {success: false, message: msg};
            }
            if (!selectedVariant?.id) {
                const msg = "Thiếu ID biến thể sản phẩm.";
                if (showAlerts) alert(msg);
                setReviewEligibilityMessage(msg);
                return {success: false, message: msg};
            }
            setIsLoadingEligibility(true);
            setReviewEligibilityMessage("");
            try {
                // 🚩 productId phải nằm ở path; variationId đi qua query
                const url = `${Constants.DOMAIN_API}/api/products/eligible-for-review/${productId}?variationId=${selectedVariant.id}`;
                const res = await fetch(url, {headers: {Authorization: `Bearer ${token}`}});
                const data = await res.json();
                if (!res.ok) {
                    const message =
                        data.message || `Lỗi ${res.status}: Không thể kiểm tra điều kiện đánh giá.`;
                    if (showAlerts) alert(message);
                    setReviewEligibilityMessage(message);
                    setEligibleOrderItems([]);
                    return {success: false, message};
                }
                const items = Array.isArray(data.eligibleItems) ? data.eligibleItems : [];
                if (items.length > 0) {
                    setEligibleOrderItems(items);
                    // BE trả về order_item_id, không phải id
                    setSelectedOrderItemId(items[0].order_item_id);
                    return {success: true, items, message: data.message};
                } else {
                    const message =
                        data.message || "Bạn không có mục nào đủ điều kiện để đánh giá sản phẩm này.";
                    setReviewEligibilityMessage(message);
                    setEligibleOrderItems([]);
                    return {success: false, message};
                }
            } catch {
                const message = "Lỗi kết nối khi kiểm tra điều kiện đánh giá. Vui lòng thử lại.";
                if (showAlerts) alert(message);
                setReviewEligibilityMessage(message);
                setEligibleOrderItems([]);
                return {success: false, message};
            } finally {
                setIsLoadingEligibility(false);
            }
        },
        [token, selectedVariant, productId]
    );

    useEffect(() => {
        fetchProductDetail();
    }, [productId, fetchProductDetail]);

    useEffect(() => {
        if (selectedVariant) fetchProductReviews();
    }, [selectedVariant, fetchProductReviews]);

    // --- Helpers ---
    const calculateReviewStats = (currentReviews) => {
        const stats = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        currentReviews.forEach((review) => {
            if (review.rating >= 1 && review.rating <= 5) stats[review.rating]++;
        });
        setReviewStats(stats);
    };

    const renderStars = (rating, onClick = null) =>
        Array.from({length: 5}, (_, i) => (
            <FontAwesomeIcon
                key={i}
                icon={i < rating ? faStarSolid : faStarRegular}
                className={`star-icon ${onClick ? "interactive" : ""} ${i < rating ? "selected" : ""}`}
                onClick={onClick ? () => onClick(i + 1) : undefined}
            />
        ));

    const formatVND = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return "— đ";
        return new Intl.NumberFormat("vi-VN", {maximumFractionDigits: 0}).format(n) + "đ";
    };

    // Lấy value từ specs theo nhãn (ưu tiên theo danh sách alias)
    const getSpecValue = (labels = []) => {
        const pool = selectedVariant?.specs || [];
        const norm = (s) => (s || "").trim().toLowerCase();
        const target = pool.find((sp) => labels.map(norm).includes(norm(sp.label)));
        return target?.value?.trim() || "";
    };

    // Tác giả & NXB từ bảng thông tin của biến thể (không dùng dữ liệu chung)
    const authorFromSpecs = getSpecValue(["Tác giả", "Tac gia", "Author"]);
    const publisherFromSpecs = getSpecValue(["NXB", "Nhà xuất bản", "Nha xuat ban", "Publisher"]);

    // Biến thể hết hàng?
    const isOutOfStock = !selectedVariant || (Number(selectedVariant.quantity) || 0) <= 0;

    // Chỉ dùng thông tin biến thể
    const variantSpecs = (selectedVariant?.specs || [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    // --- Events ---
    const handleAddToCart = useCallback(async () => {
        if (!product) return alert("Dữ liệu sản phẩm chưa được tải.");
        if (!selectedVariant)
            return alert("Vui lòng chọn một phiên bản sản phẩm trước khi thêm vào giỏ hàng.");
        if ((Number(selectedVariant.quantity) || 0) <= 0) {
            return alert("Biến thể đang hết hàng.");
        }
        const dataToSend = {product_id: product.id, quantity};
        if (selectedVariant.id !== product.id) dataToSend.variation_id = selectedVariant.id;
        try {
            const res = await fetch(`${Constants.DOMAIN_API}/api/cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            });
            const data = await res.json();
            alert(data.message);
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Đã xảy ra lỗi. Vui lòng thử lại.");
        }
    }, [selectedVariant, quantity, token, product]);

    const handleQuantityChange = (action) => {
        const currentAvailableQuantity = selectedVariant?.quantity ?? 10; // chỉ lấy theo biến thể
        if ((Number(selectedVariant?.quantity) || 0) <= 0) return; // hết hàng thì không thay đổi
        setQuantity((prev) =>
            action === "increase" ? (prev < currentAvailableQuantity ? prev + 1 : prev) : prev > 1 ? prev - 1 : prev
        );
    };

    const handleWriteReviewClick = async () => {
        if (!token) return alert("Vui lòng đăng nhập để viết đánh giá.");
        const eligibilityResult = await fetchEligibleOrderItemsForReview(true);
        setShowReviewForm(eligibilityResult.success && eligibilityResult.items?.length > 0);
    };

    const handleReviewImageChange = (e) => {
        if (e.target.files) setReviewImages(Array.from(e.target.files));
    };

    const handleEditClick = (review) => {
        setEditingReview(review);
        setUserRating(review.rating);
        setUserComment(review.comment);
        setReviewImages([]);
        setImagesToDelete([]);
        window.scrollTo({
            top: document.querySelector(".product-review-section").offsetTop,
            behavior: "smooth",
        });
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) return;
        try {
            const res = await fetch(`${Constants.DOMAIN_API}/api/reviews/${reviewId}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });
            const data = await res.json();
            alert(data.message || "Xóa thành công!");
            if (res.ok) {
                fetchProductReviews();
                fetchEligibleOrderItemsForReview();
            }
        } catch (error) {
            console.error("Error deleting review:", error);
            alert("Lỗi kết nối khi xóa đánh giá.");
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!token) return alert("Vui lòng đăng nhập.");
        if (userRating === 0) return alert("Vui lòng chọn số sao đánh giá.");
        if (!selectedOrderItemId) return alert("Lỗi: Không xác định được mục đơn hàng để đánh giá.");
        if (!selectedVariant?.id) return alert("Lỗi: Không xác định được biến thể sản phẩm.");
        setIsSubmittingReview(true);
        const formData = new FormData();
        formData.append("rating", userRating);
        formData.append("comment", userComment);
        formData.append("order_item_id", selectedOrderItemId);
        formData.append("variation_id", selectedVariant.id);
        reviewImages.forEach((file) => formData.append("images", file));
        try {
            const res = await fetch(
                `${Constants.DOMAIN_API}/api/variationId/${selectedVariant.id}/reviews`,
                {method: "POST", headers: {Authorization: `Bearer ${token}`}, body: formData}
            );
            const data = await res.json();
            alert(data.message || (res.ok ? "Đánh giá đã được gửi thành công!" : "Lỗi!"));
            if (res.ok) {
                setShowReviewForm(false);
                setUserRating(0);
                setUserComment("");
                setReviewImages([]);
                fetchProductReviews();
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Lỗi kết nối khi gửi đánh giá.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        if (!editingReview) return;
        setIsSubmittingReview(true);
        const formData = new FormData();
        formData.append("rating", userRating);
        formData.append("comment", userComment);
        formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
        reviewImages.forEach((file) => formData.append("images", file));
        try {
            const res = await fetch(`${Constants.DOMAIN_API}/api/reviews/${editingReview.id}`, {
                method: "PUT",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });
            const data = await res.json();
            alert(data.message || "Cập nhật thành công!");
            if (res.ok) {
                setEditingReview(null);
                setUserRating(0);
                setUserComment("");
                setReviewImages([]);
                setImagesToDelete([]);
                fetchProductReviews();
            }
        } catch (error) {
            console.error("Error updating review:", error);
            alert("Lỗi kết nối khi cập nhật.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (!product) return <div className="loading-container">Đang tải chi tiết sản phẩm...</div>;

    return (
        <div className="product-detail-page">
            <div className="container">
                {/* Primary Info Section */}
                <section className="product-primary-section">
                    <div className="row">
                        <div className="col-lg-5">
                            <div className="product-gallery">
                                <div className="main-image-container">
                                    <img src={mainImage || "/images/default-book.jpg"} alt={product.name}
                                         className="main-image"/>
                                </div>
                                {selectedVariant?.images?.length > 1 && (
                                    <div className="thumbnail-list">
                                        {selectedVariant.images.slice(0, 4).map((imgUrl, idx) => (
                                            <div
                                                key={idx}
                                                className={`thumbnail-item ${mainImage === imgUrl ? "active" : ""}`}
                                                onClick={() => setMainImage(imgUrl)}
                                            >
                                                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`}/>
                                            </div>
                                        ))}
                                        {selectedVariant.images.length > 4 && (
                                            <div
                                                className="thumbnail-item more-thumbnails">+{selectedVariant.images.length - 4}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="product-details">
                                <h1 className="product-title">{product.name}</h1>

                                {(authorFromSpecs || publisherFromSpecs) && (
                                    <div className="product-meta">
                                        {authorFromSpecs && (
                                            <span>
                        Tác giả: <a href="#">{authorFromSpecs}</a>
                      </span>
                                        )}
                                        {authorFromSpecs && publisherFromSpecs && <span className="separator">|</span>}
                                        {publisherFromSpecs && (
                                            <span>
                        NXB: <a href="#">{publisherFromSpecs}</a>
                      </span>
                                        )}
                                    </div>
                                )}

                                <div className="product-short-review">
                                    <span className="rating-value">{averageRating.toFixed(1)}</span>
                                    {renderStars(averageRating)}
                                    <span className="separator">|</span>
                                    <span className="review-count">{totalReviews} Đánh giá</span>
                                </div>

                                {/* ✅ Hiện selector kể cả khi chỉ có 1 biến thể */}
                                {productVariations.length >= 1 && (
                                    <div className="variant-selector">
                                        <h6 className="selector-title">Phiên bản:</h6>
                                        <div className="variant-options">
                                            {productVariations.map((v) => {
                                                const out = (Number(v.quantity) || 0) <= 0;
                                                return (
                                                    <button
                                                        key={v.id}
                                                        className={`variant-btn ${selectedVariant?.id === v.id ? "active" : ""} ${out ? "oos" : ""}`}
                                                        onClick={() => {
                                                            setSelectedVariant(v);
                                                            setMainImage(v.images[0] || "");
                                                            setQuantity(1);
                                                        }}
                                                        title={out ? "Hết hàng" : `Còn ${v.quantity}`}
                                                    >
                                                        {v.name}
                                                        <span className={`variant-stock ${out ? "out" : "in"}`}>
                              {out ? " (Hết hàng)" : ` (Còn ${v.quantity})`}
                            </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="price-box">
                                    <span
                                        className="current-price">{formatVND(selectedVariant?.price ?? product.price)}</span>
                                </div>

                                <div className="quantity-selector">
                                    <h6 className="selector-title">Số lượng:</h6>
                                    <div className={`quantity-input ${isOutOfStock ? "disabled" : ""}`}>
                                        <button onClick={() => handleQuantityChange("decrease")}
                                                disabled={isOutOfStock}>
                                            <FontAwesomeIcon icon={faMinus}/>
                                        </button>
                                        <input type="text" value={quantity} readOnly/>
                                        <button onClick={() => handleQuantityChange("increase")}
                                                disabled={isOutOfStock}>
                                            <FontAwesomeIcon icon={faPlus}/>
                                        </button>
                                    </div>
                                </div>

                                <div className="action-buttons">
                                    {!isOutOfStock ? (
                                        <>
                                            <button className="btn-add-to-cart" onClick={handleAddToCart}>
                                                <FontAwesomeIcon icon={faShoppingCart}/> Thêm vào giỏ hàng
                                            </button>
                                            <button className="btn-buy-now">Mua ngay</button>
                                        </>
                                    ) : (
                                        <div className="oos-banner">Hết hàng</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ONLY Variant Details & Description */}
                <section className="product-info-section">
                    <div className="row">
                        <div className="col-lg-8">
                            {/* THÔNG TIN CHI TIẾT (CHỈ THEO BIẾN THỂ) */}
                            <div className="info-block">
                                <h3 className="block-title">Thông tin chi tiết</h3>
                                {variantSpecs.length ? (
                                    <table className="details-table">
                                        <tbody>
                                        {variantSpecs.map((s) => (
                                            <tr key={s.id || `${s.label}-${s.value}`}>
                                                <td>{s.label}</td>
                                                <td>{s.value}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="details-empty">Biến thể này chưa có thông tin chi tiết.</div>
                                )}
                            </div>

                            {/* MÔ TẢ (vẫn dùng mô tả chung nếu bạn chưa lưu mô tả theo biến thể) */}
                            <div className="info-block">
                                <h3 className="block-title">Mô tả sản phẩm</h3>
                                <div
                                    className="description-content"
                                    dangerouslySetInnerHTML={{
                                        __html: product.description || "Chưa có mô tả cho sản phẩm này.",
                                    }}
                                />
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="policy-block">
                                <h3 className="block-title">Chính sách & Vận chuyển</h3>
                                <div className="policy-item">
                                    <FontAwesomeIcon icon={faTruck} className="policy-icon"/>
                                    <div>
                                        <h6>Giao hàng toàn quốc</h6>
                                        <p>Hỗ trợ giao hàng nhanh chóng trên 63 tỉnh thành.</p>
                                    </div>
                                </div>
                                <div className="policy-item">
                                    <FontAwesomeIcon icon={faShieldAlt} className="policy-icon"/>
                                    <div>
                                        <h6>Đổi trả trong 30 ngày</h6>
                                        <p>Miễn phí đổi trả nếu sản phẩm bị lỗi hoặc không đúng mô tả.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Review Section */}
                <section className="product-review-section" id="reviews">
                    <h3 className="block-title">Đánh giá sản phẩm</h3>
                    <div className="review-summary-container">
                        <div className="average-display">
                            <div className="score">
                                {averageRating.toFixed(1)} <span className="score-base">/ 5</span>
                            </div>
                            <div className="stars">{renderStars(averageRating)}</div>
                            <div className="total-count">({totalReviews} đánh giá)</div>
                        </div>

                        <div className="breakdown-display">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div className="breakdown-row" key={star}>
                                    <div className="star-label">
                                        {star} <FontAwesomeIcon icon={faStarSolid}/>
                                    </div>
                                    <div className="progress-container">
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width: totalReviews > 0 ? `${(reviewStats[star] / totalReviews) * 100}%` : "0%",
                                            }}
                                        />
                                    </div>
                                    <div className="review-count-per-star">{reviewStats[star] || 0}</div>
                                </div>
                            ))}
                        </div>

                        <div className="write-review-cta">
                            {!showReviewForm && !editingReview && (
                                <>
                                    <p>Bạn đã dùng sản phẩm này?</p>
                                    <button onClick={handleWriteReviewClick} disabled={isLoadingEligibility}>
                                        {isLoadingEligibility ? "Đang kiểm tra..." : "Gửi đánh giá của bạn"}
                                    </button>
                                    {reviewEligibilityMessage && !isLoadingEligibility && (
                                        <p className="eligibility-message">{reviewEligibilityMessage}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {(showReviewForm || editingReview) && (
                        <form onSubmit={editingReview ? handleUpdateReview : handleSubmitReview}
                              className="review-form">
                            <h4 className="review-form-title">{editingReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá của bạn"}</h4>
                            {!editingReview && eligibleOrderItems.length > 1 && (
                                <div className="form-group">
                                    <label htmlFor="orderItemSelect">Đánh giá cho mục đơn hàng:</label>
                                    <select
                                        id="orderItemSelect"
                                        className="form-control"
                                        value={selectedOrderItemId}
                                        onChange={(e) => setSelectedOrderItemId(e.target.value)}
                                    >
                                        {eligibleOrderItems.map((item) => (
                                            <option key={item.order_item_id} value={item.order_item_id}>
                                                Đơn hàng #{item.order_id}
                                                {item.order_date ? ` - Ngày mua: ${new Date(item.order_date).toLocaleDateString()}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label>Chất lượng sản phẩm:</label>
                                <div className="star-rating-input">{renderStars(userRating, setUserRating)}</div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="userComment">Bình luận:</label>
                                <textarea
                                    id="userComment"
                                    className="form-control"
                                    rows="4"
                                    value={userComment}
                                    onChange={(e) => setUserComment(e.target.value)}
                                    placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Hình ảnh đính kèm (tùy chọn):</label>
                                {editingReview?.images?.length > 0 && (
                                    <div className="current-images-preview mb-2">
                                        {editingReview.images
                                            .filter((img) => !imagesToDelete.includes(img.id))
                                            .map((img) => (
                                                <div key={img.id} className="image-preview-item">
                                                    <img src={img.image_url} alt="Ảnh đánh giá cũ"/>
                                                    <button
                                                        type="button"
                                                        className="delete-image-btn"
                                                        onClick={() => setImagesToDelete((prev) => [...prev, img.id])}
                                                        title="Xóa ảnh này"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                )}
                                <input type="file" multiple accept="image/*" className="form-control"
                                       onChange={handleReviewImageChange}/>
                            </div>
                            <div className="review-form-actions">
                                <button type="submit" className="btn-submit-review" disabled={isSubmittingReview}>
                                    {isSubmittingReview ? "Đang xử lý..." : editingReview ? "Cập nhật" : "Gửi đánh giá"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel-review"
                                    onClick={editingReview ? () => setEditingReview(null) : () => setShowReviewForm(false)}
                                    disabled={isSubmittingReview}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="review-list">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className="review-card">
                                    <div className="review-card-header">
                                        <img
                                            src={review.user?.avatar || "/images/default-avatar.png"}
                                            alt={review.user?.name}
                                            className="reviewer-avatar"
                                        />
                                        <div className="reviewer-info">
                                            <span
                                                className="reviewer-name">{review.user?.name || "Người dùng ẩn danh"}</span>
                                            <span
                                                className="review-date">{new Date(review.review_date || review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {currentUser?.id === review.user_id && !editingReview && (
                                            <div className="review-actions">
                                                <button onClick={() => handleEditClick(review)}>Sửa</button>
                                                <button onClick={() => handleDeleteReview(review.id)}>Xóa</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="review-card-body">
                                        <div className="star-rating">{renderStars(review.rating)}</div>
                                        <p className="review-comment">{review.comment}</p>
                                        {review.images?.length > 0 && (
                                            <div className="review-images">
                                                {review.images.map((image) => (
                                                    <img key={image.id} src={image.image_url}
                                                         alt={`Ảnh đánh giá ${image.id}`}
                                                         className="review-image-item"/>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            !showReviewForm &&
                            !editingReview &&
                            <div className="no-reviews-placeholder">Chưa có đánh giá nào cho sản phẩm này.</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProductDetail;
