import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faShoppingCart,
    faStar,
    faBolt,
    faShop,
    faHeart,
    faBook,
    faTags,
    faBoxOpen,
    faDollarSign,
    faFire,
    faFeatherAlt, // Added for placeholder icon, you can change
    faBookmark, // Added for placeholder icon, you can change
    faStore, // Added for placeholder icon, you can change
} from '@fortawesome/free-solid-svg-icons';
import '../../../assets/css/home.css'; // Import the new CSS file

const Home = () => {
    return (
        <div className="min-vh-100">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="container">
                    <div className="row justify-content-between align-items-center">
                        <div className="col-lg-5">
                            <div className="intro-excerpt">
                                <h1>Sách Hay <span className="d-block">Thế Giới Tri Thức</span></h1>
                                <p className="mb-4">
                                    Khám phá thế giới qua từng trang sách. Không gì tuyệt vời hơn việc đắm mình trong
                                    những câu chuyện và kiến thức mới mẻ.
                                </p>
                                <div className="hero-button-group">
                                    <a href="#" className="btn btn-secondary me-2">Mua Ngay</a>
                                    <a href="#" className="btn btn-white-outline">Khám Phá</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini Banners */}
            <div className="container py-4">
                <div className="row">
                    {[
                        {
                            img: "https://via.placeholder.com/400x200/FF6F61/fff?text=Thứ+4+vàng",
                            title: "THỨ 4 NGÀY VÀNG",
                            subtitle: "FREESHIP NGẬP TRÀN"
                        },
                        {
                            img: "https://via.placeholder.com/400x200/FFA07A/fff?text=Đồ+Chơi",
                            title: "GIAN HÀNG ĐỒ CHƠI",
                            subtitle: "CÙNG VUI MUÔN NƠI"
                        },
                        {
                            img: "https://via.placeholder.com/400x200/87CEFA/fff?text=Đinh+Tị+Books",
                            title: "CÙNG ĐINH TỊ BOOKS",
                            subtitle: "GIẢM GIÁ LÊN ĐẾN 50%"
                        },
                        {
                            img: "https://via.placeholder.com/400x200/FFE4B5/000?text=Best+Deals",
                            title: "HOT PICKS, COOL PRICES!",
                            subtitle: "MAY'S BEST DEALS"
                        }
                    ].map((banner, index) => (
                        <div className="col-12 col-sm-6 col-lg-3 mb-3" key={index}>
                            <div className="mini-banner-card">
                                <img src={banner.img} alt={`Banner ${index + 1}`} />
                                <div className="mini-banner-content">
                                    <p>
                                        {banner.title}<br />{banner.subtitle}
                                    </p>
                                    <button className="btn btn-danger">MUA NGAY</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Horizontal Categories (Quick Links) */}
            <div className="quick-links-section">
                <div className="container">
                    <div className="d-flex justify-content-center gap-3 overflow-auto pb-2 flex-nowrap">
                        {[
                            { icon: faStar, label: "25.05" },
                            { icon: faBolt, label: "Flash Sale" },
                            { icon: faShop, label: "Đinh Tị" },
                            { icon: faBook, label: "McBooks" },
                            { icon: faTags, label: "Mã Giảm Giá" },
                            { icon: faFire, label: "Sản Phẩm Mới" },
                            { icon: faDollarSign, label: "Được Trợ Giá" },
                            { icon: faBoxOpen, label: "Đồ Cũ" },
                            { icon: faShoppingCart, label: "Bán Sỉ" },
                            { icon: faBookmark, label: "Manga" }
                        ].map((item, index) => (
                            <a href="#" key={index} className="quick-link-item">
                                <div className="quick-link-icon-wrapper">
                                    <FontAwesomeIcon icon={item.icon} />
                                </div>
                                <div className="quick-link-label">{item.label}</div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Flash Sale Header */}
            <div className="flash-sale-header">
                <div className="mb-2 mb-md-0">
                    <span className="flash-sale-title">FLASH SALE</span>
                    <span className="flash-sale-countdown">Kết thúc trong: 01 : 11 : 50</span>
                </div>
                <a href="#" className="flash-sale-link">Xem tất cả &gt;</a>
            </div>

            {/* Flash Sale Products */}
            <div className="flash-sale-products-section">
                <div className="container">
                    <div className="row">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="col-6 col-md-4 col-lg-2 mb-4">
                                <div className="flash-sale-product-card">
                                    <img
                                        src={`https://picsum.photos/seed/flash${index + 1}/200/200`}
                                        alt={`Flash Sale ${index + 1}`}
                                    />
                                    <h3>Sách Flash {index + 1}</h3>
                                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                                        <div>
                                            <p className="flash-sale-price">55.000 đ</p>
                                            <p className="flash-sale-original-price">85.000 đ</p>
                                        </div>
                                        <span className="flash-sale-discount-badge">-35%</span>
                                    </div>
                                    <button className="flash-sale-btn">Đặt hàng</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Categories */}
            <div className="product-categories-section">
                <div className="container">
                    <h2 className="mb-4">
                        <FontAwesomeIcon icon={faBook} className="icon" />
                        Danh mục sản phẩm
                    </h2>
                    <div className="d-flex flex-wrap justify-content-center gap-3">
                        {[...Array(10)].map((_, index) => (
                            <a href="#" key={index} className="category-item">
                                <div className="category-icon-wrapper">
                                    <img src={`https://via.placeholder.com/40?text=Cat${index + 1}`} alt={`Danh mục ${index + 1}`} />
                                </div>
                                <span className="category-label">Danh mục {index + 1}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trending Products */}
            <div className="trending-products-section">
                <div className="container">
                    <h2 className="mb-4">
                        <FontAwesomeIcon icon={faHeart} className="icon" />
                        Xu Hướng Mua Sắm
                    </h2>
                    {[0, 1].map((row) => (
                        <div key={row} className="row mb-3">
                            {[...Array(6)].map((_, i) => {
                                const index = row * 6 + i;
                                return (
                                    <div key={index} className="col-6 col-md-4 col-lg-2 mb-4">
                                        <div className="trending-product-card">
                                            <div className="trending-product-image-wrapper">
                                                <img
                                                    src={`https://picsum.photos/seed/trend${index}/300/200`}
                                                    alt={`Xu hướng ${index + 1}`}
                                                />
                                                <div className="trending-discount-badge">Giảm 30%</div>
                                            </div>
                                            <div className="trending-product-content">
                                                <h3>Sản phẩm xu hướng {index + 1}</h3>
                                                <div className="trending-price-info">
                                                    <div>
                                                        <p className="trending-current-price">{(100000 + index * 10000).toLocaleString('vi-VN')} đ</p>
                                                        <p className="trending-original-price">{(150000 + index * 10000).toLocaleString('vi-VN')} đ</p>
                                                    </div>
                                                    <span className="trending-discount-label">-30%</span>
                                                </div>
                                                <button className="trending-btn">Đặt hàng</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Collections */}
            <div className="collections-section">
                <div className="container">
                    <div className="section-header">
                        <h5 className="fw-bold text-center">
                            <FontAwesomeIcon icon={faStar} className="me-2" /> BỘ SƯU TẬP NỔI BẬT
                        </h5>
                    </div>
                    <div className="d-flex flex-wrap justify-content-center gap-4">
                        {[
                            "Baby Three",
                            "Doremon",
                            "Capybara",
                            "Conan",
                            "One Piece",
                            "Panda - Gấu trúc",
                            "Disney",
                            "Sanrio"
                        ].map((name, idx) => (
                            <a href="#" key={idx} className="collection-item">
                                <img
                                    src={`https://via.placeholder.com/80?text=${name.split(" ")[0]}`}
                                    alt={name}
                                />
                                <p>{name}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Brands */}
            <div className="brands-section mb-5">
                <div className="container">
                    <div className="section-header">
                        <h5 className="fw-bold">
                            <FontAwesomeIcon icon={faStore} className="icon" /> Thương hiệu nổi bật
                        </h5>
                    </div>
                    <Tabs defaultActiveKey="Sbooks" className="mb-3">
                        {["Sbooks", "Đinh Tị", "Patech"].map((brand, index) => (
                            <Tab eventKey={brand} title={brand} key={index}>
                                <div className="row">
                                    {[...Array(6)].map((_, i) => (
                                        <div className="col-6 col-md-4 col-lg-2 mb-3" key={i}>
                                            <div className="brand-product-card">
                                                <img
                                                    src={`https://via.placeholder.com/150x220?text=Book+${i + 1}`}
                                                    alt="book"
                                                />
                                                <p className="trend-badge">Xu hướng <FontAwesomeIcon icon={faFire} /></p>
                                                <h3>Tên sách mẫu {i + 1}</h3>
                                                <p className="price-info">Giá: <strong>69.000đ</strong></p>
                                                <p className="sold-info">Đã bán: {Math.floor(Math.random() * 1000)}+</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Tab>
                        ))}
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default Home;