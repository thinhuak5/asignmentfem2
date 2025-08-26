// src/pages/admin/product/ProductList.jsx
import React, {useEffect, useMemo, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {FaCheckCircle, FaEdit, FaTimesCircle, FaTrashAlt} from "react-icons/fa";
import adminApi from "../../../api/adminApi";

// Chuẩn hoá ID: null/""/"null"/0 -> null, còn lại -> string
const toId = (v) => {
  if (v === null || v === undefined || v === "" || v === "null" || v === 0 || v === "0") return null;
  return String(v);
};

// Chuẩn hoá thông báo lỗi từ BE (theo code/message chuẩn hoá)
const pickDeleteErrorMessage = (err) => {
  const data = err?.response?.data || {};
  const code = data.code;
  const msg = data.message;
  const q = data.remaining_quantity;
  const detailList =
    Array.isArray(data.variant_quantities) && data.variant_quantities.length
      ? ` Chi tiết: ` +
        data.variant_quantities.map((v) => `#${v.variation_id}: ${v.quantity}`).join(", ")
      : "";

  switch (code) {
    case "PRODUCT_STOCK_REMAINING":
      return msg || `Không thể xóa. Sản phẩm còn ${q ?? "tồn kho"}.${detailList}`;
    case "PRODUCT_LINKED_TO_ORDERS":
      return (
        msg ||
        "Không thể xóa vì sản phẩm đã phát sinh đơn hàng. Vui lòng ngừng hiển thị hoặc lưu trữ sản phẩm."
      );
    case "PRODUCT_NOT_FOUND":
      return msg || "Không tìm thấy sản phẩm.";
    case "INVALID_ID":
      return msg || "Mã sản phẩm không hợp lệ.";
    case "FK_CONSTRAINT":
      return msg || "Không thể xóa do ràng buộc dữ liệu. Vui lòng kiểm tra đơn hàng/dữ liệu liên quan.";
    case "DELETE_FAILED":
      return msg || "Xóa sản phẩm thất bại. Vui lòng thử lại.";
    default:
      return msg || data.error || "Đã xảy ra lỗi khi xóa sản phẩm. Vui lòng thử lại.";
  }
};

function ProductList() {
  const navigate = useNavigate();

  // Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filters & pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' | 'danger'

  // Modal xóa
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = (msg, type = "success", timeout = 3000) => {
    setToastType(type === "error" ? "danger" : type);
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), timeout);
  };

  const handleAuthError = (err) => {
    const http = err?.response?.status;
    if (http === 401 || http === 403) {
      navigate("/admin-login", { replace: true });
      return true;
    }
    return false;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          adminApi.get("/categories/list"),
          adminApi.get("/products/list"),
        ]);

        // ===== Normalize categories
        const rawCats = catRes.data?.data || catRes.data || [];
        const cats = (Array.isArray(rawCats) ? rawCats : []).map((c) => ({
          id: String(c.id),
          name: c.name,
          parent_id: toId(c.parent_id),
        }));
        setCategories(cats);

        // ===== Normalize products
        const rawProds = prodRes.data?.data || prodRes.data || [];
        const prods = (Array.isArray(rawProds) ? rawProds : []).map((p) => ({
          ...p,
          _catId: toId(p.category_id ?? p.categoryId ?? p.category),
          _parentId: toId(
            p.categoryparent_id ??
              p.category_parent_id ??
              p.categoryParentId ??
              p.parent_category_id
          ),
        }));
        setProducts(prods);
      } catch (err) {
        if (handleAuthError(err)) return;
        console.error(err);
        toast("Lỗi tải dữ liệu", "danger");
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map id -> category
  const catMap = useMemo(() => {
    const m = new Map();
    (Array.isArray(categories) ? categories : []).forEach((c) => m.set(String(c.id), c));
    return m;
  }, [categories]);

  // Danh mục cha cho dropdown lọc
  const parentCategories = (Array.isArray(categories) ? categories : []).filter(
    (c) => c.parent_id === null
  );

  // Tên cha & con cho 1 product
  const getParentChildNames = (p) => {
    if (p._catId) {
      const cat = catMap.get(p._catId);
      if (cat) {
        if (cat.parent_id === null) return { parent: cat.name || "Không có", child: "Không có" };
        const parent = catMap.get(String(cat.parent_id));
        return { parent: parent?.name || "Không có", child: cat.name || "Không có" };
      }
    }
    if (p._parentId) {
      const parent = catMap.get(p._parentId);
      return { parent: parent?.name || "Không có", child: "Không có" };
    }
    return { parent: "Không có", child: "Không có" };
  };

  // Kiểm tra theo filter danh mục cha
  const belongsToParent = (p, parentId) => {
    if (!parentId) return true;
    if (p._catId) {
      const cat = catMap.get(p._catId);
      if (!cat) return false;
      if (cat.parent_id === null) return String(cat.id) === String(parentId);
      return String(cat.parent_id) === String(parentId);
    }
    if (p._parentId) return String(p._parentId) === String(parentId);
    return false;
  };

  // Filter
  const filteredProducts = (Array.isArray(products) ? products : []).filter((p) => {
    const bySearch = String(p.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const byParent = belongsToParent(p, selectedParentId);
    const byStatus = selectedStatus === "" ? true : String(p.status) === String(selectedStatus);
    return bySearch && byParent && byStatus;
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // ===== Helper tính tồn kho theo biến thể =====
  const calcTotalQty = (p) =>
    (Array.isArray(p.variations) ? p.variations : []).reduce(
      (sum, v) => sum + (Number(v.quantity) || 0),
      0
    );

  // Xoá
  const openDeleteModal = (product) => {
    const totalQty = calcTotalQty(product);
    if (totalQty > 0) {
      toast(`Không thể xóa: sản phẩm còn ${totalQty} tồn kho.`, "danger");
      return;
    }
    setDeleteId(product.id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await adminApi.delete(`/products/${deleteId}`);
      const ok = res?.data?.success !== false;
      if (ok) {
        setProducts((prev) => prev.filter((x) => String(x.id) !== String(deleteId)));
        toast("Đã xóa!", "success");
        setShowModal(false);
        setDeleteId(null);
      } else {
        toast(res?.data?.message || "Xóa thất bại!", "danger");
      }
    } catch (err) {
      if (handleAuthError(err)) return;
      console.error(err);
      toast(pickDeleteErrorMessage(err), "danger", 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container position-relative">
      {/* Toast góc phải trên (đồng bộ) */}
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

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh sách sản phẩm</h2>
        <Link className="btn btn-success" to="/admin/product/addproduct">
          Thêm sản phẩm
        </Link>
      </div>

      {/* Filters */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedParentId}
            onChange={(e) => {
              setSelectedParentId(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">-- Lọc danh mục cha --</option>
            {parentCategories.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">-- Lọc trạng thái --</option>
            <option value="1">Hiển thị</option>
            <option value="0">Ẩn</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <table className="table table-bordered table-hover text-center">
        <thead className="table-dark">
          <tr>
            <th>STT</th>
            <th>Ảnh</th>
            <th>Tên</th>
            <th>Mô tả</th>
            <th>Danh mục cha</th>
            <th>Danh mục con</th>
            <th>Trạng thái</th>
            <th>Số lượng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.length === 0 ? (
            <tr>
              <td colSpan="9">Không có sản phẩm</td>
            </tr>
          ) : (
            currentProducts.map((p, idx) => {
              const { parent, child } = getParentChildNames(p);
              const descPlain = String(p.description || "").replace(/<[^>]+>/g, "");
              const descShort = descPlain.length > 15 ? descPlain.slice(0, 15) + "..." : descPlain;
              const totalQty = calcTotalQty(p);
              const thumb = p.variations?.[0]?.productImages?.[0]?.image_url || null;

              return (
                <tr key={p.id}>
                  <td>{indexOfFirstProduct + idx + 1}</td>
                  <td>
                    {thumb ? (
                      <img src={thumb} alt="thumb" width="60" height="60" style={{ objectFit: "cover" }} />
                    ) : (
                      <span>Không có ảnh</span>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{descShort}</td>
                  <td>{parent}</td>
                  <td>{child}</td>
                  <td>{String(p.status) === "1" ? "Hiển thị" : "Ẩn"}</td>
                  <td>{totalQty}</td>
                  <td>
                    <div className="d-flex">
                      <Link className="btn btn-success me-2" to={`/admin/product/editproduct/${p.id}`}>
                        <FaEdit /> Sửa
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={() => openDeleteModal(p)}
                        disabled={totalQty > 0}
                        title={totalQty > 0 ? `Không thể xóa: còn ${totalQty} tồn kho` : ""}
                      >
                        <FaTrashAlt /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage((c) => c - 1)}>
                Sau
            </button>
          </li>
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${i + 1 === currentPage ? "active" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage((c) => c + 1)}>
                Trước
            </button>
          </li>
        </ul>
      </nav>

      {/* Modal xác nhận xóa — phong cách Category (vàng/đỏ, overlay mờ, khóa khi đang xóa) */}
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
                  <h5 className="modal-title">Xác nhận xóa</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => !isDeleting && setShowModal(false)}
                    disabled={isDeleting}
                  />
                </div>
                <div className="modal-body">
                  <p>Bạn chắc chắn muốn xóa sản phẩm này?</p>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn"
                    style={{ background: "#FFD600", color: "#333", minWidth: 70, fontWeight: 500 }}
                    onClick={() => setShowModal(false)}
                    disabled={isDeleting}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ background: "#f44e4e", color: "#fff", minWidth: 70, fontWeight: 500 }}
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
}

export default ProductList;
