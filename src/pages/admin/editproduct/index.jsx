import React, {useEffect, useState} from "react";
import {useFieldArray, useForm} from "react-hook-form";
import {Link, useNavigate, useParams} from "react-router-dom";
import {FaCheckCircle, FaTimesCircle} from "react-icons/fa";
import Constanst from "../../../Constanst";
import {CKEditor} from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const errorStyle = {
    color: "#de225d",
    display: "inline-block",
    fontSize: "0.9rem",
    marginTop: "4px",
};

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
      watch,
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
    const [parentCategories, setParentCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [selectedParentId, setSelectedParentId] = useState("");
  const [description, setDescription] = useState("");
  const [variationImageUrls, setVariationImageUrls] = useState({});
    const [removedImages, setRemovedImages] = useState([]);
    const [variationError, setVariationError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Thêm state lưu tên sản phẩm khác
    const [productNames, setProductNames] = useState([]);

  const {
    fields: variationFields,
      append,
      remove,
  } = useFieldArray({
      control,
      name: "variations",
  });

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
                    data
                        .filter((p) => String(p.id) !== String(id))
                        .map((p) => p.name.toLowerCase())
                );
            });
    }, [id]);

    // fetch product
    useEffect(() => {
        if (!categories.length) return;
    fetch(`${Constanst.DOMAIN_API}/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
          const vars = (data.variations || []).map((v) => ({
              id: v.id,
              name: v.name,
              value: v.value,
              price: v.price ?? "",
              quantity: v.quantity ?? "",
              min_stock: v.min_stock ?? "",
              images: [],
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
          // build image map
          const map = {};
          (data.variations || []).forEach((v, i) => {
              map[i] = (v.productImages || []).map((img) => img.image_url);
          });
          setVariationImageUrls(map);
      });
    }, [categories, id, reset]);

    // update childCategories when parent changes
    useEffect(() => {
        setValue("categoryparent_id", selectedParentId);
        setChildCategories(
            categories.filter((c) => c.parent_id?.toString() === selectedParentId)
        );
        setValue("category_id", "");
    }, [selectedParentId, categories, setValue]);

    // handler to remove existing image
    const handleRemoveImage = (i, j) => {
        setVariationImageUrls((prev) => {
            const next = {...prev};
            const rem = next[i][j];
            next[i] = next[i].filter((_, k) => k !== j);
            setRemovedImages((r) => [...r, rem]);
            return next;
        });
  };

  const onSubmit = async (data) => {
      // 1. Bắt lỗi trùng tên với sản phẩm khác
      if (productNames.includes(data.name.trim().toLowerCase())) {
          setError("name", {
              type: "manual",
              message: "Tên sản phẩm đã tồn tại!",
          });
          setToastType("error");
          setToastMessage("Tên sản phẩm đã tồn tại!");
          setShowToast(true);
          setIsSubmitting(false);
          setTimeout(() => setShowToast(false), 3000);
          return;
      }

      // validate at least one variant
      if (!data.variations.length) {
          setVariationError("Phải có ít nhất 1 biến thể!");
          setError("variations", {type: "manual"});
          return;
      }
      // validate each variant has an image (existing or new)
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
          // validate tồn kho tối thiểu < số lượng
          const qty = getValues(`variations.${idx}.quantity`);
          const minStock = getValues(`variations.${idx}.min_stock`);
          if (
              qty !== "" &&
              minStock !== "" &&
              !isNaN(Number(qty)) &&
              !isNaN(Number(minStock)) &&
              Number(minStock) >= Number(qty)
          ) {
              setError(`variations.${idx}.min_stock`, {
                  type: "manual",
                  message: "Tồn kho tối thiểu phải nhỏ hơn số lượng!",
              });
              setToastType("error");
              setToastMessage(
                  `Biến thể #${idx + 1}: Tồn kho tối thiểu phải nhỏ hơn số lượng!`
              );
              setShowToast(true);
              setIsSubmitting(false);
              setTimeout(() => setShowToast(false), 3000);
              return;
          }
      }
      // clear errors
      setVariationError("");
      clearErrors("variations");
      setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("status", data.status === "Còn hàng" ? 1 : 0);
      formData.append("categoryparent_id", data.categoryparent_id);
    formData.append("category_id", data.category_id);
    formData.append("removedImages", JSON.stringify(removedImages));
      formData.append(
          "variations",
          JSON.stringify(data.variations.map(({images, ...rest}) => rest))
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
          const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${id}`, {
              method: "PUT",
              body: formData,
          });
          if (!res.ok)
              throw new Error((await res.json()).error || "Cập nhật thất bại");
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
          {/* Product info */}
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
                  {...register("category_id", { required: "Bắt buộc" })}
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

          {/* Variations */}
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
                                    onClick={() => remove(idx)}
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
                                                    v < qty ||
                                                    "Tồn kho tối thiểu phải nhỏ hơn số lượng",
                                            })}
                                        />
                                        {errors.variations?.[idx]?.min_stock && (
                                            <small style={errorStyle}>
                                                {errors.variations[idx].min_stock.message}
                                            </small>
                                        )}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">
                                            Ảnh biến thể #{idx + 1}
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            {...register(`variations.${idx}.images`)}
                                            multiple
                                        />
                                        {/* Hiển thị lỗi NGAY DƯỚI ô file */}
                                        {errors.variations?.[idx]?.images && (
                                            <small style={errorStyle}>
                                                {errors.variations[idx].images.message}
                                            </small>
                                        )}
                                        {variationImageUrls[idx]?.length > 0 && (
                                            <div className="mt-2 d-flex flex-wrap">
                            {variationImageUrls[idx].map((url, i) => (
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
                                  style={{
                                    objectFit: "cover",
                                      borderRadius: 6,
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx, i)}
                                  style={{
                                      position: "absolute",
                                      top: 2,
                                      right: 2,
                                      border: "none",
                                      borderRadius: "50%",
                                      background: "rgba(255,255,255,0.8)",
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
              append({
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
