import React, {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Constants from "../../../Constanst";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useSnackbar} from "notistack";
import {
    faChevronLeft,
    faChevronRight,
    faMinus,
    faPlus,
    faShieldAlt,
    faShoppingCart,
    faStar as faStarSolid,
    faTimes,
    faTruck,
} from "@fortawesome/free-solid-svg-icons";
import {faStar as faStarRegular} from "@fortawesome/free-regular-svg-icons";
import {Button as RBButton, Modal as RBModal} from "react-bootstrap";

import "../../../assets/css/product-detail-new.css";

/* ========== Soft Blue Modal CSS (đồng nhất với trang Profile) ========== */
const SoftBlueCSS = () => (
    <style>{`
    .modal-soft-blue .modal-content{
      background:#ffffff;
      border:1px solid #cfe3ff;
      box-shadow:0 10px 30px rgba(20,60,120,.15);
      border-radius:14px;
    }
    .modal-soft-blue .modal-header{
      background:#eaf3ff;
      color:#0b3d91;
      border-bottom:1px solid #cfe3ff;
      border-top-left-radius:14px;
      border-top-right-radius:14px;
    }
    .modal-soft-blue .modal-title{ font-weight:600; }
    .modal-soft-blue .modal-body{ color:#193b6a; }
  .modal-soft-blue .btn-primary{
  background:#E74C3C;  /* đỏ */
  border-color:#E74C3C;
}
.modal-soft-blue .btn-primary:hover{
  background:#C0392B;  /* đỏ đậm khi hover */
  border-color:#C0392B;
}

    .modal-soft-blue .btn-secondary{
      background:#e9f2ff; color:#0b3d91; border-color:#cfe3ff;
    }
    .modal-soft-blue .btn-secondary:hover{
      background:#dbeaff; color:#0b3d91; border-color:#bed7ff;
    }
    .modal-soft-blue .btn-close{
      filter: invert(24%) sepia(16%) saturate(1783%) hue-rotate(189deg) brightness(90%) contrast(88%);
    }
  `}</style>
);

