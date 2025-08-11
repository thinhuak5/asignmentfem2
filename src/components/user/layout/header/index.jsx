// HeaderClient.js - PHIÊN BẢN CẬP NHẬT

import {Link, NavLink, useNavigate} from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import {jwtDecode} from 'jwt-decode';

import "../../../../assets/css/header-client.css";

const HeaderClient = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Logic useEffect và handleLogout của bạn giữ nguyên, nó đã đúng
    useEffect(() => {
        const checkAuthStatus = () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    if (decodedToken.exp * 1000 > Date.now()) {
                        setIsLoggedIn(true);
                        setUserName(decodedToken.name);
                    } else {
                        handleLogout(false);
                    }
                } catch (error) {
                    console.error("Lỗi giải mã token:", error);
                    handleLogout(false);
                }
            } else {
                setIsLoggedIn(false);
                setUserName(null);
            }
        };

        checkAuthStatus();
        window.addEventListener('storage', checkAuthStatus);
        // Thêm listener cho sự kiện đăng nhập/đăng xuất để cập nhật ngay
        window.addEventListener('authChange', checkAuthStatus);

        return () => {
            window.removeEventListener('storage', checkAuthStatus);
            window.removeEventListener('authChange', checkAuthStatus);
        };
    }, []);

    const handleLogout = (shouldNavigate = true) => {
        localStorage.removeItem('authToken');
        // Phát sự kiện để header tự cập nhật
        window.dispatchEvent(new Event('authChange')); 
        if (shouldNavigate) {
            navigate('/login');
        }
    };


    return (
        <header className="header-client">
            <div className="header-container">
                <Link to="/" className="header-brand">Book Man<span>.</span></Link>

                <button
                    className="header-toggler"
                    aria-label="Toggle navigation"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className="toggler-icon"></span>
                </button>

                <nav className={`header-nav ${isMenuOpen ? 'is-open' : ''}`}>
                    {/* Các link nav chính giữ nguyên */}
                    <ul className="nav-list nav-list-main">
                        <li><NavLink className="nav-link" to="/">Trang Chủ</NavLink></li>
                        <li><NavLink className="nav-link" to="/product">Sản Phẩm</NavLink></li>
                        <li><NavLink className="nav-link" to="/about">Thông tin</NavLink></li>
                        <li><NavLink className="nav-link" to="/services">Dịch vụ</NavLink></li>
                        <li><NavLink className="nav-link" to="/blog">Bài viết</NavLink></li>
                        <li><NavLink className="nav-link" to="/contact">Liên hệ</NavLink></li>
                    </ul>

                    {/* CTA/User Navigation */}
                    <ul className="nav-list nav-list-cta">
                        <li>
                            <NavLink className="nav-link nav-link-icon" to="/cartpage" aria-label="Giỏ hàng">
                                <i className="fas fa-shopping-cart"></i>
                            </NavLink>
                        </li>
                        {!isLoggedIn ? (
                            <>
                                <li><NavLink className="nav-link" to="/login">Đăng nhập</NavLink></li>
                                <li><NavLink className="nav-link cta-button" to="/register">Đăng ký</NavLink></li>
                            </>
                        ) : (
                            // ========================================================
                            // === THAY ĐỔI TOÀN BỘ PHẦN DROPDOWN Ở ĐÂY ===
                            // ========================================================
                            <li className="bm-user-nav"> {/* Đổi class container */}
                                <a className="bm-user-nav__trigger" href="#" onClick={(e) => e.preventDefault()}>
                                    <i className="fas fa-user"></i>
                                    <span>{userName || 'Tài khoản'}</span>
                                    <i className="fas fa-chevron-down bm-user-nav__arrow"></i> {/* Đổi class mũi tên */}
                                </a>
                                <ul className="bm-user-nav__menu"> {/* Đổi class menu */}
                                    <li><Link className="bm-user-nav__item" to="/profile">Hồ sơ</Link></li>
                                    {/* Đổi class item */}
                                    <li><Link className="bm-user-nav__item" to="/order-history">Lịch sử đơn hàng</Link>
                                    </li>
                                    <li>
                                        <hr className="bm-user-nav__divider"/>
                                    </li>
                                    {/* Đổi class divider */}
                                    <li>
                                        <button className="bm-user-nav__item bm-user-nav__item--logout"
                                                onClick={() => handleLogout()}>
                                            <i className="fas fa-sign-out-alt"></i> Đăng xuất
                                        </button>
                                    </li>
                                </ul>
                            </li>
                            // ========================================================
                            // === KẾT THÚC THAY ĐỔI ===
                            // ========================================================
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default HeaderClient;