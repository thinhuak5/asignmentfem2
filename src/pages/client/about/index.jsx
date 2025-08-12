const About = () => {
  return (
    <main className="">
      {/* Why Choose Us */}
      <section className="why-choose-section py-4">
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-6">
              <h2 className="section-title">Tại Sao Chọn Chúng Tôi</h2>
              <p>
                Hãy tận hưởng dịch vụ của chúng tôi với chất lượng tuyệt vời,
                tốc độ nhanh chóng và sự tiện lợi tối đa.
              </p>

              <div className="row my-5">
                <div className="col-6 col-md-6">
                  <div className="feature">
                    <div className="icon">
                      <img src="images/truck.svg" alt="Giao Hàng Nhanh" className="img-fluid" />
                    </div>
                    <h3>Giao Hàng Nhanh & Miễn Phí</h3>
                    <p>Nhận hàng nhanh chóng với dịch vụ giao hàng miễn phí trên toàn quốc.</p>
                  </div>
                </div>

                <div className="col-6 col-md-6">
                  <div className="feature">
                    <div className="icon">
                      <img src="images/bag.svg" alt="Mua Sắm Dễ Dàng" className="img-fluid" />
                    </div>
                    <h3>Mua Sắm Dễ Dàng</h3>
                    <p>Trải nghiệm mua sắm tiện lợi với giao diện thân thiện và dễ sử dụng.</p>
                  </div>
                </div>

                <div className="col-6 col-md-6">
                  <div className="feature">
                    <div className="icon">
                      <img src="images/support.svg" alt="Hỗ Trợ 24/7" className="img-fluid" />
                    </div>
                    <h3>Hỗ Trợ 24/7</h3>
                    <p>Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn bất cứ lúc nào.</p>
                  </div>
                </div>

                <div className="col-6 col-md-6">
                  <div className="feature">
                    <div className="icon">
                      <img src="images/return.svg" alt="Đổi Trả Dễ Dàng" className="img-fluid" />
                    </div>
                    <h3>Đổi Trả Dễ Dàng</h3>
                    <p>Chính sách đổi trả linh hoạt giúp bạn yên tâm khi mua sắm.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ảnh minh hoạ */}
            <div className="col-lg-5">
              <div className="img-wrap">
                <img
                  src="https://cafefcdn.com/2020/4/20/nguoi-dua-dieu-15873592959481709014780.jpg"
                  alt="Tại Sao Chọn Chúng Tôi"
                  className="img-fluid rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team (ảnh vuông đồng đều) */}
      <section className="untree_co-section py-4">
        <div className="container">
          <div className="row mb-5">
            <div className="col-lg-5 mx-auto text-center">
              <h2 className="section-title">Đội ngũ của chúng tôi</h2>
            </div>
          </div>

          <div className="row">
            {/* 1 */}
            <div className="col-12 col-md-6 col-lg-3 mb-5 text-center">
              <div className="ratio ratio-1x1 mb-4 rounded-3 overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop"
                  alt="Minh Anh Nguyen"
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <h3 className=""><a href="#"><span>Minh Anh</span> Nguyen</a></h3>
              <span className="d-block position mb-3">Giám đốc điều hành, Nhà sáng lập.</span>
              <p>Tối ưu trải nghiệm mua sắm cho HSSV & văn phòng.</p>
              <p className="mb-0"><a href="#" className="more dark">Tìm hiểu thêm <span className="icon-arrow_forward"></span></a></p>
            </div>

            {/* 2 */}
            <div className="col-12 col-md-6 col-lg-3 mb-5 text-center">
              <div className="ratio ratio-1x1 mb-4 rounded-3 overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1200&auto=format&fit=crop"
                  alt="Quang Huy Tran"
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <h3 className=""><a href="#"><span>Quang Huy</span> Tran</a></h3>
              <span className="d-block position mb-3">Trưởng phòng Kinh doanh.</span>
              <p>Thiết kế combo dụng cụ học tập – in ấn giá tốt.</p>
              <p className="mb-0"><a href="#" className="more dark">Tìm hiểu thêm <span className="icon-arrow_forward"></span></a></p>
            </div>

            {/* 3 */}
            <div className="col-12 col-md-6 col-lg-3 mb-5 text-center">
              <div className="ratio ratio-1x1 mb-4 rounded-3 overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1200&auto=format&fit=crop"
                  alt="Lan Phuong Le"
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <h3 className=""><a href="#"><span>Lan Phương</span> Le</a></h3>
              <span className="d-block position mb-3">Trưởng bộ phận Marketing.</span>
              <p>Đưa thương hiệu văn phòng phẩm gần với cộng đồng trường học.</p>
              <p className="mb-0"><a href="#" className="more dark">Tìm hiểu thêm <span className="icon-arrow_forward"></span></a></p>
            </div>

            {/* 4 */}
            <div className="col-12 col-md-6 col-lg-3 mb-5 text-center">
              <div className="ratio ratio-1x1 mb-4 rounded-3 overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop"
                  alt="Khanh Duy Pham"
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <h3 className=""><a href="#"><span>Khánh Duy</span> Pham</a></h3>
              <span className="d-block position mb-3">Quản lý Kho.</span>
              <p>Kiểm soát tồn kho, cam kết giao nhanh trong ngày.</p>
              <p className="mb-0"><a href="#" className="more dark">Tìm hiểu thêm <span className="icon-arrow_forward"></span></a></p>
            </div>

            {/* 5 */}
            <div className="col-12 col-md-6 col-lg-3 mb-5 text-center">
              <div className="ratio ratio-1x1 mb-4 rounded-3 overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=1200&auto=format&fit=crop"
                  alt="Bao Tram Vu"
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <h3 className=""><a href="#"><span>Bảo Trâm</span> Vu</a></h3>
              <span className="d-block position mb-3">Thiết kế Sản phẩm.</span>
              <p>Thiết kế sổ, bìa kẹp, sticker theo mùa & trend.</p>
              <p className="mb-0"><a href="#" className="more dark">Tìm hiểu thêm <span className="icon-arrow_forward"></span></a></p>
            </div>

            {/* 6 */}
            <div className="col-12 col-md-6 col-lg-3 mb-5 text-center">
              <div className="ratio ratio-1x1 mb-4 rounded-3 overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1546525848-3ce03ca516f6?q=80&w=1200&auto=format&fit=crop"
                  alt="Gia Han Hoang"
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <h3 className=""><a href="#"><span>Gia Hân</span> Hoang</a></h3>
              <span className="d-block position mb-3">Chăm sóc Khách hàng.</span>
              <p>Tư vấn combo, hỗ trợ đổi trả 7 ngày.</p>
              <p className="mb-0"><a href="#" className="more dark">Tìm hiểu thêm <span className="icon-arrow_forward"></span></a></p>
            </div>

            {/* 7 */}
            <div className="col-12 col-md-6 col-lg-3 mb-5 text-center">
              <div className="ratio ratio-1x1 mb-4 rounded-3 overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1545167622-3a6ac756afe5?q=80&w=1200&auto=format&fit=crop"
                  alt="Tuan Kiet Dao"
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <h3 className=""><a href="#"><span>Tuấn Kiệt</span> Dao</a></h3>
              <span className="d-block position mb-3">Kỹ thuật Hệ thống.</span>
              <p>Vận hành website, tích hợp thanh toán & theo dõi đơn.</p>
              <p className="mb-0"><a href="#" className="more dark">Tìm hiểu thêm <span className="icon-arrow_forward"></span></a></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
export default About;
