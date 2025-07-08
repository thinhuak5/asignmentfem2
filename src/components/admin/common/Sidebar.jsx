import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (dropdownId) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  // Handle click on sidebar collapse button
  const handleSidebarCollapse = () => {
    document.getElementById("main-wrapper").classList.toggle("mini-sidebar");
    document.getElementById("main-wrapper").classList.toggle("show-sidebar");
  };

  // Set sidebar type based on screen width
  useEffect(() => {
    const setSidebarType = () => {
      const width =
        window.innerWidth > 0 ? window.innerWidth : window.screen.width;
      const mainWrapper = document.getElementById("main-wrapper");

      if (width < 1199) {
        mainWrapper.setAttribute("data-sidebartype", "mini-sidebar");
        mainWrapper.classList.add("mini-sidebar");
      } else {
        mainWrapper.setAttribute("data-sidebartype", "full");
        mainWrapper.classList.remove("mini-sidebar");
      }
    };

    // Set initial state
    setSidebarType();

    // Add resize listener
    window.addEventListener("resize", setSidebarType);

    // Cleanup
    return () => {
      window.removeEventListener("resize", setSidebarType);
    };
  }, []);

  return (
    <aside className="left-sidebar">
      <div>
        <div className="brand-logo d-flex align-items-center justify-content-between">
          <Link to="/admin" className="text-nowrap logo-img">
            <img src="/images/logo.png" alt="Logo" className="img-fluid" />
          </Link>
          <div
            className="close-btn d-xl-none d-block sidebartoggler cursor-pointer"
            id="sidebarCollapse"
            onClick={handleSidebarCollapse}
          >
            <i className="ti ti-x fs-6"></i>
          </div>
        </div>

        <nav className="sidebar-nav scroll-sidebar" data-simplebar="">
          <ul id="sidebarnav">
            {/* Home Section */}
            <li className="nav-small-cap">
              <iconify-icon
                icon="solar:menu-dots-linear"
                className="nav-small-cap-icon fs-4"
              ></iconify-icon>
              <span className="hide-menu">Quản lý</span>
            </li>
            <li className="sidebar-item">
              <Link className="sidebar-link" to="/admin" aria-expanded="false">
                <i className="ti ti-dashboard fs-6"></i>
                <span className="hide-menu">Bảng điều khiển</span>
              </Link>
            </li>

            {/* Website Section */}
            <li className="sidebar-item">
              <button
                className="sidebar-link justify-content-between has-arrow w-100 bg-transparent border-0 text-start"
                onClick={() => toggleDropdown("frontPages")}
                aria-expanded={openDropdown === "frontPages"}
              >
                <div className="d-flex align-items-center gap-3">
                  <span className="d-flex">
                    <i className="ti ti-layout-grid fs-6"></i>
                  </span>
                  <span className="hide-menu">Website</span>
                </div>
              </button>
              <ul
                aria-expanded={openDropdown === "frontPages"}
                className={`collapse first-level ${
                  openDropdown === "frontPages" ? "show" : ""
                }`}
              >
                <li className="sidebar-item">
                  <Link className="sidebar-link justify-content-between" to="/">
                    <div className="d-flex align-items-center gap-3">
                      <div className="round-16 d-flex align-items-center justify-content-center">
                        <i className="ti ti-home"></i>
                      </div>
                      <span className="hide-menu">Trang chủ</span>
                    </div>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link
                    className="sidebar-link justify-content-between"
                    to="/about"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="round-16 d-flex align-items-center justify-content-center">
                        <i className="ti ti-info-circle"></i>
                      </div>
                      <span className="hide-menu">Giới thiệu</span>
                    </div>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link
                    className="sidebar-link justify-content-between"
                    to="/contact"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="round-16 d-flex align-items-center justify-content-center">
                        <i className="ti ti-mail"></i>
                      </div>
                      <span className="hide-menu">Liên hệ</span>
                    </div>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-small-cap">
              <iconify-icon
                icon="solar:menu-dots-linear"
                className="nav-small-cap-icon fs-4"
              ></iconify-icon>
              <span className="hide-menu">Cửa hàng</span>
            </li>

            {/* Products */}
            <li className="sidebar-item">
              <Link
                className="sidebar-link"
                to="/admin/product"
                aria-expanded="false"
              >
                <i className="ti ti-book fs-6"></i>
                <span className="hide-menu">Sản Phẩm</span>
              </Link>
            </li>

            {/* Categories */}
            <li className="sidebar-item">
              <Link
                className="sidebar-link"
                to="/admin/category"
                aria-expanded="false"
              >
                <i className="ti ti-category fs-6"></i>
                <span className="hide-menu">Danh Mục Con</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link
                  className="sidebar-link"
                  to="/admin/categoryparent"
                  aria-expanded="false"
              >
                <i className="ti ti-category fs-6"></i>
                <span className="hide-menu">Danh Mục Cha</span>
              </Link>
            </li>

            {/* Orders */}
            <li className="sidebar-item">
              <Link
                className="sidebar-link"
                to="/admin/order"
                aria-expanded="false"
              >
                <i className="ti ti-shopping-cart fs-6"></i>
                <span className="hide-menu">Đơn hàng</span>
              </Link>
            </li>

            {/* Customers */}
            <li className="sidebar-item">
              <Link
                className="sidebar-link"
                to="/admin/user"
                aria-expanded="false"
              >
                <i className="ti ti-users fs-6"></i>
                <span className="hide-menu">Khách hàng</span>
              </Link>
            </li>

            {/* Comments */}
            <li className="sidebar-item">
              <Link
                className="sidebar-link"
                to="/admin/comment"
                aria-expanded="false"
              >
                <i className="ti ti-message-circle fs-6"></i>
                <span className="hide-menu">Bình luận</span>
              </Link>
            </li>

            {/* contact */}
             <li className="sidebar-item">
              <Link
                  className="sidebar-link"
                  to="/admin/contact"
                  aria-expanded="false"
              >
                <i className="ti ti-mail fs-6"></i>
                <span className="hide-menu">Hỗ trợ</span>
              </Link>
            </li>

            {/* System section */}
            <li className="nav-small-cap">
              <iconify-icon
                icon="solar:menu-dots-linear"
                className="nav-small-cap-icon fs-4"
              ></iconify-icon>
              <span className="hide-menu">Hệ thống</span>
            </li>

            {/* Settings */}
            <li className="sidebar-item">
              <Link
                className="sidebar-link"
                to="/admin/settings"
                aria-expanded="false"
              >
                <i className="ti ti-settings fs-6"></i>
                <span className="hide-menu">Cài đặt</span>
              </Link>
            </li>

            {/* Reports */}
            <li className="sidebar-item">
              <Link
                className="sidebar-link"
                to="/admin/reports"
                aria-expanded="false"
              >
                <i className="ti ti-chart-bar fs-6"></i>
                <span className="hide-menu">Báo cáo</span>
              </Link>
            </li>

            {/* Logout */}
            <li className="sidebar-item">
              <Link className="sidebar-link" to="/logout" aria-expanded="false">
                <i className="ti ti-logout fs-6"></i>
                <span className="hide-menu">Đăng xuất</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
