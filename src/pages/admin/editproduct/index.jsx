import React, {useEffect, useState} from "react";
import {useFieldArray, useForm} from "react-hook-form";
import {Link, useNavigate, useParams} from "react-router-dom";
import Constanst from "../../../Constanst";

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
  } = useForm();

  const [categories, setCategories] = useState([]);
  const [categoryParents, setCategoryParents] = useState([]);
  const [product, setProduct] = useState(null);

  // Ảnh hiện tại (nhiều ảnh)
  const [currentImages, setCurrentImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  // Biến thể
  const {
    fields: variations,
    append,
    remove,
    update,
  } = useFieldArray({
    control,
    name: "variations",
  });

  useEffect(() => {
    fetchCategoryParents();
    fetchCategories();
    fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/list`);
      if (!res.ok) throw new Error("Lỗi khi lấy danh mục con");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Lỗi fetch categories:", err);
    }
  };

  const fetchCategoryParents = async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/categoryparents`);
      if (!res.ok) throw new Error("Lỗi khi lấy danh mục cha");
      const data = await res.json();
      setCategoryParents(data);
    } catch (err) {
      console.error("Lỗi fetch category parents:", err);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${id}`);
      if (!res.ok) throw new Error("Lỗi khi lấy sản phẩm");
      const data = await res.json();
      setProduct(data);

      setValue("name", data.name);
      setValue("description", data.description);
      setValue("price", data.price);
      setValue("discount_price", data.discount_price || "");
      setValue("status", data.status === 1 ? "Còn hàng" : "Hết hàng");
      setValue("category_id", data.category_id);
      setValue("categoryparent_id", data.categoryparent_id || "");
      setValue("quantity", data.quantity || 0);
      setValue("minStock", data.minStock || 0);

      // Ảnh hiện tại
      if (Array.isArray(data.productImages)) {
        setCurrentImages(data.productImages.map((img) => img.image_url));
      } else if (data.images) {
        setCurrentImages(data.images.split(",").map((img) => img.trim()));
      }

      // Biến thể
      if (Array.isArray(data.variations)) {
        setValue(
          "variations",
          data.variations.map((v) => ({
            id: v.id,
            name: v.name,
            value: v.value,
            price: v.price,
            quantity: v.quantity,
            minStock: v.minStock,
            type: v.type || "regular",
          }))
        );
      } else {
        setValue("variations", []);
      }
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
    }
  };

  // Xóa ảnh hiện tại (chỉ trên FE, khi submit mới gửi danh sách xóa lên BE)
  const handleRemoveImage = (img) => {
    setRemovedImages((prev) => [...prev, img]);
    setCurrentImages((prev) => prev.filter((i) => i !== img));
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    const status = data.status === "Còn hàng" ? 1 : 0;

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("discount_price", data.discount_price || "");
    formData.append("status", status);
    formData.append("category_id", data.category_id);
    formData.append("categoryparent_id", data.categoryparent_id);
    formData.append("quantity", data.quantity);
    formData.append("minStock", data.minStock);

    // Ảnh mới (nhiều ảnh)
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append("images", data.images[i]);
      }
    }

    // Ảnh cũ giữ lại
    formData.append("old_images", JSON.stringify(currentImages));
    // Ảnh bị xóa
    formData.append("removed_images", JSON.stringify(removedImages));

    // Biến thể
    formData.append("variations", JSON.stringify(data.variations || []));

    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi khi cập nhật sản phẩm");
      }

      alert("Cập nhật sản phẩm thành công!");
      navigate("/admin/product");
    } catch (err) {
      alert(`Lỗi khi cập nhật sản phẩm: ${err.message}`);
    }
  };

  if (!product) return <div>Đang tải dữ liệu sản phẩm...</div>;

  return (
    <div className="container mt-5">
      <h2>Sửa sản phẩm</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border p-4 rounded bg-light"
        encType="multipart/form-data"
      >
        {/* Tên sản phẩm */}
        <div className="mb-3">
          <label className="form-label">Tên sản phẩm</label>
          <input
            className="form-control"
            {...register("name", { required: "Tên không được để trống" })}
          />
          {errors.name && (
            <small className="text-danger">{errors.name.message}</small>
          )}
        </div>

        {/* Mô tả */}
        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          <textarea
            className="form-control"
            {...register("description", { required: "Mô tả là bắt buộc" })}
          />
          {errors.description && (
            <small className="text-danger">{errors.description.message}</small>
          )}
        </div>

        {/* Giá */}
        <div className="mb-3">
          <label className="form-label">Giá</label>
          <input
            type="number"
            className="form-control"
            {...register("price", {
              required: "Giá không được để trống",
              min: { value: 1, message: "Giá phải lớn hơn 0" },
            })}
          />
          {errors.price && (
            <small className="text-danger">{errors.price.message}</small>
          )}
        </div>

        {/* Giá khuyến mãi */}
        <div className="mb-3">
          <label className="form-label">Giá khuyến mãi</label>
          <input
            type="number"
            className="form-control"
            {...register("discount_price", {
              validate: (value) => {
                if (value === "" || value === undefined) return true;
                if (parseFloat(value) >= parseFloat(watch("price"))) {
                  return "Giá khuyến mãi phải nhỏ hơn giá gốc";
                }
                return true;
              },
            })}
          />
          {errors.discount_price && (
            <small className="text-danger">
              {errors.discount_price.message}
            </small>
          )}
        </div>

        {/* Số lượng */}
        <div className="mb-3">
          <label className="form-label">Số lượng</label>
          <input
            type="number"
            className="form-control"
            {...register("quantity", {
              required: "Số lượng là bắt buộc",
              min: { value: 0, message: "Số lượng không được âm" },
            })}
          />
          {errors.quantity && (
            <small className="text-danger">{errors.quantity.message}</small>
          )}
        </div>

        {/* Tồn kho tối thiểu */}
        <div className="mb-3">
          <label className="form-label">Tồn kho tối thiểu</label>
          <input
            type="number"
            className="form-control"
            {...register("minStock", {
              required: "Tồn kho tối thiểu là bắt buộc",
              min: { value: 0, message: "Giá trị không được âm" },
            })}
          />
          {errors.minStock && (
            <small className="text-danger">{errors.minStock.message}</small>
          )}
        </div>

        {/* Trạng thái */}
        <div className="mb-3">
          <label className="form-label">Trạng thái</label>
          <select className="form-select" {...register("status")}>
            <option value="Còn hàng">Còn hàng</option>
            <option value="Hết hàng">Hết hàng</option>
          </select>
        </div>

        {/* Ảnh hiện tại (nhiều ảnh) */}
        {currentImages.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Ảnh hiện tại</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {currentImages.map((img, idx) => (
                <div key={img} style={{ position: "relative" }}>
                  <img
                    src={`${Constanst.DOMAIN_API}/uploads/${img}`}
                    alt="Ảnh hiện tại"
                    width="100"
                    height="100"
                    style={{ objectFit: "cover", border: "1px solid #ccc" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img)}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "red",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      cursor: "pointer",
                    }}
                    title="Xóa ảnh này"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chọn hình ảnh mới (nhiều ảnh) */}
        <div className="mb-3">
          <label className="form-label">
            Chọn hình ảnh mới (có thể chọn nhiều)
          </label>
          <input
            type="file"
            className="form-control"
            multiple
            {...register("images")}
          />
        </div>

        {/* Danh mục cha */}
        <div className="mb-3">
          <label className="form-label">Danh mục cha</label>
          <select
            className="form-select"
            {...register("categoryparent_id", {
              required: "Phải chọn danh mục cha",
            })}
          >
            <option value="">Chọn danh mục cha</option>
            {categoryParents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </select>
          {errors.categoryparent_id && (
            <small className="text-danger">
              {errors.categoryparent_id.message}
            </small>
          )}
        </div>

        {/* Danh mục con */}
        <div className="mb-3">
          <label className="form-label">Danh mục con</label>
          <select
            className="form-select"
            {...register("category_id", {
              required: "Phải chọn danh mục con",
            })}
          >
            <option value="">Chọn danh mục con</option>
            {categories
              .filter((cat) => {
                const selectedParentId = watch("categoryparent_id");
                if (!selectedParentId) return true;
                return String(cat.parent_id) === String(selectedParentId);
              })
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
          {errors.category_id && (
            <small className="text-danger">{errors.category_id.message}</small>
          )}
        </div>

        {/* Biến thể sản phẩm */}
        <div className="mb-3">
          <label className="form-label">Biến thể sản phẩm</label>
          {variations.map((field, idx) => (
            <div key={field.id} className="border p-2 mb-2 rounded">
              <div className="row">
                <div className="col">
                  <input
                    type="hidden"
                    {...register(`variations.${idx}.id`)}
                    value={field.id} // Lấy ID từ field của useFieldArray
                  />
                  <input
                    className="form-control mb-1"
                    placeholder="Tên biến thể"
                    {...register(`variations.${idx}.name`, { required: true })}
                  />
                </div>
                <div className="col">
                  <input
                    className="form-control mb-1"
                    placeholder="Nội dung"
                    {...register(`variations.${idx}.value`, { required: true })}
                  />
                </div>
                <div className="col">
                  <input
                    type="number"
                    className="form-control mb-1"
                    placeholder="Giá"
                    {...register(`variations.${idx}.price`)}
                  />
                </div>
                <div className="col">
                  <input
                    type="number"
                    className="form-control mb-1"
                    placeholder="Số lượng"
                    {...register(`variations.${idx}.quantity`)}
                  />
                </div>
                <div className="col">
                  <input
                    type="number"
                    className="form-control mb-1"
                    placeholder="Tồn kho tối thiểu"
                    {...register(`variations.${idx}.minStock`)}
                  />
                </div>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => remove(idx)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              append({
                id: null,
                name: "",
                value: "",
                price: "",
                quantity: "",
                minStock: "",
                type: "regular",
              })
            }
          >
            Thêm biến thể
          </button>
        </div>
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
