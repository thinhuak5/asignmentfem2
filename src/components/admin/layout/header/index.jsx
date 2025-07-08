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
                <i className="ti ti-menu-2"></i>
              </button>
            </li>
            <li className="nav-item dropdown">
              <Notification/>
            </li>
          </ul>
          <div
              className="navbar-collapse justify-content-end px-0"
              id="navbarNav"
          >
            <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-end">
              <li className="nav-item dropdown">
                <UserAvatar/>
              </li>
            </ul>
          </div>
        </nav>
      </header>
  );
};

export default Header;
