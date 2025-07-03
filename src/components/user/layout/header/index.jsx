import React, {useEffect, useState} from 'react';
import "../../../../assets/css/bootstrap.min.css";
import "../../../../assets/css/tiny-slider.css";
import "../../../../assets/css/style.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "@fortawesome/fontawesome-free/css/all.min.css";
import {Link, useNavigate} from 'react-router';
import {jwtDecode} from 'jwt-decode';

const HeaderClient = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState(null);
    const navigate = useNavigate();

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

        return () => {
            window.removeEventListener('storage', checkAuthStatus);
        };

    }, []);

    const handleLogout = (shouldNavigate = true) => {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
        setUserName(null);
        if (shouldNavigate) {
            navigate('/login');
        }
    };

    return (
        <>
            <nav className="custom-navbar navbar navbar navbar-expand-md navbar-dark "
                 arial-label="Furni navigation bar">

                <div className="container">
                    <a className="navbar-brand" href="index.html">Book Man<span>.</span></a>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarsFurni" aria-controls="navbarsFurni" aria-expanded="false"
                            aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarsFurni">
                        <ul className="custom-navbar-nav navbar-nav ms-auto mb-2 mb-md-0">
                            <li className="nav-item ">
                                <Link className="nav-link" to={"/"}>Trang Chủ</Link>
                            </li>
                            <li><Link className="nav-link" to={"/product"}>Sản Phẩm</Link></li>
                            <li><Link className="nav-link" to={"/about"}>Thông tin</Link></li>
                            <li><Link className="nav-link" to={"/services"}>Dịch vụ</Link></li>
                            <li><Link className="nav-link" to={"/blog"}>Bài viết</Link></li>
                            <li><Link className="nav-link" to={"/contact"}>Liên hệ</Link></li>
                            <li><Link className="nav-link" to={"/cartpage"}><img src="images/cart.svg"/></Link></li>
                        </ul>

                        <ul className="custom-navbar-cta navbar-nav mb-2 mb-md-0 ms-5">
                            {!isLoggedIn ? (
                                <>
                                    <li><Link className="nav-link" to={"/login"}>Đăng nhập</Link></li>
                                    <li><Link className="nav-link" to={"/register"}>Đăng ký</Link></li>
                                </>
                            ) : (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle d-flex align-items-center" href="#"
                                       id="navbarDropdownUserLink" role="button" data-bs-toggle="dropdown"
                                       aria-expanded="false">
                                        <i className="fas fa-user me-2"></i>
                                        {userName || 'Tài khoản'}
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end"
                                        aria-labelledby="navbarDropdownUserLink">
                                        <li><Link className="dropdown-item" to="/profile">Hồ sơ</Link></li>
                                        <li><Link className="nav-link-dropdown-item" to="/order-history">Đơn hàng của
                                            tôi</Link></li>
                                        <li>
                                            <hr className="dropdown-divider"/>
                                        </li>
                                        <li>
                                            <button className="dropdown-item" onClick={() => handleLogout()}>
                                                <i className="fas fa-sign-out-alt me-1"></i> Đăng xuất
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            )}

                        </ul>
                    </div>
                </div>

            </nav>
        </>
    )
}
export default HeaderClient;
