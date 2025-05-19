import {useEffect, useState, useCallback } from "react";
import {Link} from "react-router-dom";
import Constanst from "../../../Constanst";

const ProductClient = () => {
    const [products, setProducts] = useState([]); // Dữ liệu sản phẩm
    const [categories, setCategories] = useState([]); // Dữ liệu danh mục
    const [selectedCategory, setSelectedCategory] = useState("all"); // Danh mục đã chọn, mặc định là all
    const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm
    const [priceRange, setPriceRange] = useState("all"); // Khoảng giá đã chọn
    const [sortOrder, setSortOrder] = useState("none"); // Thứ tự sắp xếp giá

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

    const filteredProducts = products.filter(product => {
        if (product.status !== 1) return false;

        const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());

        // Nếu chọn "Tất cả sản phẩm" thì không lọc theo danh mục
        const matchesCategory = selectedCategory === "all" ? true : product.category_id === selectedCategory;

        let matchesPriceRange = true;
        if (priceRange === "0-10000") {
            matchesPriceRange = product.price >= 0 && product.price <= 10000;
        } else if (priceRange === "10000-100000") {
            matchesPriceRange = product.price >= 10000 && product.price <= 100000;
        } else if (priceRange === "100000-1000000") {
            matchesPriceRange = product.price >= 100000 && product.price <= 1000000;
        } else if (priceRange === "1000000+") {  // sửa lại giá trị này
            matchesPriceRange = product.price >= 1000000;
        }

        return matchesSearchQuery && matchesCategory && matchesPriceRange;
    });

    const sortedProducts = () => {
        if (sortOrder === "asc") {
            return filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortOrder === "desc") {
            return filteredProducts.sort((a, b) => b.price - a.price);
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
                        {/* Cột bên trái - Danh mục */}
                        <div className="col-md-3 mb-4">
                            <h5>Danh mục sản phẩm</h5>
                            <ul className="list-group">
                                {/* Mục Tất cả sản phẩm */}
                                <li
                                    key="all"
                                    className="list-group-item"
                                    onClick={() => setSelectedCategory("all")}
                                    style={{
                                        cursor: 'pointer',
                                        fontWeight: selectedCategory === "all" ? 'bold' : 'normal'
                                    }}
                                >
                                    Tất cả sản phẩm
                                </li>

                                {categories.length === 0 ? (
                                    <li className="list-group-item">Không có danh mục nào</li>
                                ) : (
                                    categories.map((category) => (
                                        <li
                                            key={category.id}
                                            className="list-group-item"
                                            onClick={() => setSelectedCategory(category.id)}
                                            style={{
                                                cursor: 'pointer',
                                                fontWeight: selectedCategory === category.id ? 'bold' : 'normal'
                                            }}
                                        >
                                            {category.name}
                                        </li>
                                    ))
                                )}
                            </ul>

                            {/* Dropdown lọc giá nằm dưới danh mục */}
                            <div className="mt-4">
                                <h5>Lọc theo giá</h5>
                                <select
                                    className="form-select"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                >
                                    <option value="all">Tất cả giá</option>
                                    <option value="0-10000">Từ 0 VNĐ đến 10,000 VNĐ</option>
                                    <option value="10000-100000">Từ 10,000 VNĐ đến 100,000 VNĐ</option>
                                    <option value="100000-1000000">Từ 100,000 VNĐ đến 1,000,000 VNĐ</option>
                                    <option value="1000000+">Lớn hơn 1,000,000 VNĐ</option>
                                </select>
                            </div>
                        </div>

                        {/* Cột bên phải - Sản phẩm */}
                        <div className="col-md-9">
                            {/* Thanh tìm kiếm */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Dropdown sắp xếp giá */}
                            <div className="mb-4">
                                <select
                                    className="form-select"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="none">Sắp xếp theo giá</option>
                                    <option value="asc">Giá từ thấp đến cao</option>
                                    <option value="desc">Giá từ cao đến thấp</option>
                                </select>
                            </div>

                            <div className="row">
                                {sortedProducts().length === 0 ? (
                                    <div className="col-12">
                                        <p>Không có sản phẩm nào</p>
                                    </div>
                                ) : (
                                    sortedProducts().map((product) => (
                                        <div className="col-12 col-md-4 col-lg-3 mb-5 mb-md-0" key={product.id}>
                                            <div className="product-item" style={{lineHeight: '1.7', marginBottom: '20px'}}>
                                                <img
                                                    src={`${Constanst.DOMAIN_API}/uploads/${product.images}`}
                                                    className="img-fluid product-thumbnail"
                                                    alt={product.name}
                                                    style={{height: "250px", width: "auto", objectFit: "cover"}}
                                                />
                                                <h3 className="product-title" style={{fontSize: '16px'}}>{product.name}</h3>
                                                <strong className="product-price">
                                                    {product.price
                                                        ? product.price.toLocaleString() + " VNĐ"
                                                        : "Giá chưa có"}
                                                </strong>
                                                <div className="d-flex justify-content-between mt-3">
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleAddToCart(product)}
                                                        style={{fontSize: '14px', padding: '8px 10px'}}
                                                    >
                                                        Thêm vào giỏ
                                                    </button>
                                                    <Link to={`/product/${product.id}`} className="btn btn-sm btn-info"
                                                          style={{fontSize: '14px', padding: '8px 10px'}}>
                                                        Xem chi tiết
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
