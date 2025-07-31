import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import queryString from "query-string";
import Constants from "../../../Constanst";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCheckSquare,
    faChevronDown,
    faChevronUp,
    faEye,
    faShoppingCart,
    faSquare,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../../assets/css/productclient.css";

// Hàm tiện ích để fetch dữ liệu
const fetchData = async (url, errorMessage = "Lỗi khi tải dữ liệu:") => {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        console.error(errorMessage, err);
        return [];
    }
};

// Component con cho hiển thị sản phẩm
const ProductCard = ({product, onAddToCart}) => (
    <div className="product-column">
        <div className="product-item">
            <div className="product-thumbnail-wrapper">
                {Array.isArray(product.productImages) && product.productImages.length > 0 ? (
                    <img
                        src={product.productImages[0].image_url}
                        className="product-thumbnail"
                        alt={product.name}
                    />
                ) : product.images ? (
                    <img
                        src={product.images.split(",")[0]}
                        className="product-thumbnail"
                        alt={product.name}
                    />
                ) : (
                    <span>Không có ảnh</span>
                )}
            </div>
            <h3 className="product-title">{product.name}</h3>
            <strong className="product-price">
                {product.price?.toLocaleString()} VNĐ
            </strong>
            <div className="product-actions">
                <button className="btn-custom-sm" onClick={() => onAddToCart(product)}>
                    <FontAwesomeIcon icon={faShoppingCart}/>
                </button>
                <Link to={`/product/${product.id}`} className="btn-custom-outline">
                    <FontAwesomeIcon icon={faEye}/>
                </Link>
            </div>
        </div>
    </div>
);

