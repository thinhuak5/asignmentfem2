import React, {useEffect, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import Notification from "../../common/Notification";

const Header = () => {
  const [userName, setUserName] = useState("Tài khoản");
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleSidebarToggle = (e) => {
    e.preventDefault();
    const mainWrapper = document.getElementById("main-wrapper");
    if (!mainWrapper) return;
    mainWrapper.classList.toggle("mini-sidebar");
    mainWrapper.setAttribute(
        "data-sidebartype",
        mainWrapper.classList.contains("mini-sidebar") ? "mini-sidebar" : "full"
    );
    mainWrapper.classList.toggle("show-sidebar");
  };

  // Lấy tên từ JWT
  useEffect(() => {
    const updateFromToken = () => {
      const token = localStorage.getItem("authToken");
      if (!token) return setUserName("Tài khoản");
      try {
        const d = jwtDecode(token);
        if (d?.exp * 1000 > Date.now()) {
          setUserName(d?.name || d?.username || "Tài khoản");
        } else {
          setUserName("Tài khoản");
        }
      } catch {
        setUserName("Tài khoản");
      }
    };
    updateFromToken();
    window.addEventListener("storage", updateFromToken);
    window.addEventListener("authChange", updateFromToken);
    return () => {
      window.removeEventListener("storage", updateFromToken);
      window.removeEventListener("authChange", updateFromToken);
    };
  }, []);

  // Đóng menu khi click ngoài
  useEffect(() => {
    const onOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const handleAdminLogout = (e) => {
    e?.preventDefault?.();
    try {
      sessionStorage.removeItem("adminAuthed");
      // Nếu muốn đăng xuất luôn client:
      // localStorage.removeItem("authToken");
      window.dispatchEvent(new Event("authChange"));
    } catch {
    }
    navigate("/admin-login", {replace: true});
  };

  return (
      <header className="app-header">
        <nav className="navbar navbar-expand-lg navbar-light">
          <ul className="navbar-nav">
            <li className="nav-item d-block d-xl-none">
              <button
                  className="nav-link sidebartoggler bg-transparent border-0"
                  id="headerCollapse"
                  onClick={handleSidebarToggle}
              >
                <i className="ti ti-menu-2"></i>
              </button>
            </li>
            <li className="nav-item dropdown">
              <Notification/>
            </li>
          </ul>

          <div className="navbar-collapse justify-content-end px-0" id="navbarNav">
            <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-end">
              {/* Trigger: icon người + tên + chevron, ép màu cho chắc */}
              <li className="nav-item dropdown" ref={menuRef}>
                <button
                    className="bg-transparent border-0 d-flex align-items-center px-2"
                    onClick={() => setOpen((s) => !s)}
                    aria-expanded={open}
                    style={{
                      gap: 8,
                      color: "#2a3547",            // <-- ép màu chữ/icon
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                >
                  {/* Nếu font 'ti' không load, vẫn có fallback emoji */}
                  <span className="me-1" style={{display: "inline-flex", alignItems: "center"}}>
                  <i className="ti ti-user" style={{fontSize: 18}} aria-hidden="true"/>
                  <span className="visually-hidden">👤</span>
                </span>
                  <span>{userName}</span>
                  <i className="ti ti-chevron-down ms-1" style={{fontSize: 16}} aria-hidden="true"/>
                </button>

                {/* Dropdown menu */}
                <ul
                    className={`dropdown-menu dropdown-menu-end ${open ? "show" : ""}`}
                    style={{right: 0}}
                >
                  <li>
                    <Link className="dropdown-item" to="/admin/profile" onClick={() => setOpen(false)}>
                      Hồ sơ
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider"/>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleAdminLogout}>
                      <i className="ti ti-logout me-2" aria-hidden="true"/>
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
      </header>
  );
};

export default Header;
