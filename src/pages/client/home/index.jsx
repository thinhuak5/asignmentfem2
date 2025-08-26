// src/pages/client/home/Home.jsx
import React, {useEffect, useMemo, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import Constanst from "../../../Constanst";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faBook,
  faBookmark,
  faChevronRight,
  faDollarSign,
  faFire,
  faLightbulb,
  faStar,
  faTags,
} from "@fortawesome/free-solid-svg-icons";

import "../../../assets/css/home.css";

/* -------------------- Helpers ảnh/giá an toàn -------------------- */
// Inline SVG để tránh lỗi DNS với placeholder domain
const NO_IMG =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <rect width="100%" height="100%" fill="#eee"/>
      <text x="50%" y="50%" font-family="Arial" font-size="18" fill="#999" text-anchor="middle" dominant-baseline="middle">No Image</text>
    </svg>`
    );

const isHttp = (u) => /^https?:\/\//i.test(String(u || ""));
const absUrl = (u) => {
  if (!u) return NO_IMG;
  if (isHttp(u)) return u;
  return `${Constanst.DOMAIN_API}/${String(u).replace(/^\/+/, "")}`;
};

const coerceNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Lấy giá hiển thị: ưu tiên product.price; nếu không có → min(variations[].price)
const getDisplayPrice = (product) => {
  const p = coerceNumber(product?.price);
  if (p !== null) return p;

  const vPrices = Array.isArray(product?.variations)
      ? product.variations.map((v) => coerceNumber(v?.price)).filter((n) => n !== null)
      : [];

  return vPrices.length ? Math.min(...vPrices) : 0;
};

// Chọn ảnh: ưu tiên variations[0].productImages[0].image_url → product.productImages[0].image_url
const getFirstImage = (product) => {
  const vImg =
      product?.variations?.[0]?.productImages?.[0]?.image_url ??
      product?.variations?.[0]?.images?.[0]?.image_url; // phòng khi model đặt khác tên

  const pImg =
      product?.productImages?.[0]?.image_url ?? product?.images?.[0]?.image_url;

  const chosen = vImg || pImg || product?.thumbnail || product?.image_url;
  return absUrl(chosen);
};

/** Lấy số lượt mua từ các field khả dĩ của product (tùy backend) */
const getSoldCount = (p) => {
  const v =
      p?.sold_count ??
      p?.sales_count ??
      p?.total_sold ??
      p?.totalSold ??
      p?.orders_count ??
      p?.purchase_count ??
      p?.purchased ??
      null;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  return typeof p?.view === "number" ? p.view : 0;
};

// Style bỏ gạch chân & giữ màu chữ thừa kế
const NO_UNDERLINE = {textDecoration: "none", color: "inherit"};

/* -------------------- Card sản phẩm -------------------- */
const ProductCard = ({ product }) => {
  const productPrice = getDisplayPrice(product);
  const productImage = getFirstImage(product);
  const soldCount = getSoldCount(product);

  return (
      <Link to={`/product/${product.id}`} className="product-card" style={NO_UNDERLINE}>
        <div className="product-card__image-container">
          <img
              src={productImage}
              className="product-card__image"
              alt={product?.name || "product"}
              onError={(e) => {
                e.currentTarget.src = NO_IMG;
              }}
          />
        </div>
        <div className="product-card__info">
          <h3 className="product-card__name" title={product?.name}>
            {product?.name}
          </h3>
          <div className="product-card__price-n-rating">
            <div className="product-card__price">
              {(Number(productPrice) || 0).toLocaleString("vi-VN")} VNĐ
            </div>
            <div className="product-card__review">
              {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} className="star-icon"/>
              ))}
              <span className="sold-count">Đã bán {soldCount}</span>
            </div>
          </div>
        </div>
      </Link>
  );
};

const Home = () => {
  const navigate = useNavigate();

  // 3 ảnh banner
  const heroImages = ["/images/banner.png", "/images/banner1.png", "/images/banner2.png"];
  const [slide, setSlide] = useState(0);
  const nextSlide = () => setSlide((s) => (s + 1) % heroImages.length);
  useEffect(() => {
    const id = setInterval(nextSlide, 3000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  // ---- Danh mục (grid Danh mục nổi bật) ----
  const [categoryRaw, setCategoryRaw] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(null);

  const getCategoryImage = (item) => {
    const raw = item?.images ?? item?.image ?? "";
    return raw ? absUrl(raw) : NO_IMG;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setCatLoading(true);
      setCatError(null);
      try {
        // Lấy public categories (BE đã lọc status/cha-con trong getAllPublic)
        const res = await fetch(`${Constanst.DOMAIN_API}/api/public/categories`);
        if (!res.ok) throw new Error("Không lấy được danh mục.");
        const data = await res.json();
        if (mounted) {
          const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
          // HIỂN THỊ CẢ CHA + CON
          setCategoryRaw(list);
        }
      } catch (e) {
        if (mounted) setCatError(e.message || "Lỗi danh mục.");
      } finally {
        if (mounted) setCatLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Cha trước, con sau
  const featuredCategories = useMemo(() => {
    const arr = Array.isArray(categoryRaw) ? categoryRaw : [];
    const parents = [];
    const children = [];
    for (const c of arr) {
      if (c?.parent_id == null) parents.push(c);
      else children.push(c);
    }
    return [...parents, ...children];
  }, [categoryRaw]);

  const slugify = (text) =>
      String(text || "")
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");

  // Gợi ý sản phẩm (18 sp)
  const [suggested, setSuggested] = useState([]);
  const [loadingSuggested, setLoadingSuggested] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${Constanst.DOMAIN_API}/api/products/list`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const random18 = arr.sort(() => 0.5 - Math.random()).slice(0, 18);
        setSuggested(random18);
      } catch (e) {
        console.error("Lỗi lấy gợi ý sản phẩm:", e);
      } finally {
        setLoadingSuggested(false);
      }
    })();
  }, []);

  // 6 sản phẩm mới nhất
  const [latestProducts, setLatestProducts] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [errorLatest, setErrorLatest] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        setLoadingLatest(true);
        const res = await fetch(`${Constanst.DOMAIN_API}/api/products/list`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        arr.sort((a, b) => {
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : Number(b.id) || 0;
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : Number(a.id) || 0;
          return tb - ta;
        });
        setLatestProducts(arr.slice(0, 6));
      } catch (e) {
        console.error(e);
        setErrorLatest("Không lấy được sản phẩm mới.");
      } finally {
        setLoadingLatest(false);
      }
    })();
  }, []);

  // ---------- SECTIONS từ DB (CHA có show_home=1) ----------
  const [homeSections, setHomeSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [errorSections, setErrorSections] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingSections(true);
        const res = await fetch(`${Constanst.DOMAIN_API}/api/public/home/sections?limit=6`);
        if (!res.ok) throw new Error("Không lấy được sections trang chủ");
        const data = await res.json();
        if (mounted) setHomeSections(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setErrorSections(e.message || "Lỗi sections");
      } finally {
        if (mounted) setLoadingSections(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Demo fallback
  const homeFlashSaleProductsFallback = [
    {
      id: "fs-1",
      name: "Tâm Lý Học Về Tiền",
      price: 55000,
      productImages: [
        {image_url: "https://cdn1.fahasa.com/media/catalog/product/i/m/image_220008.jpg"},
      ],
    },
    {
      id: "fs-2",
      name: "Muôn Kiếp Nhân Sinh",
      price: 125000,
      productImages: [
        {image_url: "https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg"},
      ],
    },
    {
      id: "fs-3",
      name: "Nhà Giả Kim (Tái bản 2023)",
      price: 49000,
      productImages: [
        {image_url: "https://cdn1.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg"},
      ],
    },
    {
      id: "fs-4",
      name: "Cây Cam Ngọt Của Tôi",
      price: 71000,
      productImages: [{image_url: "https://cdn1.fahasa.com/media/catalog/product/i/m/image_217480.jpg"}],
    },
    {
      id: "fs-5",
      name: "Lược Sử Loài Người",
      price: 159000,
      productImages: [{image_url: "https://cdn1.fahasa.com/media/catalog/product/b/_/b_a-sapiens.jpg"}],
    },
    {
      id: "fs-6",
      name: "Đắc Nhân Tâm",
      price: 56000,
      productImages: [{image_url: "https://cdn1.fahasa.com/media/catalog/product/9/7/9786043949247.jpg"}],
    },
  ];

  return (
      <div className="home-container">
        {/* BANNER LỚN + 2 BANNER NHỎ */}
        <section className="banner-grid">
          <div className="card hero">
            <div className="hero__stage">
              {heroImages.map((src, i) => (
                  <img key={src} src={src} alt="" className={`hero__img ${i === slide ? "is-active" : ""}`}/>
              ))}
            </div>
            <div className="hero__dots">
              {heroImages.map((_, i) => (
                  <button
                      key={i}
                      className={`hero__dot ${i === slide ? "is-active" : ""}`}
                      onClick={() => setSlide(i)}
                  />
              ))}
            </div>
          </div>

          <div className="side">
            <div className="card side__item">
              <img src={heroImages[1]} alt="" className="side__img"/>
            </div>
            <div className="card side__item">
              <img src={heroImages[2]} alt="" className="side__img"/>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="quick-links-section">
          <div className="container">
            <div className="quick-links-wrapper">
              {[
                {icon: faStar, label: "Sale 25.05"},
                {icon: faBolt, label: "Flash Sale"},
                {icon: faTags, label: "Mã Giảm Giá"},
                {icon: faFire, label: "Sản Phẩm Mới"},
                {icon: faDollarSign, label: "Rẻ Vô Đối"},
                {icon: faBookmark, label: "Manga - Comic"},
              ].map((item, index) => (
                  <Link
                      to={`#`}
                      key={index}
                      className="quick-link-item"
                      style={NO_UNDERLINE}
                  >
                    <div className="quick-link-icon-wrapper">
                      <FontAwesomeIcon icon={item.icon}/>
                    </div>
                    <span className="quick-link-label">{item.label}</span>
                  </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Sản phẩm mới nhất (6 sp) */}
        <section className="product-section">
          <div className="container">
            <div className="section-header">
              <div className="section-title-container">
                <span className="flash-sale-countdown">Sản phẩm mới nhất</span>
              </div>
              <Link to="/flash-sale" className="section-view-all" style={NO_UNDERLINE}>
                Xem tất cả <FontAwesomeIcon icon={faChevronRight}/>
              </Link>
            </div>

            {loadingLatest ? (
                <div className="text-center py-3">Đang tải sản phẩm mới...</div>
            ) : (
                <div className="product-grid-home">
                  {(latestProducts.length ? latestProducts : homeFlashSaleProductsFallback).map((product) => (
                      <ProductCard key={`latest-${product.id}`} product={product}/>
                  ))}
                </div>
            )}

            {errorLatest && <div className="text-danger small mt-2">{errorLatest}</div>}
          </div>
        </section>

        {/* Danh mục nổi bật (grid các danh mục) */}
        <section className="product-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title no-underline">
                <FontAwesomeIcon icon={faBook} className="me-2"/> Danh Mục Nổi Bật
              </h2>
            </div>

            {catLoading && <div className="text-center py-3">Đang tải danh mục...</div>}
            {catError && <div className="text-danger small mb-3">{catError}</div>}

            <div className="category-grid">
              {!catLoading && featuredCategories.length > 0
                  ? featuredCategories.slice(0, 10).map((item) => (
                      <div
                          key={item.id}
                          className="category-item"
                          onClick={() => navigate(`/product?categoryId=${item.id}`)}
                          role="button"
                      >
                        <img
                            src={getCategoryImage(item)}
                            alt={item.name || "Danh mục"}
                            className="category-image"
                            onError={(e) => (e.currentTarget.src = NO_IMG)}
                        />
                        <span className="category-label">{item.name}</span>
                      </div>
                  ))
                  : !catLoading &&
                  [...Array(10)].map((_, index) => (
                      <div key={index} className="category-item-placeholder">
                        <div className="category-image-placeholder"></div>
                        <div className="category-label-placeholder"></div>
                      </div>
                  ))}
            </div>
          </div>
        </section>

        {/* ========== SECTIONS ĐỘNG THEO DB (show_home = 1) ========== */}
        <section className="product-section">
          <div className="container">
            {loadingSections && <div className="text-center py-3">Đang tải...</div>}
            {errorSections && <div className="text-danger small mb-3">{errorSections}</div>}
            {!loadingSections && !errorSections && homeSections.length === 0 && (
                <div className="text-center py-3">
                  Chưa có danh mục CHA nào bật “Hiển thị ở Trang chủ”.
                </div>
            )}

            {homeSections.map((sec) => (
                <div key={sec.id} className="mb-5">
                  <div className="section-header">
                    <h2 className="section-title d-flex align-items-center">
                      {/* Nếu muốn kèm ảnh danh mục */}
                      {/* <img src={getSectionCover(sec.images)} alt="" width={36} height={36} className="me-2 rounded" /> */}
                      {sec.name}
                    </h2>
                    <Link to={`/product?categoryId=${sec.id}`} className="section-view-all" style={NO_UNDERLINE}>
                      Xem thêm <FontAwesomeIcon icon={faChevronRight}/>
                    </Link>
                  </div>

                  {/* Liệt kê nhanh các danh mục con */}
                  {Array.isArray(sec.children) && sec.children.length > 0 && (
                      <div className="mb-2 small text-secondary">
                        {sec.children.map((c, i) => (
                            <React.Fragment key={c.id}>
                              <Link
                                  to={`/product?categoryId=${c.id}`}
                                  className="me-2"
                                  style={NO_UNDERLINE}
                              >
                                {c.name}
                              </Link>
                              {i < sec.children.length - 1 && <span className="me-2">•</span>}
                            </React.Fragment>
                        ))}
                      </div>
                  )}

                  <div className="product-grid-home">
                    {(sec.products || []).map((product) => (
                        <ProductCard key={`sec-${sec.id}-${product.id}`} product={product}/>
                    ))}
                  </div>
                </div>
            ))}
          </div>
        </section>

        {/* Gợi ý cho bạn (18 sp + nút xem thêm) */}
        <section className="product-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <FontAwesomeIcon icon={faLightbulb} className="me-2"/> Gợi Ý Cho Bạn
              </h2>
            </div>

            {loadingSuggested ? (
                <div className="text-center py-3">Đang tải gợi ý sản phẩm...</div>
            ) : (
                <>
                  <div className="product-grid-home">
                    {(suggested.length
                            ? suggested
                            : latestProducts.length
                                ? latestProducts
                                : homeFlashSaleProductsFallback
                    )
                        .slice(0, 18)
                        .map((product) => (
                            <ProductCard key={`suggest-${product.id}`} product={product}/>
                        ))}
                  </div>
                  <div className="text-center mt-3 text-white">
                    <Link to="/product" className="btn btn-secondary" style={NO_UNDERLINE}>
                      Xem thêm
                    </Link>
                  </div>
                </>
            )}
          </div>
        </section>
      </div>
  );
};

export default Home;
