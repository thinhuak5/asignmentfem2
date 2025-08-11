import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Constanst from "../../../Constanst";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faBolt,
    faBook,
    faBookmark,
    faChevronRight,
    faDollarSign,
    faFire,
    faHeart,
    faStar,
    faStore,
    faTags
} from '@fortawesome/free-solid-svg-icons';

import '../../../assets/css/home.css';

const ProductCard = ({product}) => {
    const productPrice = product.price ?? (product.variations?.[0]?.price ?? 0);
    const productImage =
        product.variations?.[0]?.productImages?.[0]?.image_url ??
        product.productImages?.[0]?.image_url ??
        "https://via.placeholder.com/300x300.png?text=No+Image";

    const rating = 5;
    const soldCount = Math.floor(Math.random() * 200) + 50;
    const discount = Math.floor(Math.random() * 40) + 10;

    return (
        <Link to={`/product/${product.id}`} className="product-card">
            <div className="product-card__image-container">
                <img src={productImage} className="product-card__image" alt={product.name}/>
                {discount > 0 && <div className="product-card__discount">-{discount}%</div>}
            </div>
            <div className="product-card__info">
                <h3 className="product-card__name" title={product.name}>{product.name}</h3>
                <div className="product-card__price-n-rating">
                    <div className="product-card__price">
                        {productPrice.toLocaleString()}đ
                    </div>
                    <div className="product-card__review">
                        {[...Array(rating)].map((_, i) => <FontAwesomeIcon key={i} icon={faStar}
                                                                           className="star-icon"/>)}
                        <span className="sold-count">Đã bán {soldCount}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};


const Home = () => {
    const [categoryParents, setCategoryParents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategoryParents = async () => {
            try {
                const res = await fetch(`${Constanst.DOMAIN_API}/api/categoryparents`);
                if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu danh mục cha");
                const data = await res.json();
                setCategoryParents(data);
            } catch (err) {
                console.error("Lỗi fetch category parent:", err);
            }
        };

        fetchCategoryParents();
    }, []);

    const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    // --- DỮ LIỆU MẪU ĐÃ ĐƯỢC CẬP NHẬT ĐỂ PHÙ HỢP VỚI ProductCard ---
    const homeFlashSaleProducts = [
        {
            id: "fs-1",
            name: "Tâm Lý Học Về Tiền",
            price: 55000,
            productImages: [{image_url: "https://cdn1.fahasa.com/media/catalog/product/i/m/image_220008.jpg"}]
        },
        {
            id: "fs-2",
            name: "Muôn Kiếp Nhân Sinh",
            price: 125000,
            productImages: [{image_url: "https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg"}]
        },
        {
            id: "fs-3",
            name: "Nhà Giả Kim (Tái bản 2023)",
            price: 49000,
            productImages: [{image_url: "https://cdn1.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg"}]
        },
        {
            id: "fs-4",
            name: "Cây Cam Ngọt Của Tôi",
            price: 71000,
            productImages: [{image_url: "https://cdn1.fahasa.com/media/catalog/product/i/m/image_217480.jpg"}]
        },
        {
            id: "fs-5",
            name: "Lược Sử Loài Người",
            price: 159000,
            productImages: [{image_url: "https://cdn1.fahasa.com/media/catalog/product/b/_/b_a-sapiens.jpg"}]
        },
        {
            id: "fs-6",
            name: "Đắc Nhân Tâm",
            price: 56000,
            productImages: [{image_url: "https://cdn1.fahasa.com/media/catalog/product/9/7/9786043949247.jpg"}]
        }
    ];

    const homeTrendingProducts = [
        {
            id: "tr-1",
            name: "Atomic Habits - Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ",
            price: 119000,
            productImages: [{image_url: "https://cdn0.fahasa.com/media/catalog/product/a/t/atomic-habits_1.jpg"}]
        },
        {
            id: "tr-2",
            name: "Bố Già (Phiên bản điện ảnh)",
            price: 135000,
            productImages: [{image_url: "https://cdn0.fahasa.com/media/catalog/product/b/o/bo-gia---mario-puzo---phien-ban-dien-anh-bia-mem_1.jpg"}]
        },
        {
            id: "tr-3",
            name: "Hoàng Tử Bé",
            price: 45000,
            productImages: [{image_url: "https://cdn0.fahasa.com/media/catalog/product/8/9/8934974187232.jpg"}]
        },
        {
            id: "tr-4",
            name: "Your Name",
            price: 89000,
            productImages: [{image_url: "https://cdn0.fahasa.com/media/catalog/product/i/m/image_223916.jpg"}]
        },
        {
            id: "tr-5",
            name: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
            price: 79000,
            productImages: [{image_url: "https://cdn0.fahasa.com/media/catalog/product/t/o/toi-thay-hoa-vang-tren-co-xanh---tai-ban-2022.jpg"}]
        },
        {
            id: "tr-6",
            name: "Mắt Biếc",
            price: 88000,
            productImages: [{image_url: "https://cdn0.fahasa.com/media/catalog/product/m/a/mat-biec_bia_1_6-1_1.jpg"}]
        },
    ];


    return (
        <div className="home-container">
            {/* Hero Section (Giữ nguyên) */}
            <section className="hero-section">
                <div className="container">
                    <div className="row justify-content-between align-items-center">
                        <div className="col-lg-6">
                            <div className="intro-excerpt">
                                <h1>Sách Hay <span className="d-block">Mở Ra Tri Thức</span></h1>
                                <p className="mb-4">Khám phá thế giới qua từng trang sách. Không gì tuyệt vời hơn việc
                                    đắm mình trong những câu chuyện và kiến thức mới mẻ.</p>
                                <p>
                                    <Link to="/product" className="btn btn-secondary me-2">Mua Ngay</Link>
                                    <Link to="/product" className="btn btn-white-outline">Khám Phá</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Links Section (Giữ nguyên) */}
            <section className="quick-links-section">
                <div className="container">
                    <div className="quick-links-wrapper">
                        {[{icon: faStar, label: "Sale 25.05"}, {icon: faBolt, label: "Flash Sale"}, {
                            icon: faTags,
                            label: "Mã Giảm Giá"
                        }, {icon: faFire, label: "Sản Phẩm Mới"}, {
                            icon: faDollarSign,
                            label: "Rẻ Vô Đối"
                        }, {icon: faBookmark, label: "Manga - Comic"}].map((item, index) => (
                            <Link to={`/products?tag=${slugify(item.label)}`} key={index} className="quick-link-item">
                                <div className="quick-link-icon-wrapper">
                                    <FontAwesomeIcon icon={item.icon} />
                                </div>
                                <span className="quick-link-label">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Flash Sale Section (ĐÃ CẬP NHẬT VỚI CARD MỚI) --- */}
            <section className="product-section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-title-container">
                            <span className="flash-sale-countdown">Kết thúc trong: 01 : 11 : 50</span>
                        </div>
                        <Link to="/flash-sale" className="section-view-all">Xem tất cả <FontAwesomeIcon
                            icon={faChevronRight}/></Link>
                    </div>
                    <div className="product-grid-home">
                        {homeFlashSaleProducts.map((product) => (
                            <ProductCard key={product.id} product={product}/>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product Categories Section (Giữ nguyên) */}
            <section className="product-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faBook} className="me-2"/> Danh Mục Nổi Bật
                        </h2>
                    </div>
                    <div className="category-grid">
                        {categoryParents.length > 0 ? (
                            categoryParents.map((item, index) => (
                                <div
                                    key={index}
                                    className="category-item"
                                    onClick={() => navigate(`/product?categoryparentId=${item.id}`)}
                                >
                                    <img
                                        src={item.image ? `${Constanst.DOMAIN_API}/uploads/${item.image}` : `https://via.placeholder.com/80?text=...`}
                                        alt={item.name}
                                        className="category-image"
                                    />
                                    <span className="category-label">{item.name}</span>
                                </div>
                            ))
                        ) : (
                            [...Array(12)].map((_, index) => (
                                <div key={index} className="category-item-placeholder">
                                    <div className="category-image-placeholder"></div>
                                    <div className="category-label-placeholder"></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* --- Trending Products Section (ĐÃ CẬP NHẬT VỚI CARD MỚI) --- */}
            <section className="product-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faHeart} className="me-2"/> Xu Hướng Mua Sắm
                        </h2>
                        <Link to="/trending" className="section-view-all">Xem thêm <FontAwesomeIcon
                            icon={faChevronRight}/></Link>
                    </div>
                    <div className="product-grid-home">
                        {homeTrendingProducts.map((product) => (
                            <ProductCard key={product.id} product={product}/>
                        ))}
                    </div>
                </div>
            </section>

            {/* Brands Section (Giữ nguyên) */}
            <section className="brands-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faStore} className="me-2"/> Thương Hiệu Nổi Bật
                        </h2>
                    </div>
                    <div className="row justify-content-center align-items-center">
                        {["nhanam", "alphabooks", "kimdong", "nxbtre", "firstnews", "dinhti"].map((brand, index) => (
                            <div key={index} className="col-4 col-md-2 text-center mb-3">
                                <Link to={`/brand/${brand}`} className="brand-logo-wrapper">
                                    <img
                                        src={`https://cdn0.fahasa.com/media/wysiwyg/Thang-10-2023/${brand}_logo.png`}
                                        alt={`Thương hiệu ${brand}`}
                                        className="brand-logo"
                                    />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;