import React from "react";
import { FaHeart, FaRegClock } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer-admin">
      <div className="container">
        <p>© {new Date().getFullYear()} Book Man - Hệ thống quản lý bán sách</p>
        <p>
          Liên hệ hỗ trợ:{" "}
          <a href="mailto:support@bookman.com">support@bookman.com</a>
        </p>
        <ul className="footer-links">
          <li>
            <a href="#">Chính sách bảo mật</a>
          </li>
          <li>
            <a href="#">Điều khoản sử dụng</a>
          </li>
          <li>
            <a href="#">Hỗ trợ kỹ thuật</a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
