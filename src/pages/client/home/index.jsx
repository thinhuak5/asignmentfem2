import React, {useEffect, useState} from 'react';
// Thay useNavigate bằng Link để điều hướng chuẩn hơn
import {Link, useNavigate} from 'react-router-dom';
import Constanst from "../../../Constanst";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
// Đã xóa các icon không sử dụng như faBoxOpen, faShop, faShoppingCart
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

// Import CSS cho trang Home
import '../../../assets/css/home.css';

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

    // Helper function để tạo URL thân thiện từ label
    const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');


    // Dữ liệu giả để giao diện trông đẹp hơn
    const flashSaleProducts = [
        {
            name: "Tâm Lý Học Về Tiền",
            price: "55.000 đ",
            originalPrice: "85.000 đ",
            discount: "-35%",
            sold: 88,
            total: 100,
            img: "https://cdn0.fahasa.com/media/catalog/product/t/a/tam-ly-hoc-ve-tien_bia_1_2.jpg"
        },
        {
            name: "Muôn Kiếp Nhân Sinh",
            price: "125.000 đ",
            originalPrice: "189.000 đ",
            discount: "-34%",
            sold: 120,
            total: 150,
            img: "https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg"
        },
        {
            name: "Nhà Giả Kim",
            price: "49.000 đ",
            originalPrice: "79.000 đ",
            discount: "-38%",
            sold: 250,
            total: 300,
            img: "https://cdn0.fahasa.com/media/catalog/product/n/h/nha-gia-kim--phien-ban-moi-2023.jpg"
        },
        {
            name: "Cây Cam Ngọt Của Tôi",
            price: "71.000 đ",
            originalPrice: "108.000 đ",
            discount: "-34%",
            sold: 95,
            total: 120,
            img: "https://cdn0.fahasa.com/media/catalog/product/i/m/image_235887.jpg"
        },
        {
            name: "Lược Sử Loài Người",
            price: "159.000 đ",
            originalPrice: "245.000 đ",
            discount: "-35%",
            sold: 50,
            total: 100,
            img: "https://cdn0.fahasa.com/media/catalog/product/l/u/luoc-su-loai-nguoi---bia-mem-_tai-ban-2023_.jpg"
        },
        {
            name: "Đắc Nhân Tâm",
            price: "56.000 đ",
            originalPrice: "78.000 đ",
            discount: "-28%",
            sold: 312,
            total: 400,
            img: "https://cdn0.fahasa.com/media/catalog/product/d/n/dnt_1.jpg"
        }
    ];

    const trendingProducts = [
        {
            name: "Atomic Habits",
            price: "119.000 đ",
            sold: "12.5k",
            img: "https://cdn0.fahasa.com/media/catalog/product/a/t/atomic-habits_1.jpg"
        },
        {
            name: "Bố Già",
            price: "135.000 đ",
            sold: "8.2k",
            img: "https://cdn0.fahasa.com/media/catalog/product/b/o/bo-gia---mario-puzo---phien-ban-dien-anh-bia-mem_1.jpg"
        },
        {
            name: "Hoàng Tử Bé",
            price: "45.000 đ",
            sold: "25.1k",
            img: "https://cdn0.fahasa.com/media/catalog/product/8/9/8934974187232.jpg"
        },
        {
            name: "Your Name",
            price: "89.000 đ",
            sold: "9.8k",
            img: "https://cdn0.fahasa.com/media/catalog/product/i/m/image_223916.jpg"
        },
        {
            name: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
            price: "79.000 đ",
            sold: "15.3k",
            img: "https://cdn0.fahasa.com/media/catalog/product/t/o/toi-thay-hoa-vang-tren-co-xanh---tai-ban-2022.jpg"
        },
        {
            name: "Mắt Biếc",
            price: "88.000 đ",
            sold: "18.9k",
            img: "https://cdn0.fahasa.com/media/catalog/product/m/a/mat-biec_bia_1_6-1_1.jpg"
        },
    ];


    return (
        <div className="home-container">
            {/* Hero Section */}
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

            {/* Quick Links Section */}
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
                            // SỬA: Dùng Link thay cho a href="#"
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

            {/* Flash Sale Section */}
            <section className="product-section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-title-container">
                            <img src="https://salt.tikicdn.com/ts/upload/52/ce/a6/226c656f5a33c14a298a03a743e75a33.png"
                                 alt="Flash Sale" className="section-title-icon"/>
                            <span className="flash-sale-countdown">Kết thúc trong: 01 : 11 : 50</span>
                        </div>
                        <Link to="/flash-sale" className="section-view-all">Xem tất cả <FontAwesomeIcon
                            icon={faChevronRight}/></Link>
                    </div>
                    <div className="row">
                        {flashSaleProducts.map((product, index) => (
                            <div key={index} className="col-6 col-md-4 col-lg-2 mb-4">
                                <div className="product-card product-card--flash-sale"
                                     onClick={() => navigate(`/product-detail/${slugify(product.name)}`)}>
                                    <div className="product-image-wrapper">
                                        <img src={product.img} alt={product.name} className="product-image"/>
                                        <div className="product-discount-badge">{product.discount}</div>
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product.name}</h3>
                                        <div className="product-price-container">
                                            <span className="product-price">{product.price}</span>
                                            <span className="product-original-price">{product.originalPrice}</span>
                                        </div>
                                        <div className="flash-sale-progress-bar">
                                            <div className="flash-sale-progress"
                                                 style={{width: `${(product.sold / product.total) * 100}%`}}></div>
                                            <span className="flash-sale-status">Đã bán {product.sold}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product Categories Section */}
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

            {/* Trending Products Section */}
            <section className="product-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faHeart} className="me-2"/> Xu Hướng Mua Sắm
                        </h2>
                        <Link to="/trending" className="section-view-all">Xem thêm <FontAwesomeIcon
                            icon={faChevronRight}/></Link>
                    </div>
                    <div className="row">
                        {trendingProducts.map((product, index) => (
                            <div key={index} className="col-6 col-md-4 col-lg-2 mb-4">
                                <div className="product-card"
                                     onClick={() => navigate(`/product-detail/${slugify(product.name)}`)}>
                                    <div className="product-image-wrapper">
                                        <img src={product.img} alt={product.name} className="product-image"/>
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product.name}</h3>
                                        <div className="product-review">
                                            <FontAwesomeIcon icon={faStar} className="star-icon"/>
                                            <FontAwesomeIcon icon={faStar} className="star-icon"/>
                                            <FontAwesomeIcon icon={faStar} className="star-icon"/>
                                            <FontAwesomeIcon icon={faStar} className="star-icon"/>
                                            <FontAwesomeIcon icon={faStar} className="star-icon"/>
                                            <span className="product-sold-count">Đã bán {product.sold}</span>
                                        </div>
                                        <div className="product-price-container">
                                            <span className="product-price">{product.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Brands Section */}
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