const ProductDetail = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
    const notify = useCallback(
        (msg, variant = "info") =>
            enqueueSnackbar(msg, {variant, autoHideDuration: 2500}),
        [enqueueSnackbar]
    );

  const { id: productId } = useParams();
  const token = localStorage.getItem("authToken");

    useEffect(() => {
        window.scrollTo({top: -100, left: 0, behavior: "smooth"});
    }, [productId]);

  // --- State ---
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
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // Gallery
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);

    // Confirm delete review (popup)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [pendingDeleteReviewId, setPendingDeleteReviewId] = useState(null);
    const [isDeletingReview, setIsDeletingReview] = useState(false);

  // --- Current user ---
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setCurrentUser({ id: payload.id, name: payload.name });
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
      setLoading(true);
      setErrorMsg("");
    try {
        const res = await fetch(`${Constants.DOMAIN_API}/api/products/${productId}`);
        if (!res.ok) throw new Error(`Failed to fetch product details: ${res.statusText}`);
      const data = await res.json();
      setProduct(data);

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

      if (variants.length > 0) {
        setProductVariations(variants);
          const firstInStock = variants.find((v) => (Number(v.quantity) || 0) > 0);
        const def = firstInStock || variants[0];
        setSelectedVariant(def);
        setMainImage(def.images[0] || "");
      } else {
        const fallback = {
          id: data.id,
          name: data.name,
          price: data.price,
          quantity: Number(data.quantity) || 0,
          images: (data.productImages || []).map((img) => img.image_url),
          specs: [],
        };
          setProductVariations([fallback]);
        setSelectedVariant(fallback);
        setMainImage(fallback.images[0] || "");
      }
    } catch (err) {
        console.error(err);
        setErrorMsg("Không tải được chi tiết sản phẩm. Vui lòng thử lại.");
        notify("Không tải được chi tiết sản phẩm.", "error");
    } finally {
        setLoading(false);
    }
  }, [productId, notify]);

  // --- Reviews ---
    const calculateReviewStats = (currentReviews) => {
        const stats = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        currentReviews.forEach((review) => {
            if (review.rating >= 1 && review.rating <= 5) stats[review.rating]++;
        });
        setReviewStats(stats);
    };

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

  const fetchEligibleOrderItemsForReview = useCallback(
    async (showAlerts = false) => {
      if (!token) {
        const msg = "Vui lòng đăng nhập.";
          if (showAlerts) notify(msg, "warning");
        setReviewEligibilityMessage(msg);
        return { success: false, message: msg };
      }
      if (!selectedVariant?.id) {
        const msg = "Thiếu ID biến thể sản phẩm.";
          if (showAlerts) notify(msg, "warning");
        setReviewEligibilityMessage(msg);
        return { success: false, message: msg };
      }
      setIsLoadingEligibility(true);
      setReviewEligibilityMessage("");
      try {
        const url = `${Constants.DOMAIN_API}/api/products/eligible-for-review/${productId}?variationId=${selectedVariant.id}`;
          const res = await fetch(url, {
              headers: {Authorization: `Bearer ${token}`},
          });
        const data = await res.json();
        if (!res.ok) {
          const message =
              data.message || `Lỗi ${res.status}: Không thể kiểm tra điều kiện đánh giá.`;
            if (showAlerts) notify(message, "warning");
          setReviewEligibilityMessage(message);
          setEligibleOrderItems([]);
          return { success: false, message };
        }
          const items = Array.isArray(data.eligibleItems) ? data.eligibleItems : [];
        if (items.length > 0) {
          setEligibleOrderItems(items);
          setSelectedOrderItemId(items[0].order_item_id);
          return { success: true, items, message: data.message };
        } else {
          const message =
              data.message || "Bạn không có mục nào đủ điều kiện để đánh giá sản phẩm này.";
          setReviewEligibilityMessage(message);
          setEligibleOrderItems([]);
            if (showAlerts) notify(message, "warning");
          return { success: false, message };
        }
      } catch {
          const message = "Lỗi kết nối khi kiểm tra điều kiện đánh giá. Vui lòng thử lại.";
          if (showAlerts) notify(message, "error");
        setReviewEligibilityMessage(message);
        setEligibleOrderItems([]);
        return { success: false, message };
      } finally {
        setIsLoadingEligibility(false);
      }
    },
      [token, selectedVariant, productId, notify]
  );

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  useEffect(() => {
    if (selectedVariant) fetchProductReviews();
  }, [selectedVariant, fetchProductReviews]);

    // --- UI helpers ---
  const renderStars = (rating, onClick = null) =>
    Array.from({ length: 5 }, (_, i) => (
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

  const getSpecValue = (labels = []) => {
    const pool = selectedVariant?.specs || [];
    const norm = (s) => (s || "").trim().toLowerCase();
    const target = pool.find((sp) => labels.map(norm).includes(norm(sp.label)));
    return target?.value?.trim() || "";
  };

  const authorFromSpecs = getSpecValue(["Tác giả", "Tac gia", "Author"]);
    const publisherFromSpecs = getSpecValue(["NXB", "Nhà xuất bản", "Nha xuat ban", "Publisher"]);

    const isOutOfStock = !selectedVariant || (Number(selectedVariant.quantity) || 0) <= 0;

  const variantSpecs = (selectedVariant?.specs || [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    // --- Cart / Buy ---
  const handleAddToCart = useCallback(async () => {
      if (!product) return notify("Dữ liệu sản phẩm chưa được tải.", "warning");
      if (!selectedVariant) return notify("Vui lòng chọn một phiên bản sản phẩm.", "warning");
    if ((Number(selectedVariant.quantity) || 0) <= 0) {
        return notify("Biến thể đang hết hàng.", "warning");
    }

      const stock = Number(selectedVariant?.quantity) || 0;
      if (quantity > stock) {
          return notify(`Số lượng vượt quá tồn kho (còn ${stock}).`, "warning");
      }

    const dataToSend = { product_id: product.id, quantity };
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
      if (res.ok) {
          notify(data.message || "Thêm vào giỏ thành công!", "success");
      } else {
          notify("Vui lòng đăng nhập để tiếp tục.", "warning");
          navigate("/login");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
        notify("Đã xảy ra lỗi. Vui lòng thử lại.", "error");
    }
  }, [selectedVariant, quantity, token, product, navigate, notify]);

    const handleBuyNow = useCallback(() => {
        if (!product) return notify("Dữ liệu sản phẩm chưa được tải.", "warning");
        if (!selectedVariant) return notify("Vui lòng chọn 1 phiên bản.", "warning");
        if ((Number(selectedVariant.quantity) || 0) <= 0) return notify("Biến thể đang hết hàng.", "warning");
        if (!token) {
            notify("Vui lòng đăng nhập để tiếp tục.", "warning");
            return navigate("/login");
    }

        const item = {
            id: null,
            variation: {
                id: selectedVariant.id,
                price: selectedVariant.price ?? product.price,
                image_url:
                    selectedVariant.images?.[0] || (product.productImages || [])[0]?.image_url || "",
                name: selectedVariant.name || "Biến thể",
            },
            quantity,
        };

        let uid = currentUser?.id;
        if (!uid) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                uid = payload?.id;
            } catch {
            }
        }

        navigate("/oder", {
            state: {
                cartItems: [item],
                userInfo: uid ? {id: uid} : null,
            },
        });
    }, [product, selectedVariant, quantity, token, currentUser, navigate, notify]);

  const handleQuantityChange = (action) => {
      const currentAvailableQuantity = selectedVariant?.quantity ?? 10;
      if ((Number(selectedVariant?.quantity) || 0) <= 0) return;
    setQuantity((prev) =>
        action === "increase" ? (prev < currentAvailableQuantity ? prev + 1 : prev) : prev > 1 ? prev - 1 : prev
    );
  };

    const handleQuantityManualChange = (e) => {
        const max = Number(selectedVariant?.quantity) || 0;
        const val = e.target.value.replace(/[^\d]/g, "");
        const n = Math.max(1, Math.min(Number(val || 1), max || 1));
        if (max === 0) return;
        setQuantity(n);
    };

    // --- Review UI events ---
  const handleWriteReviewClick = async () => {
      if (!token) {
          notify("Vui lòng đăng nhập để viết đánh giá.", "warning");
          navigate("/login");
          return;
      }
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
      // đảm bảo hiện form trong viewport
  };

    // Xoá bình luận
  const handleDeleteReview = async (reviewId) => {
    try {
        const res = await fetch(`${Constants.DOMAIN_API}/api/reviews/${reviewId}`, {
            method: "DELETE",
            headers: {Authorization: `Bearer ${token}`},
        });
      const data = await res.json();
        notify(data.message || (res.ok ? "Xóa thành công!" : "Xóa thất bại."), res.ok ? "success" : "error");
      if (res.ok) {
        fetchProductReviews();
        fetchEligibleOrderItemsForReview();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
        notify("Lỗi kết nối khi xóa đánh giá.", "error");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
      if (!token) return notify("Vui lòng đăng nhập.", "warning");
      if (userRating === 0) return notify("Vui lòng chọn số sao đánh giá.", "warning");
      if (!selectedOrderItemId) return notify("Không xác định được mục đơn hàng để đánh giá.", "error");
      if (!selectedVariant?.id) return notify("Không xác định được biến thể sản phẩm.", "error");
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
          {
              method: "POST",
              headers: {Authorization: `Bearer ${token}`},
              body: formData,
          }
      );
      const data = await res.json();
        notify(
            data.message || (res.ok ? "Đánh giá đã được gửi thành công!" : "Gửi đánh giá thất bại"),
            res.ok ? "success" : "error"
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
        notify("Lỗi kết nối khi gửi đánh giá.", "error");
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
        notify(data.message || (res.ok ? "Cập nhật thành công!" : "Cập nhật thất bại."), res.ok ? "success" : "error");
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
        notify("Lỗi kết nối khi cập nhật.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

    // === Lightbox handlers ===
    const openGallery = (startAt = 0) => {
        if (!selectedVariant?.images?.length) return;
        setGalleryIndex(Math.max(0, Math.min(startAt, selectedVariant.images.length - 1)));
        setIsGalleryOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeGallery = useCallback(() => {
        setIsGalleryOpen(false);
        document.body.style.overflow = "";
    }, []);

    const imagesLen = selectedVariant?.images?.length || 0;

    const nextImage = useCallback(() => {
        if (!imagesLen) return;
        setGalleryIndex((i) => (i + 1) % imagesLen);
    }, [imagesLen]);

    const prevImage = useCallback(() => {
        if (!imagesLen) return;
        setGalleryIndex((i) => (i - 1 + imagesLen) % imagesLen);
    }, [imagesLen]);

    useEffect(() => {
        if (!isGalleryOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") closeGallery();
            if (e.key === "ArrowRight") nextImage();
            if (e.key === "ArrowLeft") prevImage();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isGalleryOpen, nextImage, prevImage, closeGallery]);

    // ======= Hỏi xác nhận xoá bình luận =======
    const askDeleteReview = (reviewId) => {
        setPendingDeleteReviewId(reviewId);
        setConfirmDeleteOpen(true);
    };

    const confirmDeleteReview = async () => {
        if (!pendingDeleteReviewId) return;
        setIsDeletingReview(true);
        await handleDeleteReview(pendingDeleteReviewId);
        setIsDeletingReview(false);
        setConfirmDeleteOpen(false);
        setPendingDeleteReviewId(null);
    };

    const cancelDeleteReview = () => {
        setConfirmDeleteOpen(false);
        setPendingDeleteReviewId(null);
    };

    // --- Render ---
    if (loading)
        return <div className="loading-container">Đang tải chi tiết sản phẩm...</div>;
    if (errorMsg) return <div className="loading-container">{errorMsg}</div>;
    if (!product) return <div className="loading-container">Không tìm thấy sản phẩm.</div>;

    const images = selectedVariant?.images || [];
    const mainIndex = Math.max(0, images.findIndex((u) => u === mainImage));

  return (
    <div className="product-detail-page">
        <SoftBlueCSS/>

      <div className="container">
        {/* Primary Info Section */}
        <section className="product-primary-section">
          <div className="row">
            <div className="col-lg-5">
              <div className="product-gallery">
                  <div
                      className="main-image-container"
                      title="Bấm để xem tất cả ảnh"
                      onClick={() => openGallery(mainIndex)}
                      style={{cursor: images.length ? "zoom-in" : "default"}}
                  >
                  <img
                    src={mainImage || "/images/default-book.jpg"}
                    alt={product.name}
                    onError={(e) => (e.currentTarget.src = "/images/default-book.jpg")}
                    className="main-image"
                  />
                </div>

                  {images.length > 1 && (
                  <div className="thumbnail-list">
                      {images.slice(0, 4).map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`thumbnail-item ${mainImage === imgUrl ? "active" : ""}`}
                        onClick={() => setMainImage(imgUrl)}
                      >
                          <img
                              src={imgUrl}
                              alt={`Thumbnail ${idx + 1}`}
                              onError={(e) =>
                                  (e.currentTarget.src = "/images/default-book-thumb.jpg")
                              }
                          />
                      </div>
                    ))}

                      {images.length > 4 && (
                          <div
                              className="thumbnail-item more-thumbnails"
                              title="Xem tất cả ảnh"
                              onClick={() => openGallery(4)}
                          >
                              +{images.length - 4}
                      </div>
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
                      {authorFromSpecs && <span>Tác giả: {authorFromSpecs}</span>}
                      {authorFromSpecs && publisherFromSpecs && (
                          <span className="separator">|</span>
                    )}
                      {publisherFromSpecs && <span>NXB: {publisherFromSpecs}</span>}
                  </div>
                )}

                <div className="product-short-review">
                    <span className="rating-value">{averageRating.toFixed(1)}</span>
                  {renderStars(averageRating)}
                  <span className="separator">|</span>
                  <span className="review-count">{totalReviews} Đánh giá</span>
                </div>

                {productVariations.length >= 1 && (
                  <div className="variant-selector">
                    <h6 className="selector-title">Phiên bản:</h6>
                    <div className="variant-options">
                      {productVariations.map((v) => {
                        const out = (Number(v.quantity) || 0) <= 0;
                        return (
                          <button
                            key={v.id}
                            className={`variant-btn ${
                                selectedVariant?.id === v.id ? "active" : ""
                            } ${out ? "oos" : ""}`}
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
                  <span className="current-price">
                    {formatVND(selectedVariant?.price ?? product.price)}
                  </span>
                </div>

                <div className="quantity-selector">
                  <h6 className="selector-title">Số lượng:</h6>
                    <div className={`quantity-input ${isOutOfStock ? "disabled" : ""}`}>
                        <button onClick={() => handleQuantityChange("decrease")} disabled={isOutOfStock}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                        <input
                            type="text"
                            value={quantity}
                            onChange={handleQuantityManualChange}
                            onBlur={handleQuantityManualChange}
                            inputMode="numeric"
                        />
                        <button onClick={() => handleQuantityChange("increase")} disabled={isOutOfStock}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>

                <div className="action-buttons">
                  {!isOutOfStock ? (
                    <>
                        <button className="btn-add-to-cart" onClick={handleAddToCart}>
                            <FontAwesomeIcon icon={faShoppingCart}/> Thêm vào giỏ hàng
                        </button>
                        <button className="btn-buy-now" onClick={handleBuyNow}>
                            Mua ngay
                      </button>
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
                  <FontAwesomeIcon icon={faTruck} className="policy-icon" />
                  <div>
                    <h6>Giao hàng toàn quốc</h6>
                    <p>Hỗ trợ giao hàng nhanh chóng trên 63 tỉnh thành.</p>
                  </div>
                </div>
                <div className="policy-item">
                  <FontAwesomeIcon icon={faShieldAlt} className="policy-icon" />
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
                    {star} <FontAwesomeIcon icon={faStarSolid} />
                  </div>
                  <div className="progress-container">
                    <div
                      className="progress-bar"
                      style={{
                        width:
                          totalReviews > 0
                            ? `${(reviewStats[star] / totalReviews) * 100}%`
                            : "0%",
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
            <form
              onSubmit={editingReview ? handleUpdateReview : handleSubmitReview}
              className="review-form"
            >
              <h4 className="review-form-title">
                {editingReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá của bạn"}
              </h4>
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
                        {item.order_date
                            ? ` - Ngày mua: ${new Date(item.order_date).toLocaleDateString()}`
                          : ""}
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
                          <img src={img.image_url} alt="Ảnh đánh giá cũ" />
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
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="form-control"
                  onChange={handleReviewImageChange}
                />
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
                      <span className="reviewer-name">
                        {review.user?.name || "Người dùng ẩn danh"}
                      </span>
                                  <span className="review-date">
                        {new Date(review.review_date || review.createdAt).toLocaleDateString()}
                      </span>
                              </div>
                              {currentUser?.id === review.user_id && !editingReview && (
                                  <div className="review-actions">
                                      <button onClick={() => handleEditClick(review)}>Sửa</button>
                                      <button onClick={() => askDeleteReview(review.id)}>Xóa</button>
                                  </div>
                              )}
                          </div>
                          <div className="review-card-body">
                              <div className="star-rating">{renderStars(review.rating)}</div>
                              <p className="review-comment">{review.comment}</p>
                              {review.images?.length > 0 && (
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
                          </div>
                      </div>
                  ))
              ) : !showReviewForm && !editingReview ? (
                  <div className="no-reviews-placeholder">Chưa có đánh giá nào cho sản phẩm này.</div>
              ) : null}
          </div>
        </section>
      </div>

        {/* === Lightbox overlay === */}
        {isGalleryOpen && (
            <div className="lightbox-overlay" onClick={closeGallery}>
                <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                    <button className="lightbox-close" onClick={closeGallery} aria-label="Đóng">
                        <FontAwesomeIcon icon={faTimes}/>
                    </button>

                    <button className="lightbox-nav left" onClick={prevImage} aria-label="Ảnh trước">
                        <FontAwesomeIcon icon={faChevronLeft}/>
                    </button>

                    <img
                        className="lightbox-image"
                        src={images[galleryIndex] || "/images/default-book.jpg"}
                        alt={`Ảnh ${galleryIndex + 1}`}
                        onError={(e) => (e.currentTarget.src = "/images/default-book.jpg")}
                    />

                    <button className="lightbox-nav right" onClick={nextImage} aria-label="Ảnh sau">
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </button>

                    <div className="lightbox-thumbs">
                        {images.map((url, i) => (
                            <div
                                key={i}
                                className={`lightbox-thumb ${i === galleryIndex ? "active" : ""}`}
                                onClick={() => setGalleryIndex(i)}
                                title={`Ảnh ${i + 1}`}
                            >
                                <img src={url} alt={`thumb ${i + 1}`}/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* === Modal xác nhận XÓA bình luận (Soft Blue) === */}
        <RBModal
            show={confirmDeleteOpen}
            onHide={cancelDeleteReview}
            centered
            dialogClassName="modal-soft-blue"
            backdrop="static"
            keyboard={false}
        >
            <RBModal.Header closeButton>
                <RBModal.Title>Xác nhận xóa</RBModal.Title>
            </RBModal.Header>
            <RBModal.Body>
                <p>Bạn có chắc chắn muốn xóa bình luận này không?</p>
            </RBModal.Body>
            <RBModal.Footer>
                <RBButton variant="secondary" onClick={cancelDeleteReview} disabled={isDeletingReview}>
                    Đóng
                </RBButton>
                <RBButton variant="primary" onClick={confirmDeleteReview} disabled={isDeletingReview}>
                    {isDeletingReview ? "Đang xoá..." : "Đồng ý xóa"}
                </RBButton>
            </RBModal.Footer>
        </RBModal>
    </div>
  );
};

export default ProductDetail;
