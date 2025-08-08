import React, {useEffect, useMemo, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import queryString from "query-string";
import Constants from "../../../Constanst";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import "../../../assets/css/product-listing.css";

const TopSlider = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
    };

    const sliderImages = [
        "https://cdn1.fahasa.com/media/magentothem/banner7/TrangUuDaiT8_840x320_1.png",
        "https://cdn1.fahasa.com/media/magentothem/banner7/CardgameT8_resize_Slide_840x320.png",
        "https://cdn1.fahasa.com/media/magentothem/banner7/Trangtapvo_t8_resize_840x320.png"
    ];

    return (
        <div className="top-slider-container">
            <div className="slider-item">
                <Slider {...settings}>
                    {sliderImages.map((img, index) => (
                        <div key={index}>
                            <img src={img} alt={`Slide ${index + 1}`}
                                 style={{width: "100%", height: "auto", borderRadius: '8px'}}/>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};


// --- ProductCard Component (Được thiết kế lại) ---
const ProductCard = ({product}) => {
    const productPrice = product.price ?? (product.variations?.[0]?.price ?? 0);
    const productImage =
        product.variations?.[0]?.productImages?.[0]?.image_url ??
        product.productImages?.[0]?.image_url ??
        "https://via.placeholder.com/300x300.png?text=No+Image";

    // Dữ liệu giả cho đánh giá và số lượng đã bán để giống với hình ảnh
    const rating = 5;
    const soldCount = Math.floor(Math.random() * 200) + 50; // Random từ 50 đến 250
    const discount = Math.floor(Math.random() * 40) + 10; // Giảm giá giả từ 10-50%

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

// --- Helper function để fetch data (Không đổi) ---
const fetchData = async (url, errorMessage = "Lỗi khi tải dữ liệu:") => {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(errorMessage, err);
        return [];
    }
};


// --- Main Component: ProductClient ---
const ProductClient = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([ // Dữ liệu giả cho Thương hiệu
        {id: 1, name: "Thiên Long"},
        {id: 2, name: "Casio"},
        {id: 3, name: "Deli"},
    ]);
    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [appliedPriceRange, setAppliedPriceRange] = useState({min: null, max: null});
    const [sortOrder, setSortOrder] = useState("newest"); // 'newest', 'popular', 'bestselling', 'price_asc', 'price_desc'

    const location = useLocation();

    useEffect(() => {
        fetchData(`${Constants.DOMAIN_API}/api/products/list`).then(setProducts);
        fetchData(`${Constants.DOMAIN_API}/api/categories/list`).then(setCategories);
    }, []);

    // Logic lấy category từ URL query được giữ lại nhưng điều chỉnh cho phù hợp
    useEffect(() => {
        const params = queryString.parse(location.search);
        const categoryId = params.categoryId ? parseInt(params.categoryId) : null;
        if (categoryId) {
            setSelectedCategories(new Set([categoryId]));
        } else {
            setSelectedCategories(new Set());
        }
    }, [location.search]);

    const categoryParents = useMemo(
        () => categories.filter((c) => c.parent_id === null),
        [categories]
    );

    const handleCategoryChange = (categoryId) => {
        // Giao diện checkbox nhưng hoạt động như radio button để giữ logic cũ (chỉ lọc theo 1 danh mục)
        const newSelected = new Set();
        if (!selectedCategories.has(categoryId)) {
            newSelected.add(categoryId);
        }
        setSelectedCategories(newSelected);
    };
    
    const handleApplyCustomPrice = () => {
        setAppliedPriceRange({min: parseFloat(minPrice) || null, max: parseFloat(maxPrice) || null});
    };

    const processedProducts = useMemo(() => {
        let currentFilteredProducts = products.filter((product) => {
            if (product.status !== 1) return false;

            // Lọc theo danh mục
            let matchesCategory = true;
            if (selectedCategories.size > 0) {
                const selectedCatId = selectedCategories.values().next().value;
                const parentCat = categoryParents.find(p => p.id === selectedCatId);
                if (parentCat) { // Nếu là danh mục cha
                    const childCatIds = categories.filter(c => c.parent_id === selectedCatId).map(c => c.id);
                    matchesCategory = childCatIds.includes(product.category_id);
                } else { // Nếu là danh mục con (logic cũ)
                    matchesCategory = product.category_id === selectedCatId;
                }
            }

            // Lọc theo giá
            let matchesPriceRange = true;
            const price = product.price ?? 0;
            const {min, max} = appliedPriceRange;
            if (min !== null && price < min) matchesPriceRange = false;
            if (max !== null && price > max) matchesPriceRange = false;

            return matchesCategory && matchesPriceRange;
        });

        // Sắp xếp
        switch (sortOrder) {
            case 'price_asc':
                currentFilteredProducts.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
                break;
            case 'price_desc':
                currentFilteredProducts.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
                break;
            case 'newest':
            default:
                currentFilteredProducts.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
                break;
        }

        return currentFilteredProducts;
    }, [products, categories, selectedCategories, appliedPriceRange, sortOrder, categoryParents]);

    const discoverCategories = [
        {name: "English book", icon: "https://cdn1.fahasa.com/media/wysiwyg/Thang-08-2025/Icon_88_120x120.png"},
        {name: "Sách tiếng Việt", icon: "https://cdn1.fahasa.com/media/wysiwyg/Thang-06-2024/icon_ManngaT06.png"},
        {name: "Văn phòng phẩm", icon: "https://cdn1.fahasa.com/media/wysiwyg/HUYEN-1/8936235570006-1.jpg"},
        {name: "Quà lưu niệm", icon: "https://cdn1.fahasa.com/media/wysiwyg/Duy-VHDT/ngoai-van-t1-24(1).jpg"},
    ]

    return (
        <div className="product-listing-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb-nav">
                    <Link to="/">Trang chủ</Link>
                    <span>›</span>
                    <span>Nhà sách Hồng Ân</span>
                </nav>

                <div className="row">
                    {/* Sidebar */}
                    <aside className="col-lg-3">
                        <div className="filter-sidebar">
                            <h4 className="filter-title">▼ BỘ LỌC TÌM KIẾM</h4>

                            {/* Lọc theo danh mục */}
                            <div className="filter-block">
                                <h5 className="filter-block__title">Theo danh mục</h5>
                                <ul className="filter-block__content filter-list">
                                    {categoryParents.map(cat => (
                                        <li key={cat.id}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.has(cat.id)}
                                                    onChange={() => handleCategoryChange(cat.id)}
                                                />
                                                {cat.name}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Lọc theo thương hiệu (Dữ liệu giả) */}
                            <div className="filter-block">
                                <h5 className="filter-block__title">Thương hiệu</h5>
                                <ul className="filter-block__content filter-list">
                                    {brands.map(brand => (
                                        <li key={brand.id}>
                                            <label>
                                                <input type="checkbox"/> {brand.name}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Lọc theo giá */}
                            <div className="filter-block">
                                <h5 className="filter-block__title">Khoảng giá</h5>
                                <div className="filter-block__content">
                                    <div className="price-range-inputs">
                                        <input type="number" placeholder="Từ" value={minPrice}
                                               onChange={(e) => setMinPrice(e.target.value)}/>
                                        <span>-</span>
                                        <input type="number" placeholder="Đến" value={maxPrice}
                                               onChange={(e) => setMaxPrice(e.target.value)}/>
                                    </div>
                                    <button className="apply-price-btn" onClick={handleApplyCustomPrice}>Áp dụng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="col-lg-9">
                        <TopSlider/>

                        {/* Khám phá theo danh mục */}
                        <div className="discover-by-category">
                            <h4>Khám phá theo danh mục</h4>
                            <div className="discover-grid">
                                {discoverCategories.map(cat => (
                                    <Link to="#" key={cat.name} className="discover-item">
                                        <img src={cat.icon} alt={cat.name}/>
                                        <span>{cat.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="product-main-content">
                            <div className="toolbar">
                                <span className="sort-options__label">Sắp xếp theo</span>
                                <div className="sort-options">
                                    <button className={`sort-options__btn ${sortOrder === "newest" ? "active" : ""}`}
                                            onClick={() => setSortOrder("newest")}>Mới nhất
                                    </button>
                                    <button className={`sort-options__btn ${sortOrder === "popular" ? "active" : ""}`}
                                            onClick={() => setSortOrder("popular")}>Phổ biến
                                    </button>
                                    <button
                                        className={`sort-options__btn ${sortOrder === "bestselling" ? "active" : ""}`}
                                        onClick={() => setSortOrder("bestselling")}>Bán chạy
                                    </button>
                                    <button className={`sort-options__btn ${sortOrder === "price_asc" ? "active" : ""}`}
                                            onClick={() => setSortOrder("price_asc")}>Giá thấp
                                    </button>
                                    <button
                                        className={`sort-options__btn ${sortOrder === "price_desc" ? "active" : ""}`}
                                        onClick={() => setSortOrder("price_desc")}>Giá cao
                                    </button>
                                </div>
                            </div>
                            <div className="product-grid">
                                {processedProducts.length > 0 ? (
                                    processedProducts.map((product) => (
                                        <ProductCard key={product.id} product={product}/>))
                                ) : (
                                    <div className="no-products-found">
                                        <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProductClient;