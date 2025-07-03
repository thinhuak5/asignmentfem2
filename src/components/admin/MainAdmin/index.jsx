import "../../../assets/admin/css/styles.min.css";
import "../../../assets/admin/css/styleadmin.css";
import React from "react";
import Sidebar from "../common/Sidebar";
import Header from "../layout/header";
import Footer from "../layout/footer";
import TopStrip from "../common/TopStrip";
import { Outlet } from "react-router-dom";
const MainAdmin = () => {
  return (
    <div
      className="page-wrapper"
      id="main-wrapper"
      data-navbarbg="skin6"
      data-sidebartype="full"
      data-sidebar-position="fixed"
      data-header-position="fixed"
      data-layout="vertical"
    >
      {/* <TopStrip /> */}
      <Sidebar />
      <div className="body-wrapper">
        <Header />
        <div className="body-wrapper-inner" style={{ paddingTop: "100px" }}>
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainAdmin;
