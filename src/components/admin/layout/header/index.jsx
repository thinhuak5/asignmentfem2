import React from "react";
import Notification from "../../common/Notification";
import UserAvatar from "../../common/UserAvatar";

const Header = () => {
  const handleSidebarToggle = (e) => {
    e.preventDefault();
    const mainWrapper = document.getElementById("main-wrapper");

    // Toggle mini-sidebar class
    mainWrapper.classList.toggle("mini-sidebar");

    // Update data attribute
    if (mainWrapper.classList.contains("mini-sidebar")) {
      mainWrapper.setAttribute("data-sidebartype", "mini-sidebar");
    } else {
      mainWrapper.setAttribute("data-sidebartype", "full");
    }

    // Toggle show-sidebar for mobile view
    mainWrapper.classList.toggle("show-sidebar");
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
              <div>
                <i className="ri-dashboard-line me-2"></i>Điều khiển
              </div>
              <DropdownIcon isOpen={showDashboardSubmenu}/>
            </div>
            {showDashboardSubmenu && (
                <div className="submenu show">
                  <Link to="/admin">Xem</Link>
                </div>
            )}
          </div>

          {/* Sản phẩm */}
          <div className="sidebar-dropdown">
            <div
                onClick={() => setShowProductSubmenu(!showProductSubmenu)}
                className="sidebar-link d-flex justify-content-between align-items-center"
            >
              <div>
                <i className="ri-shopping-bag-line me-2"></i>Sản phẩm
              </div>
              <DropdownIcon isOpen={showProductSubmenu}/>
            </div>
            {showProductSubmenu && (
                <div className="submenu show">
                  <Link to="/admin/product">Danh sách sản phẩm</Link>
                </div>
            )}
          </div>

          {/* Danh mục */}
          <div className="sidebar-dropdown">
            <div
                onClick={() => setShowCategorySubmenu(!showCategorySubmenu)}
                className="sidebar-link d-flex justify-content-between align-items-center"
            >
              <div>
                <i className="ri-folder-line me-2"></i>Danh mục
              </div>
              <DropdownIcon isOpen={showCategorySubmenu}/>
            </div>
            {showCategorySubmenu && (
                <div className="submenu show">
                  <Link to="/admin/categoryparent">Danh sách danh mục cha</Link>
                  <Link to="/admin/category">Danh sách danh mục con</Link>
                </div>
            )}
          </div>

          {/* Đơn hàng */}
          <div className="sidebar-dropdown">
            <div
                onClick={() => setShowOrderSubmenu(!showOrderSubmenu)}
                className="sidebar-link d-flex justify-content-between align-items-center"
            >
              <div>
                <i className="ri-file-list-line me-2"></i>Đơn hàng
              </div>
              <DropdownIcon isOpen={showOrderSubmenu}/>
            </div>
            {showOrderSubmenu && (
                <div className="submenu show">
                  <Link to="/admin/order">Danh sách đơn hàng</Link>
                </div>
            )}
          </div>

          {/* Khách hàng */}
          <div className="sidebar-dropdown">
            <div
                onClick={() => setShowUserSubmenu(!showUserSubmenu)}
                className="sidebar-link d-flex justify-content-between align-items-center"
            >
              <div>
                <i className="ri-user-line me-2"></i>Khách hàng
              </div>
              <DropdownIcon isOpen={showUserSubmenu}/>
            </div>
            {showUserSubmenu && (
                <div className="submenu show">
                  <Link to="/admin/user">Danh sách khách hàng</Link>
                </div>
            )}
          </div>

          {/* Bình luận */}
          <div className="sidebar-dropdown">
            <div
                onClick={() => setShowCommentSubmenu(!showCommentSubmenu)}
                className="sidebar-link d-flex justify-content-between align-items-center"
            >
              <div>
                <i className="ri-message-3-line me-2"></i>Bình luận
              </div>
              <DropdownIcon isOpen={showCommentSubmenu}/>
            </div>
            {showCommentSubmenu && (
                <div className="submenu show">
                  <Link to="/admin/comment">Danh sách bình luận</Link>
                </div>
            )}
          </div>


          <div className="sidebar-dropdown">
            <div
                onClick={() => setShowCommentSubmenu(!showCommentSubmenu)}
                className="sidebar-link d-flex justify-content-between align-items-center"
            >
              <div>
                <i className="ri-message-3-line me-2"></i>Phản hồi
              </div>
              <DropdownIcon isOpen={showCommentSubmenu}/>
            </div>
            {showCommentSubmenu && (
                <div className="submenu show">
                  <Link to="/admin/contact">Phản hồi khách hàng</Link>
                </div>
            )}
          </div>
        </div>
      </>
              <i className="ti ti-menu-2"></i>
            </button>
          </li>
          <li className="nav-item dropdown">
            <Notification />
          </li>
        </ul>
        <div
          className="navbar-collapse justify-content-end px-0"
          id="navbarNav"
        >
          <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-end">
            <li className="nav-item dropdown">
              <UserAvatar />
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default HeaderAdmin;
