import React, {useEffect, useMemo, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import queryString from "query-string";
import Constants from "../../../Constanst";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckSquare, faChevronDown, faChevronUp, faEye, faSquare,} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../../assets/css/productclient.css";

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

const ProductCard = ({product}) => {
    const productPrice =
        product.price
            ? product.price
            : product.variations && product.variations.length > 0
                ? product.variations[0].price
                : 0;

    const productImage =
        product.variations &&
        product.variations.length > 0 &&
        product.variations[0].productImages &&
        product.variations[0].productImages.length > 0
            ? product.variations[0].productImages[0].image_url
            : product.productImages && product.productImages.length > 0
                ? product.productImages[0].image_url
                : "path/to/default-image.jpg";

    return (
        <div className="product-column">
            <div className="product-item">
                <div className="product-thumbnail-wrapper">
          <img
              src={productImage}
            className="product-thumbnail"
            alt={product.name}
          />
                </div>
                <h3 className="product-title">{product.name}</h3>
                <strong className="product-price">
                    {productPrice.toLocaleString()} VNĐ
                </strong>
                <div className="product-actions">
                    <Link to={`/product/${product.id}`} className="btn-custom-outline">
                        <FontAwesomeIcon icon={faEye}/>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const ProductClient = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({
    type: "all",
    id: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");
  const [openParentCategories, setOpenParentCategories] = useState([]);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

  const location = useLocation();

  useEffect(() => {
      fetchData(`${Constants.DOMAIN_API}/api/products/list`).then(setProducts);
      fetchData(`${Constants.DOMAIN_API}/api/categories/list`).then(setCategories);
  }, []);

    const categoryParents = useMemo(
        () => categories.filter((c) => c.parent_id === null),
        [categories]
    );

  useEffect(() => {
    const params = queryString.parse(location.search);
    if (params.categoryparentId) {
        const parentId = parseInt(params.categoryparentId);
        setSelectedCategory({type: "parent", id: parentId});
        setOpenParentCategories((prev) =>
            Array.from(new Set([...prev, parentId]))
        );
    } else if (params.categoryId) {
        const categoryId = parseInt(params.categoryId);
        setSelectedCategory({type: "category", id: categoryId});
        const parentCat = categories.find((cat) => cat.id === categoryId);
        if (parentCat && parentCat.parent_id) {
            setOpenParentCategories((prev) =>
                Array.from(new Set([...prev, parentCat.parent_id]))
            );
      }
    } else {
      setSelectedCategory({ type: "all", id: null });
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
          const childCatIds = categories
          .filter((c) => c.parent_id === selectedCategory.id)
          .map((c) => c.id);
          matchesCategory = childCatIds.includes(product.category_id);
      } else if (selectedCategory.type === "category" && selectedCategory.id) {
        matchesCategory = product.category_id === selectedCategory.id;
      }

        let matchesPriceRange = true;
        const price = product.price ?? 0;
        if (selectedPriceRange !== "all") {
        const [minStr, maxStr] = selectedPriceRange.split("-");
        const min = parseFloat(minStr);
        const max = maxStr ? parseFloat(maxStr) : NaN;
        if (!isNaN(min) && !isNaN(max)) {
            matchesPriceRange = price >= min && price <= max;
        } else if (!isNaN(min) && isNaN(max)) {
            matchesPriceRange = price >= min;
        } else if (isNaN(min) && !isNaN(max)) {
            matchesPriceRange = price <= max;
        }
        }
        if (minPrice !== "" || maxPrice !== "") {
            const customMin = parseFloat(minPrice);
            const customMax = parseFloat(maxPrice);
            if (!isNaN(customMin) && price < customMin) {
                matchesPriceRange = false;
            }
            if (!isNaN(customMax) && price > customMax) {
                matchesPriceRange = false;
            }
        }

        return matchesSearchQuery && matchesCategory && matchesPriceRange;
    });

      // Sắp xếp
    if (sortOrder === "asc") {
        currentFilteredProducts.sort(
            (a, b) => (a.price ?? 0) - (b.price ?? 0)
        );
    } else if (sortOrder === "desc") {
        currentFilteredProducts.sort(
            (a, b) => (b.price ?? 0) - (a.price ?? 0)
        );
    } else if (sortOrder === "newest") {
        // Sequelize mặc định trả về createdAt (camelCase)
        currentFilteredProducts.sort(
            (a, b) =>
                new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
        );
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

    const priceRanges = useMemo(
        () => [
            {label: "Tất cả giá", value: "all"},
            {label: "0 VNĐ - 10,000 VNĐ", value: "0-10000"},
            {label: "10,000 VNĐ - 100,000 VNĐ", value: "10000-100000"},
            {label: "100,000 VNĐ - 1,000,000 VNĐ", value: "100000-1000000"},
            {label: "Lớn hơn 1,000,000 VNĐ", value: "1000000-"},
        ],
        []
    );

  return (
    <div>
      <div className="untree_co-section product-section before-footer-section">
        <div className="container">
          <div className="row">
              {/* Sidebar */}
            <div className="col-md-3 mb-4 sidebar-section">
              <div className="categories-dropdown">
                  <h5>Khám phá theo danh mục</h5>
                  <ul className="list-group">
                      {/* Tất cả sản phẩm */}
                      <li
                          className={`list-group-item ${selectedCategory.type === "all" ? "active-filter" : ""}`}
                          onClick={() => setSelectedCategory({type: "all", id: null})}
                      >
                          <FontAwesomeIcon
                              icon={selectedCategory.type === "all" ? faCheckSquare : faSquare}
                              className="filter-icon"
                          />{" "}
                          <span>
        <b>Tất cả sản phẩm</b>
      </span>
                      </li>
                      {/* DANH MỤC CHA */}
                      {categoryParents.map((parent) => (
                          <React.Fragment key={parent.id}>
                              <li
                                  className={`list-group-item category-parent-item ${
                                      selectedCategory.type === "parent" && selectedCategory.id === parent.id
                                          ? "active-filter"
                                          : ""
                                  }`}
                                  onClick={() => setSelectedCategory({type: "parent", id: parent.id})}
                              >
                                  <div className="category-parent-content d-flex align-items-center">
                                      {/* Ảnh danh mục cha */}
                                      {parent.images && (
                                          <img
                                              src={parent.images}
                                              alt={parent.name}
                                              width={32}
                                              height={32}
                                              style={{objectFit: "cover", borderRadius: 6, marginRight: 10}}
                                          />
                                      )}
                                      <FontAwesomeIcon
                                          icon={
                                              selectedCategory.type === "parent" && selectedCategory.id === parent.id
                                                  ? faCheckSquare
                                                  : faSquare
                                          }
                                          className="filter-icon"
                                          style={{
                                              color:
                                                  selectedCategory.type === "parent" && selectedCategory.id === parent.id
                                                      ? "#28a745"
                                                      : "#666",
                                              marginRight: 6,
                                          }}
                                      />
                                      <span
                                          style={{
                                              color:
                                                  selectedCategory.type === "parent" && selectedCategory.id === parent.id
                                                      ? "#28a745"
                                                      : "",
                                          }}
                                      >
              {parent.name}
            </span>
                                      <FontAwesomeIcon
                                          icon={openParentCategories.includes(parent.id) ? faChevronUp : faChevronDown}
                                          className={`toggle-icon ms-auto ${
                                              openParentCategories.includes(parent.id) ? "rotated" : ""
                                          }`}
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              toggleParentCategory(parent.id);
                                          }}
                                          style={{marginLeft: "auto"}}
                                      />
                                  </div>
                              </li>
                              {/* DANH MỤC CON */}
                              {openParentCategories.includes(parent.id) && (
                                  <ul className="list-group category-child-list">
                                      {categories
                                          .filter((c) => c.parent_id === parent.id)
                                          .map((sub) => (
                                              <li
                                                  key={sub.id}
                                                  className={`list-group-item d-flex align-items-center ${
                                                      selectedCategory.type === "category" && selectedCategory.id === sub.id
                                                          ? "active-filter"
                                                          : ""
                                                  }`}
                                                  onClick={() =>
                                                      setSelectedCategory({
                                                          type: "category",
                                                          id: sub.id,
                                                      })
                                                  }
                                                  style={{paddingLeft: 38}}
                                              >
                                                  {/* Ảnh danh mục con */}
                                                  {sub.images && (
                                                      <img
                                                          src={sub.images}
                                                          alt={sub.name}
                                                          width={24}
                                                          height={24}
                                                          style={{objectFit: "cover", borderRadius: 5, marginRight: 8}}
                                                      />
                                                  )}
                                                  <FontAwesomeIcon
                                                      icon={
                                                          selectedCategory.type === "category" && selectedCategory.id === sub.id
                                                              ? faCheckSquare
                                                              : faSquare
                                                      }
                                                      className="filter-icon"
                                                      style={{marginRight: 4}}
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


                {/* Filter giá, tìm kiếm giữ nguyên */}
                <div className="mt-4 filter-group">
                    <h5>Khoảng giá</h5>
                <ul className="list-group">
                  {priceRanges.map((range) => (
                    <li
                      key={range.value}
                      className={`list-group-item filter-group-item ${
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
                <div className="mb-3 mt-4">
                    <label>
                        <b>Tìm kiếm tên sản phẩm</b>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
              {/* Kết quả sản phẩm & sort */}
            <div className="col-md-9">
                <div className="sort-options-bar">
                    <span>Sắp xếp theo:</span>
                    <button
                        className={`sort-option-btn ${
                            sortOrder === "newest" ? "active-sort" : ""
                        }`}
                        onClick={() => setSortOrder("newest")}
                        type="button"
                    >
                        Mới nhất
                    </button>
                    <button
                        className={`sort-option-btn ${
                            sortOrder === "asc" ? "active-sort" : ""
                        }`}
                        onClick={() => setSortOrder("asc")}
                        type="button"
                >
                        Giá thấp
                    </button>
                    <button
                        className={`sort-option-btn ${
                            sortOrder === "desc" ? "active-sort" : ""
                        }`}
                        onClick={() => setSortOrder("desc")}
                        type="button"
                    >
                        Giá cao
                    </button>
              </div>
              <div className="row product-grid-row">
                {processedProducts.length === 0 ? (
                  <div className="col-12">
                      <p className="no-products-message">
                          Không có sản phẩm nào
                      </p>
                  </div>
                ) : (
                  processedProducts.map((product) => (
                      <ProductCard key={product.id} product={product}/>
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
