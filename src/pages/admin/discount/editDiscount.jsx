// src/pages/admin/discount/EditDiscount.jsx
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {FaCheckCircle, FaRegFileAlt, FaTimesCircle} from "react-icons/fa";
import adminApi from "../../../api/adminApi";

const EditDiscount = () => {
  const { id } = useParams();
  const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState("");

    // Thêm state cho toast
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

  useEffect(() => {
      const fetchDiscount = async () => {
          setLoading(true);
          setErrMsg("");
          try {
              // GET /api/admin/discounts/:id
              const res = await adminApi.get(`/discounts/${id}`);
              const data = res.data;
              setForm(data?.data || data); // hỗ trợ cả 2 dạng payload
          } catch (err) {
              const http = err?.response?.status;
              if (http === 401 || http === 403) {
                  navigate("/admin-login", {replace: true});
                  return;
              }
              setErrMsg(err?.response?.data?.message || err.message || "Không tìm thấy mã giảm giá!");
          } finally {
              setLoading(false);
          }
      };
      fetchDiscount();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

      // Ép kiểu số cho các trường số
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
        if (!form.code?.trim()) return "Mã giảm giá không được để trống.";
        if (form.discount_type === "percent") {
            if (form.discount_value <= 0 || form.discount_value > 100)
                return "Giá trị phần trăm phải trong khoảng 1 - 100.";
        } else {
            if (form.discount_value <= 0) return "Giá trị giảm (VNĐ) phải lớn hơn 0.";
        }
        if ((form.quantity ?? 0) < 1) return "Số lượng mã phải >= 1.";

        if (form.start_date && form.end_date) {
            const s = new Date(form.start_date);
            const e = new Date(form.end_date);
            if (e < s) return "Ngày kết thúc phải sau ngày bắt đầu.";
        }
        return "";
    };

    // Thêm hàm helper cho toast
    const showToastMessage = (msg, type = "info") => {
        setToastType(type);
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
      const msg = validate();
      if (msg) {
          showToastMessage(msg, "info");
          return;
      }

      const payload = {
          code: form.code.trim(),
          description: form.description?.trim() || "",
          discount_type: form.discount_type, // "percent" | "fixed"
          discount_value: Number(form.discount_value) || 0,
          min_order_value: Number(form.min_order_value) || 0,
          max_discount_value: Number(form.max_discount_value) || 0,
          quantity: Number(form.quantity) || 1,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          status: !!form.status,
      };

      try {
          // PUT /api/admin/discounts/:id
          await adminApi.put(`/discounts/${id}`, payload);
          showToastMessage("Cập nhật mã giảm giá thành công!", "success");
          setTimeout(() => navigate("/admin/discount"), 1200);
      } catch (err) {
          const http = err?.response?.status;
          if (http === 401 || http === 403) {
              navigate("/admin-login", {replace: true});
              return;
          }
          showToastMessage(
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              err.message ||
              "Có lỗi xảy ra!",
              "error"
          );
    }
  };

    if (loading) {
    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{height: "50vh"}}
        >
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
            </div>
            <span className="ms-2">Đang tải dữ liệu...</span>
        </div>
    );
    }

    if (errMsg) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{errMsg}</div>
            </div>
        );
    }

    if (!form) return null;

  return (
      <div className="container position-relative">
          {/* Toast Component */}
          <div
              aria-live="polite"
              aria-atomic="true"
              className="position-fixed top-0 end-0 p-3"
              style={{zIndex: 1060}}
          >
              {showToast && (
                  <div
                      className={`toast show align-items-center ${
                          toastType === "success"
                              ? "bg-success text-white"
                              : toastType === "error"
                                  ? "bg-danger text-white"
                                  : "bg-info text-dark"
                      } border-0`}
                      role="alert"
                      aria-live="assertive"
                      aria-atomic="true"
                  >
                      <div className="d-flex align-items-center">
                          {toastType === "success" ? (
                              <FaCheckCircle className="me-2 fs-4"/>
                          ) : toastType === "error" ? (
                              <FaTimesCircle className="me-2 fs-4"/>
                          ) : (
                              <FaRegFileAlt className="me-2 fs-4"/>
                          )}
                          <div className="toast-body">{toastMessage}</div>
                          <button
                              type="button"
                              className="btn-close btn-close-white ms-auto me-2"
                              onClick={() => setShowToast(false)}
                          ></button>
                      </div>
                  </div>
              )}
          </div>

          <div className="card mt-4">
              <div className="card-body">
                  <h2 className="mb-4 text-center">Sửa mã giảm giá</h2>
                  <form className="row g-3" onSubmit={handleSubmit} noValidate>
                      {/* Mã giảm giá */}
                      <div className="col-md-6">
                          <label className="form-label">Mã giảm giá *</label>
                          <input
                              type="text"
                              className="form-control"
                              name="code"
                              placeholder="Nhập mã giảm giá"
                              value={form.code || ""}
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
                              value={form.description || ""}
                              onChange={handleChange}
                          />
                      </div>

                      {/* Loại giảm giá */}
                      <div className="col-md-4">
                          <label className="form-label">Loại giảm giá</label>
                          <select
                              className="form-select"
                              name="discount_type"
                              value={form.discount_type || "percent"}
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
                              value={form.discount_value ?? 0}
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
                              value={form.quantity ?? 1}
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
                              value={form.min_order_value ?? 0}
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
                              value={form.max_discount_value ?? 0}
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
                              checked={!!form.status}
                              onChange={handleChange}
                          />
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
