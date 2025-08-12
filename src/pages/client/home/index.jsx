import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import Constanst from "../../../Constanst";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBolt,
    faBook,
    faBookmark,
    faBookOpen,
    faChevronRight,
    faDollarSign,
    faFire,
    faLightbulb,
    faSchool,
    faStar,
    faTags,
} from "@fortawesome/free-solid-svg-icons";

import "../../../assets/css/home.css";

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

const ProductCard = ({ product }) => {
  const productPrice = product.price ?? product.variations?.[0]?.price ?? 0;
  const productImage =
    product.variations?.[0]?.productImages?.[0]?.image_url ??
    product.productImages?.[0]?.image_url ??
    "https://via.placeholder.com/300x300.png?text=No+Image";

  const soldCount = getSoldCount(product);

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card__image-container">
        <img
          src={productImage}
          className="product-card__image"
          alt={product.name}
        />
      </div>
      <div className="product-card__info">
        <h3 className="product-card__name" title={product.name}>
          {product.name}
        </h3>
        <div className="product-card__price-n-rating">
          <div className="product-card__price">
            {productPrice.toLocaleString("vi-VN")} VNĐ
          </div>
          <div className="product-card__review">
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon key={i} icon={faStar} className="star-icon" />
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
  const heroImages = [
    "https://cdn1.fahasa.com/media/magentothem/banner7/Trangdungcuhoctap_840x320.png",
    "https://file.hstatic.net/1000230347/collection/vpp_828d5e53921b4e31bc81df3170f9e39b.jpg",
    "https://vanphongphamthanhthai.com/wp-content/uploads/2022/09/van-phong-pham-thanh-thai.png",
  ];

  const [slide, setSlide] = useState(0);
  const nextSlide = () => setSlide((s) => (s + 1) % heroImages.length);
  const prevSlide = () =>
    setSlide((s) => (s - 1 + heroImages.length) % heroImages.length);

  // Auto-rotate 3s
  useEffect(() => {
    const id = setInterval(nextSlide, 3000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  // ---- Danh mục cha ----
  const [categoryParents, setCategoryParents] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(null);

  const getCategoryImage = (item) => {
    const raw = item?.images ?? item?.image ?? "";
    if (!raw) return "https://via.placeholder.com/80?text=...";
    if (/^https?:\/\//i.test(raw)) return raw;
    return `${Constanst.DOMAIN_API}/${String(raw).replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setCatLoading(true);
      setCatError(null);
      try {
        let res = await fetch(`${Constanst.DOMAIN_API}/api/categories/parents`);
        if (!res.ok) {
          res = await fetch(`${Constanst.DOMAIN_API}/api/categoryparents`);
        }
        if (!res.ok) throw new Error("Không lấy được danh mục cha.");
        const data = await res.json();
        if (mounted) setCategoryParents(Array.isArray(data) ? data : []);
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

  const slugify = (text) =>
    text
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
        const arr = Array.isArray(data) ? data : [];
        const random18 = arr.sort(() => 0.5 - Math.random()).slice(0, 18);
        setSuggested(random18);
      } catch (e) {
        console.error("Lỗi lấy gợi ý sản phẩm:", e);
      } finally {
        setLoadingSuggested(false);
      }
    })();
  }, []);

  // 6 sản phẩm mới nhất (Flash Sale khu vực trên)
  const [latestProducts, setLatestProducts] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [errorLatest, setErrorLatest] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingLatest(true);
        const res = await fetch(`${Constanst.DOMAIN_API}/api/products/list`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        arr.sort((a, b) => {
          const tb = b.createdAt
            ? new Date(b.createdAt).getTime()
            : Number(b.id) || 0;
          const ta = a.createdAt
            ? new Date(a.createdAt).getTime()
            : Number(a.id) || 0;
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

  // Demo fallback nếu cần
  const homeFlashSaleProductsFallback = [
    {
      id: "fs-1",
      name: "Tâm Lý Học Về Tiền",
      price: 55000,
      productImages: [
        {
          image_url:
            "https://cdn1.fahasa.com/media/catalog/product/i/m/image_220008.jpg",
        },
      ],
    },
    {
      id: "fs-2",
      name: "Muôn Kiếp Nhân Sinh",
      price: 125000,
      productImages: [
        {
          image_url:
            "https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg",
        },
      ],
    },
    {
      id: "fs-3",
      name: "Nhà Giả Kim (Tái bản 2023)",
      price: 49000,
      productImages: [
        {
          image_url:
            "https://cdn1.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg",
        },
      ],
    },
    {
      id: "fs-4",
      name: "Cây Cam Ngọt Của Tôi",
      price: 71000,
      productImages: [
        {
          image_url:
            "https://cdn1.fahasa.com/media/catalog/product/i/m/image_217480.jpg",
        },
      ],
    },
    {
      id: "fs-5",
      name: "Lược Sử Loài Người",
      price: 159000,
      productImages: [
        {
          image_url:
            "https://cdn1.fahasa.com/media/catalog/product/b/_/b_a-sapiens.jpg",
        },
      ],
    },
    {
      id: "fs-6",
      name: "Đắc Nhân Tâm",
      price: 56000,
      productImages: [
        {
          image_url:
            "https://cdn1.fahasa.com/media/catalog/product/9/7/9786043949247.jpg",
        },
      ],
    },
  ];

  // Sách giáo khoa (demo)
  const textbooksProducts = [
    {
      id: "sgk-1",
      name: "SGK Lớp 1 - Bộ Cơ Bản",
      price: 180000,
      productImages: [
        {
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPzp4p2YvO3xVnyPBq5k57up389IHHamLaSg&s",
        },
      ],
    },
    {
      id: "sgk-2",
      name: "SGK Lớp 6 - Bộ Cơ Bản",
      price: 320000,
      productImages: [
        {
          image_url:
            "https://thcs.toanmath.com/wp-content/uploads/2022/08/sach-giao-khoa-toan-6-tap-1-chan-troi-sang-tao.png",
        },
      ],
    },
    {
      id: "sgk-3",
      name: "SGK Lớp 10 - Bộ Cơ Bản",
      price: 450000,
      productImages: [
        {
          image_url:
            "https://online.pubhtml5.com/fhmh/zppb/files/large/1.jpg?1655188733",
        },
      ],
    },
    {
      id: "sgk-4",
      name: "Bài Tập Toán 9",
      price: 48000,
      productImages: [
        {
          image_url:
            "https://thcs.toanmath.com/wp-content/uploads/2023/12/sach-giao-khoa-toan-9-tap-1-ket-noi-tri-thuc-voi-cuoc-song.png",
        },
      ],
    },
    {
      id: "sgk-5",
      name: "Ngữ Văn 12 (Tập 1)",
      price: 52000,
      productImages: [
        {
          image_url: "https://nhasachphuongnam.com/images/detailed/287/ngu-van-lop-12-tap-1-chan-troi-sang-tao.jpg",
        },
      ],
    },
    {
      id: "sgk-6",
      name: "Tiếng Anh 7 (Sách Học Sinh)",
      price: 62000,
      productImages: [
        { image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMj_3PxRvmeuXqAVTrGHS4V_-o2NkDUgceRw&s" },
      ],
    },
  ];

  // Xu hướng tựu trường (demo)
  const backToSchoolProducts = [
    {
      id: "bts-1",
      name: "Bút Bi Thiên Long TL-07",
      price: 5000,
      productImages: [
        { image_url: "https://product.hstatic.net/1000362139/product/tl0368_cc3fd71c54b043c6ac39c5f5e17711c7_grande.jpg" },
      ],
    },
    {
      id: "bts-2",
      name: "Vở Kẻ Ngang 200 Trang",
      price: 17000,
      productImages: [
        {
          image_url:
            "https://vanphongphamhl.vn/images/products/2024/01/12/large/vo-a4-200-trang-hong-ha-2_1705050755.jpg",
        },
      ],
    },
    {
      id: "bts-3",
      name: "Balo Học Sinh Chống Gù",
      price: 390000,
      productImages: [
        {
          image_url:
            "https://mia.vn/media/uploads/tin-tuc/tieu-chi-chon-balo-chong-gu-cho-hoc-sinh-cap-2-top-san-pham-duoc-yeu-thich-05-1679682649.jpeg",
        },
      ],
    },
    {
      id: "bts-4",
      name: "Bộ Dụng Cụ Học Tập 8 Món",
      price: 89000,
      productImages: [
        {
          image_url:
            "https://muamuaonline.com/upload/deals/files/bo-dung-cu-hoc-tap-8-mon-cho-be-3_1457994970.jpg",
        },
      ],
    },
    {
      id: "bts-5",
      name: "Thước Kẻ 20cm",
      price: 6000,
      productImages: [
        {
          image_url: "https://bizweb.dktcdn.net/thumb/grande/100/521/268/products/image-2024-08-06t103749-112-1722915475088.jpg?v=1730796059243",
        },
      ],
    },
    {
      id: "bts-6",
      name: "Hộp Bút Nhựa 2 Ngăn",
      price: 49000,
      productImages: [
        { image_url: "https://chiaki.vn/upload/product/2022/01/hop-but-nhua-2-ngan-cho-hoc-sinh-61d6544384eac-06012022093027.jpg" },
      ],
    },
  ];

  return (
    <div className="home-container">
      {/* BANNER LỚN + 2 BANNER NHỎ */}
      <section className="banner-grid">
        <div className="card hero">
          <div className="hero__stage">
            {heroImages.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className={`hero__img ${i === slide ? "is-active" : ""}`}
              />
            ))}
          </div>
          <button className="hero__arrow hero__arrow--prev" onClick={prevSlide}>
            ‹
          </button>
          <button className="hero__arrow hero__arrow--next" onClick={nextSlide}>
            ›
          </button>
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
            <img src={heroImages[1]} alt="" className="side__img" />
          </div>
          <div className="card side__item">
            <img src={heroImages[2]} alt="" className="side__img" />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="quick-links-section">
        <div className="container">
          <div className="quick-links-wrapper">
            {[
              { icon: faStar, label: "Sale 25.05" },
              { icon: faBolt, label: "Flash Sale" },
              { icon: faTags, label: "Mã Giảm Giá" },
              { icon: faFire, label: "Sản Phẩm Mới" },
              { icon: faDollarSign, label: "Rẻ Vô Đối" },
              { icon: faBookmark, label: "Manga - Comic" },
            ].map((item, index) => (
              <Link
                to={`/products?tag=${slugify(item.label)}`}
                key={index}
                className="quick-link-item"
              >
                <div className="quick-link-icon-wrapper">
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <span className="quick-link-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale (6 sp mới nhất) */}
      <section className="product-section">
        <div className="container">
          <div className="section-header">
            <div className="section-title-container">
              <span className="flash-sale-countdown">
                Kết thúc trong: 01 : 11 : 50
              </span>
            </div>
            <Link to="/flash-sale" className="section-view-all">
              Xem tất cả <FontAwesomeIcon icon={faChevronRight} />
            </Link>
          </div>

          {loadingLatest ? (
            <div className="text-center py-3">Đang tải sản phẩm mới...</div>
          ) : (
            <div className="product-grid-home">
              {(latestProducts.length
                ? latestProducts
                : homeFlashSaleProductsFallback
              ).map((product) => (
                <ProductCard key={`latest-${product.id}`} product={product} />
              ))}
            </div>
          )}

          {errorLatest && (
            <div className="text-danger small mt-2">{errorLatest}</div>
          )}
        </div>
      </section>

      {/* Danh mục nổi bật */}
      <section className="product-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faBook} className="me-2" /> Danh Mục Nổi
              Bật
            </h2>
          </div>

          {catLoading && (
            <div className="text-center py-3">Đang tải danh mục...</div>
          )}
          {catError && <div className="text-danger small mb-3">{catError}</div>}

          <div className="category-grid">
            {!catLoading && categoryParents.length > 0
              ? categoryParents.map((item) => (
                  <div
                    key={item.id}
                    className="category-item"
                    onClick={() =>
                      navigate(`/product?categoryparentId=${item.id}`)
                    }
                    role="button"
                  >
                    <img
                      src={getCategoryImage(item)}
                      alt={item.name || "Danh mục"}
                      className="category-image"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/80?text=...";
                      }}
                    />
                    <span className="category-label">{item.name}</span>
                  </div>
                ))
              : !catLoading &&
                [...Array(12)].map((_, index) => (
                  <div key={index} className="category-item-placeholder">
                    <div className="category-image-placeholder"></div>
                    <div className="category-label-placeholder"></div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Sách giáo khoa */}
      <section className="product-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faBookOpen} className="me-2" /> Sách Giáo
              Khoa
            </h2>
            <Link to="/category/textbooks" className="section-view-all">
              Xem thêm <FontAwesomeIcon icon={faChevronRight} />
            </Link>
          </div>
          <div className="product-grid-home">
            {textbooksProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Xu hướng tựu trường */}
      <section className="product-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faSchool} className="me-2" /> Xu Hướng Tựu
              Trường
            </h2>
            <Link to="/back-to-school" className="section-view-all">
              Xem thêm <FontAwesomeIcon icon={faChevronRight} />
            </Link>
          </div>
          <div className="product-grid-home">
            {backToSchoolProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Gợi ý cho bạn (18 sp + nút xem thêm) */}
      <section className="product-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faLightbulb} className="me-2" /> Gợi Ý Cho
              Bạn
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
                    <ProductCard
                      key={`suggest-${product.id}`}
                      product={product}
                    />
                  ))}
              </div>
              <div className="text-center mt-3">
                <Link to="/product" className="btn btn-secondary">
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