// src/pages/admin/category/CategoryList.jsx
import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import adminApi from "../../../api/adminApi";
import {FaCheckCircle, FaTimesCircle} from "react-icons/fa";

const CategoryList = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterParentId, setFilterParentId] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        try {
            const res = await adminApi.get("/categories/list");
            const raw = res?.data;
            const list = Array.isArray(raw)
                ? raw
                : Array.isArray(raw?.data)
                    ? raw.data
                    : [];
            setCategories(list);
        } catch (error) {
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                navigate("/admin-login", {replace: true});
                return;
            }
            showToastMessage("Lỗi khi tải dữ liệu!", "error");
        }
    };

    // Toast function
    const showToastMessage = (msg, type = "success") => {
        setToastType(type);
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    // Hiện modal xác nhận xóa
    const openDeleteModal = (id) => {
        setDeleteId(id);
        setShowModal(true);
    };

    // Xác nhận xóa
    const confirmDelete = async () => {
        setShowModal(false);
        try {
            await adminApi.delete(`/categories/${deleteId}`);
            setCategories((prev) => prev.filter((category) => category.id !== deleteId));
            showToastMessage("Đã xóa danh mục thành công!", "success");
        } catch (error) {
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                navigate("/admin-login", {replace: true});
                return;
            }
            showToastMessage("Có lỗi xảy ra khi xóa danh mục.", "error");
        }
    };

    // Lấy tên danh mục cha theo parent_id từ mảng categories
    const getParentName = (parent_id) => {
        if (!parent_id && parent_id !== 0) return "Không có";
        const parent = (Array.isArray(categories) ? categories : []).find(
            (cat) => String(cat.id) === String(parent_id)
        );
        return parent ? parent.name : "Không có";
    };

    // Các danh mục cha cho dropdown lọc (an toàn)
    const parentCategories = (Array.isArray(categories) ? categories : []).filter(
        (cat) => cat?.parent_id === null || cat?.parent_id === undefined
    );

    // Lọc theo tên và theo danh mục cha nếu có
    const filteredCategories = (Array.isArray(categories) ? categories : []).filter((category) => {
        const matchesSearch = String(category.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesParent = filterParentId
            ? String(category.parent_id) === String(filterParentId)
            : true;
        return matchesSearch && matchesParent;
    });

    return (
        <div className="container position-relative">
            {/* Toast */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="position-fixed start-50 translate-middle-x"
                style={{zIndex: 1070, top: 20, left: "50%", minWidth: 340}}
            >
                {showToast && (
                    <div
                        className={`d-flex align-items-center shadow rounded-3 px-4 py-2 mb-2 position-relative`}
                        style={{
                            background: toastType === "success" ? "#25b864" : "#f44e4e",
                            color: "#fff",
                            minHeight: 46,
                        }}
                    >
                        {toastType === "success" ? (
                            <FaCheckCircle className="me-2 fs-5"/>
                        ) : (
                            <FaTimesCircle className="me-2 fs-5"/>
                        )}
                        <div style={{flex: 1}}>{toastMessage}</div>
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

            <h2>Danh sách danh mục</h2>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                    type="text"
                    className="form-control w-50"
                    placeholder="Tìm kiếm theo tên danh mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="form-select w-25 ms-3"
                    value={filterParentId}
                    onChange={(e) => setFilterParentId(e.target.value)}
                >
                    <option value="">-- Lọc theo danh mục cha --</option>
                    {parentCategories.map((parent) => (
                        <option key={parent.id} value={parent.id}>
                            {parent.name}
                        </option>
                    ))}
                </select>
                <Link to="/admin/category/addcategory" className="btn btn-primary ms-3">
                    Thêm danh mục
                </Link>
            </div>

            <table className="table table-bordered">
                <thead className="table-dark">
                <tr>
                    <th>Id</th>
                    <th>Tên danh mục</th>
                    <th>Ảnh</th>
                    <th>Trạng thái</th>
                    <th>Danh mục cha</th>
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                        <tr key={category.id}>
                            <td>{category.id}</td>
                            <td>{category.name}</td>
                            <td>
                                {category.images ? (
                                    <img
                                        src={category.images}
                                        alt="category"
                                        width="60"
                                        height="60"
                                        style={{objectFit: "cover"}}
                                    />
                                ) : (
                                    <span>Không có ảnh</span>
                                )}
                            </td>
                            <td>{category.status === 1 ? "Hiển thị" : "Ẩn"}</td>
                            <td>{getParentName(category.parent_id)}</td>
                            <td>
                                <Link
                                    to={`/admin/category/editcategory/${category.id}`}
                                    className="btn btn-warning btn-sm me-2"
                                >
                                    Sửa
                                </Link>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => openDeleteModal(category.id)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="text-center">
                            Không tìm thấy danh mục phù hợp
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            {/* Modal xác nhận xóa */}
            {showModal && (
                <>
                    <div
                        className="modal fade show"
                        style={{
                            display: "block",
                            background: "rgba(0,0,0,0.15)",
                        }}
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
                                        onClick={() => setShowModal(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    <p>Bạn chắc chắn muốn xóa danh mục này?</p>
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
                                        onClick={() => setShowModal(false)}
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

export default CategoryList;
