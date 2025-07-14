import React, {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router";
import Constanst from "../../../Constanst";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faMinus,
  faMoneyBillWave,
  faPlus,
  faShieldAlt,
  faShoppingCart,
  faStar as faStarSolid,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import {faStar as faStarRegular} from "@fortawesome/free-regular-svg-icons";
import "../../../assets/css/productdetail.css";
import "../../../assets/css/review.css";

const ProductDetail = () => {
  const { id: productId } = useParams();
  const token = localStorage.getItem("authToken"); // Đã sửa lỗi ở đây: localStorage.localStorage -> localStorage

  // --- State Management ---
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [productVariations, setProductVariations] = useState([]);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewStats, setReviewStats] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewEligibilityMessage, setReviewEligibilityMessage] = useState("");
  const [eligibleOrderItems, setEligibleOrderItems] = useState([]);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState("");
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(false);

  // --- API Fetch Functions ---

  const fetchProductDetail = useCallback(async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${productId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Error fetching product details");
      }
      const data = await res.json();
      setProduct(data);

      const images = Array.isArray(data.productImages) && data.productImages.length > 0
        ? data.productImages.map((imgObj) => imgObj.image_url)
        : data.images?.split(",").map((img) => img.trim()) || [];
      setMainImage(images[0] || "");

      // Create a "default" variant representation from the main product data
      const defaultVariant = {
        id: data.id, // This is the main product's ID (product.id)
        name: "Sản phẩm mặc định",
        price: data.price,
        discount_price: data.discount_price,
        quantity: data.quantity,
      };

      const allVariants = data.variations && data.variations.length > 0
        ? [defaultVariant, ...data.variations.map(v => ({ ...v, name: v.name || v.value }))]
        : [defaultVariant];

      setProductVariations(allVariants);
      setSelectedVariant(defaultVariant); // By default, select the main product
    } catch (err) {
      console.error("Error fetching product detail:", err.message);
    }
  }, [productId]);

  const fetchProductReviews = useCallback(async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${productId}/reviews`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Error fetching product reviews");
      }
      const data = await res.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
      calculateReviewStats(data.reviews || []);
    } catch (err) {
      console.error("Error fetching product reviews:", err.message);
    }
  }, [productId]);

  const fetchEligibleOrderItemsForReview = useCallback(
    async (showAlerts = false) => {
      if (!token) {
        const msg = "Vui lòng đăng nhập.";
        if (showAlerts) alert(msg);
        setReviewEligibilityMessage(msg);
        return { success: false, message: msg };
      }
      if (!productId) {
        const msg = "Thiếu thông tin sản phẩm.";
        if (showAlerts) alert(msg);
        setReviewEligibilityMessage(msg);
        return { success: false, message: msg };
      }

      setIsLoadingEligibility(true);
      setReviewEligibilityMessage("");
      try {
        const res = await fetch(`${Constanst.DOMAIN_API}/api/products/eligible-for-review/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          const message = data.message || `Lỗi ${res.status}: Cannot check review eligibility.`;
          if (showAlerts) alert(message);
          setReviewEligibilityMessage(message);
          setEligibleOrderItems([]);
          return { success: false, message: message };
        }

        if (data.eligibleItems?.length > 0) {
          setEligibleOrderItems(data.eligibleItems);
          setSelectedOrderItemId(data.eligibleItems[0].id);
          return { success: true, items: data.eligibleItems, message: data.message };
        } else {
          const message = data.message || "You have no eligible items to review for this product.";
          setReviewEligibilityMessage(message);
          setEligibleOrderItems([]);
          return { success: false, message: message };
        }
      } catch (err) {
        console.error("Error checking eligible order items for review:", err);
        const message = "Connection error checking review eligibility. Please try again.";
        if (showAlerts) alert(message);
        setReviewEligibilityMessage(message);
        setEligibleOrderItems([]);
        return { success: false, message: message };
      } finally {
        setIsLoadingEligibility(false);
      }
    },
    [token, productId]
  );

  // --- Effects ---

  useEffect(() => {
    fetchProductDetail();
    fetchProductReviews();
  }, [fetchProductDetail, fetchProductReviews]);

  // --- Helper Functions ---

  const calculateReviewStats = (currentReviews) => {
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    currentReviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        stats[review.rating]++;
      }
    });
    setReviewStats(stats);
  };

  const handleAddToCart = useCallback(async () => {
    if (!product) { // Ensure product data is loaded
      alert("Product data is not loaded yet.");
      return;
    }
    if (!selectedVariant) {
      alert("Vui lòng chọn một phiên bản sản phẩm trước khi thêm vào giỏ hàng.");
      return;
    }

    // Prepare data to send to the backend
    const dataToSend = {
      product_id: product.id, // Always send the main product's ID
      quantity,
    };

    if (selectedVariant.id !== product.id) {
      dataToSend.variation_id = selectedVariant.id; // Send the variation's ID
    }

    console.log("Dữ liệu gửi đến API giỏ hàng:", dataToSend); // LOG the payload
    console.log("Product ID (URL param):", productId);
    console.log("Main Product ID from state (product.id):", product.id);
    console.log("Selected Variant ID (selectedVariant.id):", selectedVariant.id);


    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(dataToSend),
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  }, [selectedVariant, quantity, token, product, productId]); // Add 'productId' to dependency array

  const handleQuantityChange = (action) => {
    const currentAvailableQuantity = selectedVariant?.quantity || product?.quantity || 10;
    setQuantity((prevQuantity) => {
      if (action === "increase") {
        return prevQuantity < currentAvailableQuantity ? prevQuantity + 1 : prevQuantity;
      }
      return prevQuantity > 1 ? prevQuantity - 1 : prevQuantity;
    });
  };

  const handleWriteReviewClick = async () => {
    if (!token) {
      alert("Vui lòng đăng nhập để viết đánh giá.");
      return;
    }
    const eligibilityResult = await fetchEligibleOrderItemsForReview(false);
    setShowReviewForm(eligibilityResult.success && eligibilityResult.items?.length > 0);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) return alert("Vui lòng đăng nhập.");
    if (userRating === 0) return alert("Vui lòng chọn số sao đánh giá.");
    if (!selectedOrderItemId) return alert("Lỗi: Không xác định được mục đơn hàng để đánh giá. Vui lòng thử tải lại trang.");

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: userRating, comment: userComment, order_item_id: selectedOrderItemId }),
      });
      const data = await res.json();
      alert(data.message || (res.ok ? "Đánh giá đã được gửi thành công!" : "Đã xảy ra lỗi khi gửi đánh giá."));

      if (res.ok) {
        setShowReviewForm(false);
        setUserRating(0);
        setUserComment("");
        fetchProductReviews(); // Re-fetch reviews to update the list and stats
        const updatedEligibleItems = eligibleOrderItems.filter((item) => item.id !== selectedOrderItemId);
        setEligibleOrderItems(updatedEligibleItems);
        if (updatedEligibleItems.length > 0) {
          setSelectedOrderItemId(updatedEligibleItems[0].id);
        } else {
          setSelectedOrderItemId("");
          setReviewEligibilityMessage("Bạn đã đánh giá tất cả các mục đủ điều kiện cho sản phẩm này.");
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Lỗi kết nối khi gửi đánh giá.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getProductImages = () => {
    if (Array.isArray(product?.productImages) && product.productImages.length > 0) {
      return product.productImages.map((imgObj) => imgObj.image_url);
    }
    if (product?.images) {
      return product.images.split(",").map((img) => img.trim());
    }
    return [];
  };

  const productImages = getProductImages();

  const renderStars = (rating, onClick = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={i < rating ? faStarSolid : faStarRegular}
        className={`star-icon ${onClick ? "interactive" : ""} ${i < rating ? "selected" : ""}`}
        onClick={onClick ? () => onClick(i + 1) : undefined}
      />
    ));
  };

  // --- Render Logic ---

  if (!product) {
    return <div className="text-center">Đang tải chi tiết sản phẩm...</div>;
  }

  const publisherName = product.publisher?.name || product.supplier || "Fahasa";
  const authorName = product.author || "Nhiều tác giả";

