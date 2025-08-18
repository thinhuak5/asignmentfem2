// src/pages/admin/category/AddCategory.jsx
import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {FaCheckCircle, FaRegFileAlt, FaTimesCircle} from "react-icons/fa";
import adminApi from "../../../api/adminApi";

const AddCategory = () => {
    const navigate = useNavigate();

    const [category, setCategory] = useState({
        name: "",
        status: "Hiển thị",
        parent_id: "",
        image: null,
    });
    const [categoryParents, setCategoryParents] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [errors, setErrors] = useState({});

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    useEffect(() => {
        // load dữ liệu ban đầu: tất cả danh mục (để check trùng) + danh mục cha
        const loadInitial = async () => {
            try {
                const [allRes, parentsRes] = await Promise.all([
                    adminApi.get("/categories/list"),
                    adminApi.get("/categories/parents"),
                ]);
                if (Array.isArray(allRes.data)) setAllCategories(allRes.data);
                if (Array.isArray(parentsRes.data)) setCategoryParents(parentsRes.data);
            } catch (error) {
                const status = error?.response?.status;
                if (status === 401 || status === 403) {
                    navigate("/admin-login", {replace: true});
                    return;
                }
                showToastMessage("Lỗi khi load dữ liệu danh mục!", "error");
            }
        };
        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Toast helper
    const showToastMessage = (msg, type = "info") => {
        setToastType(type);
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setCategory((prev) => ({...prev, [name]: value}));
        setErrors((prev) => ({...prev, [name]: ""}));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setCategory((prev) => ({...prev, image: e.target.files[0]}));
            setErrors((prev) => ({...prev, image: ""}));
        }
    };

    // tên trùng (không phân biệt hoa/thường, normalize space)
    const isDuplicateName = (name) => {
        const normalize = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
        return allCategories.some((cat) => normalize(cat.name) === normalize(name));
    };

    const validateForm = () => {
        const errs = {};
        if (!category.name.trim()) {
            errs.name = "Tên danh mục không được để trống.";
        } else if (isDuplicateName(category.name)) {
            errs.name = "Tên danh mục đã tồn tại!";
        }

        if (!category.image) {
            errs.image = "Phải chọn ảnh cho danh mục!";
        } else {
            const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!allowedTypes.includes(category.image.type)) {
                errs.image = "Chỉ chọn file ảnh (jpg, png, gif, webp)!";
            } else if (category.image.size > 2 * 1024 * 1024) {
                errs.image = "Ảnh phải nhỏ hơn 2MB!";
            }
        }

        if (
            category.parent_id &&
            !categoryParents.some((item) => String(item.id) === String(category.parent_id))
        ) {
            errs.parent_id = "Danh mục cha không hợp lệ!";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            if (errors.name) {
                showToastMessage(errors.name, "info");
            } else if (!category.image) {
                showToastMessage("Phải chọn ảnh cho danh mục!", "info");
            } else {
                showToastMessage("Vui lòng kiểm tra lại thông tin!", "info");
            }
            return;
        }

        const formData = new FormData();
        formData.append("name", category.name);
        formData.append("status", category.status === "Hiển thị" ? 1 : 0);
        if (category.image) formData.append("images", category.image);
        if (category.parent_id) formData.append("parent_id", category.parent_id);

        try {
            await adminApi.post("/categories/add", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
            showToastMessage("Thêm danh mục thành công!", "success");
            setTimeout(() => navigate("/admin/category"), 1200);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                navigate("/admin-login", {replace: true});
                return;
            }
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                "Thêm thất bại";
            showToastMessage("Lỗi khi thêm danh mục: " + msg, "error");
        }
    };

    return (
        <div className="container position-relative">
            {/* Toast */}
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

            <h2>Thêm danh mục</h2>
            <form
                onSubmit={handleSubmit}
                className="border p-4 bg-light rounded"
                encType="multipart/form-data"
                noValidate
            >
                <div className="mb-3">
                    <label className="form-label">Tên danh mục</label>
                    <input
                        type="text"
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        name="name"
                        value={category.name}
                        onChange={handleChange}
                        required
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        Ảnh <span className="text-danger">*</span>
                    </label>
                    <input
                        type="file"
                        className={`form-control ${errors.image ? "is-invalid" : ""}`}
                        name="images"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {errors.image && <div className="invalid-feedback">{errors.image}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Trạng thái</label>
                    <select
                        className="form-select"
                        name="status"
                        value={category.status}
                        onChange={handleChange}
                    >
                        <option value="Hiển thị">Hiển thị</option>
                        <option value="Ẩn">Ẩn</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Danh mục cha</label>
                    <select
                        className={`form-select ${errors.parent_id ? "is-invalid" : ""}`}
                        name="parent_id"
                        value={category.parent_id}
                        onChange={handleChange}
                    >
                        <option value="">-- Chọn danh mục cha --</option>
                        {categoryParents.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    {errors.parent_id && (
                        <div className="invalid-feedback">{errors.parent_id}</div>
                    )}
                </div>

                <button type="submit" className="btn btn-success me-2">
                    Thêm danh mục
                </button>
                <Link to="/admin/category" className="btn btn-secondary">
                    Quay lại
                </Link>
            </form>
        </div>
    );
};

export default AddCategory;
