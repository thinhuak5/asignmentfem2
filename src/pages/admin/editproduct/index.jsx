import React, {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
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
    formState: { errors },
  } = useForm();

  const [categories, setCategories] = useState([]);
  const [categoryParents, setCategoryParents] = useState([]);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchCategoryParents();
    fetchCategories();
    fetchProduct();
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
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
    }
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

    if (data.images && data.images.length > 0 && data.images[0]) {
      formData.append("images", data.images[0]);
    } else {
      formData.append("old_image", product.images);
    }

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
                {...register("name", {required: "Tên không được để trống"})}
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
                {...register("description", {required: "Mô tả là bắt buộc"})}
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
                  min: {value: 1, message: "Giá phải lớn hơn 0"},
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
                  min: {value: 0, message: "Số lượng không được âm"},
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
                  min: {value: 0, message: "Giá trị không được âm"},
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

          {/* Ảnh hiện tại */}
          {product.images && (
              <div className="mb-3">
                <label className="form-label">Ảnh hiện tại</label>
                <br/>
                <img
                    src={`${Constanst.DOMAIN_API}/uploads/${product.images}`}
                    alt="Ảnh hiện tại"
                    width="100"
                    height="100"
                    style={{objectFit: "cover", border: "1px solid #ccc"}}
                />
              </div>
          )}

          {/* Chọn hình ảnh mới */}
          <div className="mb-3">
            <label className="form-label">Chọn hình ảnh mới (nếu có)</label>
            <input type="file" className="form-control" {...register("images")} />
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