const ProductClient = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // danh mục con
    const [categoriesParent, setCategoriesParent] = useState([]); // danh mục cha (parent_id null)
    const [selectedCategory, setSelectedCategory] = useState({
        type: "all",
        id: null,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPriceRange, setSelectedPriceRange] = useState("all");
    const [sortOrder, setSortOrder] = useState("default");
    const [openParentCategories, setOpenParentCategories] = useState([]);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const location = useLocation();

    // Load dữ liệu danh mục cha/con và sản phẩm
    const initializeData = useCallback(async () => {
        setProducts(
            await fetchData(
                `${Constants.DOMAIN_API}/api/products/list`,
                "Lỗi fetch product:"
            )
        );
        setCategories(
            await fetchData(
                `${Constants.DOMAIN_API}/api/categories/list`,
                "Lỗi fetch category:"
            )
        );
        setCategoriesParent(
            await fetchData(
                `${Constants.DOMAIN_API}/api/categories/parents`,
                "Lỗi fetch category parent:"
            )
        );
    }, []);

    useEffect(() => {
        initializeData();
    }, [initializeData]);

    // Xử lý params từ URL để thiết lập danh mục đang chọn và mở danh mục cha
    useEffect(() => {
        const params = queryString.parse(location.search);
        if (params.parent_id) {
            const parentId = parseInt(params.parent_id);
            setSelectedCategory({type: "parent", id: parentId});
            setOpenParentCategories((prev) => Array.from(new Set([...prev, parentId])));
        } else if (params.categoryId) {
            const categoryId = parseInt(params.categoryId);
            setSelectedCategory({type: "category", id: categoryId});
            const child = categories.find((cat) => cat.id === categoryId);
            if (child && child.parent_id) {
                setOpenParentCategories((prev) => Array.from(new Set([...prev, child.parent_id])));
            }
        } else {
            setSelectedCategory({type: "all", id: null});
        }
    }, [location.search, categories]);

    const handlePriceRangeChange = (range) => {
        setSelectedPriceRange(range);
        setMinPrice("");
        setMaxPrice("");
    };

    const handleApplyCustomPrice = () => {
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);
        if (!isNaN(min) && !isNaN(max)) {
            setSelectedPriceRange(`${min}-${max}`);
        } else if (!isNaN(min)) {
            setSelectedPriceRange(`${min}-`);
        } else if (!isNaN(max)) {
            setSelectedPriceRange(`0-${max}`);
        } else {
            setSelectedPriceRange("all");
        }
    };

    const toggleParentCategory = (parentId) => {
        setOpenParentCategories((prev) =>
            prev.includes(parentId)
                ? prev.filter((id) => id !== parentId)
                : [...prev, parentId]
        );
    };

    const processedProducts = useMemo(() => {
        let currentFilteredProducts = products.filter((product) => {
            if (product.status !== 1) return false;
            const matchesSearchQuery = product.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            let matchesCategory = true;
            if (selectedCategory.type === "parent" && selectedCategory.id) {
                // Lọc sản phẩm theo danh mục cha đã chọn
                const childCategoriesOfSelectedParent = categories
                    .filter((c) => c.parent_id === selectedCategory.id)
                    .map((c) => c.id);
                matchesCategory = childCategoriesOfSelectedParent.includes(
                    product.category_id
                );
            } else if (selectedCategory.type === "category" && selectedCategory.id) {
                // Lọc sản phẩm theo danh mục con đã chọn
                matchesCategory = product.category_id === selectedCategory.id;
            }
            // Nếu selectedCategory.type === "all", matchesCategory mặc định là true

            let matchesPriceRange = true;
            if (selectedPriceRange !== "all") {
                const [minStr, maxStr] = selectedPriceRange.split("-");
                const min = parseFloat(minStr);
                const max = maxStr ? parseFloat(maxStr) : NaN;
                if (!isNaN(min) && !isNaN(max)) {
                    matchesPriceRange = product.price >= min && product.price <= max;
                } else if (!isNaN(min) && isNaN(max)) {
                    matchesPriceRange = product.price >= min;
                } else if (isNaN(min) && !isNaN(max)) {
                    matchesPriceRange = product.price <= max;
                }
            }

            if (minPrice !== "" || maxPrice !== "") {
                const customMin = parseFloat(minPrice);
                const customMax = parseFloat(maxPrice);
                if (!isNaN(customMin) && product.price < customMin) {
                    matchesPriceRange = false;
                }
                if (!isNaN(customMax) && product.price > customMax) {
                    matchesPriceRange = false;
                }
            }

            return (
                matchesSearchQuery && matchesCategory && matchesPriceRange
            );
        });

        if (sortOrder === "asc") {
            currentFilteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortOrder === "desc") {
            currentFilteredProducts.sort((a, b) => b.price - a.price);
        } else if (sortOrder === "newest") {
            currentFilteredProducts.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
        } else if (sortOrder === "popularity") {
            currentFilteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOrder === "bestselling") {
            currentFilteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        }

        return currentFilteredProducts;
    }, [
        products,
        categories,
        selectedCategory,
        searchQuery,
        selectedPriceRange,
        sortOrder,
        minPrice,
        maxPrice,
    ]);

    const handleAddToCart = useCallback(async (product, quantity = 1) => {
        if (!product) return;
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
                return;
            }
            const res = await fetch(`${Constants.DOMAIN_API}/api/cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({product_id: product.id, quantity}),
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
            } else {
                alert(`Lỗi: ${data.message || "Không thể thêm vào giỏ hàng."}`);
            }
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            alert("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    }, []);

    const priceRanges = useMemo(() => [
        {label: "Tất cả giá", value: "all"},
        {label: "0 VNĐ - 10,000 VNĐ", value: "0-10000"},
        {label: "10,000 VNĐ - 100,000 VNĐ", value: "10000-100000"},
        {label: "100,000 VNĐ - 1,000,000 VNĐ", value: "100000-1000000"},
        {label: "Lớn hơn 1,000,000 VNĐ", value: "1000000-"},
    ], []);

    return (
        <div>
            <div className="untree_co-section product-section before-footer-section">
                <div className="container">
                    <div className="row">
                        {/* Sidebar: Filter */}
                        <div className="col-md-3 mb-4 sidebar-section">
                            <div className="categories-dropdown">
                                <h5>Khám phá theo danh mục</h5>
                                <ul className="list-group">
                                    <li
                                        className={`list-group-item ${selectedCategory.type === "all" ? "active-filter" : ""}`}
                                        onClick={() => {
                                            setSelectedCategory({type: "all", id: null});
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={selectedCategory.type === "all" ? faCheckSquare : faSquare}
                                            className="filter-icon"
                                        />{" "}
                                        Tất cả sản phẩm
                                    </li>
                                    {categoriesParent.map((parent) => (
                                        <React.Fragment key={parent.id}>
                                            <li
                                                className={`list-group-item category-parent-item ${
                                                    selectedCategory.type === "parent" &&
                                                    selectedCategory.id === parent.id
                                                        ? "active-filter"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setSelectedCategory({type: "parent", id: parent.id})
                                                }
                                            >
                                                <div className="category-parent-content">
                                                    <div>
                                                        <FontAwesomeIcon
                                                            icon={
                                                                selectedCategory.type === "parent" &&
                                                                selectedCategory.id === parent.id
                                                                    ? faCheckSquare
                                                                    : faSquare
                                                            }
                                                            className="filter-icon"
                                                            style={{
                                                                color:
                                                                    selectedCategory.type === "parent" &&
                                                                    selectedCategory.id === parent.id
                                                                        ? "#28a745"
                                                                        : "#666",
                                                            }}
                                                        />{" "}
                                                        <span
                                                            style={{
                                                                color:
                                                                    selectedCategory.type === "parent" &&
                                                                    selectedCategory.id === parent.id
                                                                        ? "#28a745"
                                                                        : "",
                                                            }}
                                                        >
                                                            {parent.name}
                                                        </span>
                                                    </div>
                                                    <FontAwesomeIcon
                                                        icon={
                                                            openParentCategories.includes(parent.id)
                                                                ? faChevronUp
                                                                : faChevronDown
                                                        }
                                                        className={`toggle-icon ${
                                                            openParentCategories.includes(parent.id) ? 'rotated' : ''
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleParentCategory(parent.id);
                                                        }}
                                                    />
                                                </div>
                                            </li>
                                            {openParentCategories.includes(parent.id) && (
                                                <ul className="list-group category-child-list">
                                                    {categories
                                                        .filter((c) => c.parent_id === parent.id)
                                                        .map((sub) => (
                                                            <li
                                                                key={sub.id}
                                                                className={`list-group-item ${
                                                                    selectedCategory.type === "category" &&
                                                                    selectedCategory.id === sub.id
                                                                        ? "active-filter"
                                                                        : ""
                                                                }`}
                                                                onClick={() =>
                                                                    setSelectedCategory({
                                                                        type: "category",
                                                                        id: sub.id,
                                                                    })
                                                                }
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        selectedCategory.type === "category" &&
                                                                        selectedCategory.id === sub.id
                                                                            ? faCheckSquare
                                                                            : faSquare
                                                                    }
                                                                    className="filter-icon"
                                                                />{" "}
                                                                {sub.name}
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </ul>
                            </div>
                            {/* Price Range */}
                            <div className="mt-4 filter-group">
                                <h5>Khoảng giá</h5>
                                <ul className="list-group">
                                    {priceRanges.map((range) => (
                                        <li
                                            key={range.value}
                                            className={`list-group-item filter-group-item ${selectedPriceRange === range.value ? "active-filter" : ""}`}
                                            onClick={() => handlePriceRangeChange(range.value)}
                                            style={{cursor: "pointer"}}
                                        >
                                            <FontAwesomeIcon
                                                icon={selectedPriceRange === range.value ? faCheckSquare : faSquare}
                                                className="filter-icon"
                                            />{" "}
                                            {range.label}
                                        </li>
                                    ))}
                                </ul>
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
                                <button
                                    className="apply-price-btn"
                                    onClick={handleApplyCustomPrice}
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </div>

                        {/* Product grid & sort */}
                        <div className="col-md-9">
                            <div className="sort-options-bar">
                                <span>Sắp xếp theo:</span>
                                <button className={`sort-option-btn ${sortOrder === "newest" ? "active-sort" : ""}`}
                                        onClick={() => setSortOrder("newest")}>Mới nhất
                                </button>
                                <button className={`sort-option-btn ${sortOrder === "popularity" ? "active-sort" : ""}`}
                                        onClick={() => setSortOrder("popularity")}>Phổ biến
                                </button>
                                <button
                                    className={`sort-option-btn ${sortOrder === "bestselling" ? "active-sort" : ""}`}
                                    onClick={() => setSortOrder("bestselling")}>Bán chạy
                                </button>
                                <button className={`sort-option-btn ${sortOrder === "asc" ? "active-sort" : ""}`}
                                        onClick={() => setSortOrder("asc")}>Giá thấp
                                </button>
                                <button className={`sort-option-btn ${sortOrder === "desc" ? "active-sort" : ""}`}
                                        onClick={() => setSortOrder("desc")}>Giá cao
                                </button>
                            </div>
                            <div className="row product-grid-row">
                                {processedProducts.length === 0 ? (
                                    <div className="col-12">
                                        <p className="no-products-message">Không có sản phẩm nào</p>
                                    </div>
                                ) : (
                                    processedProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onAddToCart={handleAddToCart}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductClient;
