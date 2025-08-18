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

/* ======================= slider top ======================= */
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
        "https://cdn1.fahasa.com/media/magentothem/banner7/Trangtapvo_t8_resize_840x320.png",
        "https://cdn1.fahasa.com/media/magentothem/banner7/TrangUuDaiT8_840x320_1.png",
        "https://cdn1.fahasa.com/media/magentothem/banner7/CardgameT8_resize_Slide_840x320.png",
    ];

    return (
        <div className="top-slider-container">
            <div className="slider-item">
                <Slider {...settings}>
                    {sliderImages.map((img, index) => (
                        <div key={index}>
                            <img
                                src={img}
                                alt={`Slide ${index + 1}`}
                                style={{width: "100%", height: "auto", borderRadius: "8px"}}
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

/* ======================= helpers ======================= */
const isNum = (v) => typeof v === "number" && Number.isFinite(v);

const getDisplayPrice = (product) => {
    if (isNum(product?.price)) return product.price;
    const vPrices = Array.isArray(product?.variations)
        ? product.variations
            .map((v) => Number(v?.price))
            .filter((n) => Number.isFinite(n))
        : [];
    if (vPrices.length) return Math.min(...vPrices);
    return 0;
};

const getFirstImage = (product) =>
    product?.variations?.[0]?.productImages?.[0]?.image_url ||
    product?.productImages?.[0]?.image_url ||
    "https://via.placeholder.com/300x300.png?text=No+Image";

/* ======================= thẻ sản phẩm ======================= */
const ProductCard = ({product}) => {
    const productPrice = getDisplayPrice(product);
    const productImage = getFirstImage(product);

    const rating = 5; // demo UI
    const soldCount = Math.floor(Math.random() * 200) + 50; // demo UI
    const discount = Math.floor(Math.random() * 40) + 10; // demo UI

    return (
        <Link to={`/product/${product.id}`} className="product-card">
            <div className="product-card__image-container">
                <img src={productImage} className="product-card__image" alt={product?.name || "product"}/>
                {discount > 0 && <div className="product-card__discount">-{discount}%</div>}
            </div>
            <div className="product-card__info">
                <h3 className="product-card__name" title={product?.name}>
                    {product?.name}
                </h3>
                <div className="product-card__price-n-rating">
                    <div className="product-card__price">
                        {(Number(productPrice) || 0).toLocaleString("vi-VN")}đ
                    </div>
                    <div className="product-card__review">
                        {[...Array(rating)].map((_, i) => (
                            <FontAwesomeIcon key={i} icon={faStar} className="star-icon"/>
                        ))}
                        <span className="sold-count">Đã bán {soldCount}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

/* ======================= fetch tiện ích ======================= */
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

/* ======================= trang chính ======================= */
const ProductClient = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    // demo thương hiệu
    const [brands] = useState([
        {id: 1, name: "Thiên Long"},
        {id: 2, name: "Casio"},
        {id: 3, name: "Deli"},
    ]);

    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [appliedPriceRange, setAppliedPriceRange] = useState({min: null, max: null});
    const [sortOrder, setSortOrder] = useState("newest");

    const location = useLocation();

    useEffect(() => {
        // products: public
        fetchData(`${Constants.DOMAIN_API}/api/products/list`).then((data) =>
            setProducts(Array.isArray(data) ? data : [])
        );
        // categories: dùng public (đã sửa)
        fetchData(`${Constants.DOMAIN_API}/api/public/categories`).then((data) =>
            setCategories(Array.isArray(data) ? data : [])
        );
    }, []);

    // chọn danh mục theo query
    useEffect(() => {
        const params = queryString.parse(location.search);
        const catId = params.categoryId ? parseInt(params.categoryId) : null;
        if (catId) setSelectedCategories(new Set([catId]));
        else setSelectedCategories(new Set());
    }, [location.search]);

    // danh mục cha (khi BE trả full list thì parent_id === null; nếu BE chỉ trả cha, vẫn ok)
    const categoryParents = useMemo(
        () => (Array.isArray(categories) ? categories.filter((c) => c?.parent_id == null) : []),
        [categories]
    );

    const handleCategoryChange = (categoryId) => {
        const next = new Set();
        if (!selectedCategories.has(categoryId)) next.add(categoryId);
        setSelectedCategories(next); // hành vi radio
    };

    const handleApplyCustomPrice = () => {
        setAppliedPriceRange({
            min: Number.isFinite(parseFloat(minPrice)) ? parseFloat(minPrice) : null,
            max: Number.isFinite(parseFloat(maxPrice)) ? parseFloat(maxPrice) : null,
        });
    };

    // build map parent -> children để lọc (nếu BE có trả con)
    const childrenByParent = useMemo(() => {
        const map = new Map();
        (Array.isArray(categories) ? categories : []).forEach((c) => {
            if (c?.parent_id != null) {
                const list = map.get(c.parent_id) || [];
                list.push(c.id);
                map.set(c.parent_id, list);
            }
        });
        return map;
    }, [categories]);

    const processedProducts = useMemo(() => {
        let list = (Array.isArray(products) ? products : []).filter((p) => Number(p?.status) === 1);

        // lọc danh mục (hỗ trợ khi BE chỉ trả danh mục cha hoặc trả đủ)
        if (selectedCategories.size > 0) {
            const selectedCatId = [...selectedCategories][0];

            const childIds = childrenByParent.get(selectedCatId) || [];
            list = list.filter(
                (p) =>
                    String(p?.category_id) === String(selectedCatId) ||
                    childIds.some((id) => String(id) === String(p?.category_id))
            );
        }

        // lọc giá
        const {min, max} = appliedPriceRange;
        if (min != null || max != null) {
            list = list.filter((p) => {
                const price = getDisplayPrice(p);
                if (min != null && price < min) return false;
                if (max != null && price > max) return false;
                return true;
            });
        }

        // sắp xếp
        switch (sortOrder) {
            case "price_asc":
                list.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
                break;
            case "price_desc":
                list.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
                break;
            case "newest":
            default:
                list.sort(
                    (a, b) =>
                        new Date(b?.createdAt || b?.created_at || 0) -
                        new Date(a?.createdAt || a?.created_at || 0)
                );
                break;
        }

        return list;
    }, [products, selectedCategories, appliedPriceRange, sortOrder, childrenByParent]);

    const discoverCategories = [
        {name: "English book", icon: "https://cdn1.fahasa.com/media/wysiwyg/Thang-08-2025/Icon_88_120x120.png"},
        {name: "Sách tiếng Việt", icon: "https://cdn1.fahasa.com/media/wysiwyg/Thang-06-2024/icon_ManngaT06.png"},
        {name: "Văn phòng phẩm", icon: "https://cdn1.fahasa.com/media/wysiwyg/HUYEN-1/8936235570006-1.jpg"},
        {name: "Quà lưu niệm", icon: "https://cdn1.fahasa.com/media/wysiwyg/Duy-VHDT/ngoai-van-t1-24(1).jpg"},
    ];

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

                            {/* Danh mục */}
                            <div className="filter-block">
                                <h5 className="filter-block__title">Theo danh mục</h5>
                                <ul className="filter-block__content filter-list">
                                    {categoryParents.map((cat) => (
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

                            {/* Thương hiệu (demo) */}
                            <div className="filter-block">
                                <h5 className="filter-block__title">Thương hiệu</h5>
                                <ul className="filter-block__content filter-list">
                                    {brands.map((brand) => (
                                        <li key={brand.id}>
                                            <label>
                                                <input type="checkbox"/> {brand.name}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Giá */}
                            <div className="filter-block">
                                <h5 className="filter-block__title">Khoảng giá</h5>
                                <div className="filter-block__content">
                                    <div className="price-range-inputs">
                                        <input
                                            type="number"
                                            placeholder="Từ"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                        />
                                        <span>-</span>
                                        <input
                                            type="number"
                                            placeholder="Đến"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                        />
                                    </div>
                                    <button className="apply-price-btn" onClick={handleApplyCustomPrice}>
                                        Áp dụng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main */}
                    <main className="col-lg-9">
                        <TopSlider/>

                        {/* Khám phá theo danh mục */}
                        <div className="discover-by-category">
                            <h4>Khám phá theo danh mục</h4>
                            <div className="discover-grid">
                                {discoverCategories.map((cat) => (
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
                                    <button
                                        className={`sort-options__btn ${sortOrder === "newest" ? "active" : ""}`}
                                        onClick={() => setSortOrder("newest")}
                                    >
                                        Mới nhất
                                    </button>
                                    <button
                                        className={`sort-options__btn ${sortOrder === "popular" ? "active" : ""}`}
                                        onClick={() => setSortOrder("popular")}
                                    >
                                        Phổ biến
                                    </button>
                                    <button
                                        className={`sort-options__btn ${sortOrder === "bestselling" ? "active" : ""}`}
                                        onClick={() => setSortOrder("bestselling")}
                                    >
                                        Bán chạy
                                    </button>
                                    <button
                                        className={`sort-options__btn ${sortOrder === "price_asc" ? "active" : ""}`}
                                        onClick={() => setSortOrder("price_asc")}
                                    >
                                        Giá thấp
                                    </button>
                                    <button
                                        className={`sort-options__btn ${sortOrder === "price_desc" ? "active" : ""}`}
                                        onClick={() => setSortOrder("price_desc")}
                                    >
                                        Giá cao
                                    </button>
                                </div>
                            </div>

                            <div className="product-grid">
                                {processedProducts.length > 0 ? (
                                    processedProducts.map((product) => <ProductCard key={product.id}
                                                                                    product={product}/>)
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