const renderPriceSection = () => {
  const item = selectedVariant || product;
  const hasDiscount = item.discount_price && item.discount_price > 0 && item.price < item.discount_price;
  const primaryDisplayPrice = item.price;
  return (
    <div className="product-price-section">
      <span className="current-price">{primaryDisplayPrice?.toLocaleString() || "N/A"} VNĐ</span>
      {hasDiscount && (
        <>
          <span className="original-price">{item.discount_price?.toLocaleString()} VNĐ</span>
          <span className="discount-tag">- {(((item.discount_price - item.price) / item.discount_price) * 100).toFixed(0)}%</span>
        </>
      )}
    </div>
  );
};

  const renderReviewForm = () => {
    if (!showReviewForm || eligibleOrderItems.length === 0) return null;

    const selectedItemDetails = eligibleOrderItems.find((it) => it.id === selectedOrderItemId);

    return (
      <form onSubmit={handleSubmitReview} className="review-form">
        <h5>Viết đánh giá của bạn</h5>
        {eligibleOrderItems.length > 1 && (
          <div className="form-group">
            <label htmlFor="orderItemSelect">Đánh giá cho mục đơn hàng:</label>
            <select
              id="orderItemSelect"
              className="form-control"
              value={selectedOrderItemId}
              onChange={(e) => setSelectedOrderItemId(e.target.value)}
            >
              {eligibleOrderItems.map((item) => (
                <option key={item.id} value={item.id}>
                  Đơn hàng #{item.order_id} - Ngày mua: {new Date(item.order_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}
        {eligibleOrderItems.length === 1 && selectedItemDetails && (
          <p className="info-text">
            Đánh giá sản phẩm bạn đã mua (Đơn hàng #{selectedItemDetails.order_id}, vào{" "}
            {new Date(selectedItemDetails.order_date).toLocaleDateString()}).
          </p>
        )}
        <div className="form-group">
          <label>Đánh giá của bạn:</label>
          <div className="star-rating-input">{renderStars(userRating, setUserRating)}</div>
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
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => {
            setShowReviewForm(false);
            setReviewEligibilityMessage("");
          }}
        >
          Hủy
        </button>
      </form>
    );
  };

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
                    className={`thumbnail-item ${mainImage === img ? "active" : ""}`}
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
            <h1 className="mb-2 product-title-custom">{product.name}</h1>
            <p className="product-meta">
              Nhà cung cấp: <strong>{product.supplier || publisherName}</strong>
            </p>
            <p className="product-meta">
              Nhà xuất bản: <strong>{publisherName}</strong>
            </p>
            <p className="product-meta">
              Tác giả: <strong>{authorName}</strong>
            </p>

            {/* Product Variant Selection */}
            {productVariations.length > 0 && (
              <div className="product-variants mb-3">
                <h6 className="mb-2">Chọn phiên bản:</h6>
                <div className="d-flex gap-2 flex-wrap">
                  {productVariations.map((variant) => (
                    <button
                      key={variant.id}
                      className={`btn btn-outline-primary ${selectedVariant?.id === variant.id ? "active" : ""}`}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                    >
                      {variant.name} 
                    </button>
                  ))}
                </div>
              </div>
            )}

            {renderPriceSection()}

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

      {/* Delivery & Promotion Section */}
      <div className="delivery-promo-section">
        <h5>Thông tin vận chuyển & Ưu đãi</h5>
        <div className="row">
          <div className="col-md-6">
            <div className="delivery-item">
              <FontAwesomeIcon icon={faTruck} />
              <span>
                Giao hàng đến:{" "}
                <strong>{product.user_address || "Địa chỉ mặc định, Quận 1, TP.HCM"}</strong>{" "}
                <a href="#" className="delivery-link">
                  Thay đổi
                </a>
              </span>
            </div>
            <div className="delivery-item">
              <FontAwesomeIcon icon={faTruck} />
              <span>
                Giao hàng tiêu chuẩn: Dự kiến giao <strong>Thứ Sáu - 23/05</strong> (Example)
              </span>
            </div>
          </div>
          <div className="col-md-6">
            <div className="promo-item">
              <FontAwesomeIcon icon={faMoneyBillWave} />
              <span>
                Ưu đãi liên quan:{" "}
                <a href="#" className="delivery-link">
                  Xem thêm
                </a>
              </span>
            </div>
            <div className="promo-item">
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>
                Chính sách đổi trả: <strong>Đổi trả miễn phí toàn quốc trong 30 ngày</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Table Section */}
      <div className="product-details-table-section">
        <h5>Thông tin chi tiết</h5>
        <table className="product-details-table">
          <tbody>
            <tr>
              <td>Mã hàng</td>
              <td>{product.product_code || product.id || "Updating"}</td>
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
              <td>{product.weight_g || "300"}</td>
            </tr>
            <tr>
              <td>Kích thước bao bì</td>
              <td>{product.dimensions || "20 x 14 x 2 cm"}</td>
            </tr>
            <tr>
              <td>Số trang</td>
              <td>{product.pages || "250"}</td>
            </tr>
            <tr>
              <td>Hình thức</td>
              <td>{product.format || "Bìa mềm"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Product Description Section */}
      <div className="product-description-section">
        <h5>Mô tả sản phẩm</h5>
        <div
          className="product-description-content"
          dangerouslySetInnerHTML={{
            __html: product.description || "No description available for this product.",
          }}
        ></div>
      </div>

      {/* Product Review Section */}
      <div className="product-review-section">
        <h5>Đánh giá sản phẩm ({totalReviews} đánh giá)</h5>
        {totalReviews > 0 && (
          <div className="review-summary">
            <div className="average-rating-display">
              <div className="rating-score">{averageRating.toFixed(1)}/5</div>
              <div className="star-rating">{renderStars(averageRating)}</div>
            </div>
            <div className="review-breakdown">
              {[5, 4, 3, 2, 1].map((star) => (
                <div className="review-row" key={star}>
                  <span className="stars">{star} sao</span>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{
                        width: totalReviews > 0 ? `${(reviewStats[star] / totalReviews) * 100}%` : "0%",
                      }}
                    ></div>
                  </div>
                  <span className="percentage">
                    {totalReviews > 0 ? ((reviewStats[star] / totalReviews) * 100).toFixed(0) : 0}% ({reviewStats[star] || 0})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showReviewForm && (
          <>
            {token && (
              <button className="view-reviews-btn" onClick={handleWriteReviewClick} disabled={isLoadingEligibility}>
                {isLoadingEligibility ? "Đang kiểm tra..." : "Viết đánh giá"}
              </button>
            )}
            {reviewEligibilityMessage && !isLoadingEligibility && (
              <p className="info-text" style={{ color: eligibleOrderItems.length > 0 ? "initial" : "red" }}>
                {reviewEligibilityMessage}
              </p>
            )}
            {!token && (
              <p className="info-text">
                Vui lòng <a href="/login">đăng nhập</a> để viết đánh giá.
              </p>
            )}
          </>
        )}

        {renderReviewForm()}

        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-author">
                  <img
                    src={review.user?.avatar ? `${Constanst.DOMAIN_API}/uploads/${review.user.avatar}` : "/images/default-avatar.png"}
                    alt={review.user?.name || "User"}
                    className="reviewer-avatar"
                  />
                  <strong>{review.user?.name || "Người dùng ẩn danh"}</strong>
                  <span className="review-date">
                    {" "}
                    - {new Date(review.review_date || review.createdAt).toLocaleDateString()}
                  </span>
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