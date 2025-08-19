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
    const [toastType, setToastType] = useState("success");

    // Modal xóa
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const toast = (msg, type = "success") => {
        setToastType(type);
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleAuthError = (err) => {
        const http = err?.response?.status;
        if (http === 401 || http === 403) {
            navigate("/admin-login", {replace: true});
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
                    // _catId: id của category_id (có thể là CHA hoặc CON)
                    _catId: toId(p.category_id ?? p.categoryId ?? p.category),
                    // _parentId: id của categoryparent_id nếu backend lưu riêng
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
                toast("Lỗi tải dữ liệu", "error");
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

    // Tên cha & con cho 1 product (xử lý đủ TH: chỉ cha, cha+con)
    const getParentChildNames = (p) => {
        // TH1: Có category_id
        if (p._catId) {
            const cat = catMap.get(p._catId);
            if (cat) {
                if (cat.parent_id === null) {
                    // category_id trỏ đến chính danh mục CHA
                    return {parent: cat.name || "Không có", child: "Không có"};
                }
                // category_id trỏ đến danh mục CON
                const parent = catMap.get(String(cat.parent_id));
                return {parent: parent?.name || "Không có", child: cat.name || "Không có"};
            }
        }
        // TH2: Không có category_id nhưng có categoryparent_id
        if (p._parentId) {
            const parent = catMap.get(p._parentId);
            return {parent: parent?.name || "Không có", child: "Không có"};
        }
        // TH3: Không có gì
        return {parent: "Không có", child: "Không có"};
    };

    // Kiểm tra theo filter danh mục cha
    const belongsToParent = (p, parentId) => {
        if (!parentId) return true;
        if (p._catId) {
            const cat = catMap.get(p._catId);
            if (!cat) return false;
            if (cat.parent_id === null) return String(cat.id) === String(parentId); // chính là cha
            return String(cat.parent_id) === String(parentId); // con thuộc về cha này
        }
        if (p._parentId) {
            return String(p._parentId) === String(parentId);
        }
        return false;
    };

    // Filter
    const filteredProducts = (Array.isArray(products) ? products : []).filter((p) => {
        const bySearch = String(p.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const byParent = belongsToParent(p, selectedParentId);
        const byStatus = selectedStatus === "" ? true : String(p.status) === String(selectedStatus);
        return bySearch && byParent && byStatus;
    });

    // Pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Xoá
    const openDeleteModal = (id) => {
        setDeleteId(id);
        setShowModal(true);
    };
    const confirmDelete = async () => {
        setShowModal(false);
        try {
            await adminApi.delete(`/products/${deleteId}`);
            setProducts((prev) => prev.filter((x) => String(x.id) !== String(deleteId)));
            toast("Đã xóa!", "success");
        } catch (err) {
            if (handleAuthError(err)) return;
            console.error(err);
            toast(err?.response?.data?.message || "Xóa thất bại!", "error");
        }
    };

    return (
        <div className="container position-relative">
            {/* Toast */}
            <div aria-live="polite" aria-atomic="true" className="position-fixed top-0 end-0 p-3"
                 style={{zIndex: 1060}}>
                {showToast && (
                    <div
                        className={`toast show align-items-center text-white bg-${toastType === "success" ? "success" : "danger"} border-0`}
                        role="alert"
                    >
                        <div className="d-flex align-items-center">
                            {toastType === "success" ? <FaCheckCircle className="me-2 fs-4"/> :
                                <FaTimesCircle className="me-2 fs-4"/>}
                            <div className="toast-body">{toastMessage}</div>
                            <button type="button" className="btn-close btn-close-white ms-auto me-2"
                                    onClick={() => setShowToast(false)}/>
                        </div>
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
                        const {parent, child} = getParentChildNames(p);
                        const descPlain = String(p.description || "").replace(/<[^>]+>/g, "");
                        const descShort = descPlain.length > 15 ? descPlain.slice(0, 15) + "..." : descPlain;
                        const totalQty = (Array.isArray(p.variations) ? p.variations : []).reduce(
                            (sum, v) => sum + (Number(v.quantity) || 0),
                            0
                        );
                        const thumb = p.variations?.[0]?.productImages?.[0]?.image_url || null;

                        return (
                            <tr key={p.id}>
                                <td>{indexOfFirstProduct + idx + 1}</td>
                                <td>
                                    {thumb ? (
                                        <img src={thumb} alt="thumb" width="60" height="60"
                                             style={{objectFit: "cover"}}/>
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
                                        <Link className="btn btn-success me-2"
                                              to={`/admin/product/editproduct/${p.id}`}>
                                            <FaEdit/> Sửa
                                        </Link>
                                        <button className="btn btn-danger" onClick={() => openDeleteModal(p.id)}>
                                            <FaTrashAlt/> Xóa
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
                            Prev
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
                            Next
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Modal xóa */}
            {showModal && (
                <>
                    <div className="modal fade show" style={{display: "block"}} tabIndex={-1} aria-modal="true"
                         role="dialog">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Xác nhận xóa</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}/>
                                </div>
                                <div className="modal-body">
                                    <p>Bạn chắc chắn muốn xóa sản phẩm này?</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary"
                                            onClick={() => setShowModal(false)}>
                                        Hủy
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={confirmDelete}>
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
}

export default ProductList;
