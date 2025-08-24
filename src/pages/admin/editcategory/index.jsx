import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import adminApi from "../../../api/adminApi";
import {FaCheckCircle, FaRegFileAlt, FaTimesCircle} from "react-icons/fa";
import Constanst from "../../../Constanst";

const absUrl = (u) => {
    if (!u) return "";
    return /^https?:\/\//i.test(u) ? u : `${Constanst.DOMAIN_API}/${String(u).replace(/^\/+/, "")}`;
};

const EditCategory = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState({
        name: "",
        status: "Hiển thị",
        show_home: 0,   // chỉ áp dụng cho CHA
        images: null,
        parent_id: "",
    });
    const [newImage, setNewImage] = useState(null);
    const [categoryParents, setCategoryParents] = useState([]);
    const [errors, setErrors] = useState({});

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    const showToastMessage = (msg, type = "info") => {
        setToastType(type);
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await adminApi.get(`/categories/${id}`);
                const data = res.data?.data || res.data;
                if (!data) throw new Error("Không có dữ liệu danh mục");

                setCategory({
                    name: data.name || "",
                    status: data.status === 1 ? "Hiển thị" : "Ẩn",
                    show_home: data.show_home ? 1 : 0,
                    images: data.images || null,
                    parent_id: data.parent_id || "",
                });

                const resParents = await adminApi.get(`/categories/parents`);
                const parentData = resParents.data?.data || resParents.data || [];
                setCategoryParents(Array.isArray(parentData) ? parentData : []);
            } catch (err) {
                const http = err?.response?.status;
                if (http === 401 || http === 403) {
                    navigate("/admin-login", {replace: true});
                    return;
                }
                showToastMessage("Lỗi khi tải dữ liệu danh mục!", "error");
                navigate("/admin/category");
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setCategory((prev) => {
            const next = {
                ...prev,
                [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
            };
            // nếu chuyển sang CON → ép tắt show_home
            if (name === "parent_id" && value) next.show_home = 0;
            return next;
        });
        setErrors((prev) => ({...prev, [name]: ""}));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewImage(e.target.files[0]);
            setErrors((prev) => ({...prev, newImage: ""}));
        }
    };

    const validateForm = () => {
        const errs = {};
        if (!category.name.trim()) {
            errs.name = "Tên danh mục không được để trống.";
        }
        if (category.parent_id && String(category.parent_id) === String(id)) {
            errs.parent_id = "Không thể chọn chính nó làm danh mục cha!";
        } else if (
            category.parent_id &&
            !categoryParents.some((item) => String(item.id) === String(category.parent_id))
        ) {
            errs.parent_id = "Danh mục cha không hợp lệ!";
        }
        if (newImage) {
            const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!allowedTypes.includes(newImage.type)) {
                errs.newImage = "Chỉ chọn file ảnh (jpg, png, gif, webp)!";
            } else if (newImage.size > 2 * 1024 * 1024) {
                errs.newImage = "Ảnh phải nhỏ hơn 2MB!";
            }
        }
        // KHÔNG còn validate show_home cho CON vì đã ẩn checkbox
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showToastMessage("Vui lòng kiểm tra lại thông tin!", "info");
            return;
        }

        const status = category.status === "Hiển thị" ? 1 : 0;

        const formData = new FormData();
        formData.append("name", category.name);
        formData.append("status", status);
        // chỉ gửi 1 nếu là CHA; nếu có parent_id thì luôn 0
        formData.append("show_home", category.parent_id ? 0 : category.show_home ? 1 : 0);
        formData.append("old_image", category.images || "");
        if (newImage) formData.append("images", newImage);
        if (category.parent_id) formData.append("parent_id", category.parent_id);

        try {
            await adminApi.put(`/categories/${id}`, formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });

            showToastMessage("Cập nhật danh mục thành công!", "success");
            setTimeout(() => navigate("/admin/category"), 1200);
        } catch (err) {
            const http = err?.response?.status;
            if (http === 401 || http === 403) {
                navigate("/admin-login", {replace: true});
                return;
            }
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err.message ||
                "Cập nhật thất bại";
            showToastMessage("Lỗi khi cập nhật danh mục: " + msg, "error");
        }
    };

    return (
        <div className="container position-relative">
            {/* Toast */}
            <div aria-live="polite" aria-atomic="true" className="position-fixed top-0 end-0 p-3"
                 style={{zIndex: 1060}}>
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
                            <button type="button" className="btn-close btn-close-white ms-auto me-2"
                                    onClick={() => setShowToast(false)}></button>
                        </div>
                    </div>
                )}
            </div>

            <h2>Sửa danh mục</h2>

            <form onSubmit={handleSubmit} className="border p-4 bg-light rounded" encType="multipart/form-data"
                  noValidate>
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
                    <label className="form-label">Trạng thái</label>
                    <select className="form-select" name="status" value={category.status} onChange={handleChange}>
                        <option value="Hiển thị">Hiển thị</option>
                        <option value="Ẩn">Ẩn</option>
                    </select>
                </div>

                {/* 🔒 Chỉ render checkbox khi là DANH MỤC CHA */}
                {!category.parent_id && (
                    <div className="mb-3">
                        <label className="form-label">Hiển thị ở Trang chủ</label>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="show_home"
                                className="form-check-input"
                                name="show_home"
                                checked={!!category.show_home}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="show_home">
                                Bật để hiển thị <strong>Danh mục CHA</strong> ngoài trang Home
                            </label>
                        </div>
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">Danh mục cha</label>
                    <select
                        className={`form-select ${errors.parent_id ? "is-invalid" : ""}`}
                        name="parent_id"
                        value={category.parent_id}
                        onChange={handleChange}
                    >
                        <option value="">-- Chọn danh mục cha --</option>
                        {categoryParents
                            .filter((parent) => String(parent.id) !== String(id))
                            .map((parent) => (
                                <option key={parent.id} value={parent.id}>
                                    {parent.name}
                                </option>
                            ))}
                    </select>
                    {errors.parent_id && <div className="invalid-feedback">{errors.parent_id}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Ảnh hiện tại</label>
                    <div>
                        {category.images ? (
                            <img
                                src={absUrl(category.images)}
                                alt="Ảnh danh mục"
                                width="100"
                                height="100"
                                style={{objectFit: "cover"}}
                            />
                        ) : (
                            <span>Chưa có ảnh</span>
                        )}
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Chọn ảnh mới (nếu muốn thay đổi)</label>
                    <input
                        type="file"
                        className={`form-control ${errors.newImage ? "is-invalid" : ""}`}
                        name="images"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {errors.newImage && <div className="invalid-feedback">{errors.newImage}</div>}
                </div>

                <button type="submit" className="btn btn-success me-2">
                    Cập nhật danh mục
                </button>
                <Link to="/admin/category" className="btn btn-secondary">
                    Quay lại
                </Link>
            </form>
        </div>
    );
};

export default EditCategory;
