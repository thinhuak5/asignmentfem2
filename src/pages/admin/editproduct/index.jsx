import React, {useEffect, useState} from "react";
import {useFieldArray, useForm} from "react-hook-form";
import {Link, useNavigate, useParams} from "react-router-dom";
import Constanst from "../../../Constanst";
import {CKEditor} from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
      reset,
      watch,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      status: "Còn hàng",
      categoryparent_id: "",
      category_id: "",
      price: "",
      discount_price: "",
      quantity: "",
      min_stock: "",
      variations: [],
    },
  });

    // State
  const [categories, setCategories] = useState([]);
    const [parentCategories, setParentCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [selectedParentId, setSelectedParentId] = useState("");
  const [description, setDescription] = useState("");
  const [variationImageUrls, setVariationImageUrls] = useState({});
    const [removedImages, setRemovedImages] = useState([]);

  const {
    fields: variationFields,
    append: appendVariation,
    remove: removeVariation,
  } = useFieldArray({ control, name: "variations" });

    const categoryIdValue = watch("category_id");

    // 1. Fetch categories
  useEffect(() => {
    fetch(`${Constanst.DOMAIN_API}/api/categories/list`)
      .then((r) => r.json())
        .then((allCats) => {
            setCategories(allCats);
            setParentCategories(allCats.filter((c) => c.parent_id === null));
        });
  }, []);

    // 2. Khi đã có categories, fetch product
    useEffect(() => {
        if (!categories.length) return;
    fetch(`${Constanst.DOMAIN_API}/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
          const vars = Array.isArray(data.variations)
              ? data.variations.map((v) => ({
                  id: v.id,
                  name: v.name,
                  value: v.value,
                  price: v.price ?? "",
                  quantity: v.quantity ?? "",
                  min_stock: v.min_stock ?? "",
                  images: [],
              }))
              : [];
          // Tìm cha từ danh mục sản phẩm
          const prodCat = categories.find((c) => String(c.id) === String(data.category_id));
          const parentId = prodCat?.parent_id ? String(prodCat.parent_id) : "";
          // Reset form
          reset({
              name: data.name,
              description: data.description || "",
              status: data.status === 1 ? "Còn hàng" : "Hết hàng",
              price: data.price ?? "",
              discount_price: data.discount_price ?? "",
              quantity: data.quantity ?? "",
              min_stock: data.min_stock ?? "",
              category_id: data.category_id ?? "",
              categoryparent_id: parentId,
              variations: vars,
          });
          setDescription(data.description || "");
          setSelectedParentId(parentId);
          // Ảnh từng biến thể
          const urlsMap = {};
          if (Array.isArray(data.variations)) {
          data.variations.forEach((v, idx) => {
              urlsMap[idx] = Array.isArray(v.productImages) && v.productImages.length
                  ? v.productImages.map((img) => img.image_url)
                  : [];
          });
          }
          setVariationImageUrls(urlsMap);
      });
    // eslint-disable-next-line
    }, [categories, id, reset]);

    // 3. Đồng bộ danh mục con với parent hiện tại
    useEffect(() => {
        if (selectedParentId) {
            setChildCategories(
                categories.filter((c) => String(c.parent_id) === String(selectedParentId))
            );
        } else {
            setChildCategories([]);
        }
    }, [selectedParentId, categories]);

    // Khi đổi danh mục cha bằng select, reset category con
    const handleParentChange = (e) => {
        setSelectedParentId(e.target.value);
        setValue("category_id", "");
        setValue("categoryparent_id", e.target.value);
    };

    // Xóa ảnh biến thể
  const handleRemoveImage = (variationIdx, imageIdx) => {
    const updatedUrls = { ...variationImageUrls };
      updatedUrls[variationIdx] = updatedUrls[variationIdx].filter((_, idx) => idx !== imageIdx);
    setVariationImageUrls(updatedUrls);
    const removedImage = variationImageUrls[variationIdx][imageIdx];
    setRemovedImages((prevImages) => [...prevImages, removedImage]);
  };

    // Submit
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("status", data.status === "Còn hàng" ? 1 : 0);
      formData.append("categoryparent_id", selectedParentId);
    formData.append("category_id", data.category_id);
    formData.append("price", data.price);
    formData.append("discount_price", data.discount_price);
    formData.append("quantity", data.quantity);
    formData.append("minStock", data.min_stock);

    formData.append("removedImages", JSON.stringify(removedImages));

      // Gửi biến thể: id sẽ null nếu là biến thể mới!
    const rawVars = data.variations || [];
    const varsMeta = rawVars.map(({ images, ...rest }) => rest);
    formData.append("variations", JSON.stringify(varsMeta));
    rawVars.forEach((v, idx) => {
      if (v.images && v.images.length) {
        Array.from(v.images).forEach((file) => {
          formData.append("images", file);
          formData.append("variation_idx", idx);
        });
      }
    });

    const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${id}`, {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      return alert("Lỗi: " + (err.error || "Cập nhật thất bại"));
    }
    alert("Cập nhật thành công!");
    navigate("/admin/product");
  };

  return (
    <div className="container">
      <h2>Sửa sản phẩm</h2>
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
                {...register("name", { required: "Bắt buộc" })}
              />
              {errors.name && (
                <small className="text-danger">{errors.name.message}</small>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Mô tả</label>
              <div className="border rounded p-2" style={{ minHeight: 40 }}>
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
                <small className="text-danger">
                  {errors.description.message}
                </small>
              )}
            </div>
          </div>
        </div>
          {/* Trạng thái & Danh mục */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Trạng thái và Danh mục</h5>
            <div className="row">
              <div className="col">
                <label className="form-label">Trạng thái</label>
                <select className="form-select" {...register("status")}>
                  <option value="Còn hàng">Còn hàng</option>
                  <option value="Hết hàng">Hết hàng</option>
                </select>
              </div>
              <div className="col">
                <label className="form-label">Danh mục cha</label>
                <select
                  className="form-select"
                  value={selectedParentId}
                  onChange={handleParentChange}
                >
                  <option value="">-- Chọn --</option>
                    {parentCategories.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label className="form-label">Danh mục con</label>
                <select
                  className="form-select"
                  {...register("category_id", { required: "Bắt buộc" })}
                  value={categoryIdValue || ""}
                  onChange={e => setValue("category_id", e.target.value)}
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
                  <small className="text-danger">
                    {errors.category_id.message}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Biến thể sản phẩm */}
        <div className="row">
          {variationFields.map((field, idx) => (
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
                        {...register(`variations.${idx}.name`, {required: "Bắt buộc"})}
                      />
                    </div>
                    <div className="col">
                      <input
                        className="form-control"
                        placeholder="Nội dung"
                        {...register(`variations.${idx}.value`, {required: "Bắt buộc"})}
                      />
                    </div>
                    <div className="col">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Giá"
                        {...register(`variations.${idx}.price`)}
                      />
                    </div>
                    <div className="col">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Số lượng"
                        {...register(`variations.${idx}.quantity`)}
                      />
                    </div>
                    <div className="col">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Tồn khuyến cáo"
                        {...register(`variations.${idx}.min_stock`)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        Ảnh biến thể #{idx + 1}
                      </label>
                      {variationImageUrls[idx] &&
                        variationImageUrls[idx].length > 0 && (
                              <div className="mb-2 d-flex flex-wrap">
                            {variationImageUrls[idx].map((url, i) => (
                              <div
                                key={i}
                                style={{
                                    position: "relative",
                                    display: "inline-block",
                                    marginRight: 10,
                                    marginBottom: 10,
                                }}
                              >
                                <img
                                  src={url}
                                  alt="old"
                                  width="60"
                                  height="60"
                                  style={{
                                    objectFit: "cover",
                                      borderRadius: 6,
                                      boxShadow: "0 1px 5px rgba(0,0,0,0.10)",
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx, i)}
                                  style={{
                                      position: "absolute",
                                      top: 2,
                                      right: 2,
                                      width: 22,
                                      height: 22,
                                      border: "none",
                                      borderRadius: "50%",
                                      background: "rgba(255,255,255,0.82)",
                                      color: "#e74c3c",
                                      fontWeight: "bold",
                                      fontSize: "18px",
                                      cursor: "pointer",
                                      lineHeight: "18px",
                                      padding: 0,
                                      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                                      zIndex: 2,
                                      transition: "background 0.2s",
                                  }}
                                  title="Xóa ảnh"
                                >
                                    ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      <input
                        type="file"
                        className="form-control"
                        {...register(`variations.${idx}.images`)}
                        multiple
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
        <button type="submit" className="btn btn-success me-2">
          Cập nhật sản phẩm
        </button>
        <Link to="/admin/product" className="btn btn-secondary">
          Quay lại
        </Link>
      </form>
    </div>
  );
};

export default EditProduct;
