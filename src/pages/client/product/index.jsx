import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Constanst from "../../../Constanst";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faEye, faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-free/css/all.min.css';
import "../../../assets/css/productclient.css"; // Import CSS mới

const ProductClient = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [sortOrder, setSortOrder] = useState("none");

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/products/list`);
            if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu sản phẩm");
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Lỗi fetch product:", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/list`);
            if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu danh mục");
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error("Lỗi fetch category:", err);
        }
    };

    const handlePriceRangeChange = (range) => {
        const isSelected = selectedPriceRanges.includes(range);
        if (isSelected) {
            setSelectedPriceRanges(selectedPriceRanges.filter(r => r !== range));
        } else {
            setSelectedPriceRanges([...selectedPriceRanges, range]);
        }
    };

    const filteredProducts = products.filter(product => {
        if (product.status !== 1) return false;
        const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" ? true : product.category_id === selectedCategory;
        let matchesPriceRange = false;
        if (selectedPriceRanges.length === 0 || selectedPriceRanges.includes("all")) {
            matchesPriceRange = true;
        } else {
            for (const range of selectedPriceRanges) {
                const [minStr, maxStr] = range.split('-');
                const min = parseFloat(minStr);
                const max = parseFloat(maxStr);
                if (!isNaN(min) && !isNaN(max) && product.price >= min && product.price <= max) {
                    matchesPriceRange = true;
                    break;
                } else if (!isNaN(min) && isNaN(max) && product.price >= min) {
                    matchesPriceRange = true;
                    break;
                } else if (range === "all") {
                    matchesPriceRange = true;
                    break;
                }
            }
        }
        return matchesSearchQuery && matchesCategory && matchesPriceRange;
    });

    const sortedProducts = () => {
        if (sortOrder === "asc") {
            return [...filteredProducts].sort((a, b) => a.price - b.price); // Use spread to avoid direct mutation
        } else if (sortOrder === "desc") {
            return [...filteredProducts].sort((a, b) => b.price - a.price); // Use spread to avoid direct mutation
        }
        return filteredProducts;
    };

    const handleAddToCart = useCallback(async (product, quantity = 1) => {
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
    }, []);

    return (
        <div>
            <div className="hero">
                <div className="container">
                    <div className="row justify-content-between">
                        <div className="col-lg-5">
                            <div className="intro-excerpt">
                                <h1>Cửa Hàng</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="untree_co-section product-section before-footer-section">
                <div className="container">
                    <div className="row">
                        {/* Cột bên trái - Danh mục và Lọc giá */}
                        <div className="col-md-3 mb-4 sidebar-section">
                            <h5>Danh mục sản phẩm</h5>
                            <ul className="list-group">
                                <li
                                    key="all"
                                    className={`list-group-item ${selectedCategory === "all" ? 'active-filter' : ''}`}
                                    onClick={() => setSelectedCategory("all")}
                                >
                                    <FontAwesomeIcon
                                        icon={selectedCategory === "all" ? faCheckSquare : faSquare}
                                        className={`filter-icon ${selectedCategory === "all" ? 'checked' : ''}`}
                                    />
                                    Tất cả sản phẩm
                                </li>
                                {categories.length === 0 ? (
                                    <li className="list-group-item">Không có danh mục nào</li>
                                ) : (
                                    categories.map((category) => (
                                        <li
                                            key={category.id}
                                            className={`list-group-item ${selectedCategory === category.id ? 'active-filter' : ''}`}
                                            onClick={() => setSelectedCategory(category.id)}
                                        >
                                            <FontAwesomeIcon
                                                icon={selectedCategory === category.id ? faCheckSquare : faSquare}
                                                className={`filter-icon ${selectedCategory === category.id ? 'checked' : ''}`}
                                            />
                                            {category.name}
                                        </li>
                                    ))
                                )}
                            </ul>

                            <div className="mt-4 ">
                                <h5>Lọc theo giá</h5>
                                <ul className="list-group">
                                    <li
                                        className={`list-group-item ${selectedPriceRanges.includes("all") ? 'active-filter' : ''}`}
                                        onClick={() => handlePriceRangeChange("all")}
                                    >
                                        <FontAwesomeIcon
                                            icon={selectedPriceRanges.includes("all") ? faCheckSquare : faSquare}
                                            className={`filter-icon ${selectedPriceRanges.includes("all") ? 'checked' : ''}`}
                                        />Tất cả giá
                                    </li>
                                    <li
                                        className={`list-group-item ${selectedPriceRanges.includes("0-10000") ? 'active-filter' : ''}`}
                                        onClick={() => handlePriceRangeChange("0-10000")}
                                    >
                                        <FontAwesomeIcon
                                            icon={selectedPriceRanges.includes("0-10000") ? faCheckSquare : faSquare}
                                            className={`filter-icon ${selectedPriceRanges.includes("0-10000") ? 'checked' : ''}`}
                                        />
                                        0 VNĐ - 10,000 VNĐ
                                    </li>
                                    <li
                                        className={`list-group-item ${selectedPriceRanges.includes("10000-100000") ? 'active-filter' : ''}`}
                                        onClick={() => handlePriceRangeChange("10000-100000")}
                                    >
                                        <FontAwesomeIcon
                                            icon={selectedPriceRanges.includes("10000-100000") ? faCheckSquare : faSquare}
                                            className={`filter-icon ${selectedPriceRanges.includes("100000-100000") ? 'checked' : ''}`}
                                        />
                                        10,000 VNĐ - 100,000 VNĐ
                                    </li>
                                    <li
                                        className={`list-group-item ${selectedPriceRanges.includes("100000-1000000") ? 'active-filter' : ''}`}
                                        onClick={() => handlePriceRangeChange("100000-1000000")}
                                    >
                                        <FontAwesomeIcon
                                            icon={selectedPriceRanges.includes("100000-1000000") ? faCheckSquare : faSquare}
                                            className={`filter-icon ${selectedPriceRanges.includes("1000000-1000000") ? 'checked' : ''}`}
                                        />
                                        100,000 VNĐ - 1,000,000 VNĐ
                                    </li>
                                    <li
                                        className={`list-group-item ${selectedPriceRanges.includes("1000000-") ? 'active-filter' : ''}`}
                                        onClick={() => handlePriceRangeChange("1000000-")}
                                    >
                                        <FontAwesomeIcon
                                            icon={selectedPriceRanges.includes("1000000-") ? faCheckSquare : faSquare}
                                            className={`filter-icon ${selectedPriceRanges.includes("1000000-") ? 'checked' : ''}`}
                                        />
                                        Lớn hơn 1,000,000 VNĐ
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Cột bên phải - Sản phẩm */}
                        <div className="col-md-9">
                            {/* Thanh tìm kiếm */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Dropdown sắp xếp giá */}
                            <div className="mb-4">
                                <select
                                    className="sort-select"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="none">Sắp xếp theo giá</option>
                                    <option value="asc">Giá từ thấp đến cao</option>
                                    <option value="desc">Giá từ cao đến thấp</option>
                                </select>
                            </div>

                            <div className="row product-grid-row">
                                {sortedProducts().length === 0 ? (
                                    <div className="col-12">
                                        <p className="no-products-message">Không có sản phẩm nào</p>
                                    </div>
                                ) : (
                                    sortedProducts().map((product) => (
                                        <div className="product-column" key={product.id}>
                                            <div className="product-item">
                                                <div className="product-thumbnail-wrapper">
                                                    <img
                                                        src={`${Constanst.DOMAIN_API}/uploads/${product.images}`}
                                                        className="product-thumbnail"
                                                        alt={product.name}
                                                    />
                                                </div>
                                                <h3 className="product-title">
                                                    {product.name}
                                                </h3>
                                                <strong className="product-price">
                                                    {product.price ? product.price.toLocaleString() + " VNĐ" : "Giá chưa có"}
                                                </strong>
                                                <div className="product-actions">
                                                    <button
                                                        className="btn-custom-sm"
                                                        onClick={() => handleAddToCart(product)}
                                                    >
                                                        <FontAwesomeIcon icon={faShoppingCart} />
                                                    </button>
                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className="btn-custom-outline"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
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