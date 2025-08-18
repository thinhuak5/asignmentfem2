// src/pages/admin/discount/AddDiscount.jsx
import {useState} from "react";
import {useNavigate} from "react-router-dom";
// ⚠️ Điều chỉnh đường dẫn này đúng với cây thư mục dự án của bạn:
import adminApi from "../../../api/adminApi";

const AddDiscount = () => {
    const navigate = useNavigate();
  const [form, setForm] = useState({
    code: "",
    description: "",
      discount_type: "percent",   // "percent" | "fixed"
      discount_value: 0,          // % hoặc VNĐ
      min_order_value: 0,         // VNĐ
      max_discount_value: 0,      // VNĐ
    quantity: 1,
    start_date: "",
    end_date: "",
    status: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

      // Các trường số -> ép số
      const numericFields = new Set([
          "discount_value",
          "min_order_value",
          "max_discount_value",
          "quantity",
      ]);

    setForm((prev) => ({
      ...prev,
        [name]:
            type === "checkbox"
                ? checked
                : numericFields.has(name)
                    ? (value === "" ? "" : Number(value))
                    : value,
    }));
  };

    const validate = () => {
        if (!form.code.trim()) return "Mã giảm giá không được để trống.";
        if (form.discount_type === "percent") {
            if (form.discount_value <= 0 || form.discount_value > 100)
                return "Giá trị phần trăm phải trong khoảng 1 - 100.";
        } else {
            if (form.discount_value <= 0) return "Giá trị giảm (VNĐ) phải lớn hơn 0.";
        }
        if (form.quantity < 1) return "Số lượng mã phải >= 1.";

        if (form.start_date && form.end_date) {
            const s = new Date(form.start_date);
            const e = new Date(form.end_date);
            if (e < s) return "Ngày kết thúc phải sau ngày bắt đầu.";
        }
        return "";
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
      const msg = validate();
      if (msg) {
          alert(msg);
          return;
      }

      // Chuẩn hóa payload theo backend
      const payload = {
          code: form.code.trim(),
          description: form.description?.trim() || "",
          discount_type: form.discount_type,                // "percent" | "fixed"
          discount_value: Number(form.discount_value) || 0, // % hoặc VNĐ
          min_order_value: Number(form.min_order_value) || 0,
          max_discount_value: Number(form.max_discount_value) || 0,
          quantity: Number(form.quantity) || 1,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          status: !!form.status,                            // true/false
      };

      try {
          await adminApi.post("/discounts", payload);
      alert("Thêm mã giảm giá thành công!");
      navigate("/admin/discount");
      } catch (err) {
          const http = err?.response?.status;
          if (http === 401 || http === 403) {
              navigate("/admin-login", {replace: true});
              return;
          }
          alert(
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              err.message ||
              "Có lỗi xảy ra!"
          );
    }
  };

  return (
      <div className="container">
          <div className="card mt-4">
              <div className="card-body">
                  <h2 className="mb-4 text-center">Thêm mã giảm giá</h2>

                  <form className="row g-3" onSubmit={handleSubmit} noValidate>
                      {/* Mã giảm giá */}
                      <div className="col-md-6">
                          <label className="form-label">Mã giảm giá *</label>
                          <input
                              type="text"
                              className="form-control"
                              name="code"
                              placeholder="Nhập mã giảm giá"
                              value={form.code}
                              onChange={handleChange}
                              required
                          />
                      </div>

                      {/* Mô tả */}
                      <div className="col-md-6">
                          <label className="form-label">Mô tả</label>
                          <input
                              type="text"
                              className="form-control"
                              name="description"
                              placeholder="Nhập mô tả"
                              value={form.description}
                              onChange={handleChange}
                          />
                      </div>

                      {/* Loại giảm giá */}
                      <div className="col-md-4">
                          <label className="form-label">Loại giảm giá</label>
                          <select
                              className="form-select"
                              name="discount_type"
                              value={form.discount_type}
                              onChange={handleChange}
                          >
                              <option value="percent">Phần trăm (%)</option>
                              <option value="fixed">Số tiền (VNĐ)</option>
                          </select>
                      </div>

                      {/* Giá trị giảm */}
                      <div className="col-md-4">
                          <label className="form-label">Giá trị giảm *</label>
                          <input
                              type="number"
                              className="form-control"
                              name="discount_value"
                              placeholder="Ví dụ: 10 hoặc 10000"
                              value={form.discount_value}
                              onChange={handleChange}
                              min={0}
                              max={form.discount_type === "percent" ? 100 : undefined}
                              required
                          />
                      </div>

                      {/* Số lượng mã */}
                      <div className="col-md-4">
                          <label className="form-label">Số lượng *</label>
                          <input
                              type="number"
                              className="form-control"
                              name="quantity"
                              placeholder="Số lượng mã được phát hành"
                              value={form.quantity}
                              onChange={handleChange}
                              min={1}
                              required
                          />
                      </div>

                      {/* Đơn hàng tối thiểu */}
                      <div className="col-md-6">
                          <label className="form-label">Đơn hàng tối thiểu</label>
                          <input
                              type="number"
                              className="form-control"
                              name="min_order_value"
                              placeholder="Giá trị đơn hàng tối thiểu (VNĐ)"
                              value={form.min_order_value}
                              onChange={handleChange}
                              min={0}
                          />
                      </div>

                      {/* Giá trị giảm tối đa */}
                      <div className="col-md-6">
                          <label className="form-label">Giảm tối đa</label>
                          <input
                              type="number"
                              className="form-control"
                              name="max_discount_value"
                              placeholder="Số tiền giảm tối đa (VNĐ)"
                              value={form.max_discount_value}
                              onChange={handleChange}
                              min={0}
                          />
                      </div>

                      {/* Thời gian bắt đầu */}
                      <div className="col-md-6">
                          <label className="form-label">Ngày bắt đầu</label>
                          <input
                              type="date"
                              className="form-control"
                              name="start_date"
                              value={form.start_date?.slice(0, 10) || ""}
                              onChange={handleChange}
                          />
                      </div>

                      {/* Thời gian kết thúc */}
                      <div className="col-md-6">
                          <label className="form-label">Ngày kết thúc</label>
                          <input
                              type="date"
                              className="form-control"
                              name="end_date"
                              value={form.end_date?.slice(0, 10) || ""}
                              onChange={handleChange}
                          />
                      </div>

                      {/* Trạng thái */}
                      <div className="col-md-12 d-flex align-items-center">
                          <input
                              type="checkbox"
                              className="form-check-input me-2"
                              name="status"
                              checked={form.status}
                              onChange={handleChange}
                          />
                          <label className="form-label mb-0">Kích hoạt</label>
                      </div>

                      {/* Nút thêm */}
                      <div className="col-12 text-center mt-3">
                          <button className="btn btn-primary px-5" type="submit">
                              Thêm mã giảm giá
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      </div>
  );
};

export default AddDiscount;
