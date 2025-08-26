// HeaderClient.js - PHIÊN BẢN CẬP NHẬT (dùng logo.png)

import { Link, NavLink, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import "../../../../assets/css/header-client.css";

const HeaderClient = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken");
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
    window.addEventListener("storage", checkAuthStatus);
    window.addEventListener("authChange", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
      window.removeEventListener("authChange", checkAuthStatus);
    };
  }, []);

  const handleLogout = (shouldNavigate = true) => {
    localStorage.removeItem("authToken");
    window.dispatchEvent(new Event("authChange"));
    if (shouldNavigate) navigate("/login");
  };

  return (
    <header className="header-client">
      <div className="header-container">
        <div id="bglogo">
          {/* Logo thay cho chữ Book Man. */}
          <Link to="/" className="header-brand" aria-label="Trang chủ">
            <img
              id="logo"
              src="/images/logo4.png"
              alt="BookMan"
              className="header-logo"
            />
          </Link>
        </div>
        <button
          className="header-toggler"
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="toggler-icon"></span>
        </button>

        <nav className={`header-nav ${isMenuOpen ? "is-open" : ""}`}>
          <ul className="nav-list nav-list-main">
            <li>
              <NavLink className="nav-link" to="/">
                Trang Chủ
              </NavLink>
            </li>
            <li>
              <NavLink className="nav-link" to="/product">
                Sản Phẩm
              </NavLink>
            </li>
            <li>
              <NavLink className="nav-link" to="/about">
                Thông tin
              </NavLink>
            </li>
            <li>
              <NavLink className="nav-link" to="/blog">
                Bài viết
              </NavLink>
            </li>
            <li>
              <NavLink className="nav-link" to="/contact">
                Liên hệ
              </NavLink>
            </li>
          </ul>

          <ul className="nav-list nav-list-cta">
            <li>
              <NavLink
                className="nav-link nav-link-icon"
                to="/cartpage"
                aria-label="Giỏ hàng"
              >
                <i className="fas fa-shopping-cart"></i>
              </NavLink>
            </li>

            {!isLoggedIn ? (
              <>
                <li>
                  <NavLink className="nav-link" to="/login">
                    Đăng nhập
                  </NavLink>
                </li>
                <li>
                  <NavLink className="nav-link cta-button" to="/register">
                    Đăng ký
                  </NavLink>
                </li>
              </>
            ) : (
              <li className="bm-user-nav">
                <a
                  className="bm-user-nav__trigger"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="fas fa-user"></i>
                  <span>{userName || "Tài khoản"}</span>
                  <i className="fas fa-chevron-down bm-user-nav__arrow"></i>
                </a>
                <ul className="bm-user-nav__menu">
                  <li>
                    <Link className="bm-user-nav__item" to="/profile">
                      Hồ sơ
                    </Link>
                  </li>
                  <li>
                    <Link className="bm-user-nav__item" to="/order-history">
                      Lịch sử đơn hàng
                    </Link>
                  </li>
                  <li>
                    <hr className="bm-user-nav__divider" />
                  </li>
                  <li>
                    <button
                      className="bm-user-nav__item bm-user-nav__item--logout"
                      onClick={() => handleLogout()}
                    >
                      <i className="fas fa-sign-out-alt"></i> Đăng xuất
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default HeaderClient;
