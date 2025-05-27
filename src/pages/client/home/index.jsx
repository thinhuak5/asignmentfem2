import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom'; // Thêm để điều hướng
import Constanst from "../../../Constanst";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faBolt,
    faBook,
    faBookmark,
    faBoxOpen,
    faDollarSign,
    faFire,
    faHeart,
    faShop,
    faShoppingCart,
    faStar,
    faStore,
    faTags,
} from '@fortawesome/free-solid-svg-icons';
import '../../../assets/css/home.css'; // Import the new CSS file

const Home = () => {
    // Đổi tên state thành categoryParents
    const [categoryParents, setCategoryParents] = useState([]);
    const navigate = useNavigate(); // Khai báo navigate

    useEffect(() => {
        const fetchCategoryParents = async () => {
            try {
                // Lấy danh sách danh mục cha
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
                    {[{
                        img: "https://via.placeholder.com/400x200/FF6F61/fff?text=Thứ+4+vàng",
                        title: "THỨ 4 NGÀY VÀNG",
                        subtitle: "FREESHIP NGẬP TRÀN"
                    }, {
                        img: "https://via.placeholder.com/400x200/FFA07A/fff?text=Đồ+Chơi",
                        title: "GIAN HÀNG ĐỒ CHƠI",
                        subtitle: "CÙNG VUI MUÔN NƠI"
                    }, {
                        img: "https://via.placeholder.com/400x200/87CEFA/fff?text=Đinh+Tị+Books",
                        title: "CÙNG ĐINH TỊ BOOKS",
                        subtitle: "GIẢM GIÁ LÊN ĐẾN 50%"
                    }, {
                        img: "https://via.placeholder.com/400x200/FFE4B5/000?text=Best+Deals",
                        title: "HOT PICKS, COOL PRICES!",
                        subtitle: "MAY'S BEST DEALS"
                    }].map((banner, index) => (
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
                        {[{icon: faStar, label: "25.05"}, {icon: faBolt, label: "Flash Sale"}, {
                            icon: faShop,
                            label: "Đinh Tị"
                        }, {icon: faBook, label: "McBooks"}, {icon: faTags, label: "Mã Giảm Giá"}, {
                            icon: faFire,
                            label: "Sản Phẩm Mới"
                        }, {icon: faDollarSign, label: "Được Trợ Giá"}, {
                            icon: faBoxOpen,
                            label: "Đồ Cũ"
                        }, {icon: faShoppingCart, label: "Bán Sỉ"}, {
                            icon: faBookmark,
                            label: "Manga"
                        }].map((item, index) => (
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

            {/* Product Categories - Sửa thành categoryParents */}
            <div className="product-categories-section">
                <div className="container">
                    <h2 className="mb-4">
                        <FontAwesomeIcon icon={faBook} className="icon" />
                        Danh mục sản phẩm
                    </h2>
                    <div className="d-flex flex-wrap justify-content-center gap-3">
                        {categoryParents.length > 0 ? (
                            categoryParents.map((item, index) => (
                                <div
                                    key={index}
                                    className="category-item"
                                    style={{cursor: 'pointer'}}
                                    onClick={() => navigate(`/product?categoryparentId=${item.id}`)}
                                >
                                    <div className="category-icon-wrapper">
                                        {item.image ? (
                                            <img
                                                src={`${Constanst.DOMAIN_API}/uploads/${item.image}`}
                                                alt={item.name}
                                            />
                                        ) : (
                                            <img
                                                src={`https://via.placeholder.com/40?text=No+Image`}
                                                alt="No Image"
                                            />
                                        )}
                                    </div>
                                    <span className="category-label">{item.name}</span>
                                </div>
                            ))
                        ) : (
                            // Phần fallback nếu chưa có categoryParents
                            [...Array(10)].map((_, index) => (
                                <a href="#" key={index} className="category-item">
                                    <div className="category-icon-wrapper">
                                        <img
                                            src={`https://via.placeholder.com/40?text=Cat${index + 1}`}
                                            alt={`Danh mục ${index + 1}`}
                                        />
                                    </div>
                                    <span className="category-label">Danh mục {index + 1}</span>
                                </a>
                            ))
                        )}

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
                                            <div className="trending-product-img-wrapper">
                                                <img
                                                    src={`https://picsum.photos/seed/trending${index + 1}/200/200`}
                                                    alt={`Xu hướng ${index + 1}`}
                                                />
                                            </div>
                                            <h3>Xu hướng {index + 1}</h3>
                                            <p className="trending-product-price">79.000 đ</p>
                                            <button className="trending-product-btn">Mua ngay</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Brands Section */}
            <div className="brands-section py-4">
                <div className="container">
                    <h2 className="mb-4">
                        <FontAwesomeIcon icon={faStore} className="icon"/>
                        Thương hiệu nổi bật
                    </h2>
                    <div className="row justify-content-center align-items-center">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="col-6 col-md-2 text-center mb-3">
                                <div className="brand-logo-wrapper">
                                    <img
                                        src={`https://picsum.photos/seed/brand${index + 1}/120/120`}
                                        alt={`Thương hiệu ${index + 1}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
