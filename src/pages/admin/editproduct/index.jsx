// src/pages/admin/products/EditProduct.jsx
import React, {useEffect, useState} from "react";
import {useFieldArray, useForm} from "react-hook-form";
import {Link, useNavigate, useParams} from "react-router-dom";
import {FaCheckCircle, FaTimesCircle} from "react-icons/fa";
import Constanst from "../../../Constanst";
import {CKEditor} from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const errorStyle = {color: "#de225d", display: "inline-block", fontSize: "0.9rem", marginTop: "4px"};

// Preset chi tiết cho MỖI biến thể (có thể sửa trước khi lưu)
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

/** Component con cho 1 biến thể (useFieldArray lồng nhau cho specs) */
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
    const {fields: specFields, append: appendSpec, remove: removeSpec} =
        useFieldArray({control, name: `variations.${index}.specs`});

    return (
        <div className="col-12 mb-3">
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title d-flex justify-content-between align-items-center">
                        <span>Biến thể #{index + 1}</span>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => removeVariation(index)}>
                            Xóa
                        </button>
                    </h5>

                    <div className="row g-2">
                        {/* Tên biến thể */}
                        <div className="col">
                            <input
                                className="form-control"
                                placeholder="Tên biến thể"
                                {...register(`variations.${index}.name`, {required: "Bắt buộc"})}
                            />
                            {errors.variations?.[index]?.name && (
                                <small style={errorStyle}>{errors.variations[index].name.message}</small>
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
                                <small style={errorStyle}>{errors.variations[index].price.message}</small>
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
                                <small style={errorStyle}>{errors.variations[index].quantity.message}</small>
                            )}
                        </div>

                        {/* Ảnh */}
                        <div className="col-12">
                            <label className="form-label">Ảnh biến thể #{index + 1}</label>
                            <input type="file" className="form-control" {...register(`variations.${index}.images`)}
                                   multiple/>
                            {errors.variations?.[index]?.images && (
                                <small style={errorStyle}>{errors.variations[index].images.message}</small>
                            )}

                            {/* ảnh đang có */}
                            {variationImageUrls[index]?.length > 0 && (
                                <div className="mt-2 d-flex flex-wrap">
                                    {variationImageUrls[index].map((url, i) => (
                                        <div key={i} style={{position: "relative", marginRight: 10, marginBottom: 10}}>
                                            <img src={url} alt="" width="60" height="60"
                                                 style={{objectFit: "cover", borderRadius: 6}}/>
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

                    {/* Thông tin chi tiết (specs) của biến thể – 2 cột */}
                    <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">Thông tin chi tiết (biến thể)</h6>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => appendSpec({label: "Thuộc tính mới", value: ""})}
                            >
                                + Thêm dòng
                            </button>
                        </div>

                        <div className="row">
                            {specFields.map((sf, j) => (
                                <div className="col-md-6 mb-2" key={sf.id}>
                                    <div className="row g-2 align-items-center">
                                        <div className="col-5">
                                            <input
                                                className="form-control"
                                                {...register(`variations.${index}.specs.${j}.label`)}
                                                readOnly={SPEC_PRESET.some(
                                                    (p) => p.label === getValues(`variations.${index}.specs.${j}.label`)
                                                )}
                                            />
                                        </div>
                                        <div className="col-5">
                                            <input
                                                className="form-control"
                                                {...register(`variations.${index}.specs.${j}.value`, {required: "Bắt buộc"})}
                                            />
                                            {errors.variations?.[index]?.specs?.[j]?.value && (
                                                <small style={errorStyle}>
                                                    {errors.variations[index].specs[j].value.message}
                                                </small>
                                            )}
                                        </div>
                                        <div className="col-2 text-end">
                                            <button type="button" className="btn btn-sm btn-outline-danger"
                                                    onClick={() => removeSpec(j)}>
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

    // State chung
  const [categories, setCategories] = useState([]);
    const [parentCategories, setParentCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [selectedParentId, setSelectedParentId] = useState("");

  const [description, setDescription] = useState("");
  const [variationImageUrls, setVariationImageUrls] = useState({});
    // map biến thể -> danh sách URL bị xóa
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
  } = useFieldArray({control, name: "variations"});

    // register description for validation
    useEffect(() => {
        register("description", {required: "Bắt buộc"});
    }, [register]);

    // fetch categories
  useEffect(() => {
    fetch(`${Constanst.DOMAIN_API}/api/categories/list`)
      .then((r) => r.json())
        .then((data) => {
            setCategories(data);
            setParentCategories(data.filter((c) => c.parent_id === null));
        });
  }, []);

    // fetch product names (loại trừ sản phẩm đang sửa)
    useEffect(() => {
        fetch(`${Constanst.DOMAIN_API}/api/products/list`)
            .then((r) => r.json())
            .then((data) => {
                setProductNames(
                    data.filter((p) => String(p.id) !== String(id)).map((p) => p.name.toLowerCase())
                );
            });
    }, [id]);

    // fetch product (khi đã có categories)
    useEffect(() => {
        if (!categories.length) return;
    fetch(`${Constanst.DOMAIN_API}/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
          const vars = (data.variations || []).map((v) => ({
              id: v.id,
              name: v.name,
              price: v.price ?? "",
              quantity: v.quantity ?? "",
              images: [],
              // specs từ API
              specs: (v.specs || [])
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((s) => ({label: s.label, value: s.value})),
          }));
          const prodCat = categories.find((c) => c.id === data.category_id);
          const parentId = prodCat?.parent_id?.toString() || "";
          reset({
              name: data.name,
              description: data.description || "",
              status: data.status === 1 ? "Còn hàng" : "Hết hàng",
              categoryparent_id: parentId,
              category_id: data.category_id?.toString() || "",
              variations: vars,
          });
          setDescription(data.description || "");
          setSelectedParentId(parentId);

          // map ảnh đang có theo index biến thể
          const map = {};
          (data.variations || []).forEach((v, i) => {
              map[i] = (v.productImages || []).map((img) => img.image_url);
          });
          setVariationImageUrls(map);
          setRemovedVarImgsMap({}); // reset
      });
    }, [categories, id, reset]);

    // update childCategories when parent changes
    useEffect(() => {
        setValue("categoryparent_id", selectedParentId);
        setChildCategories(categories.filter((c) => c.parent_id?.toString() === selectedParentId));
        setValue("category_id", "");
    }, [selectedParentId, categories, setValue]);

    // handler to remove existing image -> cập nhật map xóa theo idx biến thể
    const handleRemoveImage = (varIdx, imgIdx) => {
        setVariationImageUrls((prev) => {
            const next = {...prev};
            const removedUrl = next[varIdx][imgIdx];
            next[varIdx] = next[varIdx].filter((_, k) => k !== imgIdx);
            // gom theo map
            setRemovedVarImgsMap((m) => {
                const mm = {...m};
                mm[varIdx] = [...(mm[varIdx] || []), removedUrl];
                return mm;
            });
            return next;
        });
  };

  const onSubmit = async (data) => {
      // 1. Bắt lỗi trùng tên
      if (productNames.includes(data.name.trim().toLowerCase())) {
          setError("name", {type: "manual", message: "Tên sản phẩm đã tồn tại!"});
          setToastType("error");
          setToastMessage("Tên sản phẩm đã tồn tại!");
          setShowToast(true);
          setIsSubmitting(false);
          setTimeout(() => setShowToast(false), 3000);
          return;
      }

      // 2. Ít nhất 1 biến thể + có ảnh (cũ hoặc mới)
      if (!data.variations.length) {
          setVariationError("Phải có ít nhất 1 biến thể!");
          setError("variations", {type: "manual"});
          return;
      }
      for (let idx = 0; idx < data.variations.length; idx++) {
          const hasExisting = (variationImageUrls[idx] || []).length > 0;
          const files = getValues(`variations.${idx}.images`);
          const hasNew = files && files.length;
          if (!hasExisting && !hasNew) {
              setVariationError(`Biến thể #${idx + 1} phải có ít nhất 1 ảnh`);
              setError(`variations.${idx}.images`, {type: "manual", message: "Bắt buộc"});
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
      formData.append("categoryparent_id", data.categoryparent_id);
    formData.append("category_id", data.category_id);

      // gửi map ảnh bị xóa theo index biến thể
      formData.append("removedVariationImages", JSON.stringify(removedVarImgsMap));

      // variations JSON (kèm specs + sort_order) — KHÔNG còn value/min_stock
      formData.append(
          "variations",
          JSON.stringify(
              data.variations.map(({images, specs, ...rest}) => ({
                  id: rest.id,
                  name: rest.name || "",
                  price: rest.price === "" ? null : Number(rest.price),
                  quantity: rest.quantity === "" ? 0 : Number(rest.quantity),
                  type: rest.type || "regular",
                  specs: Array.isArray(specs)
                      ? specs.map((s, idx) => ({label: s.label, value: s.value, sort_order: idx}))
                      : [],
              }))
          )
      );

      // files + index mapping
      data.variations.forEach((v, idx) => {
          if (v.images?.length) {
        Array.from(v.images).forEach((file) => {
          formData.append("images", file);
          formData.append("variation_idx", idx);
        });
      }
    });

      try {
          const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${id}`, {
              method: "PUT",
              body: formData,
          });
          if (!res.ok) {
              const ct = res.headers.get("content-type") || "";
              const payload = ct.includes("application/json") ? await res.json() : await res.text();
              const msg = typeof payload === "string" ? payload : (payload.error || "Cập nhật thất bại");
              throw new Error(msg);
          }
          setToastType("success");
          setToastMessage("Cập nhật thành công!");
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

  return (
      <div className="container position-relative">
          {/* toast pop-up */}
          <div aria-live="polite" aria-atomic="true" className="position-fixed top-0 end-0 p-3" style={{zIndex: 1060}}>
              {showToast && (
                  <div
                      className={`toast show align-items-center text-white bg-${toastType === "success" ? "success" : "danger"} border-0`}
                      role="alert">
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

          <h2 className="mb-4">Sửa sản phẩm</h2>

          {variationError && (
              <div className="alert alert-info" style={{
                  background: "#eaf6ff",
                  border: "1px solid #b6e0fe",
                  color: "#222",
                  borderRadius: 8,
                  marginBottom: 16,
                  padding: "16px 24px"
              }}>
                  {variationError}
              </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="border p-4 rounded bg-light">
              {/* Product info */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Thông tin sản phẩm</h5>

            <div className="mb-3">
              <label className="form-label">Tên sản phẩm</label>
                <input className="form-control" {...register("name", {required: "Bắt buộc"})} />
                {errors.name && <small style={errorStyle}>{errors.name.message}</small>}
            </div>

            <div className="mb-3">
              <label className="form-label">Mô tả</label>
                <div className="border rounded p-2" style={{minHeight: 80}}>
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
                {errors.description && <small style={errorStyle}>{errors.description.message}</small>}
            </div>

              {/* 3 ô trên 1 dòng */}
              <div className="row g-3">
                  <div className="col-12 col-md-4">
                <label className="form-label">Trạng thái</label>
                      <select className="form-select" {...register("status", {required: "Bắt buộc"})}>
                  <option value="Còn hàng">Còn hàng</option>
                  <option value="Hết hàng">Hết hàng</option>
                </select>
                      {errors.status && <small style={errorStyle}>{errors.status.message}</small>}
              </div>

                  <div className="col-12 col-md-4">
                <label className="form-label">Danh mục cha</label>
                      <select className="form-select" value={selectedParentId}
                              onChange={(e) => setSelectedParentId(e.target.value)}>
                  <option value="">-- Chọn --</option>
                          {parentCategories.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

                  <div className="col-12 col-md-4">
                <label className="form-label">Danh mục con</label>
                      <select className="form-select" {...register("category_id", {required: "Bắt buộc"})}
                              disabled={!selectedParentId}>
                  <option value="">-- Chọn --</option>
                          {childCategories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                </select>
                      {errors.category_id && <small style={errorStyle}>{errors.category_id.message}</small>}
              </div>
            </div>
          </div>
        </div>

              {/* Variations */}
        <div className="row">
            {variationFields.map((field, idx) => (
                <VariationItem
                    key={field.id}
                    index={idx}
                    control={control}
                    register={register}
                    errors={errors}
                    getValues={getValues}
                    removeVariation={remove}
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
                  specs: SPEC_PRESET.map((s) => ({...s})), // preset cho biến thể mới
            })
          }
        >
          Thêm biến thể
        </button>

              <button type="submit" className="btn btn-success me-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                      <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
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
