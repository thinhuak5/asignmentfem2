import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';

const Home = () => {
    return (
        <div className="min-vh-100">
            <div className="hidden hero">
                <div className="container">
                    <div className="row justify-content-between">
                        <div className="col-lg-5">
                            <div className="intro-excerpt">
                                <h1>Sách Hay <span className="d-block">Thế Giới Tri Thức</span></h1>
                                <p className="mb-4">
                                    Khám phá thế giới qua từng trang sách. Không gì tuyệt vời hơn việc đắm mình trong
                                    những câu chuyện và kiến thức mới mẻ.
                                </p>
                                <p>
                                    <a href="#" className="btn btn-secondary me-2">Mua Ngay</a>
                                    <a href="#" className="btn btn-white-outline">Khám Phá</a>
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="hero-img-wrap">
                                <img src="images/anhnen.png" className="img-fluid" alt="Sách" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Hero section (ẩn hiện theo nhu cầu) */}
            <div className="d-none hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-5 text-center text-lg-start mb-3 mb-lg-0">
                            <h1>Sách Hay <span className="d-block">Thế Giới Tri Thức</span></h1>
                            <p className="mb-4">
                                Khám phá thế giới qua từng trang sách. Không gì tuyệt vời hơn việc đắm mình trong
                                những câu chuyện và kiến thức mới mẻ.
                            </p>
                            <a href="#" className="btn btn-secondary me-2 mb-2">Mua Ngay</a>
                            <a href="#" className="btn btn-outline-secondary mb-2">Khám Phá</a>
                        </div>
                        <div className="col-lg-7 text-center">
                            <img src="images/anhnen.png" className="img-fluid" alt="Sách" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini Banners */}
            <div className="container py-4">
                <div className="row">
                    {[
                        {
                            img: "https://via.placeholder.com/400x200/FF6F61/fff?text=Thứ+4+vàng",
                            text: "THỨ 4 NGÀY VÀNG\nFREESHIP NGẬP TRÀN"
                        },
                        {
                            img: "https://via.placeholder.com/400x200/FFA07A/fff?text=Đồ+Chơi",
                            text: "GIAN HÀNG ĐỒ CHƠI\nCÙNG VUI MUÔN NƠI"
                        },
                        {
                            img: "https://via.placeholder.com/400x200/87CEFA/fff?text=Đinh+Tị+Books",
                            text: "CÙNG ĐINH TỊ BOOKS\nGIẢM GIÁ LÊN ĐẾN 50%"
                        },
                        {
                            img: "https://via.placeholder.com/400x200/FFE4B5/000?text=Best+Deals",
                            text: "HOT PICKS, COOL PRICES!\nMAY'S BEST DEALS"
                        }
                    ].map((banner, index) => (
                        <div className="col-12 col-sm-6 col-lg-3 mb-3" key={index}>
                            <div className="bg-white shadow-sm rounded h-100 d-flex flex-column">
                                <img src={banner.img} alt={`Banner ${index + 1}`} className="w-100" />
                                <div className="p-2 text-center flex-grow-1 d-flex flex-column justify-content-between">
                                    <p className="fw-bold small">
                                        {banner.text.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                                    </p>
                                    <button className="btn btn-danger btn-sm">MUA NGAY</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Horizontal Categories */}
            <div className="bg-white py-3">
                <div className="container">
                    <div className="d-flex justify-content-center gap-3 overflow-auto pb-2 flex-nowrap">
                        {[
                            { icon: "🌟", label: "25.05" },
                            { icon: "⚡", label: "Flash Sale" },
                            { icon: "🏢", label: "Đinh Tị" },
                            { icon: "📘", label: "McBooks" },
                            { icon: "🏷️", label: "Mã Giảm Giá" },
                            { icon: "🆕", label: "Sản Phẩm Mới" },
                            { icon: "💖", label: "Được Trợ Giá" },
                            { icon: "🏪", label: "Đồ Cũ" },
                            { icon: "📦", label: "Bán Sỉ" },
                            { icon: "📚", label: "Manga" }
                        ].map((item, index) => (
                            <div key={index} className="text-center" style={{ minWidth: 80 }}>
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto" style={{ width: 60, height: 60, fontSize: 24 }}>
                                    {item.icon}
                                </div>
                                <div className="small mt-2">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Flash Sale Banner */}
            <div style={{ backgroundColor: '#3b5d50' }} className=" text-white p-3 d-flex justify-content-between align-items-center flex-column flex-md-row text-center text-md-start">
                <div className="mb-2 mb-md-0">
                    <span className="text-danger fw-bold me-2">FLASH SALE</span>
                    <span>Kết thúc trong: 01 : 11 : 50</span>
                </div>
                <a href="#" className="text-info">Xem tất cả &gt;</a>
            </div>

            {/* Flash Sale Products */}
            <div style={{ backgroundColor: '#88b584' }} className="py-4"> {/* xanh lá cây nhạt */}
                <div className="container">
                    <div className="row">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="col-6 col-md-4 col-lg-2 mb-4">
                                <div className="bg-white rounded shadow-sm h-100 d-flex flex-column p-2">
                                    <img
                                        src={`https://picsum.photos/seed/flash${index + 1}/200/200`}
                                        alt={`Flash Sale ${index + 1}`}
                                        className="w-100 object-cover mb-2"
                                    />
                                    <h3 className="text-sm fw-semibold mb-2">Sách Flash {index + 1}</h3>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="text-danger fw-bold mb-0">55.000 đ</p>
                                            <p className="text-muted text-decoration-line-through small">85.000 đ</p>
                                        </div>
                                        <div className="bg-danger text-white small px-1 rounded">-35%</div>
                                    </div>
                                    <button className="btn btn-dark btn-sm w-100 mt-2">Đặt hàng</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Product Categories */}
            <div className="container py-5">
                <h2 className="h5 fw-bold d-flex align-items-center mb-4">
                    <span className="me-2">📚</span>
                    Danh mục sản phẩm
                </h2>
                <div className="d-flex flex-wrap justify-content-center gap-3">
                    {[...Array(10)].map((_, index) => (
                        <div key={index} className="text-center" style={{ width: 80 }}>
                            <div className="border rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: 60, height: 60 }}>
                                <img src="https://via.placeholder.com/40" alt={`Danh mục ${index + 1}`} className="img-fluid" />
                            </div>
                            <span className="small mt-2 d-block">Danh mục {index + 1}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Xu Hướng Mua Sắm */}
            <div className="bg-gradient text-white py-4" style={{ background: 'linear-gradient(to right, #4b0082, #800080)' }}>
                <div className="container">
                    <h2 className="h5 text-dark fw-bold d-flex align-items-center mb-4">
                        <span className="bg-white text-danger rounded-circle px-2 py-1 me-2">❤️</span>
                        Xu Hướng Mua Sắm
                    </h2>
                    {[0, 1].map((row) => (
                        <div key={row} className="row mb-3">
                            {[...Array(6)].map((_, i) => {
                                const index = row * 6 + i;
                                return (
                                    <div key={index} className="col-6 col-md-4 col-lg-2 mb-4">
                                        <div className="bg-white text-dark rounded shadow-sm h-100 d-flex flex-column">
                                            <div className="position-relative">
                                                <img
                                                    src={`https://picsum.photos/seed/trend${index}/300/200`}
                                                    alt={`Xu hướng ${index + 1}`}
                                                    className="w-100"
                                                />
                                                <div className="position-absolute top-0 start-0 bg-danger text-white small px-2 py-1">Giảm 30%</div>
                                            </div>
                                            <div className="p-2 flex-grow-1 d-flex flex-column justify-content-between">
                                                <h3 className="small fw-semibold">Sản phẩm xu hướng {index + 1}</h3>
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <div>
                                                        <p className="text-danger fw-bold small">{(100000 + index * 10000).toLocaleString('vi-VN')} đ</p>
                                                        <p className="text-muted text-decoration-line-through small">{(150000 + index * 10000).toLocaleString('vi-VN')} đ</p>
                                                    </div>
                                                    <div className="bg-danger text-white small px-1 rounded">-30%</div>
                                                </div>
                                                <button className="btn btn-danger btn-sm w-100 mt-2">Đặt hàng</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bộ Sưu Tập Nổi Bật */}
            <div className="container mt-5">
                <div className="bg-light p-3 rounded">
                    <h5 className="fw-bold text-danger mb-3 text-center">
                        <i className="bi bi-stars"></i> BỘ SƯU TẬP NỔI BẬT
                    </h5>
                    <div className="d-flex flex-wrap justify-content-center gap-4">
                        {[
                            "Baby Three",
                            "Doremon",
                            "Capybara",
                            "Conan",
                            "One Piece",
                            "Panda - Gấu trúc",
                            "Disney",
                            "Sanrio"
                        ].map((name, idx) => (
                            <div key={idx} className="text-center">
                                <img
                                    src={`https://via.placeholder.com/80?text=${name.split(" ")[0]}`}
                                    alt={name}
                                    className="rounded-circle mb-2"
                                />
                                <p className="small">{name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Thương Hiệu Nổi Bật */}
            <div className="container mt-5 mb-5">
                <div className="bg-white p-3 rounded shadow-sm">
                    <h5 className="fw-bold text-danger mb-3">
                        <i className="bi bi-shop"></i> Thương hiệu nổi bật
                    </h5>
                    <Tabs defaultActiveKey="Sbooks" className="mb-3">
                        {["Sbooks", "Đinh Tị", "Patech"].map((brand, index) => (
                            <Tab eventKey={brand} title={brand} key={index}>
                                <div className="row">
                                    {[...Array(6)].map((_, i) => (
                                        <div className="col-6 col-md-4 col-lg-2 mb-3" key={i}>
                                            <div className="border rounded p-2 h-100">
                                                <img
                                                    src={`https://via.placeholder.com/150x220?text=Book+${i + 1}`}
                                                    alt="book"
                                                    className="w-100 mb-2"
                                                />
                                                <p className="small mb-1 text-danger">Xu hướng 🔥</p>
                                                <p className="small fw-bold mb-1">Tên sách mẫu {i + 1}</p>
                                                <p className="text-muted small mb-0">Giá: <strong>69.000đ</strong></p>
                                                <p className="text-muted small">Đã bán: {Math.floor(Math.random() * 1000)}+</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Tab>
                        ))}
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default Home;
