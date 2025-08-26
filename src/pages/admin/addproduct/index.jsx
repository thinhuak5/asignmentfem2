// src/pages/admin/products/AddProduct.jsx
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

const SPEC_PRESET = [
  {label: "Mã hàng", value: "195"},
  {label: "Nhà cung cấp", value: "Fahasa"},
  {label: "Tác giả", value: "Nhiều tác giả"},
  {label: "NXB", value: "Fahasa"},
  {label: "Năm XB", value: "2023"},
  {label: "Trọng lượng (gr)", value: "300"},
  {label: "Kích thước", value: "20 x 14 x 2 cm"},
  {label: "Số trang", value: "250"},
  {label: "Hình thức", value: "Bìa mềm"},
];

/** Component một biến thể (có specs riêng) */
function VariationItem({
                         index,
                         control,
                         register,
                         errors,
                         getValues,
                         removeVariation,
                       }) {
  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({control, name: `variations.${index}.specs`});

  return (
      <div className="col-12 mb-3">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title d-flex justify-content-between align-items-center">
              <span>Biến thể #{index + 1}</span>
              <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => removeVariation(index)}
              >
                Xóa biến thể
              </button>
            </h5>

            <div className="row g-2">
              {/* Tên biến thể */}
              <div className="col">
                <input
                    className="form-control"
                    placeholder="Tên biến thể"
                    {...register(`variations.${index}.name`, {
                      required: "Bắt buộc",
                      // Kiểm tra không trùng tên biến thể (case-insensitive, trim)
                      validate: (val) => {
                        const cur = String(val || "").trim().toLowerCase();
                        if (!cur) return "Bắt buộc";
                        const vars = getValues("variations") || [];
                        const names = vars.map(v =>
                            String(v?.name || "").trim().toLowerCase()
                        );
                        const firstIdx = names.indexOf(cur);
                        if (firstIdx !== -1 && firstIdx !== index) {
                          return "Tên biến thể đã tồn tại.";
                        }
                        return true;
                      },
                    })}
                />
                {errors.variations?.[index]?.name && (
                    <small style={errorStyle}>
                      {errors.variations[index].name.message}
                    </small>
                )}
              </div>

              {/* Giá */}
              <div className="col">
                <input
                    type="number"
                    className="form-control"
                    placeholder="Giá"
                    {...register(`variations.${index}.price`, {
                      required: "Bắt buộc",
                      valueAsNumber: true,
                      min: {value: 0, message: "Không được nhỏ hơn 0"},
                    })}
                />
                {errors.variations?.[index]?.price && (
                    <small style={errorStyle}>
                      {errors.variations[index].price.message}
                    </small>
                )}
              </div>

              {/* Số lượng */}
              <div className="col">
                <input
                    type="number"
                    className="form-control"
                    placeholder="Số lượng"
                    {...register(`variations.${index}.quantity`, {
                      required: "Bắt buộc",
                      valueAsNumber: true,
                      min: {value: 0, message: "Không được nhỏ hơn 0"},
                    })}
                />
                {errors.variations?.[index]?.quantity && (
                    <small style={errorStyle}>
                      {errors.variations[index].quantity.message}
                    </small>
                )}
              </div>

              {/* Ảnh */}
              <div className="col-12">
                <label className="form-label">Ảnh biến thể #{index + 1}</label>
                <input
                    type="file"
                    className="form-control"
                    {...register(`variations.${index}.images`)}
                    multiple
                />
                {errors.variations?.[index]?.images && (
                    <small style={errorStyle}>
                      {errors.variations[index].images.message}
                    </small>
                )}
              </div>
            </div>

            {/* Thông tin chi tiết (specs) */}
            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Thông tin chi tiết (biến thể)</h6>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => appendSpec({label: "", value: ""})}
                >
                  + Thêm dòng
                </button>
              </div>

              <div className="row">
                {specFields.map((sf, j) => (
                    <div className="col-md-6 mb-2" key={sf.id}>
                      <div className="row g-2 align-items-center">
                        <div className="col-5">
                          {/* CHO PHÉP SỬA label + validate không trùng trong cùng biến thể */}
                          <input
                              className="form-control"
                              placeholder="Thuộc tính (VD: Màu, Size...)"
                              {...register(`variations.${index}.specs.${j}.label`, {
                                required: "Bắt buộc",
                                validate: (v) => {
                                  const val = String(v || "").trim().toLowerCase();
                                  if (!val) return "Bắt buộc";
                                  const specs = getValues(`variations.${index}.specs`) || [];
                                  const labels = specs.map(s =>
                                      String(s?.label || "").trim().toLowerCase()
                                  );
                                  const first = labels.indexOf(val);
                                  if (first !== -1 && first !== j) {
                                    return "Thuộc tính đã tồn tại trong biến thể này.";
                                  }
                                  return true;
                                },
                              })}
                          />
                          {errors.variations?.[index]?.specs?.[j]?.label && (
                              <small style={errorStyle}>
                                {errors.variations[index].specs[j].label.message}
                              </small>
                          )}
                        </div>
                        <div className="col-5">
                          <input
                              className="form-control"
                              placeholder="Giá trị (VD: Đỏ, XL...)"
                              {...register(`variations.${index}.specs.${j}.value`, {
                                required: "Bắt buộc",
                              })}
                          />
                          {errors.variations?.[index]?.specs?.[j]?.value && (
                              <small style={errorStyle}>
                                {errors.variations[index].specs[j].value.message}
                              </small>
                          )}
                        </div>
                        <div className="col-2 text-end">
                          <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeSpec(j)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
  );
}

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

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FieldArray biến thể
  const {
    fields: variationFields,
    append: appendVariation,
    remove: removeVariation,
  } = useFieldArray({control, name: "variations"});

  useEffect(() => {
    register("description", {required: "Bắt buộc"});
  }, [register]);

  // ===== Fetch categories =====
  useEffect(() => {
    adminApi
        .get("/categories/list")
        .then((res) => {
          const raw = res?.data;
          const listRaw = Array.isArray(raw)
              ? raw
              : Array.isArray(raw?.data)
                  ? raw.data
                  : [];

          const list = listRaw.map((c) => {
            const pidRaw = c?.parent_id;
            const pid =
                pidRaw === null ||
                pidRaw === undefined ||
                pidRaw === "" ||
                pidRaw === "null" ||
                pidRaw === 0 ||
                pidRaw === "0"
                    ? null
                    : String(pidRaw);
            return {...c, id: String(c.id), parent_id: pid};
          });

          setCategories(list);
          setParentCategories(list.filter((c) => c.parent_id === null));
        })
        .catch(() => {
          setCategories([]);
          setParentCategories([]);
        });
  }, []);

  // ===== Fetch product names =====
  useEffect(() => {
    adminApi
        .get("/products/list")
        .then((res) => {
          const raw = res?.data;
          const list = Array.isArray(raw)
              ? raw
              : Array.isArray(raw?.data)
                  ? raw.data
                  : [];
          setProductNames(
              list.map((p) => String(p?.name || "").toLowerCase()).filter(Boolean)
          );
        })
        .catch(() => setProductNames([]));
  }, []);

  useEffect(() => {
    setValue("categoryparent_id", selectedParentId);
    const list = Array.isArray(categories) ? categories : [];
    const childsFixed = list.filter((c) => c.parent_id === selectedParentId);
    setChildCategories(childsFixed);
  }, [selectedParentId, categories, setValue]);

  useEffect(() => {
    if (variationFields.length > 0 && variationError) {
      setVariationError("");
      clearErrors("variations");
    }
  }, [variationFields.length, variationError, clearErrors]);

  const description = watch("description");

  const onSubmit = async (data) => {
    // 1. Trùng tên SP
    if (productNames.includes(String(data.name || "").trim().toLowerCase())) {
      setError("name", {type: "manual", message: "Tên sản phẩm đã tồn tại!"});
      setToastType("error");
      setToastMessage("Tên sản phẩm đã tồn tại!");
      setShowToast(true);
      setIsSubmitting(false);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // 2. Ít nhất 1 biến thể
    if (!Array.isArray(data.variations) || data.variations.length === 0) {
      setVariationError("Phải có ít nhất 1 biến thể!");
      setError("variations", {
        type: "manual",
        message: "Phải có ít nhất 1 biến thể!",
      });
      setIsSubmitting(false);
      return;
    }
    setVariationError("");
    clearErrors("variations");

    // 3a. Kiểm tra TRÙNG TÊN biến thể (đảm bảo lần cuối trước khi gửi)
    const names = data.variations.map(v =>
        String(v?.name || "").trim().toLowerCase()
    );
    const dupMap = new Map(); // name -> firstIndex
    let hasDup = false;
    names.forEach((name, i) => {
      if (!name) return;
      if (dupMap.has(name)) {
        hasDup = true;
        const j = dupMap.get(name);
        setError(`variations.${j}.name`, {type: "manual", message: "Tên biến thể đã tồn tại."});
        setError(`variations.${i}.name`, {type: "manual", message: "Tên biến thể đã tồn tại."});
      } else {
        dupMap.set(name, i);
      }
    });
    if (hasDup) {
      setToastType("error");
      setToastMessage("Không được trùng tên biến thể.");
      setShowToast(true);
      setIsSubmitting(false);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // 3b. Các validate khác cho biến thể
    for (let i = 0; i < data.variations.length; i++) {
      const v = data.variations[i];

      // i) Ít nhất 1 ảnh
      if (!v.images || v.images.length === 0) {
        setError(`variations.${i}.images`, {
          type: "manual",
          message: "Biến thể phải có ít nhất 1 ảnh!",
        });
        setToastType("error");
        setToastMessage(`Biến thể #${i + 1} phải có ít nhất 1 ảnh!`);
        setShowToast(true);
        setIsSubmitting(false);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      // ii) Số lượng hợp lệ
      if (v.quantity === "" || isNaN(Number(v.quantity))) {
        setError(`variations.${i}.quantity`, {
          type: "manual",
          message: "Nhập số lượng hợp lệ!",
        });
        setToastType("error");
        setToastMessage(`Biến thể #${i + 1}: Nhập số lượng hợp lệ!`);
        setShowToast(true);
        setIsSubmitting(false);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      // iii) Specs: label bắt buộc & không trùng trong cùng biến thể
      const specs = Array.isArray(v.specs) ? v.specs : [];
      const labels = specs
          .map(s => String(s?.label || "").trim().toLowerCase())
          .filter(Boolean);
      const setLabels = new Set(labels);
      if (labels.length !== setLabels.size) {
        setToastType("error");
        setToastMessage(`Thuộc tính trong Biến thể #${i + 1} đang bị trùng.`);
        setShowToast(true);
        setIsSubmitting(false);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      // nếu có label rỗng
      if (specs.some(s => !String(s?.label || "").trim())) {
        setToastType("error");
        setToastMessage(`Biến thể #${i + 1}: Label thuộc tính không được để trống.`);
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

      const parentId = data.categoryparent_id || "";
      const childId = data.category_id || "";
      formData.append("categoryparent_id", parentId);
      formData.append("category_id", childId ? childId : parentId);

      const rawVars = data.variations;
      formData.append(
          "variations",
          JSON.stringify(
              rawVars.map(({images, ...rest}) => ({
                name: rest.name || "",
                price: rest.price === "" ? null : Number(rest.price),
                quantity: rest.quantity === "" ? 0 : Number(rest.quantity),
                type: rest.type || "regular",
                specs: Array.isArray(rest.specs)
                    ? rest.specs.map((s, idx) => ({
                      label: s.label,
                      value: s.value,
                      sort_order: idx,
                    }))
                    : [],
              }))
          )
      );

      rawVars.forEach((v, idx) => {
        if (v.images?.length) {
          Array.from(v.images).forEach((file) => {
            formData.append("images", file);
            formData.append("variation_idx", idx);
          });
        }
      });

      await adminApi.post("/products/add", formData);

      setToastType("success");
      setToastMessage("Thêm sản phẩm thành công!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/admin/product");
      }, 2000);
    } catch (err) {
      const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Có lỗi xảy ra";
      setToastType("error");
      setToastMessage(`Lỗi: ${msg}`);
      setShowToast(true);
      setIsSubmitting(false);
      setTimeout(() => setShowToast(false), 3000);
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
          {/* Thông tin sản phẩm */}
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Thông tin sản phẩm</h5>

              <div className="mb-3">
                <label className="form-label">Tên sản phẩm</label>
                <input
                    className="form-control"
                    {...register("name", {required: "Bắt buộc"})}
                />
                {errors.name && (
                    <small style={errorStyle}>{errors.name.message}</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Mô tả</label>
                <div className="border rounded p-2" style={{minHeight: 80}}>
                  <CKEditor
                      editor={ClassicEditor}
                      data={description}
                      onChange={(_, editor) =>
                          setValue("description", editor.getData(), {
                            shouldValidate: true,
                          })
                      }
                  />
                </div>
                {errors.description && (
                    <small style={errorStyle}>{errors.description.message}</small>
                )}
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
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

                <div className="col-12 col-md-6">
                  <label className="form-label">Danh mục cha (bắt buộc)</label>
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
                  <input
                      type="hidden"
                      {...register("categoryparent_id", {
                        required: "Vui lòng chọn danh mục cha",
                        validate: (v) => (v ? true : "Vui lòng chọn danh mục cha"),
                      })}
                      value={selectedParentId}
                  />
                  {errors.categoryparent_id && (
                      <small style={errorStyle}>
                        {errors.categoryparent_id.message}
                      </small>
                  )}
                </div>

                {/* Danh mục con: KHÔNG bắt buộc */}
                <div className="col-12">
                  <label className="form-label">
                    Danh mục con (không bắt buộc)
                  </label>
                  <select
                      className="form-select"
                      {...register("category_id")}
                      disabled={!selectedParentId}
                  >
                    <option value="">-- Không chọn --</option>
                    {childCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Biến thể */}
          <div className="row">
            {variationFields.map((field, idx) => (
                <VariationItem
                    key={field.id}
                    index={idx}
                    control={control}
                    register={register}
                    errors={errors}
                    getValues={getValues}
                    removeVariation={removeVariation}
                />
            ))}
          </div>

          <button
              type="button"
              className="btn btn-primary me-2"
              onClick={() =>
                  appendVariation({
                    name: "",
                    price: "",
                    quantity: "",
                    images: [],
                    // preset nhưng CHO SỬA label
                    specs: SPEC_PRESET.map((s) => ({...s})),
                  })
              }
          >
            Thêm biến thể
          </button>

          <button
              type="submit"
              className="btn btn-success me-2"
              disabled={isSubmitting}
          >
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
