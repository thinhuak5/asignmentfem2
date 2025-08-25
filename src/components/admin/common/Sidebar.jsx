import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleSidebarCollapse = () => {
    const el = document.getElementById("main-wrapper");
    if (!el) return;
    el.classList.toggle("mini-sidebar");
    el.classList.toggle("show-sidebar");
  };

  useEffect(() => {
    const setSidebarType = () => {
      const width = window.innerWidth || window.screen.width || 0;
      const wrapper = document.getElementById("main-wrapper");
      if (!wrapper) return;
      if (width < 1199) {
        wrapper.setAttribute("data-sidebartype", "mini-sidebar");
        wrapper.classList.add("mini-sidebar");
      } else {
        wrapper.setAttribute("data-sidebartype", "full");
        wrapper.classList.remove("mini-sidebar");
      }
    };
    setSidebarType();
    window.addEventListener("resize", setSidebarType);
    return () => window.removeEventListener("resize", setSidebarType);
  }, []);

  return (
    <aside className="left-sidebar">
      {/* LOGO to hơn nhưng không đè menu */}
      <div className="brand-logo d-flex align-items-center justify-content-between">
        <Link to="/admin" className="text-nowrap logo-img d-flex align-items-center gap-2">
          {/* icon nhỏ cho trạng thái mini */}
          <img src="/images/logo-icon.png" alt="Logo icon" className="logo-icon"/>
          {/* logo đầy đủ */}
          <img src="/images/logo.png" alt="Book Man" className="logo-text img-fluid"/>
        </Link>

        <div
            className="close-btn d-xl-none d-block sidebartoggler cursor-pointer"
            id="sidebarCollapse"
            onClick={handleSidebarCollapse}
            aria-label="Toggle sidebar"
        >
          <i className="ti ti-x fs-6"></i>
        </div>
      </div>

      <nav className="sidebar-nav scroll-sidebar" data-simplebar="">
        <ul id="sidebarnav">
          {/* QUẢN LÝ */}
          <li className="nav-small-cap">
            <iconify-icon icon="solar:menu-dots-linear" className="nav-small-cap-icon fs-4"/>
            <span className="hide-menu">Quản lý</span>
          </li>

          <li className="sidebar-item">
            <Link className="sidebar-link" to="/admin">
              <i className="ti ti-dashboard fs-6"></i>
              <span className="hide-menu">Bảng điều khiển</span>
            </Link>
          </li>

          {/* WEBSITE */}
          <li className="sidebar-item">
            <button
                type="button"
                className="sidebar-link has-arrow w-100 bg-transparent border-0 text-start"
                onClick={() => toggleDropdown("frontPages")}
                aria-expanded={openDropdown === "frontPages"}
            >
              <div className="d-flex align-items-center gap-3">
                <span className="d-flex"><i className="ti ti-layout-grid fs-6"></i></span>
                <span className="hide-menu">Website</span>
              </div>
            </button>

            <ul
                aria-expanded={openDropdown === "frontPages"}
                className={`collapse first-level ${openDropdown === "frontPages" ? "show" : ""}`}
            >
              <li className="sidebar-item">
                <Link className="sidebar-link" to="/">
                  <div className="d-flex align-items-center gap-3">
                    <div className="round-16 d-flex align-items-center justify-content-center">
                      <i className="ti ti-home"></i>
                    </div>
                    <span className="hide-menu">Trang chủ</span>
                  </div>
                </Link>
              </li>

            </ul>
          </li>

          {/* CỬA HÀNG */}
          <li className="nav-small-cap">
            <iconify-icon icon="solar:menu-dots-linear" className="nav-small-cap-icon fs-4"/>
            <span className="hide-menu">Cửa hàng</span>
          </li>

          <li className="sidebar-item">
            <Link className="sidebar-link" to="/admin/product">
              <i className="ti ti-book fs-6"></i>
              <span className="hide-menu">Sản Phẩm</span>
            </Link>
          </li>

          <li className="sidebar-item">
            <Link className="sidebar-link" to="/admin/category">
              <i className="ti ti-category fs-6"></i>
              <span className="hide-menu">Danh Mục</span>
            </Link>
          </li>

          <li className="sidebar-item">
            <Link className="sidebar-link" to="/admin/order">
              <i className="ti ti-shopping-cart fs-6"></i>
              <span className="hide-menu">Đơn hàng</span>
            </Link>
          </li>

          <li className="sidebar-item">
            <Link className="sidebar-link" to="/admin/user">
              <i className="ti ti-users fs-6"></i>
                <span className="hide-menu">Tài khoản</span>
            </Link>
          </li>

          <li className="sidebar-item">
            <Link className="sidebar-link" to="/admin/comment">
              <i className="ti ti-message-circle fs-6"></i>
              <span className="hide-menu">Bình luận</span>
            </Link>
          </li>

          <li className="sidebar-item">
            <Link className="sidebar-link" to="/admin/contact">
              <i className="ti ti-mail fs-6"></i>
              <span className="hide-menu">Hỗ trợ</span>
            </Link>
          </li>

          <li className="sidebar-item">
            <Link className="sidebar-link" to="/admin/discount">
              <i className="ti ti-discount fs-6"></i>
              <span className="hide-menu">Mã giảm giá</span>
            </Link>
          </li>




        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
