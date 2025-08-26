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

    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    const fetchData = async () => {
        try {
            const res = await adminApi.get("/categories/list");
            const raw = res?.data;
            const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
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

    const showToastMessage = (msg, type = "success") => {
        setToastType(type);
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    // ---- Helpers ----
    const findCategoryById = (id) => {
        const list = Array.isArray(categories) ? categories : [];
        return list.find((c) => c && c.id == id) || null;
    };

    // FE: kiểm tra nhanh danh mục có danh mục con hay không (dùng == để bắt cả string/number)
    const hasChildCategory = (id) => {
        const list = Array.isArray(categories) ? categories : [];
        return list.some((c) => c && c.parent_id != null && c.parent_id == id);
    };

    const openDeleteModal = (id) => {
        // Nếu đang có danh mục con -> chặn ngay, không gọi API
        if (hasChildCategory(id)) {
            showToastMessage("Không thể xóa: danh mục đang chứa danh mục con.", "error");
            return;
        }
        setDeleteId(id);
        setShowModal(true);
    };

    /**
     * Trích xuất code/message từ nhiều format payload phổ biến
     */
    const extractErrorPayload = (data) => {
        if (!data) return {code: undefined, message: ""};
        if (typeof data === "string") return {code: undefined, message: String(data)};
        if (data?.error && typeof data.error === "object") {
            return {
                code: data.error.code || data.error.errorCode || data.error.name || data.error.error_code,
                message: data.error.message || data.error.msg || data.error.error || data.error.description || "",
            };
        }
        if (Array.isArray(data?.errors) && data.errors.length > 0) {
            const e0 = data.errors[0];
            if (typeof e0 === "string") return {code: undefined, message: e0};
            if (typeof e0 === "object") {
                return {
                    code: e0.code || e0.errorCode || e0.name || e0.error_code,
                    message: e0.message || e0.msg || e0.error || e0.description || "",
                };
            }
        }
        return {
            code: data.code || data.errorCode || data.error_code || data.name,
            message: data.message || data.msg || data.error || data.description || "",
        };
    };

    /**
     * Phân loại lý do bị chặn xóa
     */
    const getDeleteBlockReason = (error, ctx = {}) => {
        const status = error?.response?.status;
        const data = error?.response?.data;
        const {code, message} = extractErrorPayload(data);
        const msg = String(message || "").toLowerCase();
        const isChild = !!ctx.isChild;

        if (status === 422) {
            if (code === "CATEGORY_HAS_CHILDREN") return "children";
            if (code === "SUBCATEGORY_HAS_PRODUCTS" || code === "CHILD_CATEGORY_HAS_PRODUCTS") {
                return "childProducts";
            }
            if (code === "CATEGORY_HAS_PRODUCTS" || code === "CATEGORY_NOT_EMPTY") {
                return isChild ? "childProducts" : "products";
            }
        }

        const isFK =
            code === "SequelizeForeignKeyConstraintError" ||
            /foreign key/.test(msg) ||
            msg.includes("violates foreign key constraint") ||
            msg.includes("constraint failed") ||
            msg.includes("referenced row") ||
            msg.includes("is referenced");

        if (isFK) {
            if (/(sub[- ]?category|child).*(product|products)/.test(msg) ||
                /(product|products).*(sub[- ]?category|child)/.test(msg)) {
                return "childProducts";
            }
            if (/(child|sub[- ]?category|descendant)/.test(msg)) return "children";
            return isChild ? "childProducts" : "products";
        }

        if (/(sub[- ]?category|child).*(has|have|contains|contain|with).*(product|products)/.test(msg) ||
            /(product|products).*(in|under).*(sub[- ]?category|child)/.test(msg)) {
            return "childProducts";
        }
        if ((/has|have|contains|contain/.test(msg) && /product|products/.test(msg) && /category/.test(msg)) ||
            /product.*in (this|the) category/.test(msg) ||
            /still.*product/.test(msg)) {
            return isChild ? "childProducts" : "products";
        }
        if (/(has|have|contains|contain).*(child|sub[- ]?category|descendant)/.test(msg) ||
            /(child|sub[- ]?category|descendant).*exists?/.test(msg)) {
            return "children";
        }

        if (/(danh mục con|danh mục phụ).*(còn|vẫn|đang).*(sản phẩm)/.test(msg) ||
            /(sản phẩm).*(thuộc|trong).*(danh mục con|danh mục phụ)/.test(msg)) {
            return "childProducts";
        }
        if ((/(còn|vẫn|đang).*(sản phẩm).*danh mục(?! con)/.test(msg)) ||
            /(danh mục).*(còn|chứa|có).*(sản phẩm)/.test(msg)) {
            return isChild ? "childProducts" : "products";
        }
        if (/(có|chứa).*(danh mục con)/.test(msg) || /danh mục con.*(tồn tại|đang có)/.test(msg)) {
            return "children";
        }

        if (data?.code === "23503") return isChild ? "childProducts" : "products";
        if (data?.code === "ER_ROW_IS_REFERENCED" || data?.code === "ER_ROW_IS_REFERENCED_2")
            return isChild ? "childProducts" : "products";
        if (data?.code === "SQLITE_CONSTRAINT_FOREIGNKEY") return isChild ? "childProducts" : "products";

        if (status === 409) {
            if (/(sub[- ]?category|child).*(product|products)/.test(msg) ||
                /(product|products).*(sub[- ]?category|child)/.test(msg)) {
                return "childProducts";
            }
            if (/(child|sub[- ]?category)/.test(msg)) return "children";
            if (/product|products/.test(msg)) return isChild ? "childProducts" : "products";
        }

        return null;
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
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

            const cat = findCategoryById(deleteId);
            const isChild = !!(cat && cat.parent_id != null);
            const reason = getDeleteBlockReason(error, {isChild});

            if (reason === "children") {
                showToastMessage("Không thể xóa: danh mục đang chứa danh mục con.", "error");
            } else if (reason === "childProducts") {
                showToastMessage("Không thể xóa: danh mục con vẫn còn sản phẩm.", "error");
            } else if (reason === "products") {
                showToastMessage("Không thể xóa: danh mục này vẫn còn sản phẩm.", "error");
            } else {
                if (isChild && (status === 409 || status === 422)) {
                    showToastMessage("Không thể xóa: danh mục con vẫn còn sản phẩm.", "error");
                } else {
                    const backendMsg =
                        typeof error?.response?.data === "string"
                            ? error.response.data
                            : error?.response?.data?.message || "";
                    showToastMessage(
                        backendMsg ? `Xóa không thành công: ${backendMsg}` : "Có lỗi xảy ra khi xóa danh mục.",
                        "error"
                    );
                }
            }
        } finally {
            setIsDeleting(false);
            setShowModal(false);
            setDeleteId(null);
        }
    };

    const getParentName = (parent_id) => {
        if (parent_id == null) return "Không có";
        const parent = (Array.isArray(categories) ? categories : []).find(
            (cat) => cat && cat.id == parent_id
        );
        return parent ? parent.name : "Không có";
    };

    const parentCategories = (Array.isArray(categories) ? categories : []).filter(
        (cat) => cat?.parent_id == null
    );

    const filteredCategories = (Array.isArray(categories) ? categories : []).filter((category) => {
        const matchesSearch = String(category.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesParent = filterParentId ? category.parent_id == filterParentId : true;
        return matchesSearch && matchesParent;
    });

    return (
        <div className="container position-relative">
            {/* Toast (top-right) */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="position-fixed"
                style={{zIndex: 1070, top: 20, right: 20, minWidth: 340}}
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
                <Link to="/admin/category/addcategory" className="btn btn-success ms-3">
                    Thêm danh mục
                </Link>
            </div>

            <table className="table table-bordered">
                <thead className="table-dark">
                <tr>
                    {/* ĐỔI "Id" -> "STT" */}
                    <th>STT</th>
                    <th>Tên danh mục</th>
                    <th>Ảnh</th>
                    <th>Trạng thái</th>
                    <th>Hiển thị Home</th>
                    <th>Danh mục cha</th>
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => (
                        <tr key={category.id}>
                            {/* HIỂN THỊ STT THEO DANH SÁCH ĐANG HIỂN THỊ */}
                            <td>{index + 1}</td>
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
                            <td>{category.show_home === 1 ? "Có" : "Không"}</td>
                            <td>{getParentName(category.parent_id)}</td>
                            <td>
                                <Link
                                    to={`/admin/category/editcategory/${category.id}`}
                                    className="btn btn-success  btn-sm me-2"
                                >
                                    Sửa
                                </Link>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => openDeleteModal(category.id)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting && deleteId === category.id ? "Đang xóa..." : "Xóa"}
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="7" className="text-center">
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
                        style={{display: "block", background: "rgba(0,0,0,0.15)"}}
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
                                    <p>Bạn chắc chắn muốn xóa danh mục này?</p>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{background: "#FFD600", color: "#333", minWidth: 70, fontWeight: 500}}
                                        onClick={() => setShowModal(false)}
                                        disabled={isDeleting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{background: "#f44e4e", color: "#fff", minWidth: 70, fontWeight: 500}}
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? "Đang xóa..." : "Xóa"}
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
