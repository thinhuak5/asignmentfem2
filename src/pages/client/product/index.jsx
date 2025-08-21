import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import queryString from "query-string";
import Constants from "../../../Constanst";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
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
    "/images/banner.png",
    "/images/banner1.png",
    "/images/banner2.png",
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
                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
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

/* ===== normalize id ===== */
const toId = (v) => {
  if (
    v === null ||
    v === undefined ||
    v === "" ||
    v === "null" ||
    v === 0 ||
    v === "0"
  )
    return null;
  return String(v);
};

/* ===== lấy id danh mục từ product ===== */
const getCatIdOfProduct = (p) =>
  toId(p?.category_id ?? p?.categoryId ?? p?.category);
const getParentIdDirectFromProduct = (p) =>
  toId(
    p?.categoryparent_id ??
      p?.category_parent_id ??
      p?.categoryParentId ??
      p?.parent_category_id
  );

/* ======================= thẻ sản phẩm ======================= */
const ProductCard = ({ product }) => {
  const productPrice = getDisplayPrice(product);
  const productImage = getFirstImage(product);

  const rating = 5; // demo UI
  const soldCount = Math.floor(Math.random() * 200) + 50; // demo UI
  const discount = Math.floor(Math.random() * 40) + 10; // demo UI

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card__image-container">
        <img
          src={productImage}
          className="product-card__image"
          alt={product?.name || "product"}
        />
        {discount > 0 && (
          <div className="product-card__discount">-{discount}%</div>
        )}
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
              <FontAwesomeIcon key={i} icon={faStar} className="star-icon" />
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
  const [categoriesRaw, setCategoriesRaw] = useState([]);

  // demo thương hiệu
  const [brands] = useState([
    { id: 1, name: "Thiên Long" },
    { id: 2, name: "Casio" },
    { id: 3, name: "Deli" },
  ]);

  // Filter state
  // selectedFilter: { type: 'all' | 'parent' | 'child', id: string|null }
  const [selectedFilter, setSelectedFilter] = useState({
    type: "all",
    id: null,
  });
  // expandedParents: Set<string>
  const [expandedParents, setExpandedParents] = useState(new Set());

  // Price + sort
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedPriceRange, setAppliedPriceRange] = useState({
    min: null,
    max: null,
  });
  const [sortOrder, setSortOrder] = useState("newest");

  const location = useLocation();

  useEffect(() => {
    fetchData(`${Constants.DOMAIN_API}/api/products/list`).then((data) =>
      setProducts(
        Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
      )
    );

    // ✅ Sau khi sửa API, endpoint này trả CẢ cha + con
    fetchData(`${Constants.DOMAIN_API}/api/public/categories`).then((data) =>
      setCategoriesRaw(
        Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
      )
    );
  }, []);

  /* ===== Chuẩn hoá CATEGORIES (id=string, parent_id=null nếu là cha) ===== */
  const categories = useMemo(() => {
    return (Array.isArray(categoriesRaw) ? categoriesRaw : []).map((c) => {
      const pid =
        c?.parent_id === null ||
        c?.parent_id === undefined ||
        c?.parent_id === "null" ||
        c?.parent_id === 0 ||
        c?.parent_id === "0" ||
        c?.parent_id === ""
          ? null
          : String(c.parent_id);
      return { ...c, id: String(c.id), parent_id: pid };
    });
  }, [categoriesRaw]);

  // Danh mục cha
  const categoryParents = useMemo(
    () => categories.filter((c) => c.parent_id === null),
    [categories]
  );

  // Map parent -> children (từ categories, vì giờ đã có con)
  const childrenByParent = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => {
      if (c.parent_id !== null) {
        const key = String(c.parent_id);
        const list = map.get(key) || [];
        list.push({ id: c.id, name: c.name });
        map.set(key, list);
      }
    });
    return map;
  }, [categories]);

  // Bản đồ parentOf: catId -> parentId (cha tự trỏ về chính nó)
  const parentOf = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => {
      if (c.parent_id === null) map.set(c.id, c.id);
      else map.set(c.id, c.parent_id);
    });
    return map;
  }, [categories]);

  // ==== Chuẩn hoá tuỳ theo product (để dễ lấy id) ====
  const normalizedProducts = useMemo(() => {
    return (Array.isArray(products) ? products : []).map((p) => ({
      ...p,
      _catId: getCatIdOfProduct(p), // có thể là CHA hoặc CON
      _parentId: getParentIdDirectFromProduct(p), // nếu BE có lưu riêng
    }));
  }, [products]);

  // ===== Đọc query ?categoryId=... để set sẵn filter + expand
  useEffect(() => {
    const params = queryString.parse(location.search);
    const raw = params.categoryId ? String(params.categoryId) : null;
    if (!raw) return;

    // Nếu là CHA (có trong categoryParents)
    if (categoryParents.some((p) => p.id === raw)) {
      setSelectedFilter({ type: "parent", id: raw });
      return;
    }
    // Nếu là CON (có trong parentOf)
    const pid = parentOf.get(raw);
    if (pid) {
      setSelectedFilter({ type: "child", id: raw });
      setExpandedParents((prev) => {
        const next = new Set(prev);
        next.add(String(pid));
        return next;
      });
    }
  }, [location.search, categoryParents, parentOf]);

  /* ===== Handlers ===== */
  const handleAllChange = () => setSelectedFilter({ type: "all", id: null });

  // 1 lần: lọc theo CHA
  const handleParentCheck = (parentId) => {
    setSelectedFilter({ type: "parent", id: String(parentId) });
  };

  // 2 lần: bung/tắt danh mục con
  const handleParentDoubleClick = (parentId) => {
    const key = String(parentId);
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // 1 lần: lọc theo CON
  const handleChildCheck = (childId) => {
    setSelectedFilter({ type: "child", id: String(childId) });
  };

  const handleApplyCustomPrice = () => {
    setAppliedPriceRange({
      min: Number.isFinite(parseFloat(minPrice)) ? parseFloat(minPrice) : null,
      max: Number.isFinite(parseFloat(maxPrice)) ? parseFloat(maxPrice) : null,
    });
  };

  /* ===== Lấy CHA hiệu lực của product ===== */
  const getEffectiveParentId = (p) => {
    // Ưu tiên field parent lưu trên product
    const direct = p._parentId;
    if (direct) return String(direct);

    // Nếu không có, suy luận từ category_id qua parentOf
    const cid = p._catId;
    if (!cid) return null;
    return parentOf.get(String(cid)) || null;
  };

  /* ===== Xử lý sản phẩm theo filter ===== */
  const processedProducts = useMemo(() => {
    let list = normalizedProducts.filter((p) => Number(p?.status) === 1);

    // Lọc theo danh mục
    if (selectedFilter.type === "parent" && selectedFilter.id) {
      const pid = String(selectedFilter.id);
      list = list.filter((p) => String(getEffectiveParentId(p)) === pid);
    } else if (selectedFilter.type === "child" && selectedFilter.id) {
      const cid = String(selectedFilter.id);
      list = list.filter((p) => String(p._catId) === cid);
    }

    // Lọc giá
    const { min, max } = appliedPriceRange;
    if (min != null || max != null) {
      list = list.filter((p) => {
        const price = getDisplayPrice(p);
        if (min != null && price < min) return false;
        if (max != null && price > max) return false;
        return true;
      });
    }

    // Sắp xếp
    switch (sortOrder) {
      case "price_asc":
        list.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
        break;
      case "price_desc":
        list.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
        break;
      case "popular":
      case "bestselling":
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
  }, [
    normalizedProducts,
    selectedFilter,
    appliedPriceRange,
    sortOrder,
    parentOf,
  ]);

  const discoverCategories = [
    {
      name: "English book",
      icon: "https://cdn1.fahasa.com/media/wysiwyg/Thang-08-2025/Icon_88_120x120.png",
    },
    {
      name: "Sách tiếng Việt",
      icon: "https://cdn1.fahasa.com/media/wysiwyg/Thang-06-2024/icon_ManngaT06.png",
    },
    {
      name: "Văn phòng phẩm",
      icon: "https://cdn1.fahasa.com/media/wysiwyg/HUYEN-1/8936235570006-1.jpg",
    },
    {
      name: "Quà lưu niệm",
      icon: "https://cdn1.fahasa.com/media/wysiwyg/Duy-VHDT/ngoai-van-t1-24(1).jpg",
    },
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
                  {/* Tất cả sản phẩm */}
                  <li>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedFilter.type === "all"}
                        onChange={handleAllChange}
                      />{" "}
                      Tất cả sản phẩm
                    </label>
                  </li>

                  {/* Cha + dropdown con */}
                  {categoryParents.map((cat) => {
                    const key = String(cat.id);
                    const childs = childrenByParent.get(key) || [];
                    const isExpanded = expandedParents.has(key);
                    const isChecked =
                      selectedFilter.type === "parent" &&
                      String(selectedFilter.id) === key;

                    return (
                      <li key={key}>
                        {/* Hàng cha */}
                        <div
                          className="category-parent-row"
                          onDoubleClick={() => handleParentDoubleClick(key)}
                          title={
                            childs.length
                              ? "Nhấp 2 lần để xem danh mục con"
                              : "Danh mục này chưa có danh mục con"
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            cursor: "default",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleParentCheck(key)}
                            style={{ cursor: "pointer" }}
                          />
                          <span style={{ userSelect: "none" }}>{cat.name}</span>
                          {childs.length > 0 && (
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 12,
                                opacity: 0.7,
                                userSelect: "none",
                              }}
                            >
                              {isExpanded ? "▼" : "▶"}
                            </span>
                          )}
                        </div>

                        {/* Dropdown con */}
                        {isExpanded && childs.length > 0 && (
                          <ul
                            className="filter-list"
                            style={{ paddingLeft: 20, marginTop: 6 }}
                          >
                            {childs.map((child) => {
                              const ckey = String(child.id);
                              const childChecked =
                                selectedFilter.type === "child" &&
                                String(selectedFilter.id) === ckey;
                              return (
                                <li key={ckey}>
                                  <label>
                                    <input
                                      type="checkbox"
                                      checked={childChecked}
                                      onChange={() => handleChildCheck(ckey)}
                                    />{" "}
                                    {child.name}
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Thương hiệu (demo) */}
              <div className="filter-block">
                <h5 className="filter-block__title">Thương hiệu</h5>
                <ul className="filter-block__content filter-list">
                  {brands.map((brand) => (
                    <li key={brand.id}>
                      <label>
                        <input type="checkbox" /> {brand.name}
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
                  <button
                    className="apply-price-btn"
                    onClick={handleApplyCustomPrice}
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="col-lg-9">
            <TopSlider />

            {/* Khám phá theo danh mục */}
            <div className="discover-by-category">
              <h4>Khám phá theo danh mục</h4>
              <div className="discover-grid">
                {discoverCategories.map((cat) => (
                  <Link to="#" key={cat.name} className="discover-item">
                    <img src={cat.icon} alt={cat.name} />
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
                    className={`sort-options__btn ${
                      sortOrder === "newest" ? "active" : ""
                    }`}
                    onClick={() => setSortOrder("newest")}
                  >
                    Mới nhất
                  </button>
                  <button
                    className={`sort-options__btn ${
                      sortOrder === "popular" ? "active" : ""
                    }`}
                    onClick={() => setSortOrder("popular")}
                  >
                    Phổ biến
                  </button>
                  <button
                    className={`sort-options__btn ${
                      sortOrder === "bestselling" ? "active" : ""
                    }`}
                    onClick={() => setSortOrder("bestselling")}
                  >
                    Bán chạy
                  </button>
                  <button
                    className={`sort-options__btn ${
                      sortOrder === "price_asc" ? "active" : ""
                    }`}
                    onClick={() => setSortOrder("price_asc")}
                  >
                    Giá thấp
                  </button>
                  <button
                    className={`sort-options__btn ${
                      sortOrder === "price_desc" ? "active" : ""
                    }`}
                    onClick={() => setSortOrder("price_desc")}
                  >
                    Giá cao
                  </button>
                </div>
              </div>

              <div className="product-grid">
                {processedProducts.length > 0 ? (
                  processedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
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
