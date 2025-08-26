// src/pages/admin/discount/DiscountAdmin.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminApi from "../../../api/adminApi";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const DiscountAdmin = () => {
  const [discounts, setDiscounts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  /* ===== Toast ===== */
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success"); // 'success' | 'danger'
  const [toastMessage, setToastMessage] = useState("");

  const showToastMsg = (msg, type = "success", timeout = 2500) => {
    setToastType(type === "error" ? "danger" : type);
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), timeout);
  };

  /* ===== Confirm Delete Modal ===== */
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };
  const closeDeleteModal = () => {
    if (isDeleting) return;
    setShowModal(false);
    setDeleteId(null);
  };

  const fetchDiscounts = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const res = await adminApi.get("/discounts");
      const payload = res.data;
      const list = Array.isArray(payload) ? payload : (payload?.data || []);
      setDiscounts(list);
    } catch (err) {
      const http = err?.response?.status;
      if (http === 401 || http === 403) {
        navigate("/admin-login", { replace: true });
        return;
      }
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Lỗi khi tải danh sách mã giảm giá";
      setErrMsg(msg);
      showToastMsg(`Lỗi tải dữ liệu: ${msg}`, "error", 3500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await adminApi.delete(`/discounts/${deleteId}`);
      setDiscounts((prev) => prev.filter((d) => d.id !== deleteId));
      showToastMsg(`Đã xóa mã giảm giá #${deleteId}`, "success");
      closeDeleteModal();
    } catch (err) {
      const http = err?.response?.status;
      if (http === 401 || http === 403) {
        navigate("/admin-login", { replace: true });
        return;
      }
      const msg =
        err?.response?.data?.message || err.message || "Lỗi khi xóa!";
      showToastMsg(`Xóa không thành công: ${msg}`, "error", 3500);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDiscounts = discounts.filter((d) =>
    String(d.code || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mt-4">
        <h4>Đang tải danh sách mã giảm giá...</h4>
      </div>
    );
  }

  return (
    <div className="container position-relative">
      {/* Toast (góc phải trên) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="position-fixed"
        style={{ zIndex: 1070, top: 20, right: 20, minWidth: 340 }}
      >
        {showToast && (
          <div
            className="d-flex align-items-center shadow rounded-3 px-4 py-2 mb-2 position-relative"
            style={{
              background: toastType === "success" ? "#25b864" : "#f44e4e",
              color: "#fff",
              minHeight: 46,
            }}
          >
            {toastType === "success" ? (
              <FaCheckCircle className="me-2 fs-5" />
            ) : (
              <FaTimesCircle className="me-2 fs-5" />
            )}
            <div style={{ flex: 1 }}>{toastMessage}</div>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: 18,
                cursor: "pointer",
              }}
              onClick={() => setShowToast(false)}
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý mã giảm giá</h2>
        <Link className="btn btn-success" to="/admin/discount/add">
          Thêm mã giảm giá
        </Link>
      </div>

      {errMsg && <div className="alert alert-danger">{errMsg}</div>}

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm mã giảm giá..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="table table-bordered table-hover text-center">
        <thead className="table-dark">
          <tr>
            <th>STT</th>
            <th>Mã</th>
            <th>Mô tả</th>
            <th>Loại</th>
            <th>Giá trị</th>
            <th>Đơn tối thiểu</th>
            <th>Tối đa giảm</th>
            <th>Số lượng</th>
            <th>Đã dùng</th>
            <th>Bắt đầu</th>
            <th>Kết thúc</th>
            <th>Kích hoạt</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {filteredDiscounts.length === 0 ? (
            <tr>
              <td colSpan="13">Không có mã giảm giá nào</td>
            </tr>
          ) : (
            filteredDiscounts.map((d, idx) => (
              <tr key={d.id}>
                <td>{idx + 1}</td>
                <td>{d.code}</td>
                <td>{d.description}</td>
                <td>{d.discount_type === "percent" ? "%" : "VNĐ"}</td>
                <td>{d.discount_value}</td>
                <td>{d.min_order_value}</td>
                <td>{d.max_discount_value}</td>
                <td>{d.quantity}</td>
                <td>{d.used}</td>
                <td>{d.start_date?.slice(0, 10)}</td>
                <td>{d.end_date?.slice(0, 10)}</td>
                <td>{d.status ? "✔️" : "❌"}</td>
                <td className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => navigate(`/admin/discount/edit/${d.id}`)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => openDeleteModal(d.id)}
                    disabled={isDeleting && deleteId === d.id}
                  >
                    {isDeleting && deleteId === d.id ? "Đang xóa..." : "Xóa"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal xác nhận xóa — cùng phong cách với Category/Comment */}
      {showModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block", background: "rgba(0,0,0,0.15)" }}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title">Xác nhận xóa mã giảm giá</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    Bạn chắc chắn muốn xóa mã này?
                    
                  </p>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn"
                    style={{
                      background: "#FFD600",
                      color: "#333",
                      minWidth: 70,
                      fontWeight: 500,
                    }}
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      background: "#f44e4e",
                      color: "#fff",
                      minWidth: 70,
                      fontWeight: 500,
                    }}
                    onClick={confirmDelete}
                    disabled={isDeleting || !deleteId}
                  >
                    {isDeleting ? "Đang xóa..." : "Xóa"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* backdrop */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default DiscountAdmin;
