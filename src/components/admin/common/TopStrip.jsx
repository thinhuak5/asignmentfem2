import React, { useState } from "react";

const TopStrip = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="app-topstrip bg-dark py-6 px-3 w-100 d-lg-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center justify-content-center gap-5 mb-2 mb-lg-0">
        <a className="d-flex justify-content-center" href="#">
          <img
            src="assets/images/logos/logo-wrappixel.svg"
            alt="Logo"
            width="150"
          />
        </a>
      </div>

      <div className="d-lg-flex align-items-center gap-2 py-2">
        <h3 className="text-white mb-2 mb-lg-0 fs-5 text-center">
          Check Flexy Premium Version
        </h3>
        <div className="d-flex align-items-center justify-content-center gap-2"></div>
      </div>
    </div>
  );
};

export default TopStrip;
