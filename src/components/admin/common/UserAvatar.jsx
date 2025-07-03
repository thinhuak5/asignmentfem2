import React from "react";
import { Link } from "react-router";

const UserAvatar = () => {
  return (
    <>
      <a
        className="nav-link"
        href="javascript:void(0)"
        id="drop2"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <img
          src="./assets/images/profile/user-1.jpg"
          alt=""
          width="35"
          height="35"
          className="rounded-circle"
        />
      </a>
      <div
        className="dropdown-menu dropdown-menu-end dropdown-menu-animate-up"
        aria-labelledby="drop2"
      >
        <div className="message-body">
          <Link to="#" className="d-flex align-items-center gap-2 dropdown-item">
            <i className="ti ti-user fs-6"></i>
            <p className="mb-0 fs-3">My Profile</p>
          </Link>
          <Link to="#" className="d-flex align-items-center gap-2 dropdown-item">
            <i className="ti ti-mail fs-6"></i>
            <p className="mb-0 fs-3">My Account</p>
          </Link>
          <Link to="#" className="d-flex align-items-center gap-2 dropdown-item">
            <i className="ti ti-list-check fs-6"></i>
            <p className="mb-0 fs-3">My Task</p>
          </Link>
          <a
            href="./authentication-login.html"
            className="btn btn-outline-primary mx-3 mt-2 d-block"
          >
            Logout
          </a>
        </div>
      </div>
    </>
  );
};

export default UserAvatar;
