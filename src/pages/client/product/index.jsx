import React, {useCallback, useEffect, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import queryString from "query-string";
import Constanst from "../../../Constanst";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckSquare, faEye, faShoppingCart, faSquare} from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-free/css/all.min.css';
import "../../../assets/css/productclient.css";
import {FaChevronDown} from "react-icons/fa";

const ProductClient = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryParents, setCategoryParents] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState({type: "all", id: null});
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPriceRange, setSelectedPriceRange] = useState("all");  // chỉ chọn 1 khoảng giá
    const [sortOrder, setSortOrder] = useState("none");
    const [openParentCategories, setOpenParentCategories] = useState([]);

    const location = useLocation();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchCategoryParents();
    }, []);

    useEffect(() => {
        const params = queryString.parse(location.search);
        if (params.categoryparentId) {
            setSelectedCategory({type: "parent", id: parseInt(params.categoryparentId)});
        } else if (params.categoryId) {
            setSelectedCategory({type: "category", id: parseInt(params.categoryId)});
        } else {
            setSelectedCategory({type: "all", id: null});
        }
    }, [location.search]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/products/list`);
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Lỗi fetch product:", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/list`);
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error("Lỗi fetch category:", err);
        }
    };

    const fetchCategoryParents = async () => {
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/categoryparents`);
            const data = await res.json();
            setCategoryParents(data);
        } catch (err) {
            console.error("Lỗi fetch category parent:", err);
        }
    };

    // Chọn 1 khoảng giá
    const handlePriceRangeChange = (range) => {
        setSelectedPriceRange(range);
    };

    const toggleParentCategory = (parentId) => {
        if (openParentCategories.includes(parentId)) {
            setOpenParentCategories(openParentCategories.filter(id => id !== parentId));
        } else {
            setOpenParentCategories([...openParentCategories, parentId]);
        }
    };

    // Lọc sản phẩm theo các điều kiện
    const filteredProducts = products.filter(product => {
        if (product.status !== 1) return false;
        const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesCategory = true;
        if (selectedCategory.type === "parent" && selectedCategory.id) {
            const childCategories = categories.filter(c => c.parent_id === selectedCategory.id).map(c => c.id);
            matchesCategory = childCategories.includes(product.category_id);
        } else if (selectedCategory.type === "category" && selectedCategory.id) {
            matchesCategory = product.category_id === selectedCategory.id;
        }

        let matchesPriceRange = selectedPriceRange === "all";
        if (!matchesPriceRange) {
            const [minStr, maxStr] = selectedPriceRange.split('-');
            const min = parseFloat(minStr);
            const max = maxStr ? parseFloat(maxStr) : NaN;
            if (!isNaN(min) && !isNaN(max)) {
                matchesPriceRange = product.price >= min && product.price <= max;
            } else if (!isNaN(min) && isNaN(max)) {
                matchesPriceRange = product.price >= min;
            }
        }

        return matchesSearchQuery && matchesCategory && matchesPriceRange;
    });

    const sortedProducts = () => {
        if (sortOrder === "asc") return [...filteredProducts].sort((a, b) => a.price - b.price);
        if (sortOrder === "desc") return [...filteredProducts].sort((a, b) => b.price - a.price);
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
                body: JSON.stringify({product_id: product.id, quantity})
            });
            const data = await res.json();
            alert(data.message);
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
                        <div className="col-md-3 mb-4 sidebar-section">
                            <div className="categories-dropdown">
                                <h5>Danh mục sản phẩm</h5>
                                <ul className="list-group">
                                    <li
                                        className={`list-group-item ${selectedCategory.type === "all" ? "active-filter" : ""}`}
                                        onClick={() => setSelectedCategory({type: "all", id: null})}
                                    >
                                        <FontAwesomeIcon
                                            icon={selectedCategory.type === "all" ? faCheckSquare : faSquare}
                                            className="filter-icon"/> Tất cả sản phẩm
                                    </li>

                                    {categoryParents.map(parent => (
                                        <li key={parent.id} className="list-group-item">
                                            <div
                                                className={`d-flex justify-content-between align-items-center ${selectedCategory.type === "parent" && selectedCategory.id === parent.id ? "active-filter" : ""}`}
                                                onClick={() => setSelectedCategory({type: "parent", id: parent.id})}
                                            >
                                                <div>
                                                    <FontAwesomeIcon
                                                        icon={selectedCategory.type === "parent" && selectedCategory.id === parent.id ? faCheckSquare : faSquare}
                                                        className="filter-icon"
                                                    /> {parent.name}
                                                </div>
                                                <div onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleParentCategory(parent.id);
                                                }}>
                                                    <FaChevronDown
                                                        className={`ms-2 chevron-icon ${openParentCategories.includes(parent.id) ? "rotate-180" : ""}`}/>
                                                </div>
                                            </div>

                                            {openParentCategories.includes(parent.id) && (
                                                <ul className="list-group"
                                                    style={{paddingLeft: "15px", marginTop: "8px"}}>
                                                    {categories.filter(c => c.parent_id === parent.id).map(sub => (
                                                        <li
                                                            key={sub.id}
                                                            className={`list-group-item ${selectedCategory.type === "category" && selectedCategory.id === sub.id ? "active-filter" : ""}`}
                                                            onClick={() => setSelectedCategory({
                                                                type: "category",
                                                                id: sub.id
                                                            })}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={selectedCategory.type === "category" && selectedCategory.id === sub.id ? faCheckSquare : faSquare}
                                                                className="filter-icon"
                                                            /> {sub.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>

                            </div>

                            <div className="mt-4">
                                <h5>Lọc theo giá</h5>
                                <ul className="list-group">
                                    {[
                                        {label: "Tất cả giá", value: "all"},
                                        {label: "0 VNĐ - 10,000 VNĐ", value: "0-10000"},
                                        {label: "10,000 VNĐ - 100,000 VNĐ", value: "10000-100000"},
                                        {label: "100,000 VNĐ - 1,000,000 VNĐ", value: "100000-1000000"},
                                        {label: "Lớn hơn 1,000,000 VNĐ", value: "1000000-"}
                                    ].map(range => (
                                        <li
                                            key={range.value}
                                            className={`list-group-item ${selectedPriceRange === range.value ? 'active-filter' : ''}`}
                                            onClick={() => handlePriceRangeChange(range.value)}
                                            style={{cursor: "pointer"}}
                                        >
                                            <FontAwesomeIcon
                                                icon={selectedPriceRange === range.value ? faCheckSquare : faSquare}
                                                className="filter-icon"
                                            /> {range.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="col-md-9">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <select className="sort-select" value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}>
                                    <option value="none">Sắp xếp theo giá</option>
                                    <option value="asc">Giá từ thấp đến cao</option>
                                    <option value="desc">Giá từ cao đến thấp</option>
                                </select>
                            </div>
                            <div className="row product-grid-row">
                                {sortedProducts().length === 0 ? (
                                    <div className="col-12"><p className="no-products-message">Không có sản phẩm nào</p>
                                    </div>
                                ) : (
                                    sortedProducts().map(product => (
                                        <div className="product-column" key={product.id}>
                                            <div className="product-item">
                                                <div className="product-thumbnail-wrapper">
                                                    <img src={`${Constanst.DOMAIN_API}/uploads/${product.images}`}
                                                         className="product-thumbnail" alt={product.name}/>
                                                </div>
                                                <h3 className="product-title">{product.name}</h3>
                                                <strong
                                                    className="product-price">{product.price.toLocaleString()} VNĐ</strong>
                                                <div className="product-actions">
                                                    <button className="btn-custom-sm"
                                                            onClick={() => handleAddToCart(product)}>
                                                        <FontAwesomeIcon icon={faShoppingCart} />
                                                    </button>
                                                    <Link to={`/product/${product.id}`} className="btn-custom-outline">
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
