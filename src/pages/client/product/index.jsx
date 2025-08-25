// src/pages/client/product/index.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import Constants from "../../../Constanst";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import "../../../assets/css/product-listing.css";

/* ======================= Utilities (ảnh/URL an toàn) ======================= */
const NO_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
      <rect width='100%' height='100%' fill='#eee'/>
      <text x='50%' y='50%' font-family='Arial' font-size='18' fill='#999' text-anchor='middle' dominant-baseline='middle'>No Image</text>
    </svg>`
  );

const isHttp = (u) => /^https?:\/\//i.test(String(u || ""));
const absUrl = (u) => {
  if (!u) return NO_IMG;
  if (isHttp(u)) return u;
  return `${Constants.DOMAIN_API}/${String(u).replace(/^\/+/, "")}`;
};

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

  const sliderImages = ["/images/banner.png", "/images/banner1.png", "/images/banner2.png"];

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
const coerceNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const getDisplayPrice = (product) => {
  const p = coerceNumber(product?.price);
  if (p !== null) return p;

  const vPrices = Array.isArray(product?.variations)
    ? product.variations.map((v) => coerceNumber(v?.price)).filter((n) => n !== null)
    : [];
  if (vPrices.length) return Math.min(...vPrices);

  return 0;
};

const getFirstImage = (product) => {
  const vImg =
    product?.variations?.[0]?.productImages?.[0]?.image_url ??
    product?.variations?.[0]?.images?.[0]?.image_url;
  const pImg = product?.productImages?.[0]?.image_url ?? product?.images?.[0]?.image_url;
  const chosen = vImg || pImg || product?.thumbnail || product?.image_url;
  return absUrl(chosen);
};

/* Lấy "lượt mua" (sold) ưu tiên: product.sold -> tổng variations.sold -> sold_count/total_sold */
const getSoldCount = (product) => {
  const topSold = coerceNumber(product?.sold);
  if (topSold !== null) return topSold;

  if (Array.isArray(product?.variations)) {
    const sum = product.variations.reduce((acc, v) => acc + (Number(v?.sold) || 0), 0);
    if (sum > 0) return sum;
  }

  const alt =
    coerceNumber(product?.sold_count) ??
    coerceNumber(product?.total_sold) ??
    0;

  return alt || 0;
};

/* ===== normalize id ===== */
const toId = (v) => {
  if (v === null || v === undefined || v === "" || v === "null" || v === 0 || v === "0") return null;
  return String(v);
};

/* ===== lấy id danh mục từ product ===== */
const getCatIdOfProduct = (p) => toId(p?.category_id ?? p?.categoryId ?? p?.category);
const getParentIdDirectFromProduct = (p) =>
  toId(p?.categoryparent_id ?? p?.category_parent_id ?? p?.categoryParentId ?? p?.parent_category_id);

/* ======================= Product Card ======================= */
const ProductCard = ({ product }) => {
  const productPrice = getDisplayPrice(product);
  const productImage = getFirstImage(product);

  const rating = 5; // demo UI
  const soldCount = getSoldCount(product); // ✅ dùng dữ liệu thật từ BE

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card__image-container">
        <img
          src={productImage}
          className="product-card__image"
          alt={product?.name || "product"}
          onError={(e) => (e.currentTarget.src = NO_IMG)}
        />
        {/* ĐÃ XÓA badge giảm giá % theo yêu cầu */}
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
            <span className="sold-count">Lượt mua {soldCount}</span>
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

/* ======================= Ẩn scrollbar + chặn scroll chaining ======================= */
const HiddenScrollbarStyles = () => (
  <style>{`
    .discover-strip {
      scrollbar-width: none;
      -ms-overflow-style: none;
      overscroll-behavior: contain;
    }
    .discover-strip::-webkit-scrollbar { width: 0; height: 0; display: none; }

    /* Pagination look & feel — nâng lên ~5px so với trước (16px -> 11px) */
    .pgbar { display:flex; gap:8px; align-items:center; justify-content:center; margin-top:11px; }
    .pgbtn {
      border:1px solid #3b82f6;
      background:#fff;
      color:#1d4ed8;
      padding:6px 14px;
      border-radius:8px;
      font-size:14px;
      cursor:pointer;
      line-height:1;
      user-select:none;
    }
    .pgbtn[disabled] { opacity:.45; cursor:not-allowed; }
    .pgbtn.active, .pgbtn[aria-current="page"] {
      background:#1d4ed8;
      color:#fff;
      border-color:#1d4ed8;
      font-weight:600;
    }
    .pgdots{ padding:6px 10px; color:#6b7280; }
  `}</style>
);

/* ======================= DiscoverStrip: kéo mượt + click để lọc ======================= */
const DiscoverStrip = ({ items, onPick }) => {
  const ref = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0); // px/ms
  const rafId = useRef(0);
  const moved = useRef(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  const stopInertia = () => {
    cancelAnimationFrame(rafId.current);
    rafId.current = 0;
  };

  const beginInertia = () => {
    stopInertia();
    const el = ref.current;
    if (!el) return;

    const DAMPING = 0.95;
    const MIN_VEL = 0.02; // px/ms

    let prev = performance.now();
    const step = (t) => {
      const dt = t - prev;
      prev = t;

      velocity.current *= Math.pow(DAMPING, dt / 16.7);
      el.scrollLeft += velocity.current * dt;

      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft <= 0 || el.scrollLeft >= max) {
        el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft));
        stopInertia();
        return;
      }
      if (Math.abs(velocity.current) < MIN_VEL) {
        stopInertia();
        return;
      }
      rafId.current = requestAnimationFrame(step);
    };
    rafId.current = requestAnimationFrame(step);
  };

  const onPointerDown = (e) => {
    const el = ref.current;
    if (!el) return;
    isDown.current = true;
    moved.current = false;
    setDragging(true);
    startX.current = e.clientX;
    startScrollLeft.current = el.scrollLeft;

    stopInertia();
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const onPointerMove = (e) => {
    const el = ref.current;
    if (!el || !isDown.current) return;
    const dx = e.clientX - startX.current;
    if (!moved.current && Math.abs(dx) > 6) moved.current = true;

    if (moved.current) {
      e.preventDefault();
      const before = el.scrollLeft;
      el.scrollLeft = startScrollLeft.current - dx;

      const now = performance.now();
      const dt = now - lastTime.current || 16.7;
      velocity.current = (el.scrollLeft - before) / dt;
      lastTime.current = now;
    }
  };

  const onPointerUp = () => {
    const el = ref.current;
    if (!el) return;
    isDown.current = false;
    setDragging(false);
    if (moved.current && Math.abs(velocity.current) > 0.01) beginInertia();
  };

  // Wheel: đổi dọc -> ngang + khóa scroll trang
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const wheelHandler = (e) => {
      if (el.scrollWidth <= el.clientWidth) return;

      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;

      const before = el.scrollLeft;
      el.scrollLeft += delta;

      if (el.scrollLeft !== before) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener("wheel", wheelHandler, { passive: false });
    return () => el.removeEventListener("wheel", wheelHandler, { passive: false });
  }, []);

  const handleItemClick = (id) => (e) => {
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      onPick?.(id);
    }
  };

  return (
    <>
      <div
        className="discover-strip"
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          overflowY: "hidden",
          paddingBottom: 6,
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "pan-x",
          scrollSnapType: "x mandatory",
        }}
      >
        {items.map((cat) => (
          <div
            key={cat.id}
            role="button"
            title={cat.name}
            onClick={handleItemClick(cat.id)}
            style={{
              flex: "0 0 auto",
              width: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: 10,
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #eee",
              textDecoration: "none",
              scrollSnapAlign: "start",
            }}
          >
            <img
              src={cat._img || NO_IMG}
              alt={cat.name}
              onError={(e) => (e.currentTarget.src = NO_IMG)}
              style={{ width: 88, height: 88, objectFit: "cover", borderRadius: 8 }}
            />
            <span style={{ fontSize: 13, color: "#333", textAlign: "center" }}>{cat.name}</span>
          </div>
        ))}
      </div>
      {items.length > 8 && (
        <div style={{ textAlign: "right", fontSize: 12, opacity: 0.7, marginTop: 4 }}>
          Giữ chuột và kéo để xem thêm →
        </div>
      )}
    </>
  );
};

/* ======================= Pagination Bar ======================= */
const PaginationBar = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  const makePages = () => {
    const pages = [];
    const add = (p) => pages.push(p);

    const windowSize = 1;
    add(1);
    let start = Math.max(2, page - windowSize);
    let end = Math.min(totalPages - 1, page + windowSize);

    if (start > 2) add("dots-left");
    for (let p = start; p <= end; p++) add(p);
    if (end < totalPages - 1) add("dots-right");
    if (totalPages > 1) add(totalPages);

    return pages;
  };

  const items = makePages();

  return (
    <div className="pgbar">
      <button className="pgbtn" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹ Trước
      </button>

      {items.map((it, idx) =>
        typeof it === "number" ? (
          <button
            key={idx}
            className={`pgbtn ${page === it ? "active" : ""}`}
            aria-current={page === it ? "page" : undefined}
            onClick={() => onChange(it)}
          >
            {it}
          </button>
        ) : (
          <span key={idx} className="pgdots">…</span>
        )
      )}

      <button className="pgbtn" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Sau ›
      </button>
    </div>
  );
};

/* ======================= trang chính ======================= */
const ProductClient = () => {
  const [products, setProducts] = useState([]);
  const [categoriesRaw, setCategoriesRaw] = useState([]);

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState({ type: "all", id: null });
  const [expandedParents, setExpandedParents] = useState(new Set());

  // Price + sort
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedPriceRange, setAppliedPriceRange] = useState({ min: null, max: null });
  const [sortOrder, setSortOrder] = useState("newest");

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 16;

  const location = useLocation();
  const navigate = useNavigate();

  // Scroll lên đầu trang khi vào trang / đổi URL
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);
  useEffect(() => {
    scrollToTop();
  }, [location.pathname, scrollToTop]);

  useEffect(() => {
    fetchData(`${Constants.DOMAIN_API}/api/products/list`).then((data) =>
      setProducts(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [])
    );

    fetchData(`${Constants.DOMAIN_API}/api/public/categories`).then((data) =>
      setCategoriesRaw(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [])
    );
  }, []);

  /* ===== Chuẩn hoá + LỌC CATEGORIES ===== */
  const categories = useMemo(() => {
    const normalized = (Array.isArray(categoriesRaw) ? categoriesRaw : []).map((c) => {
      const pid =
        c?.parent_id === null ||
        c?.parent_id === undefined ||
        c?.parent_id === "null" ||
        c?.parent_id === 0 ||
        c?.parent_id === "0" ||
        c?.parent_id === ""
          ? null
          : String(c.parent_id);
      return {
        ...c,
        id: String(c.id),
        parent_id: pid,
        status: Number(c?.status) ?? 0,
        _img: absUrl(c?.images || c?.image),
      };
    });

    const visibleOnly = normalized.filter((c) => c.status === 1);
    const visibleParentIds = new Set(visibleOnly.filter((c) => c.parent_id === null).map((c) => c.id));
    const cleaned = visibleOnly.filter(
      (c) => c.parent_id === null || visibleParentIds.has(String(c.parent_id))
    );

    return cleaned;
  }, [categoriesRaw]);

  const visibleCatIds = useMemo(() => new Set(categories.map((c) => c.id)), [categories]);
  const categoryParents = useMemo(() => categories.filter((c) => c.parent_id === null), [categories]);
  const visibleParentIds = useMemo(() => new Set(categoryParents.map((c) => c.id)), [categoryParents]);

  // Map parent -> children
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

  // ==== Chuẩn hoá tuỳ theo product
  const normalizedProducts = useMemo(() => {
    return (Array.isArray(products) ? products : []).map((p) => ({
      ...p,
      _catId: getCatIdOfProduct(p),
      _parentId: getParentIdDirectFromProduct(p),
    }));
  }, [products]);

  // ===== Helper: lấy CHA hiệu lực của product (useCallback để ổn định) =====
  const getEffectiveParentId = useCallback(
    (p) => {
      const direct = p._parentId;
      if (direct) return String(direct);
      const cid = p._catId;
      if (!cid) return null;
      return parentOf.get(String(cid)) || null;
    },
    [parentOf]
  );

  // ===== Đọc query ?categoryId=...
  useEffect(() => {
    const params = queryString.parse(location.search);
    const raw = params.categoryId ? String(params.categoryId) : null;
    if (!raw) return;

    if (!visibleCatIds.has(raw)) {
      setSelectedFilter({ type: "all", id: null });
      setPage(1);
      return;
    }

    if (categoryParents.some((p) => p.id === raw)) {
      setSelectedFilter({ type: "parent", id: raw });
      setPage(1);
      return;
    }
    const pid = parentOf.get(raw);
    if (pid) {
      setSelectedFilter({ type: "child", id: raw });
      setExpandedParents((prev) => {
        const next = new Set(prev);
        next.add(String(pid));
        return next;
      });
      setPage(1);
    }
  }, [location.search, categoryParents, parentOf, visibleCatIds]);

  /* ===== Handlers ===== */
  const navigateAndTop = (path) => {
    navigate(path, { replace: false });
    scrollToTop();
  };

  const handleAllChange = () => {
    setSelectedFilter({ type: "all", id: null });
    setPage(1);
    navigateAndTop(`/product`);
  };

  const handleParentCheck = (parentId) => {
    setSelectedFilter({ type: "parent", id: String(parentId) });
    setPage(1);
    navigateAndTop(`/product?categoryId=${parentId}`);
  };

  const handleParentDoubleClick = (parentId) => {
    const key = String(parentId);
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleChildCheck = (childId) => {
    setSelectedFilter({ type: "child", id: String(childId) });
    setPage(1);
    navigateAndTop(`/product?categoryId=${childId}`);
  };

  const handleApplyCustomPrice = () => {
    const minNum = minPrice === "" ? null : Number.isFinite(Number(minPrice)) ? Number(minPrice) : null;
    const maxNum = maxPrice === "" ? null : Number.isFinite(Number(maxPrice)) ? Number(maxPrice) : null;

    let nextMin = minNum;
    let nextMax = maxNum;
    if (nextMin !== null && nextMax !== null && nextMin > nextMax) {
      const t = nextMin;
      nextMin = nextMax;
      nextMax = t;
    }
    setAppliedPriceRange({ min: nextMin, max: nextMax });
    setPage(1);
    scrollToTop();
  };

  const handleClearPrice = () => {
    setMinPrice("");
    setMaxPrice("");
    setAppliedPriceRange({ min: null, max: null });
    setPage(1);
    scrollToTop();
  };

  const handlePriceKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyCustomPrice();
    }
  };

  /* ===== Xử lý sản phẩm theo filter ===== */
  const processedProducts = useMemo(() => {
    let list = (Array.isArray(normalizedProducts) ? normalizedProducts : []).filter(
      (p) => Number(p?.status) === 1
    );

    // Chỉ giữ sản phẩm thuộc danh mục hiển thị
    list = list.filter((p) => {
      const cid = p._catId ? String(p._catId) : null;
      const pid = getEffectiveParentId(p);
      if (cid && !visibleCatIds.has(cid)) return false;
      if (pid && !visibleParentIds.has(pid)) return false;
      return true;
    });

    // Lọc theo danh mục đang chọn
    if (selectedFilter.type === "parent" && selectedFilter.id) {
      const pid = String(selectedFilter.id);
      list = list.filter((p) => String(getEffectiveParentId(p)) === pid);
    } else if (selectedFilter.type === "child" && selectedFilter.id) {
      const cid = String(selectedFilter.id);
      list = list.filter((p) => String(p._catId) === cid);
    }

    // Lọc giá
    const { min, max } = appliedPriceRange;
    if (min !== null || max !== null) {
      list = list.filter((p) => {
        const price = getDisplayPrice(p);
        if (min !== null && price < min) return false;
        if (max !== null && price > max) return false;
        return true;
      });
    }

    // Sắp xếp (clone để tránh mutate)
    const sorted = [...list];
    switch (sortOrder) {
      case "price_asc":
        sorted.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
        break;
      case "price_desc":
        sorted.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
        break;
      case "popular":
      case "bestselling":
        // demo: giữ nguyên
        break;
      case "newest":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b?.createdAt || b?.created_at || 0) -
            new Date(a?.createdAt || a?.created_at || 0)
        );
        break;
    }

    return sorted;
  }, [
    normalizedProducts,
    selectedFilter,
    appliedPriceRange,
    sortOrder,
    getEffectiveParentId,   // để hết cảnh báo ESLint
    visibleCatIds,
    visibleParentIds,
  ]);

  // Reset page khi filter/sort đổi
  useEffect(() => {
    setPage(1);
  }, [selectedFilter, appliedPriceRange, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedProducts.length / PAGE_SIZE));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const paginatedProducts = processedProducts.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE
  );

  // Dữ liệu cho Discover từ CHA
  const discoverItems = useMemo(
    () =>
      categoryParents.map((c) => ({
        id: c.id,
        name: c.name,
        _img: c._img || NO_IMG,
      })),
    [categoryParents]
  );

  return (
    <div className="product-listing-page">
      <HiddenScrollbarStyles />
      <div className="container">
        <div className="row">
          {/* Sidebar */}
          <aside className="col-lg-3">
            <div className="filter-sidebar">
              <h4 className="filter-title">▼ BỘ LỌC TÌM KIẾM</h4>

              {/* Danh mục */}
              <div className="filter-block">
                <h5 className="filter-block__title">Theo danh mục</h5>
                <ul className="filter-block__content filter-list">
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

                  {categoryParents.map((cat) => {
                    const key = String(cat.id);
                    const childs = childrenByParent.get(key) || [];
                    const isExpanded = expandedParents.has(key);
                    const isChecked =
                      selectedFilter.type === "parent" && String(selectedFilter.id) === key;

                    return (
                      <li key={key}>
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

                        {isExpanded && childs.length > 0 && (
                          <ul className="filter-list" style={{ paddingLeft: 20, marginTop: 6 }}>
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
                      onKeyDown={handlePriceKeyDown}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Đến"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      onKeyDown={handlePriceKeyDown}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="apply-price-btn" onClick={handleApplyCustomPrice}>
                      Áp dụng
                    </button>
                    <button
                      className="apply-price-btn"
                      onClick={handleClearPrice}
                      style={{ background: "#eee", color: "#333" }}
                    >
                      Xóa giá
                    </button>
                  </div>
                  {appliedPriceRange.min !== null || appliedPriceRange.max !== null ? (
                    <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
                      Đang áp dụng:{" "}
                      {appliedPriceRange.min !== null
                        ? appliedPriceRange.min.toLocaleString("vi-VN")
                        : "—"}{" "}
                      -{" "}
                      {appliedPriceRange.max !== null
                        ? appliedPriceRange.max.toLocaleString("vi-VN")
                        : "—"}{" "}
                      đ
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="col-lg-9">
            <TopSlider />

            {/* Khám phá theo danh mục (tất cả danh mục CHA) */}
            <div className="discover-by-category">
              <h4>Khám phá theo danh mục</h4>
              <DiscoverStrip
                items={discoverItems}
                onPick={(id) => {
                  setSelectedFilter({ type: "parent", id: String(id) });
                  setPage(1);
                  navigate(`/product?categoryId=${id}`, { replace: false });
                  scrollToTop();
                }}
              />
            </div>

            <div className="product-main-content">
              <div className="toolbar">
                <span className="sort-options__label">Sắp xếp theo</span>
                <div className="sort-options">
                  <button
                    className={`sort-options__btn ${sortOrder === "newest" ? "active" : ""}`}
                    onClick={() => {
                      setSortOrder("newest");
                      scrollToTop();
                    }}
                  >
                    Mới nhất
                  </button>

                  <button
                    className={`sort-options__btn ${sortOrder === "price_asc" ? "active" : ""}`}
                    onClick={() => {
                      setSortOrder("price_asc");
                      scrollToTop();
                    }}
                  >
                    Giá thấp
                  </button>
                  <button
                    className={`sort-options__btn ${sortOrder === "price_desc" ? "active" : ""}`}
                    onClick={() => {
                      setSortOrder("price_desc");
                      scrollToTop();
                    }}
                  >
                    Giá cao
                  </button>
                </div>
              </div>

              <div className="product-grid">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => <ProductCard key={product.id} product={product} />)
                ) : (
                  <div className="no-products-found">
                    <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                  </div>
                )}
              </div>

              {/* Pagination 16 sản phẩm/trang */}
              <PaginationBar
                page={pageSafe}
                totalPages={Math.max(1, Math.ceil(processedProducts.length / 16))}
                onChange={(p) => {
                  setPage(p);
                  scrollToTop(); // cuộn lên đầu khi đổi trang
                }}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductClient;
