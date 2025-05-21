import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import Constanst from "../../../Constanst"; // Đảm bảo Constanst.DOMAIN_API chứa URL đúng của API của bạn
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faEye, faPlus, faMinus, faTruck, faExchangeAlt, faMoneyBillWave, faShieldAlt, faStar } from '@fortawesome/free-solid-svg-icons';
import "../../../assets/css/productdetail.css"; // Import CSS mới cho trang chi tiết

const ProductDetail = () => {
    const { id } = useParams(); // Lấy ID sản phẩm từ URL
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(''); // State để quản lý ảnh chính hiển thị

    useEffect(() => {
        fetchProductDetail();
    }, [id]);

    // Hàm lấy chi tiết sản phẩm
    const fetchProductDetail = async () => {
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${id}`);
            if (!res.ok) {
                throw new Error("Lỗi khi lấy dữ liệu chi tiết sản phẩm");
            }
            const data = await res.json();
            setProduct(data);
            // Đặt ảnh chính ban đầu là ảnh đầu tiên từ product.images (nếu có)
            if (data.images) {
                const imagesArray = data.images.split(','); // Giả sử ảnh được lưu dạng "image1.jpg,image2.jpg"
                if (imagesArray.length > 0) {
                    setMainImage(imagesArray[0].trim());
                }
            }
        } catch (err) {
            console.error("Lỗi fetch product detail:", err);
        }
    };

    // Hàm thêm sản phẩm vào giỏ hàng
    const handleAddToCart = useCallback(async () => {
        if (!product) return;

        try {
            const token = localStorage.getItem("authToken");
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
    }, [product, quantity]);

    // Hàm thay đổi số lượng sản phẩm
    const handleQuantityChange = (action) => {
        if (action === "increase" && quantity < 10) { // Giới hạn số lượng mua là 10
            setQuantity(prevQuantity => prevQuantity + 1);
        } else if (action === "decrease" && quantity > 1) { // Số lượng tối thiểu là 1
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    // Hàm tính tổng giá
    const calculateTotalPrice = () => {
        return product?.price ? product.price * quantity : 0;
    };

    if (!product) return <div className="text-center">Đang tải...</div>;

    // Split product images string into an array
    const productImages = product.images ? product.images.split(',').map(img => img.trim()) : [];

    // Lấy thông tin category và publisher (ví dụ, nếu có trong product object)
    // Giả sử API trả về `product.category.name` và `product.publisher.name`
    // Nếu API chỉ trả về `category_id` và `publisher_id`, bạn sẽ cần fetch thêm data hoặc map trước.
    const categoryName = product.category?.name || 'Đang cập nhật'; // Example
    const publisherName = product.publisher?.name || 'Đang cập nhật'; // Example

    return (
        <div className="product-detail-container container">
            <div className="row product-info-wrapper">
                {/* Left Column: Product Image & Thumbnails */}
                <div className="col-md-5 mb-4">
                    <div className="product-image-gallery">
                        <img
                            src={mainImage ? `${Constanst.DOMAIN_API}/uploads/${mainImage}` : "/images/default-book.jpg"}
                            alt={product.name}
                            className="img-fluid main-product-image"
                        />
                        {/* Thumbnail Images */}
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

                {/* Right Column: Product Details */}
                <div className="col-md-7">
                    <div className="product-main-details">
                        <p className="product-meta">Nhà cung cấp: <strong>{publisherName}</strong></p>
                        <p className="product-meta">Xuất bản: <strong>{publisherName}</strong></p> {/* If publisher is also the exact NXB */}
                        <p className="product-meta">Tác giả: <strong>{product.author || 'Đang cập nhật'}</strong></p>
                        <h1 className="mb-2">{product.name}</h1>

                        <div className="product-price-section">
                            <span className="current-price">
                                {product.price ? product.price.toLocaleString() : 'N/A'} VNĐ
                            </span>
                            {/* Example for original price and discount (if applicable) */}
                            {product.original_price && product.original_price > product.price && (
                                <>
                                    <span className="original-price">
                                        {product.original_price.toLocaleString()} VNĐ
                                    </span>
                                    <span className="discount-tag">
                                        -{((1 - product.price / product.original_price) * 100).toFixed(0)}%
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

            {/* Delivery & Promotion Section */}
            <div className="delivery-promo-section">
                <h5>Thông tin vận chuyển & Ưu đãi</h5>
                <div className="row">
                    <div className="col-md-6">
                        <div className="delivery-item">
                            <FontAwesomeIcon icon={faTruck} />
                            <span>Giao hàng: <strong>Phương Bình Nguyên, Quận 1, Hồ Chí Minh</strong> <a href="#" className="delivery-link">Thay đổi</a></span>
                        </div>
                        <div className="delivery-item">
                            <FontAwesomeIcon icon={faTruck} />
                            <span>Giao hàng tiêu chuẩn: Dự kiến giao <strong>Thứ sáu - 23/05</strong></span>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="promo-item">
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                            <span>Ưu đãi liên quan: <a href="#" className="delivery-link">Xem thêm</a></span>
                        </div>
                        <div className="promo-item">
                            <FontAwesomeIcon icon={faShieldAlt} />
                            <span>Chính sách đổi trả: <strong>Đổi trả miễn phí toàn quốc</strong></span>
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
                        <td>{product.product_code || 'Đang cập nhật'}</td>
                    </tr>
                    <tr>
                        <td>Nhà cung cấp</td>
                        <td>{product.supplier || 'Đang cập nhật'}</td>
                    </tr>
                    <tr>
                        <td>Tác giả</td>
                        <td>{product.author || 'Đang cập nhật'}</td>
                    </tr>
                    <tr>
                        <td>NXB</td>
                        <td>{publisherName}</td>
                    </tr>
                    <tr>
                        <td>Trọng lượng (gr)</td>
                        <td>{product.weight_g || 'Đang cập nhật'}</td>
                    </tr>
                    <tr>
                        <td>Kích thước bao bì</td>
                        <td>{product.dimensions || 'Đang cập nhật'}</td>
                    </tr>
                    <tr>
                        <td>Số trang</td>
                        <td>{product.pages || 'Đang cập nhật'}</td>
                    </tr>
                    <tr>
                        <td>Hình thức</td>
                        <td>{product.format || 'Bìa mềm'}</td>
                    </tr>
                    </tbody>
                </table>


            </div>

            {/* Product Description Section */}
            <div className="product-description-section">
                <h5>Mô tả sản phẩm</h5>
                <div className="product-description-content">
                    <p>{product.description || 'Đang cập nhật mô tả sản phẩm...'}</p>
                    {/* Add more detailed description here if available in product data */}
                    <p>Sách được biên soạn đầy đủ các dạng khác nhau của động từ, tất cả đều có kèm theo phiên âm quốc tế để chỉ rõ cách đọc. Ngoài ra còn có phần biệt rõ các từ có xưa ít dùng và các từ khác biệt giữa cách dùng của Anh, Mỹ.</p>
                    <p>Sách in dạng bỏ túi rất tiện dụng cho học sinh, sinh viên để tham khảo giúp trí nhớ. Có phần hướng dẫn cách thành lập các thì trong tiếng Anh và cách sử dụng trong từng trường hợp, kèm theo các ví dụ minh họa, rất đầy đủ và rõ ràng, dễ hiểu.</p>
                </div>
            </div>

            {/* Product Review Section */}
            <div className="product-review-section">
                <h5>Đánh giá sản phẩm</h5>
                <div className="review-summary">
                    <div className="text-center">
                        <div className="rating-score">0/5</div> {/* Example score */}
                        <div className="star-rating">
                            <FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} />
                        </div>
                    </div>
                    <div className="review-breakdown">
                        <div className="review-row">
                            <span className="stars">5 sao</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '0%' }}></div> {/* Example percentage */}
                            </div>
                            <span className="percentage">0%</span>
                        </div>
                        <div className="review-row">
                            <span className="stars">4 sao</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '0%' }}></div>
                            </div>
                            <span className="percentage">0%</span>
                        </div>
                        <div className="review-row">
                            <span className="stars">3 sao</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '0%' }}></div>
                            </div>
                            <span className="percentage">0%</span>
                        </div>
                        <div className="review-row">
                            <span className="stars">2 sao</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '0%' }}></div>
                            </div>
                            <span className="percentage">0%</span>
                        </div>
                        <div className="review-row">
                            <span className="stars">1 sao</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '0%' }}></div>
                            </div>
                            <span className="percentage">0%</span>
                        </div>
                    </div>
                </div>
                <button className="view-reviews-btn">Viết đánh giá</button>
            </div>
        </div>
    );
};

export default ProductDetail;