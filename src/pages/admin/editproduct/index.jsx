// src/pages/admin/products/EditProduct.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import adminApi from "../../../api/adminApi";

const errorStyle = {
  color: "#de225d",
  display: "inline-block",
  fontSize: "0.9rem",
  marginTop: "4px",
};

const SPEC_PRESET = [
  { label: "Mã hàng", value: "195" },
  { label: "Nhà cung cấp", value: "Fahasa" },
  { label: "Tác giả", value: "Nhiều tác giả" },
  { label: "NXB", value: "Fahasa" },
  { label: "Năm XB", value: "2023" },
  { label: "Trọng lượng (gr)", value: "300" },
  { label: "Kích thước", value: "20 x 14 x 2 cm" },
  { label: "Số trang", value: "250" },
  { label: "Hình thức", value: "Bìa mềm" },
];

/** ===== Helpers format tiền VNĐ (không có ,00) & lọc số ===== */
const formatCurrencyVN = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};
const onlyDigits = (s) => String(s || "").replace(/[^\d]/g, "");

/** Component con cho 1 biến thể */
function VariationItem({
  index,
  control,
  register,
  errors,
  getValues,
  removeVariation,
  variationImageUrls,
  onRemoveImage,
}) {
  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({ control, name: `variations.${index}.specs` });

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
              Xóa
            </button>
          </h5>

          <div className="row g-2">
            {/* Tên biến thể — thêm validate không trùng */}
            <div className="col">
              <input
                className="form-control"
                placeholder="Tên biến thể"
                {...register(`variations.${index}.name`, {
                  required: "Bắt buộc",
                  validate: (val) => {
                    const cur = String(val || "")
                      .trim()
                      .toLowerCase();
                    if (!cur) return "Bắt buộc";
                    const vars = getValues("variations") || [];
                    const names = vars.map((v) =>
                      String(v?.name || "")
                        .trim()
                        .toLowerCase()
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

            <div className="col">
              <Controller
                name={`variations.${index}.price`}
                control={control}
                rules={{
                  required: "Bắt buộc",
                  validate: (v) =>
                    v === "" || v == null
                      ? "Bắt buộc"
                      : Number(v) >= 0 || "Không được nhỏ hơn 0",
                }}
                render={({ field: { value, onChange, onBlur, ref } }) => (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Giá (VD: 100000)"
                    inputMode="numeric"
                    pattern="\d*"
                    value={value ?? ""}
                    onChange={(e) => {
                      const raw = onlyDigits(e.target.value);
                      onChange(raw === "" ? "" : Number(raw));
                    }}
                    onBlur={onBlur}
                    ref={ref}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                )}
              />
              {errors.variations?.[index]?.price && (
                <small style={errorStyle}>
                  {errors.variations[index].price.message}
                </small>
              )}
            </div>

            <div className="col">
              <input
                type="number"
                className="form-control"
                placeholder="Số lượng"
                {...register(`variations.${index}.quantity`, {
                  required: "Bắt buộc",
                  valueAsNumber: true,
                  min: { value: 0, message: "Không được nhỏ hơn 0" },
                })}
                onWheel={(e) => e.currentTarget.blur()}
              />
              {errors.variations?.[index]?.quantity && (
                <small style={errorStyle}>
                  {errors.variations[index].quantity.message}
                </small>
              )}
            </div>

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

              {variationImageUrls[index]?.length > 0 && (
                <div className="mt-2 d-flex flex-wrap">
                  {variationImageUrls[index].map((url, i) => (
                    <div
                      key={i}
                      style={{
                        position: "relative",
                        marginRight: 10,
                        marginBottom: 10,
                      }}
                    >
                      <img
                        src={url}
                        alt=""
                        width="60"
                        height="60"
                        style={{ objectFit: "cover", borderRadius: 6 }}
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveImage(index, i)}
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          border: "none",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.85)",
                          color: "#e74c3c",
                          cursor: "pointer",
                          width: 22,
                          height: 22,
                          lineHeight: "18px",
                          fontWeight: "bold",
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Thông tin chi tiết (biến thể)</h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => appendSpec({ label: "", value: "" })}
              >
                + Thêm dòng
              </button>
            </div>

            <div className="row">
              {specFields.map((sf, j) => (
                <div className="col-md-6 mb-2" key={sf.id}>
                  <div className="row g-2 align-items-center">
                    <div className="col-5">
                      {/* Cho phép SỬA label + validate không trùng trong cùng biến thể */}
                      <input
                        className="form-control"
                        placeholder="Thuộc tính (VD: Màu, Size...)"
                        {...register(`variations.${index}.specs.${j}.label`, {
                          required: "Bắt buộc",
                          validate: (v) => {
                            const val = String(v || "")
                              .trim()
                              .toLowerCase();
                            if (!val) return "Bắt buộc";
                            const specs =
                              getValues(`variations.${index}.specs`) || [];
                            const labels = specs.map((s) =>
                              String(s?.label || "")
                                .trim()
                                .toLowerCase()
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

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      status: "Còn hàng",
      categoryparent_id: "",
      category_id: "",
      variations: [],
    },
  });

  const [categories, setCategories] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState("");

  const [description, setDescription] = useState("");
  const [variationImageUrls, setVariationImageUrls] = useState({});
  const [removedVarImgsMap, setRemovedVarImgsMap] = useState({});
  const [variationError, setVariationError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productNames, setProductNames] = useState([]);

  const {
    fields: variationFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "variations",
  });

  // === CHẶN XÓA KHI CÒN 1 BIẾN THỂ ===
  const attemptRemoveVariation = React.useCallback(
    (idx) => {
      const vars = getValues("variations") || [];
      if (vars.length <= 1) {
        setToastType("error");
        setToastMessage("Phải còn ít nhất 1 biến thể, không được xóa.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      remove(idx);
    },
    [getValues, remove]
  );

  useEffect(() => {
    register("description", { required: "Bắt buộc" });
  }, [register]);

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
          return { ...c, id: String(c.id), parent_id: pid };
        });
        setCategories(list);
      })
      .catch(() => setCategories([]));
  }, []);

  const parentCategories = useMemo(
    () =>
      (Array.isArray(categories) ? categories : []).filter(
        (c) => c.parent_id === null
      ),
    [categories]
  );

  const childOptions = useMemo(
    () =>
      (Array.isArray(categories) ? categories : []).filter(
        (c) => c.parent_id === selectedParentId
      ),
    [categories, selectedParentId]
  );

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
          list
            .filter((p) => String(p?.id) !== String(id))
            .map((p) => String(p?.name || "").toLowerCase())
            .filter(Boolean)
        );
      })
      .catch(() => setProductNames([]));
  }, [id]);

  useEffect(() => {
    if (!Array.isArray(categories) || categories.length === 0) return;

    adminApi
      .get(`/products/${id}`)
      .then((res) => {
        const raw = res?.data;
        const data = raw?.data ?? raw;

        const vars = (
          Array.isArray(data?.variations) ? data.variations : []
        ).map((v) => ({
          id: v.id,
          name: v.name,
          price: v.price ?? "",
          quantity: v.quantity ?? "",
          images: [],
          specs: (Array.isArray(v.specs) ? v.specs : [])
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((s) => ({ label: s.label, value: s.value })),
        }));

        const allCats = Array.isArray(categories) ? categories : [];
        let parentId = "";
        let childId = "";

        if (data?.category_id != null) {
          const currentCat = allCats.find(
            (c) => c.id === String(data.category_id)
          );
          if (currentCat) {
            if (currentCat.parent_id === null) {
              parentId = currentCat.id;
              childId = "";
            } else {
              parentId = currentCat.parent_id;
              childId = currentCat.id;
            }
          }
        }
        if (!parentId && data?.categoryparent_id != null) {
          const pc = allCats.find(
            (c) => c.id === String(data.categoryparent_id)
          );
          if (pc) parentId = pc.id;
        }

        setSelectedParentId(parentId);

        reset({
          name: data?.name || "",
          description: data?.description || "",
          status: data?.status === 1 ? "Còn hàng" : "Hết hàng",
          categoryparent_id: parentId,
          category_id: childId,
          variations: vars,
        });

        setDescription(data?.description || "");

        const map = {};
        (Array.isArray(data?.variations) ? data.variations : []).forEach(
          (v, i) => {
            map[i] = (
              Array.isArray(v?.productImages) ? v.productImages : []
            ).map((img) => img.image_url);
          }
        );
        setVariationImageUrls(map);
        setRemovedVarImgsMap({});
      })
      .catch(() => {});
  }, [categories, id, reset]);

  useEffect(() => {
    setValue("categoryparent_id", selectedParentId);
    const currentChild = String(getValues("category_id") || "");
    if (currentChild && !childOptions.some((c) => c.id === currentChild)) {
      setValue("category_id", "");
    }
  }, [selectedParentId, childOptions, setValue, getValues]);

  const handleRemoveImage = (varIdx, imgIdx) => {
    setVariationImageUrls((prev) => {
      const next = { ...prev };
      const removedUrl = next[varIdx][imgIdx];
      next[varIdx] = next[varIdx].filter((_, k) => k !== imgIdx);
      setRemovedVarImgsMap((m) => {
        const mm = { ...m };
        mm[varIdx] = [...(mm[varIdx] || []), removedUrl];
        return mm;
      });
      return next;
    });
  };

  const onSubmit = async (data) => {
    // 1) Không trùng tên sản phẩm
    if (productNames.includes(data.name.trim().toLowerCase())) {
      setError("name", { type: "manual", message: "Tên sản phẩm đã tồn tại!" });
      setToastType("error");
      setToastMessage("Tên sản phẩm đã tồn tại!");
      setShowToast(true);
      setIsSubmitting(false);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // 2) Không trùng tên biến thể (final gate)
    const names = (data.variations || []).map((v) =>
      String(v?.name || "")
        .trim()
        .toLowerCase()
    );
    const seen = new Map();
    let dup = false;
    names.forEach((n, i) => {
      if (!n) return;
      if (seen.has(n)) {
        dup = true;
        const j = seen.get(n);
        setError(`variations.${j}.name`, {
          type: "manual",
          message: "Tên biến thể đã tồn tại.",
        });
        setError(`variations.${i}.name`, {
          type: "manual",
          message: "Tên biến thể đã tồn tại.",
        });
      } else {
        seen.set(n, i);
      }
    });
    if (dup) {
      setToastType("error");
      setToastMessage("Không được trùng tên biến thể.");
      setShowToast(true);
      setIsSubmitting(false);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // 3) Ít nhất 1 ảnh cho mỗi biến thể (ảnh cũ hoặc mới)
    if (!Array.isArray(data.variations) || !data.variations.length) {
      setVariationError("Phải có ít nhất 1 biến thể!");
      setError("variations", { type: "manual" });
      return;
    }
    for (let idx = 0; idx < data.variations.length; idx++) {
      const hasExisting = (variationImageUrls[idx] || []).length > 0;
      const files = getValues(`variations.${idx}.images`);
      const hasNew = files && files.length;
      if (!hasExisting && !hasNew) {
        setVariationError(`Biến thể #${idx + 1} phải có ít nhất 1 ảnh`);
        setError(`variations.${idx}.images`, {
          type: "manual",
          message: "Bắt buộc",
        });
        return;
      }

      // Validate specs: label không trống, không trùng (đã validate ở input)
      const specs = data.variations[idx]?.specs || [];
      const labels = specs
        .map((s) =>
          String(s?.label || "")
            .trim()
            .toLowerCase()
        )
        .filter(Boolean);
      const setLabels = new Set(labels);
      if (labels.length !== setLabels.size) {
        setVariationError(
          `Thuộc tính (label) trong Biến thể #${idx + 1} đang bị trùng.`
        );
        return;
      }
    }

    setVariationError("");
    clearErrors("variations");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("status", data.status === "Còn hàng" ? 1 : 0);

    const parentId = data.categoryparent_id || "";
    const childId = data.category_id || "";
    formData.append("categoryparent_id", parentId);
    formData.append("category_id", childId ? childId : parentId);

    formData.append(
      "removedVariationImages",
      JSON.stringify(removedVarImgsMap)
    );

    formData.append(
      "variations",
      JSON.stringify(
        data.variations.map(({ images, specs, ...rest }) => ({
          id: rest.id,
          name: rest.name || "",
          price: rest.price === "" ? null : Number(rest.price),
          quantity: rest.quantity === "" ? 0 : Number(rest.quantity),
          type: rest.type || "regular",
          specs: Array.isArray(specs)
            ? specs.map((s, idx) => ({
                label: s.label,
                value: s.value,
                sort_order: idx,
              }))
            : [],
        }))
      )
    );

    data.variations.forEach((v, idx) => {
      if (v.images?.length) {
        Array.from(v.images).forEach((file) => {
          formData.append("images", file);
          formData.append("variation_idx", idx);
        });
      }
    });

    try {
      await adminApi.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToastType("success");
      setToastMessage("Cập nhật thành công!");
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
        "Cập nhật thất bại";
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
        style={{ zIndex: 1060 }}
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
                <FaCheckCircle className="me-2 fs-4" />
              ) : (
                <FaTimesCircle className="me-2 fs-4" />
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

      <h2 className="mb-4">Sửa sản phẩm</h2>

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
                {...register("name", { required: "Bắt buộc" })}
              />
              {errors.name && (
                <small style={errorStyle}>{errors.name.message}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Mô tả</label>
              <div className="border rounded p-2" style={{ minHeight: 80 }}>
                <CKEditor
                  editor={ClassicEditor}
                  data={description}
                  onChange={(_, editor) => {
                    const d = editor.getData();
                    setDescription(d);
                    setValue("description", d, { shouldValidate: true });
                  }}
                />
              </div>
              {errors.description && (
                <small style={errorStyle}>{errors.description.message}</small>
              )}
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  {...register("status", { required: "Bắt buộc" })}
                >
                  <option value="Còn hàng">Còn hàng</option>
                  <option value="Hết hàng">Hết hàng</option>
                </select>
                {errors.status && (
                  <small style={errorStyle}>{errors.status.message}</small>
                )}
              </div>

              <div className="col-12 col-md-4">
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
                  readOnly
                />
                {errors.categoryparent_id && (
                  <small style={errorStyle}>
                    {errors.categoryparent_id.message}
                  </small>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">
                  Danh mục con (không bắt buộc)
                </label>
                <Controller
                  name="category_id"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      className="form-select"
                      disabled={!selectedParentId}
                      {...field}
                    >
                      <option value="">-- Không chọn --</option>
                      {childOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {variationFields.map((field, idx) => (
            <VariationItem
              key={field.id}
              index={idx}
              control={control}
              register={register}
              errors={errors}
              getValues={getValues}
              removeVariation={attemptRemoveVariation} // dùng hàm chặn xóa
              variationImageUrls={variationImageUrls}
              onRemoveImage={handleRemoveImage}
            />
          ))}
        </div>

        <button
          type="button"
          className="btn btn-primary me-2"
          onClick={() =>
            append({
              name: "",
              price: "",
              quantity: "",
              images: [],
              specs: SPEC_PRESET.map((s) => ({ ...s })), // preset có thể sửa label
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
            "Cập nhật sản phẩm"
          )}
        </button>

        <Link to="/admin/product" className="btn btn-secondary">
          Quay lại
        </Link>
      </form>
    </div>
  );
}
