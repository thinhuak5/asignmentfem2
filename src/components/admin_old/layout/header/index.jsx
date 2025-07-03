import "../../../../assets/admin/css/styleadmin.css";
import {Link} from "react-router";
import {useState} from "react";
import {FaChevronDown} from "react-icons/fa";

const HeaderAdmin = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProductSubmenu, setShowProductSubmenu] = useState(false);
  const [showCategorySubmenu, setShowCategorySubmenu] = useState(false);
  const [showOrderSubmenu, setShowOrderSubmenu] = useState(false);
  const [showUserSubmenu, setShowUserSubmenu] = useState(false);
  const [showCommentSubmenu, setShowCommentSubmenu] = useState(false);
  const [showDashboardSubmenu, setShowDashboardSubmenu] = useState(false);

  const DropdownIcon = ({isOpen}) => (
      <span className={`ms-2 ${isOpen ? "rotate-180" : "rotate-0"}`}>
      <FaChevronDown/>
    </span>
  );

  return (
      <>
        <div className="sidebar d-flex flex-column p-3">
          <img src="images/logo.png" className="img-fluid mb-3" alt="Sách"/>
          <hr/>

          {/* Điều khiển */}
          <div className="sidebar-dropdown">
            <div
                onClick={() => setShowDashboardSubmenu(!showDashboardSubmenu)}
                className="sidebar-link d-flex justify-content-between align-items-center"
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
        </div>
      </>
  );
};

export default HeaderAdmin;
