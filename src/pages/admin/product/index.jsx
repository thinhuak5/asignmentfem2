// src/pages/admin/product/ProductList.jsx
import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {FaCheckCircle, FaEdit, FaTimesCircle, FaTrashAlt,} from "react-icons/fa";
// ⚠️ cập nhật path cho đúng
import adminApi from "../../../api/adminApi";

const ProductList = () => {
    const navigate = useNavigate();

    // Data chính
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // Filters & pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedParentId, setSelectedParentId] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(""); // <-- Lọc trạng thái
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    // Modal xóa
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
        // eslint-disable-next-line
    }, []);

    const handleAuthError = (err) => {
        const http = err?.response?.status;
        if (http === 401 || http === 403) {
            navigate("/admin-login", {replace: true});
            return true;
        }
        return false;
    };

    const fetchProducts = async () => {
        try {
            // Admin list: GET /api/admin/products/list
            const res = await adminApi.get("/products/list");
            const data = res.data?.data || res.data || [];
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            if (handleAuthError(err)) return;
            console.error(err);
            setToastType("error");
            setToastMessage("Lỗi tải danh sách sản phẩm");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const fetchCategories = async () => {
        try {
            // Admin categories: GET /api/admin/categories/list
            const res = await adminApi.get("/categories/list");
            const data = res.data?.data || res.data || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            if (handleAuthError(err)) return;
            console.error(err);
            setToastType("error");
            setToastMessage("Lỗi tải danh mục");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    // Mở modal xác nhận xóa
    const openDeleteModal = (id) => {
        setDeleteId(id);
        setShowModal(true);
    };

    // Xác nhận xóa
    const confirmDelete = async () => {
        setShowModal(false);
        try {
            // DELETE /api/admin/products/:id
            await adminApi.delete(`/products/${deleteId}`);
            setToastType("success");
            setToastMessage("Đã xóa!");
            fetchProducts();
        } catch (err) {
            if (handleAuthError(err)) return;
            console.error(err);
            setToastType("error");
            setToastMessage(err?.response?.data?.message || "Xóa thất bại!");
        }
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Lọc danh mục cha
    const parentCategories = categories.filter((c) => c.parent_id === null);

    // Lấy tên danh mục
    const getCategoryName = (id) =>
        categories.find((c) => String(c.id) === String(id))?.name || "Không có";

    const getParentName = (child_id) => {
        const cat = categories.find((c) => String(c.id) === String(child_id));
        return cat && cat.parent_id ? getCategoryName(cat.parent_id) : "Không có";
    };

    // Filter sản phẩm
    const filteredProducts = products.filter((p) => {
        const bySearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
        let byParent = true;
        let byStatus = true;
        if (selectedParentId) {
            const cat = categories.find(
                (c) => String(c.id) === String(p.category_id)
            );
            byParent = cat && String(cat.parent_id) === String(selectedParentId);
        }
        if (selectedStatus !== "") {
            byStatus = String(p.status) === String(selectedStatus);
        }
        return bySearch && byParent && byStatus;
    });

    // Phân trang (client)
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    return (
        <div className="container position-relative">
            {/* ----- Bootstrap Toast ----- */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="position-fixed top-0 end-0 p-3"
                style={{zIndex: 1060}}
            >
                {showToast && (
                    <div
                        className={`toast show align-items-center text-white bg-${
                            toastType === "success" ? "success" : "danger"
                        } border-0`}
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                    >
                        <div className="d-flex align-items-center">
                            {toastType === "success" ? (
                                <FaCheckCircle className="me-2 fs-4"/>
                            ) : (
                                <FaTimesCircle className="me-2 fs-4"/>
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

            {/* Tiêu đề & Thêm */}
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
                {/* Lọc trạng thái */}
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

            {/* Bảng sản phẩm */}
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
                    currentProducts.map((p, idx) => (
                        <tr key={p.id}>
                            <td>{indexOfFirstProduct + idx + 1}</td>
                            <td>
                                {p.variations?.[0]?.productImages?.[0] ? (
                                    <img
                                        src={p.variations[0].productImages[0].image_url}
                                        alt="thumb"
                                        width="60"
                                        height="60"
                                        style={{objectFit: "cover"}}
                                    />
                                ) : (
                                    <span>Không có ảnh</span>
                                )}
                            </td>
                            <td>{p.name}</td>
                            <td>
                                {/* Ẩn thẻ HTML trong mô tả */}
                                {(() => {
                                    const text = p.description
                                        ? p.description.replace(/<[^>]+>/g, "")
                                        : "";
                                    return text.length > 15 ? text.substring(0, 15) + "..." : text;
                                })()}
                            </td>
                            <td>{getParentName(p.category_id)}</td>
                            <td>{getCategoryName(p.category_id)}</td>
                            <td>{p.status === 1 ? "Hiển thị" : "Ẩn"}</td>
                            <td>
                                {(p.variations || []).reduce(
                                    (sum, v) => sum + (Number(v.quantity) || 0),
                                    0
                                )}
                            </td>
                            <td>
                                <div className="d-flex">
                                    <Link
                                        className="btn btn-success me-2"
                                        to={`/admin/product/editproduct/${p.id}`}
                                    >
                                        <FaEdit/> Sửa
                                    </Link>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => openDeleteModal(p.id)}
                                    >
                                        <FaTrashAlt/> Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            {/* Pagination */}
            <nav>
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            onClick={() => setCurrentPage((c) => c - 1)}
                        >
                            Prev
                        </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                        <li
                            key={i}
                            className={`page-item ${i + 1 === currentPage ? "active" : ""}`}
                        >
                            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                {i + 1}
                            </button>
                        </li>
                    ))}
                    <li
                        className={`page-item ${
                            currentPage === totalPages || totalPages === 0 ? "disabled" : ""
                        }`}
                    >
                        <button
                            className="page-link"
                            onClick={() => setCurrentPage((c) => c + 1)}
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Modal xóa */}
            {showModal && (
                <>
                    <div
                        className="modal fade show"
                        style={{display: "block"}}
                        tabIndex={-1}
                        aria-modal="true"
                        role="dialog"
                    >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Xác nhận xóa</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    <p>Bạn chắc chắn muốn xóa sản phẩm này?</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={confirmDelete}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </div>
    );
};

export default ProductList;
