// src/pages/admin/discount/DiscountAdmin.jsx
import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
// Điều chỉnh đường dẫn này cho khớp dự án của bạn
import adminApi from "../../../api/adminApi";

const DiscountAdmin = () => {
  const [discounts, setDiscounts] = useState([]);
  const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  const fetchDiscounts = async () => {
      setLoading(true);
      setErrMsg("");
    try {
        // GET /api/admin/discounts
        const res = await adminApi.get("/discounts");
        // Hỗ trợ cả 2 dạng payload: mảng hoặc { data: mảng }
        const payload = res.data;
        const list = Array.isArray(payload) ? payload : (payload?.data || []);
        setDiscounts(list);
    } catch (err) {
        const http = err?.response?.status;
        if (http === 401 || http === 403) {
            navigate("/admin-login", {replace: true});
            return;
        }
        setErrMsg(err?.response?.data?.message || err.message || "Lỗi khi tải danh sách mã giảm giá");
    } finally {
        setLoading(false);
    }
  };

    useEffect(() => {
        fetchDiscounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa mã này?")) return;
      try {
          await adminApi.delete(`/discounts/${id}`);
          // Xóa xong, tải lại danh sách (hoặc filter local cho nhanh)
          setDiscounts((prev) => prev.filter((d) => d.id !== id));
      } catch (err) {
          const http = err?.response?.status;
          if (http === 401 || http === 403) {
              navigate("/admin-login", {replace: true});
              return;
          }
          alert(err?.response?.data?.message || err.message || "Lỗi khi xóa!");
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

    if (errMsg) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{errMsg}</div>
            </div>
        );
    }

  return (
      <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Quản lý mã giảm giá</h2>
              <Link className="btn btn-success" to="/admin/discount/add">
                  Thêm mã giảm giá
              </Link>
          </div>

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
                      <td>
                          <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => navigate(`/admin/discount/edit/${d.id}`)}
                          >
                              Sửa
                          </button>
                          <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(d.id)}
                          >
                              Xóa
                          </button>
                      </td>
                  </tr>
              ))
          )}
              </tbody>
          </table>
      </div>
  );
};

export default DiscountAdmin;
