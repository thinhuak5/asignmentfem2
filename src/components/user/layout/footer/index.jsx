import React from 'react';

// IMPORT CSS FOOTER
import "../../../../assets/css/footer-client.css";
import SupportFloatingButtons from '../../../Client/SupportFloatingButtons';

const FooterClient = () => {
  return (
    <footer className="footer-client">
       <SupportFloatingButtons></SupportFloatingButtons>
      <div className="footer-container">
        {/* ĐÃ XÓA ẢNH TRANG TRÍ */}

        {/* Subscribe */}
        <div className="footer-row">
          <div className="footer-subscribe">
            <h3>
              <i className="fas fa-envelope-open-text"></i>
              <span>Đăng ký nhận bản tin</span>
            </h3>
            <form action="#" className="subscribe-form">
              <input type="text" className="subscribe-input" placeholder="Tên của bạn" />
              <input type="email" className="subscribe-input" placeholder="Nhập email của bạn" />
              <button type="submit" className="subscribe-button" aria-label="Gửi">
                <i className="fa fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>

        {/* Main content */}
        <div className="footer-main-content">
          <div className="footer-column-logo">
            <div className="footer-brand-wrap">
              <a href="#" className="footer-brand">Book Man<span>.</span></a>
            </div>
            <p className="footer-description">
              Khám phá tri thức, kết nối đam mê. Book Man là ngôi nhà cho tất cả những người yêu sách,
              nơi bạn có thể tìm thấy mọi cuốn sách mình cần.
            </p>
            <ul className="footer-social-list">
              <li><a href="#" aria-label="Facebook" className="social-link"><i className="fab fa-facebook-f"></i></a></li>
              <li><a href="#" aria-label="Twitter" className="social-link"><i className="fab fa-twitter"></i></a></li>
              <li><a href="#" aria-label="Instagram" className="social-link"><i className="fab fa-instagram"></i></a></li>
              <li><a href="#" aria-label="LinkedIn" className="social-link"><i className="fab fa-linkedin-in"></i></a></li>
            </ul>
          </div>

          <div className="footer-column-links">
            <div className="footer-links-grid">
              <div className="links-list">
                <h4>Về chúng tôi</h4>
                <ul>
                  <li><a href="#" className="footer-link">Giới thiệu</a></li>
                  <li><a href="#" className="footer-link">Dịch vụ</a></li>
                  <li><a href="#" className="footer-link">Bài viết</a></li>
                  <li><a href="#" className="footer-link">Liên hệ</a></li>
                </ul>
              </div>
              <div className="links-list">
                <h4>Hỗ trợ</h4>
                <ul>
                  <li><a href="#" className="footer-link">Trung tâm trợ giúp</a></li>
                  <li><a href="#" className="footer-link">Cửa hàng</a></li>
                  <li><a href="#" className="footer-link">Hỗ trợ trực tuyến</a></li>
                </ul>
              </div>
              <div className="links-list">
                <h4>Công ty</h4>
                <ul>
                  <li><a href="#" className="footer-link">Tuyển dụng</a></li>
                  <li><a href="#" className="footer-link">Đội ngũ</a></li>
                  <li><a href="#" className="footer-link">Điều khoản</a></li>
                  <li><a href="#" className="footer-link">Chính sách bảo mật</a></li>
                </ul>
              </div>
              <div className="links-list">
                <h4>Khám phá</h4>
                <ul>
                  <li><a href="#" className="footer-link">Sách Khoa Học</a></li>
                  <li><a href="#" className="footer-link">Sách Tâm Lý</a></li>
                  <li><a href="#" className="footer-link">Sách Công Nghệ</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <div className="copyright-text">
            <p>
              Copyright &copy; {new Date().getFullYear()}. All Rights Reserved.
              &nbsp;—&nbsp;Thiết kế bởi <a href="https://untree.co" target="_blank" rel="noopener noreferrer">Untree.co</a>
              &nbsp;&amp;&nbsp;Phân phối bởi <a href="https://themewagon.com" target="_blank" rel="noopener noreferrer">ThemeWagon</a>
            </p>
          </div>
          <div className="copyright-links">
            <ul>
              <li><a href="#">Điều khoản &amp; Điều kiện</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterClient;
