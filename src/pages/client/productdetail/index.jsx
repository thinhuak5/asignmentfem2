import React, {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router";
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
import "../../../assets/css/productdetail.css";
import "../../../assets/css/review.css";

const ProductDetail = () => {
  const { id: productId } = useParams();
  const token = localStorage.getItem("authToken");

  // --- State Management ---
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [productVariations, setProductVariations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
    const [reviewStats, setReviewStats] = useState({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
    });
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

  // --- Fetch Current User ---
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

  // --- API Fetch Functions ---
  const fetchProductDetail = useCallback(async () => {
    try {
        const res = await fetch(
            `${Constants.DOMAIN_API}/api/products/${productId}`
        );

      if (!res.ok) {
          throw new Error(`Failed to fetch product details: ${res.statusText}`);
      }

      const data = await res.json();

      setProduct(data);

        const variants = (data.variations || []).map((v) => ({
            id: v.id,
            name: v.name || v.value,
            price: v.price,
            quantity: v.quantity,
            images: (v.productImages || []).map((img) => img.image_url),
        }));

        setProductVariations(variants);

        if (variants.length > 0) {
            const firstVariant = variants[0];
            setSelectedVariant(firstVariant);
            setMainImage(firstVariant.images[0] || "");
        } else {
            const firstVariant = {
                id: data.id,
                name: data.name,
                price: data.price,
                quantity: data.quantity,
                images: (data.productImages || []).map((img) => img.image_url),
            };
            setSelectedVariant(firstVariant);
            setMainImage(firstVariant.images[0] || "");
        }
    } catch (error) {
    }
  }, [productId]);

  const fetchProductReviews = useCallback(async () => {
      if (!selectedVariant || !selectedVariant.id) {
          return; // Không gọi API nếu thiếu selectedVariant ID
      }

    try {
        const res = await fetch(
            `${Constants.DOMAIN_API}/api/variationId/${selectedVariant.id}/reviews`
        );

      if (!res.ok) {
          const errorData = await res
              .json()
              .catch(() => ({message: "Unknown error"}));
        throw new Error(errorData.message || "Error fetching product reviews");
      }

      const data = await res.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
      calculateReviewStats(data.reviews || []);
    } catch (err) {
        // Không có log lỗi ở đây
    }
  }, [selectedVariant]); // Fetch lại khi selectedVariant thay đổi

  const fetchEligibleOrderItemsForReview = useCallback(
    async (showAlerts = false) => {
      if (!token) {
        const msg = "Vui lòng đăng nhập.";
        if (showAlerts) alert(msg);
        setReviewEligibilityMessage(msg);
        return { success: false, message: msg };
      }

        // Kiểm tra nếu selectedVariant là null hoặc không có id
        if (!selectedVariant || !selectedVariant.id) {
            const msg = "Thiếu ID biến thể sản phẩm.";
        if (showAlerts) alert(msg);
        setReviewEligibilityMessage(msg);
        return { success: false, message: msg };
      }

        const variationId = selectedVariant.id; // Đảm bảo bạn đang lấy đúng variationId từ selectedVariant

      setIsLoadingEligibility(true);
      setReviewEligibilityMessage("");

      try {
          const res = await fetch(
              `${Constants.DOMAIN_API}/api/products/eligible-for-review/${variationId}`,
              {
                  headers: {Authorization: `Bearer ${token}`},
              }
          );
        const data = await res.json();

        if (!res.ok) {
            const message =
                data.message ||
                `Lỗi ${res.status}: Không thể kiểm tra điều kiện đánh giá.`;
          if (showAlerts) alert(message);
          setReviewEligibilityMessage(message);
          setEligibleOrderItems([]);
          return { success: false, message: message };
        }

        if (data.eligibleItems?.length > 0) {
          setEligibleOrderItems(data.eligibleItems);
          setSelectedOrderItemId(data.eligibleItems[0].id);
            return {
                success: true,
                items: data.eligibleItems,
                message: data.message,
            };
        } else {
            const message =
                data.message ||
                "Bạn không có mục nào đủ điều kiện để đánh giá sản phẩm này.";
          setReviewEligibilityMessage(message);
          setEligibleOrderItems([]);
          return { success: false, message: message };
        }
      } catch (err) {
          const message =
              "Lỗi kết nối khi kiểm tra điều kiện đánh giá. Vui lòng thử lại.";
        if (showAlerts) alert(message);
        setReviewEligibilityMessage(message);
        setEligibleOrderItems([]);
        return { success: false, message: message };
      } finally {
        setIsLoadingEligibility(false);
      }
    },
      [token, selectedVariant] // Kiểm tra sự thay đổi của selectedVariant
  );

  useEffect(() => {
      const fetchProductDetailData = async () => {
          await fetchProductDetail();
      };
      fetchProductDetailData();
  }, [productId, fetchProductDetail]);  // Thêm fetchProductDetail vào mảng phụ thuộc nếu nó là hàm đã được memoized

    useEffect(() => {
        const fetchReviewsData = async () => {
            await fetchProductReviews();
        };
        if (selectedVariant) {
            fetchReviewsData();
        }
    }, [selectedVariant, fetchProductReviews]);  // Thêm fetchProductReviews vào mảng phụ thuộc nếu nó là hàm đã được memoized

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
    if (!product) {
      alert("Dữ liệu sản phẩm chưa được tải.");
      return;
    }
    if (!selectedVariant) {
        alert(
            "Vui lòng chọn một phiên bản sản phẩm trước khi thêm vào giỏ hàng."
        );
      return;
    }

    const dataToSend = {
      product_id: product.id,
      quantity,
    };

    if (selectedVariant.id !== product.id) {
      dataToSend.variation_id = selectedVariant.id;
    }

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
      const currentAvailableQuantity =
          selectedVariant?.quantity || product?.quantity || 10;
    setQuantity((prevQuantity) => {
      if (action === "increase") {
          return prevQuantity < currentAvailableQuantity
              ? prevQuantity + 1
              : prevQuantity;
      }
      return prevQuantity > 1 ? prevQuantity - 1 : prevQuantity;
    });
  };

  const handleWriteReviewClick = async () => {
    if (!token) {
      alert("Vui lòng đăng nhập để viết đánh giá.");
      return;
    }
    const eligibilityResult = await fetchEligibleOrderItemsForReview(true);
      setShowReviewForm(
          eligibilityResult.success && eligibilityResult.items?.length > 0
      );
  };

  const handleReviewImageChange = (e) => {
    if (e.target.files) {
      setReviewImages(Array.from(e.target.files));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token) return alert("Vui lòng đăng nhập.");
    if (userRating === 0) return alert("Vui lòng chọn số sao đánh giá.");
      if (!selectedOrderItemId)
          return alert("Lỗi: Không xác định được mục đơn hàng để đánh giá.");

      // Kiểm tra selectedVariant trước khi gửi
      if (!selectedVariant || !selectedVariant.id) {
          return alert("Lỗi: Không xác định được biến thể sản phẩm.");
      }

    setIsSubmittingReview(true);

    const formData = new FormData();
    formData.append("rating", userRating);
    formData.append("comment", userComment);
    formData.append("order_item_id", selectedOrderItemId);
      formData.append("variation_id", selectedVariant.id);

    reviewImages.forEach((file) => {
      formData.append("images", file);
    });

    try {
        const res = await fetch(
            `${Constants.DOMAIN_API}/api/variationId/${selectedVariant.id}/reviews`,
            {
                method: "POST",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            }
        );
      const data = await res.json();
        alert(
            data.message || (res.ok ? "Đánh giá đã được gửi thành công!" : "Lỗi!")
        );

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
    reviewImages.forEach((file) => {
      formData.append("images", file);
    });

    try {
        const res = await fetch(
            `${Constants.DOMAIN_API}/api/reviews/${editingReview.id}`,
            {
                method: "PUT",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            }
        );
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
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
      return;
    }

    try {
        const res = await fetch(
            `${Constants.DOMAIN_API}/api/reviews/${reviewId}`,
            {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            }
        );
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

  const renderStars = (rating, onClick = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={i < rating ? faStarSolid : faStarRegular}
        className={`star-icon ${onClick ? "interactive" : ""} ${
            i < rating ? "selected" : ""
        }`}
        onClick={onClick ? () => onClick(i + 1) : undefined}
      />
    ));
  };

  const renderReviewForm = () => {
    if (!showReviewForm && !editingReview) {
      return null;
    }

    const selectedItemDetails = !editingReview
        ? eligibleOrderItems.find(
            (it) => it.id.toString() === selectedOrderItemId.toString()
        )
        : null;

    return (
        <form
            onSubmit={editingReview ? handleUpdateReview : handleSubmitReview}
            className="review-form"
        >
            <h5 className="mb-3">
                {editingReview
                    ? "Chỉnh sửa đánh giá của bạn"
                    : "Viết đánh giá của bạn"}
            </h5>
        {!editingReview && (
          <>
            {eligibleOrderItems.length > 1 && (
              <div className="form-group">
                  <label htmlFor="orderItemSelect">
                      Đánh giá cho mục đơn hàng:
                  </label>
                <select
                  id="orderItemSelect"
                  className="form-control"
                  value={selectedOrderItemId}
                  onChange={(e) => setSelectedOrderItemId(e.target.value)}
                >
                  {eligibleOrderItems.map((item) => (
                    <option key={item.id} value={item.id}>
                        Đơn hàng #{item.order_id} - Ngày mua:{" "}
                        {new Date(item.order_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {eligibleOrderItems.length === 1 && selectedItemDetails && (
              <p className="info-text">
                  Đánh giá sản phẩm bạn đã mua (Đơn hàng #
                  {selectedItemDetails.order_id}, vào{" "}
                  {new Date(selectedItemDetails.order_date).toLocaleDateString()}
                  ).
              </p>
            )}
          </>
        )}
        <div className="form-group">
          <label>Đánh giá của bạn:</label>
            <div className="star-rating-input">
                {renderStars(userRating, setUserRating)}
            </div>
        </div>
        <div className="form-group">
          <label htmlFor="userComment">Bình luận của bạn:</label>
          <textarea
            id="userComment"
            className="form-control"
            rows="4"
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
          ></textarea>
        </div>
        <div className="form-group">
          <label>Hình ảnh đính kèm (tùy chọn):</label>
            {editingReview &&
                editingReview.images &&
                editingReview.images.length > 0 && (
                    <div className="current-images-preview mb-2">
                        {editingReview.images
                  .filter((img) => !imagesToDelete.includes(img.id))
                  .map((img) => (
                      <div key={img.id} className="image-preview-item">
                          <img src={img.image_url} alt="Ảnh đánh giá cũ"/>
                          <button
                        type="button"
                        className="delete-image-btn"
                        onClick={() =>
                            setImagesToDelete((prev) => [...prev, img.id])
                        }
                        title="Xóa ảnh này"
                          >
                              X
                          </button>
                      </div>
                  ))}
                    </div>
                )}
          <input
            type="file"
            multiple
            accept="image/*"
            className="form-control"
            onChange={handleReviewImageChange}
            id="review-image-upload"
          />
            <small className="form-text text-muted">
                Bạn có thể chọn nhiều ảnh (tối đa 5).
            </small>
          {reviewImages.length > 0 && (
              <div className="new-images-preview mt-2">
                  {reviewImages.map((file, index) => (
                      <div key={index} className="image-preview-item">
                          <img
                              src={URL.createObjectURL(file)}
                              alt={`Ảnh mới ${index + 1}`}
                          />
                      </div>
                  ))}
              </div>
          )}
        </div>
        <div className="review-form-actions mt-3">
            <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmittingReview}
            >
            {isSubmittingReview
                ? "Đang xử lý..."
                : editingReview
                    ? "Cập nhật đánh giá"
                    : "Gửi đánh giá"}
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={
                editingReview
                    ? () => setEditingReview(null)
                    : () => setShowReviewForm(false)
            }
            disabled={isSubmittingReview}
          >
            Hủy
          </button>
        </div>
      </form>
    );
  };

  if (!product) {
    return <div className="text-center">Đang tải chi tiết sản phẩm...</div>;
  }

  const publisherName = product.publisher?.name || product.supplier || "Fahasa";
  const authorName = product.author || "Nhiều tác giả";

  return (
    <div className="product-detail-container container">
      {/* Product Info Section */}
        <div className="product-detail-container container">
            {/* Product Info */}
            <div className="row product-info-wrapper">
                <div className="col-md-5 mb-4">
                    <div className="product-image-gallery">
                        <img
                            src={mainImage || "/images/default-book.jpg"}
                            alt={product.name}
                            className="img-fluid main-product-image"
                        />

                        {selectedVariant?.images?.length > 1 && (
                            <div className="thumbnail-container">
                                {selectedVariant.images.slice(0, 3).map((imgUrl, idx) => (
                                    <div
                                        key={idx}
                                        className={`thumbnail-item ${
                                            mainImage === imgUrl ? "active" : ""
                                        }`}
                                        onClick={() => setMainImage(imgUrl)}
                                    >
                                        <img src={imgUrl} alt={`Thumb ${idx + 1}`}/>
                                    </div>
                                ))}
                                {selectedVariant.images.length > 3 && (
                                    <div className="thumbnail-item thumbnail-more">
                      <span className="more-sign">
                        +{selectedVariant.images.length - 3}
                      </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-md-7">
                    <h1 className="product-title-custom">{product.name}</h1>
                    <p>
              Nhà xuất bản: <strong>{publisherName}</strong>
            </p>
                    {/* Variant selector */}
            {productVariations.length > 1 && (
              <div className="product-variants mb-3">
                  <h6>Chọn phiên bản:</h6>
                  <div className="d-flex gap-2">
                      {productVariations.map((v) => (
                    <button
                        key={v.id}
                        className={`btn btn-outline-primary ${
                            selectedVariant?.id === v.id ? "active" : ""
                        }`}
                      onClick={() => {
                          setSelectedVariant(v);
                          setMainImage(v.images[0] || "");
                        setQuantity(1);
                      }}
                    >
                        {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

                    {/* Price & qty */}
                    <div className="product-price-section">
              <span>
                {(selectedVariant?.price || product.price).toLocaleString()} VNĐ
              </span>
                    </div>
            <div className="quantity-control mb-4">
                <button onClick={() => handleQuantityChange("decrease")}>
                <FontAwesomeIcon icon={faMinus} />
              </button>
                <span>{quantity}</span>
                <button onClick={() => handleQuantityChange("increase")}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
                    <button className="add-to-cart-btn" onClick={handleAddToCart}>
                        <FontAwesomeIcon icon={faShoppingCart}/> Thêm vào giỏ
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
                  <strong>
                  {product.user_address || "Địa chỉ mặc định, Quận 1, TP.HCM"}
                </strong>{" "}
              </span>
            </div>
          </div>
          <div className="col-md-6">
            <div className="promo-item">
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>
                Chính sách đổi trả:{" "}
                  <strong>Đổi trả miễn phí toàn quốc trong 30 ngày</strong>
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
            __html: product.description || "Chưa có mô tả cho sản phẩm này.",
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
                          width:
                              totalReviews > 0
                                  ? `${(reviewStats[star] / totalReviews) * 100}%`
                                  : "0%",
                      }}
                    ></div>
                  </div>
                  <span className="percentage">
                    {totalReviews > 0
                        ? ((reviewStats[star] / totalReviews) * 100).toFixed(0)
                        : 0}
                      % ({reviewStats[star] || 0})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {!showReviewForm && !editingReview && (
          <div className="write-review-prompt">
            {token ? (
              <>
                <button
                    className="view-reviews-btn"
                    onClick={handleWriteReviewClick}
                    disabled={isLoadingEligibility}
                >
                  {isLoadingEligibility ? "Đang kiểm tra..." : "Viết đánh giá"}
                </button>
                {reviewEligibilityMessage && !isLoadingEligibility && (
                    <p
                        className="info-text mt-2"
                        style={{
                            color: eligibleOrderItems.length > 0 ? "initial" : "red",
                        }}
                    >
                    {reviewEligibilityMessage}
                  </p>
                )}
              </>
            ) : (
              <p className="info-text">
                Vui lòng <a href="/login">đăng nhập</a> để viết đánh giá.
              </p>
            )}
          </div>
        )}
        {(showReviewForm || editingReview) && renderReviewForm()}
        <div className="reviews-list mt-4">
            {reviews.length > 0
                ? reviews.map((review) => (
                    <div key={review.id} className="review-item">
                        <div className="review-author">
                            <img
                      src={
                        review.user?.avatar
                            ? review.user.avatar
                            : "/images/default-avatar.png"
                      }
                      alt={review.user?.name || "User"}
                      className="reviewer-avatar"
                            />
                            <div>
                                <strong>
                                    {review.user?.name || "Người dùng ẩn danh"}
                                </strong>
                                <span className="review-date">
                        {" "}
                                    -{" "}
                                    {new Date(
                                        review.review_date || review.createdAt
                                    ).toLocaleDateString()}
                      </span>
                            </div>
                        </div>
                        <div className="star-rating">
                            {renderStars(review.rating)}
                        </div>
                        {review.comment && (
                            <p className="review-comment">{review.comment}</p>
                        )}
                        {review.images && review.images.length > 0 && (
                    <div className="review-images">
                      {review.images.map((image) => (
                          <img
                              key={image.id}
                              src={image.image_url}
                              alt={`Ảnh đánh giá ${image.id}`}
                              className="review-image-item"
                          />
                      ))}
                    </div>
                        )}
                        {currentUser &&
                            currentUser.id === review.user_id &&
                            !editingReview && (
                                <div className="review-actions">
                                    <button
                          onClick={() => handleEditClick(review)}
                          className="btn btn-sm btn-outline-primary me-2"
                                    >
                                        Sửa
                                    </button>
                                    <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="btn btn-sm btn-outline-danger"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            )}
                    </div>
                ))
                : !showReviewForm &&
                !editingReview && (
                    <p className="info-text">
                        Chưa có đánh giá nào cho sản phẩm này.
                    </p>
                )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
