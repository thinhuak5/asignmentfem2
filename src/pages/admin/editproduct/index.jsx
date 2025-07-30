import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Constanst from "../../../Constanst";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
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

  const [categoryParents, setCategoryParents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState("");
  const [variationImageUrls, setVariationImageUrls] = useState({});
  const [removedImages, setRemovedImages] = useState([]); // Khai báo state cho removedImages

  const {
    fields: variationFields,
    append: appendVariation,
    remove: removeVariation,
  } = useFieldArray({ control, name: "variations" });

  const parentId = watch("categoryparent_id");

  useEffect(() => {
    // fetch danh mục cha & con
    fetch(`${Constanst.DOMAIN_API}/api/categoryparents`)
      .then((r) => r.json())
      .then(setCategoryParents);
    fetch(`${Constanst.DOMAIN_API}/api/categories/list`)
      .then((r) => r.json())
      .then(setCategories);

    // fetch product
    fetch(`${Constanst.DOMAIN_API}/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        // chung
        setValue("name", data.name);
        setValue("description", data.description);
        setDescription(data.description || "");
        setValue("status", data.status === 1 ? "Còn hàng" : "Hết hàng");
        setValue("categoryparent_id", data.categoryparent_id ?? "");
        setValue("category_id", data.category_id ?? "");
        setValue("price", data.price ?? "");
        setValue("discount_price", data.discount_price ?? "");
        setValue("quantity", data.quantity ?? "");
        setValue("min_stock", data.min_stock ?? "");

        // biến thể
        if (Array.isArray(data.variations)) {
          const vars = data.variations.map((v) => ({
            id: v.id,
            name: v.name,
            value: v.value,
            price: v.price ?? "",
            quantity: v.quantity ?? "",
            min_stock: v.min_stock ?? "",
            images: [], // input file mới để upload
          }));
          setValue("variations", vars);

          const urlsMap = {};
          data.variations.forEach((v, idx) => {
            urlsMap[idx] =
              Array.isArray(v.productImages) && v.productImages.length
                ? v.productImages.map((img) => img.image_url)
                : [];
          });
          setVariationImageUrls(urlsMap);
        }
      });
    // eslint-disable-next-line
  }, [id]);

  // Xử lý xóa ảnh
  const handleRemoveImage = (variationIdx, imageIdx) => {
    const updatedUrls = { ...variationImageUrls };
    updatedUrls[variationIdx] = updatedUrls[variationIdx].filter(
      (_, idx) => idx !== imageIdx
    );
    setVariationImageUrls(updatedUrls);

    // Thêm URL ảnh cần xóa vào mảng removedImages
    const removedImage = variationImageUrls[variationIdx][imageIdx];
    setRemovedImages((prevImages) => [...prevImages, removedImage]);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("status", data.status === "Còn hàng" ? 1 : 0);
    formData.append("categoryparent_id", data.categoryparent_id);
    formData.append("category_id", data.category_id);
    formData.append("price", data.price);
    formData.append("discount_price", data.discount_price);
    formData.append("quantity", data.quantity);
    formData.append("minStock", data.min_stock);

    // Thêm mảng removedImages vào formData
    formData.append("removedImages", JSON.stringify(removedImages));

    const rawVars = data.variations || [];
    const varsMeta = rawVars.map(({ images, ...rest }) => rest);
    formData.append("variations", JSON.stringify(varsMeta));

    // Upload file biến thể
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
        {/* Thẻ thông tin sản phẩm */}
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

            {/* Mô tả */}
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

        {/* Thẻ trạng thái và danh mục */}
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
                  value={parentId}
                  onChange={(e) =>
                    setValue("categoryparent_id", e.target.value)
                  }
                >
                  <option value="">-- Chọn --</option>
                  {categoryParents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.categoryparent_id && (
                  <small className="text-danger">
                    {errors.categoryparent_id.message}
                  </small>
                )}
              </div>
              <div className="col">
                <label className="form-label">Danh mục con</label>
                <select
                  className="form-select"
                  {...register("category_id", { required: "Bắt buộc" })}
                  disabled={!parentId}
                >
                  <option value="">-- Chọn --</option>
                  {categories
                    .filter((c) => String(c.parent_id) === String(parentId))
                    .map((c) => (
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
                        {...register(`variations.${idx}.name`, {
                          required: "Bắt buộc",
                        })}
                      />
                    </div>
                    <div className="col">
                      <input
                        className="form-control"
                        placeholder="Nội dung"
                        {...register(`variations.${idx}.value`, {
                          required: "Bắt buộc",
                        })}
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
                      {/* Hiển thị ảnh cũ nếu có */}
                      {variationImageUrls[idx] &&
                        variationImageUrls[idx].length > 0 && (
                          <div className="mb-2 d-flex">
                            {variationImageUrls[idx].map((url, i) => (
                              <div
                                key={i}
                                className="d-flex align-items-center"
                              >
                                <img
                                  src={url}
                                  alt="old"
                                  width="60"
                                  height="60"
                                  style={{
                                    objectFit: "cover",
                                    marginRight: 8,
                                  }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemoveImage(idx, i)}
                                >
                                  Xóa
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
