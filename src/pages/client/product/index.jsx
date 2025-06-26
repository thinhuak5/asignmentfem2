import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import queryString from "query-string";
import Constants from "../../../Constanst"; // Đổi Constanst thành Constants
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckSquare, faEye, faShoppingCart, faSquare,} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../../assets/css/productclient.css";
import {FaChevronDown} from "react-icons/fa";

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
    return []; // Trả về mảng rỗng để tránh lỗi map
  }
};

// Component con cho hiển thị sản phẩm
const ProductCard = ({ product, onAddToCart }) => (
  <div className="product-column">
    <div className="product-item">
      <div className="product-thumbnail-wrapper">
        {Array.isArray(product.productImages) && product.productImages.length > 0 ? (
          <img
            src={`${Constants.DOMAIN_API}/uploads/${product.productImages[0].image_url}`}
            className="product-thumbnail"
            alt={product.name}
          />
        ) : product.images ? (
          <img
            src={`${Constants.DOMAIN_API}/uploads/${product.images.split(",")[0]}`}
            className="product-thumbnail"
            alt={product.name}
          />
        ) : (
          <span>Không có ảnh</span>
        )}
      </div>
      <h3 className="product-title">{product.name}</h3>
      <strong className="product-price">
        {product.price.toLocaleString()} VNĐ
      </strong>
      <div className="product-actions">
        <button className="btn-custom-sm" onClick={() => onAddToCart(product)}>
          <FontAwesomeIcon icon={faShoppingCart} />
        </button>
        <Link to={`/product/${product.id}`} className="btn-custom-outline">
          <FontAwesomeIcon icon={faEye} />
        </Link>
      </div>
    </div>
  </div>
);

const ProductClient = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryParents, setCategoryParents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({
    type: "all",
    id: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");
  const [openParentCategories, setOpenParentCategories] = useState([]);

  const location = useLocation();

  // Unified fetch function using useCallback for stability
  const initializeData = useCallback(async () => {
    setProducts(await fetchData(`${Constants.DOMAIN_API}/api/products/list`, "Lỗi fetch product:"));
    setCategories(await fetchData(`${Constants.DOMAIN_API}/api/categories/list`, "Lỗi fetch category:"));
    setCategoryParents(await fetchData(`${Constants.DOMAIN_API}/api/categoryparents`, "Lỗi fetch category parent:"));
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    const params = queryString.parse(location.search);
    if (params.categoryparentId) {
      setSelectedCategory({
        type: "parent",
        id: parseInt(params.categoryparentId),
      });
      // Optionally open the parent category when deep-linked
      if (!openParentCategories.includes(parseInt(params.categoryparentId))) {
        setOpenParentCategories((prev) => [...prev, parseInt(params.categoryparentId)]);
      }
    } else if (params.categoryId) {
      setSelectedCategory({
        type: "category",
        id: parseInt(params.categoryId),
      });
      // Find parent of selected category to open it
      const parentCat = categories.find(cat => cat.id === parseInt(params.categoryId));
      if (parentCat && !openParentCategories.includes(parentCat.parent_id)) {
        setOpenParentCategories((prev) => [...prev, parentCat.parent_id]);
      }
    } else {
      setSelectedCategory({ type: "all", id: null });
    }
  }, [location.search, categories, openParentCategories]); // Add categories to dependency array

  const handlePriceRangeChange = (range) => {
    setSelectedPriceRange(range);
  };

  const toggleParentCategory = (parentId) => {
    setOpenParentCategories((prev) =>
      prev.includes(parentId)
        ? prev.filter((id) => id !== parentId)
        : [...prev, parentId]
    );
  };

  // Sử dụng useMemo để tối ưu hóa việc lọc và sắp xếp
  const processedProducts = useMemo(() => {
    let currentFilteredProducts = products.filter((product) => {
      if (product.status !== 1) return false;
      const matchesSearchQuery = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      let matchesCategory = true;
      if (selectedCategory.type === "parent" && selectedCategory.id) {
        const childCategories = categories
          .filter((c) => c.parent_id === selectedCategory.id)
          .map((c) => c.id);
        matchesCategory = childCategories.includes(product.category_id);
      } else if (selectedCategory.type === "category" && selectedCategory.id) {
        matchesCategory = product.category_id === selectedCategory.id;
      }

      let matchesPriceRange = selectedPriceRange === "all";
      if (!matchesPriceRange) {
        const [minStr, maxStr] = selectedPriceRange.split("-");
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

    if (sortOrder === "asc") {
      currentFilteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      currentFilteredProducts.sort((a, b) => b.price - a.price);
    }
    return currentFilteredProducts;
  }, [products, categories, selectedCategory, searchQuery, selectedPriceRange, sortOrder]);


  const handleAddToCart = useCallback(async (product, quantity = 1) => {
    if (!product) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${Constants.DOMAIN_API}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: product.id, quantity }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  }, []);

  const priceRanges = [
    { label: "Tất cả giá", value: "all" },
    { label: "0 VNĐ - 10,000 VNĐ", value: "0-10000" },
    { label: "10,000 VNĐ - 100,000 VNĐ", value: "10000-100000" },
    { label: "100,000 VNĐ - 1,000,000 VNĐ", value: "100000-1000000" },
    { label: "Lớn hơn 1,000,000 VNĐ", value: "1000000-" },
  ];

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
                    className={`list-group-item ${
                      selectedCategory.type === "all" ? "active-filter" : ""
                    }`}
                    onClick={() => setSelectedCategory({ type: "all", id: null })}
                  >
                    <FontAwesomeIcon
                      icon={selectedCategory.type === "all" ? faCheckSquare : faSquare}
                      className="filter-icon"
                    />{" "}
                    Tất cả sản phẩm
                  </li>

                  {categoryParents.map((parent) => (
                    <li key={parent.id} className="list-group-item">
                      <div
                        className={`d-flex justify-content-between align-items-center ${
                          selectedCategory.type === "parent" &&
                          selectedCategory.id === parent.id
                            ? "active-filter"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedCategory({ type: "parent", id: parent.id })
                        }
                      >
                        <div>
                          <FontAwesomeIcon
                            icon={
                              selectedCategory.type === "parent" &&
                              selectedCategory.id === parent.id
                                ? faCheckSquare
                                : faSquare
                            }
                            className="filter-icon"
                          />{" "}
                          {parent.name}
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleParentCategory(parent.id);
                          }}
                        >
                          <FaChevronDown
                            className={`ms-2 chevron-icon ${
                              openParentCategories.includes(parent.id)
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </div>
                      </div>

                      {openParentCategories.includes(parent.id) && (
                        <ul
                          className="list-group"
                          style={{ paddingLeft: "15px", marginTop: "8px" }}
                        >
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
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h5>Lọc theo giá</h5>
                <ul className="list-group">
                  {priceRanges.map((range) => (
                    <li
                      key={range.value}
                      className={`list-group-item ${
                        selectedPriceRange === range.value
                          ? "active-filter"
                          : ""
                      }`}
                      onClick={() => handlePriceRangeChange(range.value)}
                      style={{ cursor: "pointer" }}
                    >
                      <FontAwesomeIcon
                        icon={
                          selectedPriceRange === range.value
                            ? faCheckSquare
                            : faSquare
                        }
                        className="filter-icon"
                      />{" "}
                      {range.label}
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