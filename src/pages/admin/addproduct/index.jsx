// src/pages/admin/product/AddProduct.jsx
import React, {useEffect, useState} from "react";
import {useFieldArray, useForm} from "react-hook-form";
import {Link, useNavigate} from "react-router-dom";
import {FaCheckCircle, FaTimesCircle} from "react-icons/fa";
import {CKEditor} from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import adminApi from "../../../api/adminApi";

const errorStyle = {
    color: "#de225d",
    display: "inline-block",
    fontSize: "0.9rem",
    marginTop: "4px",
};

export default function AddProduct() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        control,
        formState: {errors},
        setError,
        clearErrors,
    } = useForm({
        defaultValues: {variations: [], description: ""},
    });

    // State chung
    const [categories, setCategories] = useState([]);
    const [parentCategories, setParentCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [selectedParentId, setSelectedParentId] = useState("");
    const [variationError, setVariationError] = useState("");
    const [productNames, setProductNames] = useState([]);

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    // Loading submit
    const [isSubmitting, setIsSubmitting] = useState(false);

    // FieldArray cho biến thể
    const {
        fields: variationFields,
        append: appendVariation,
        remove: removeVariation,
    } = useFieldArray({control, name: "variations"});

    // Register description để validate
    useEffect(() => {
        register("description", {required: "Bắt buộc"});
    }, [register]);

    // Fetch categories (ADMIN)
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await adminApi.get("/categories/list");
                const data = Array.isArray(res.data) ? res.data : [];
                setCategories(data);
                setParentCategories(data.filter((c) => c.parent_id === null));
            } catch (error) {
                const status = error?.response?.status;
                if (status === 401 || status === 403) {
                    navigate("/admin-login", {replace: true});
                    return;
                }
                showToastMessage("Lỗi khi tải danh mục!", "error");
            }
        };
        fetchCats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch product names (ADMIN) để kiểm tra trùng tên
    useEffect(() => {
        const fetchProductNames = async () => {
            try {
                const res = await adminApi.get("/products/list");
                const arr = Array.isArray(res.data) ? res.data : [];
                setProductNames(arr.map((p) => String(p.name || "").toLowerCase()));
            } catch (error) {
                const status = error?.response?.status;
                if (status === 401 || status === 403) {
                    navigate("/admin-login", {replace: true});
                    return;
                }
            }
        };
        fetchProductNames();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cập nhật childCategories khi chọn parent
    useEffect(() => {
        setValue("categoryparent_id", selectedParentId);
        setChildCategories(categories.filter((c) => String(c.parent_id) === selectedParentId));
        setValue("category_id", "");
    }, [selectedParentId, categories, setValue]);

    // Clear lỗi biến thể khi có biến thể
    useEffect(() => {
        if (variationFields.length > 0 && variationError) {
            setVariationError("");
            clearErrors("variations");
        }
    }, [variationFields.length, variationError, clearErrors]);

    const description = watch("description");

    // Toast helper
    const showToastMessage = (msg, type = "info") => {
        setToastType(type);
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const onSubmit = async (data) => {
        // 1. Trùng tên
        if (productNames.includes(data.name.trim().toLowerCase())) {
            setError("name", {type: "manual", message: "Tên sản phẩm đã tồn tại!"});
            setToastType("error");
            setToastMessage("Tên sản phẩm đã tồn tại!");
            setShowToast(true);
            setIsSubmitting(false);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        // 2. Ít nhất 1 biến thể
        if (!data.variations || data.variations.length === 0) {
            setVariationError("Phải có ít nhất 1 biến thể!");
            setError("variations", {type: "manual", message: "Phải có ít nhất 1 biến thể!"});
            setIsSubmitting(false);
            return;
        }
        setVariationError("");
        clearErrors("variations");

        // 3. Validate từng biến thể
        for (let i = 0; i < data.variations.length; i++) {
            const v = data.variations[i];
            if (!v.images || v.images.length === 0) {
                setError(`variations.${i}.images`, {type: "manual", message: "Biến thể phải có ít nhất 1 ảnh!"});
                setToastType("error");
                setToastMessage(`Biến thể #${i + 1} phải có ít nhất 1 ảnh!`);
                setShowToast(true);
                setIsSubmitting(false);
                setTimeout(() => setShowToast(false), 3000);
                return;
            }
            if (
                v.quantity === "" ||
                v.min_stock === "" ||
                isNaN(Number(v.quantity)) ||
                isNaN(Number(v.min_stock))
            ) {
                setError(`variations.${i}.quantity`, {
                    type: "manual",
                    message: "Nhập số lượng và tồn kho tối thiểu!",
                });
                setToastType("error");
                setToastMessage(`Biến thể #${i + 1}: Nhập số lượng và tồn kho tối thiểu!`);
                setShowToast(true);
                setIsSubmitting(false);
                setTimeout(() => setShowToast(false), 3000);
                return;
            }
            if (Number(v.min_stock) >= Number(v.quantity)) {
                setError(`variations.${i}.min_stock`, {
                    type: "manual",
                    message: "Tồn kho tối thiểu phải nhỏ hơn số lượng!",
                });
                setToastType("error");
                setToastMessage(`Biến thể #${i + 1}: Tồn kho tối thiểu phải nhỏ hơn số lượng!`);
                setShowToast(true);
                setIsSubmitting(false);
                setTimeout(() => setShowToast(false), 3000);
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("status", data.status === "Còn hàng" ? 1 : 0);
            formData.append("categoryparent_id", data.categoryparent_id || "");
            formData.append("category_id", data.category_id || "");

            const rawVars = data.variations;
            // Bỏ images ra khỏi JSON, chỉ gửi meta
            formData.append(
                "variations",
                JSON.stringify(rawVars.map(({images, ...rest}) => rest))
            );
            // Gửi file ảnh + index biến thể để backend map
            rawVars.forEach((v, idx) => {
                if (v.images?.length) {
                    Array.from(v.images).forEach((file) => {
                        formData.append("images", file);
                        formData.append("variation_idx", idx);
                    });
                }
            });

            // ADMIN endpoint
            await fetchAdminCreate(formData);

            setToastType("success");
            setToastMessage("Thêm sản phẩm thành công!");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                navigate("/admin/product");
            }, 2000);
        } catch (err) {
            setToastType("error");
            setToastMessage(`Lỗi: ${err.message}`);
            setShowToast(true);
            setIsSubmitting(false);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    // Gọi API tạo sản phẩm qua adminApi (multipart)
    const fetchAdminCreate = async (formData) => {
        try {
            await adminApi.post("/products/add", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
        } catch (error) {
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                navigate("/admin-login", {replace: true});
                throw new Error("Không có quyền hoặc token hết hạn");
            }
            const msg =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                "Error";
            throw new Error(msg);
        }
    };

    return (
        <div className="container position-relative">
            {/* Toast góc trên bên phải */}
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
                            />
                        </div>
                    </div>
                )}
            </div>

            <h2 className="mb-4">Thêm sản phẩm</h2>

            {variationError && (
                <div
                    className="alert alert-info"
                    style={{
                        background: "#eaf6ff",
                        border: "1px solid #b6e0fe",
                        color: "#222",
                        borderRadius: 8,
                        marginBottom: 16,
                        padding: "16px 24px",
                    }}
                >
                    {variationError}
                </div>
            )}

            <form
                onSubmit={handleSubmit(onSubmit)}
                encType="multipart/form-data"
                className="border p-4 rounded bg-light"
            >
                <div className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title">Thông tin sản phẩm</h5>
                        <div className="mb-3">
                            <label className="form-label">Tên sản phẩm</label>
                            <input
                                className="form-control"
                                {...register("name", {required: "Bắt buộc"})}
                            />
                            {errors.name && <small style={errorStyle}>{errors.name.message}</small>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <div className="border rounded p-2" style={{minHeight: 80}}>
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={description}
                                    onChange={(_, editor) =>
                                        setValue("description", editor.getData(), {shouldValidate: true})
                                    }
                                />
                            </div>
                            {errors.description && (
                                <small style={errorStyle}>{errors.description.message}</small>
                            )}
                        </div>

                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Trạng thái</label>
                                <select
                                    className="form-select"
                                    {...register("status", {required: "Bắt buộc"})}
                                >
                                    <option value="Còn hàng">Còn hàng</option>
                                    <option value="Hết hàng">Hết hàng</option>
                                </select>
                                {errors.status && (
                                    <small style={errorStyle}>{errors.status.message}</small>
                                )}
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">Danh mục cha</label>
                                <select
                                    className="form-select"
                                    value={selectedParentId}
                                    onChange={(e) => setSelectedParentId(e.target.value)}
                                >
                                    <option value="">-- Chọn --</option>
                                    {parentCategories.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">Danh mục con</label>
                                <select
                                    className="form-select"
                                    {...register("category_id", {required: "Bắt buộc"})}
                                    disabled={!selectedParentId}
                                >
                                    <option value="">-- Chọn --</option>
                                    {childCategories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <small style={errorStyle}>{errors.category_id.message}</small>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {variationFields.map((field, idx) => {
                        const qty = getValues(`variations.${idx}.quantity`) || 0;
                        return (
                            <div key={field.id} className="col-12 mb-3">
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">Biến thể #{idx + 1}</h5>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger float-end"
                                            onClick={() => removeVariation(idx)}
                                        >
                                            Xóa
                                        </button>

                                        <div className="row g-2">
                                            <div className="col">
                                                <input
                                                    className="form-control"
                                                    placeholder="Tên biến thể"
                                                    {...register(`variations.${idx}.name`, {
                                                        required: "Bắt buộc",
                                                    })}
                                                />
                                                {errors.variations?.[idx]?.name && (
                                                    <small style={errorStyle}>
                                                        {errors.variations[idx].name.message}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col">
                                                <input
                                                    className="form-control"
                                                    placeholder="Mô tả"
                                                    {...register(`variations.${idx}.value`, {
                                                        required: "Bắt buộc",
                                                    })}
                                                />
                                                {errors.variations?.[idx]?.value && (
                                                    <small style={errorStyle}>
                                                        {errors.variations[idx].value.message}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Giá"
                                                    {...register(`variations.${idx}.price`, {
                                                        required: "Bắt buộc",
                                                        valueAsNumber: true,
                                                        min: {value: 0, message: "Không được nhỏ hơn 0"},
                                                    })}
                                                />
                                                {errors.variations?.[idx]?.price && (
                                                    <small style={errorStyle}>
                                                        {errors.variations[idx].price.message}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Số lượng"
                                                    {...register(`variations.${idx}.quantity`, {
                                                        required: "Bắt buộc",
                                                        valueAsNumber: true,
                                                        min: {value: 0, message: "Không được nhỏ hơn 0"},
                                                    })}
                                                />
                                                {errors.variations?.[idx]?.quantity && (
                                                    <small style={errorStyle}>
                                                        {errors.variations[idx].quantity.message}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Tồn kho tối thiểu"
                                                    {...register(`variations.${idx}.min_stock`, {
                                                        required: "Bắt buộc",
                                                        valueAsNumber: true,
                                                        min: {value: 0, message: "Không được nhỏ hơn 0"},
                                                        validate: (v) =>
                                                            v < qty || "Tồn kho tối thiểu phải nhỏ hơn số lượng",
                                                    })}
                                                />
                                                {errors.variations?.[idx]?.min_stock && (
                                                    <small style={errorStyle}>
                                                        {errors.variations[idx].min_stock.message}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label">Ảnh biến thể #{idx + 1}</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    {...register(`variations.${idx}.images`)}
                                                    multiple
                                                />
                                                {errors.variations?.[idx]?.images && (
                                                    <small style={errorStyle}>
                                                        {errors.variations[idx].images.message}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="btn btn-primary me-2"
                    onClick={() =>
                        appendVariation({
                            name: "",
                            value: "",
                            price: "",
                            quantity: "",
                            min_stock: "",
                            images: [],
                        })
                    }
                >
                    Thêm biến thể
                </button>

                <button type="submit" className="btn btn-success me-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
              <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
              />
                            Đang xử lý...
                        </>
                    ) : (
                        "Thêm sản phẩm"
                    )}
                </button>

                <Link to="/admin/product" className="btn btn-secondary">
                    Quay lại
                </Link>
            </form>
        </div>
    );
}
