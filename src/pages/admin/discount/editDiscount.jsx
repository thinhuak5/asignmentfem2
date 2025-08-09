import { useEffect, useState } from "react";
import Constanst from "../../../Constanst";
import { useNavigate, useParams } from "react-router-dom";

const EditDiscount = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDiscount();
    // eslint-disable-next-line
  }, [id]);

  const fetchDiscount = async () => {
    const res = await fetch(`${Constanst.DOMAIN_API}/api/discounts/${id}`);
    if (res.ok) {
      const data = await res.json();
      setForm(data);
    } else {
      alert("Không tìm thấy mã giảm giá!");
      navigate("/admin/discount");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${Constanst.DOMAIN_API}/api/discounts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert("Cập nhật thành công!");
      navigate("/admin/discount");
    } else {
      alert("Có lỗi xảy ra!");
    }
  };

  if (!form)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <span className="ms-2">Đang tải dữ liệu...</span>
      </div>
    );

  return (
    <div className="container" >
      <div className="card mt-4">
        <div className="card-body">
          <h2 className="mb-4 text-center">Sửa mã giảm giá</h2>
          <form className="row g-3" onSubmit={handleSubmit}>
            {/* Mã giảm giá */}
            <div className="col-md-6">
              <label className="form-label">Mã giảm giá *</label>
              <input type="text" className="form-control" name="code" placeholder="Nhập mã giảm giá" value={form.code} onChange={handleChange} required />
            </div>
            {/* Mô tả */}
            <div className="col-md-6">
              <label className="form-label">Mô tả</label>
              <input type="text" className="form-control" name="description" placeholder="Nhập mô tả" value={form.description} onChange={handleChange} />
            </div>
            {/* Loại giảm giá */}
            <div className="col-md-4">
              <label className="form-label">Loại giảm giá</label>
              <select className="form-select" name="discount_type" value={form.discount_type} onChange={handleChange}>
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền (VNĐ)</option>
              </select>
            </div>
            {/* Giá trị giảm */}
            <div className="col-md-4">
              <label className="form-label">Giá trị giảm *</label>
              <input type="number" className="form-control" name="discount_value" placeholder="Ví dụ: 10 hoặc 10000" max={form.discount_type == 'percent' ? 100 : 100000000000} value={form.discount_value} onChange={handleChange} min={0} required />
            </div>
            {/* Số lượng mã */}
            <div className="col-md-4">
              <label className="form-label">Số lượng *</label>
              <input type="number" className="form-control" name="quantity" placeholder="Số lượng mã được phát hành" value={form.quantity} onChange={handleChange} min={1} required />
            </div>
            {/* Đơn hàng tối thiểu */}
            <div className="col-md-6">
              <label className="form-label">Đơn hàng tối thiểu</label>
              <input type="number" className="form-control" name="min_order_value" placeholder="Giá trị đơn hàng tối thiểu (VNĐ)" value={form.min_order_value} onChange={handleChange} min={0} />
            </div>
            {/* Giá trị giảm tối đa */}
            <div className="col-md-6">
              <label className="form-label">Giảm tối đa</label>
              <input type="number" className="form-control" name="max_discount_value" placeholder="Số tiền giảm tối đa (VNĐ)" value={form.max_discount_value} onChange={handleChange} min={0} />
            </div>
            {/* Thời gian bắt đầu */}
            <div className="col-md-6">
              <label className="form-label">Ngày bắt đầu</label>
              <input type="date" className="form-control" name="start_date" value={form.start_date?.slice(0, 10) || ""} onChange={handleChange} />
            </div>
            {/* Thời gian kết thúc */}
            <div className="col-md-6">
              <label className="form-label">Ngày kết thúc</label>
              <input type="date" className="form-control" name="end_date" value={form.end_date?.slice(0, 10) || ""} onChange={handleChange} />
            </div>
            {/* Trạng thái */}
            <div className="col-md-12 d-flex align-items-center">
              <input type="checkbox" className="form-check-input me-2" name="status" checked={form.status} onChange={handleChange} />
              <label className="form-label mb-0">Kích hoạt</label>
            </div>
            {/* Nút cập nhật */}
            <div className="col-12 text-center mt-3">
              <button className="btn btn-primary px-5" type="submit">
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDiscount;
