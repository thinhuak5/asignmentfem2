import React, {useEffect, useState} from "react";
import {useFieldArray, useForm} from "react-hook-form";
import {Link, useNavigate} from "react-router-dom";
import Constanst from "../../../Constanst";
import {CKEditor} from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Đảm bảo Bootstrap CSS đã import ở project!
const AddProduct = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
      trigger,
      setError,
      clearErrors
  } = useForm({ defaultValues: { variations: [], description: "" } });

    const [categories, setCategories] = useState([]);
    const [parentCategories, setParentCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [selectedParentId, setSelectedParentId] = useState("");
    const [variationError, setVariationError] = useState("");

  useEffect(() => {
    register("description", { required: "Bắt buộc" });
      fetch(`${Constanst.DOMAIN_API}/api/categories/list`)
          .then(r => r.json())
          .then(data => {
              setCategories(data);
              setParentCategories(data.filter(c => c.parent_id === null));
          });
  }, [register]);

    useEffect(() => {
        setValue("categoryparent_id", selectedParentId);
        setChildCategories(
            categories.filter(c => String(c.parent_id) === String(selectedParentId))
        );
        setValue("category_id", "");
    }, [selectedParentId, categories, setValue]);

  const {
    fields: variationFields,
    append: appendVariation,
    remove: removeVariation,
  } = useFieldArray({ control, name: "variations" });

  const onSubmit = async (data) => {
      // Validate phải có ít nhất 1 biến thể
      if (!data.variations || data.variations.length === 0) {
          setVariationError("Phải có ít nhất 1 biến thể!");
          setError("variations", {type: "manual", message: "Phải có ít nhất 1 biến thể!"});
          return;
      } else {
          setVariationError("");
          clearErrors("variations");
      }

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("status", data.status === "Còn hàng" ? 1 : 0);
      formData.append("categoryparent_id", data.categoryparent_id);
      formData.append("category_id", data.category_id);

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

      const res = await fetch(`${Constanst.DOMAIN_API}/api/products/add`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error");

      alert("Thêm sản phẩm thành công");
      navigate("/admin/product");
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

    // Khi có biến thể, clear lỗi
    useEffect(() => {
        if (variationFields.length > 0 && variationError) {
            setVariationError("");
            clearErrors("variations");
        }
    }, [variationFields.length, variationError, clearErrors]);

  return (

      <div className="container">
      <h2>Thêm sản phẩm</h2>

          {/* Error nếu không có biến thể: dùng Bootstrap Alert */}
          {variationError && (
              <div
                  className="alert alert-info"
                  style={{
                      background: "#eaf6ff",
                      border: "1px solid #b6e0fe",
                      color: "#222",
                      borderRadius: "8px",
                      fontSize: "1.05rem",
                      padding: "16px 24px",
                      margin: "16px 0 8px 0",
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
                  data={watch("description")}
                  onChange={(_, editor) =>
                    setValue("description", editor.getData(), {
                      shouldValidate: true,
                    })
                  }
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

          {/* Status & Categories */}
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
                  onChange={e => setSelectedParentId(e.target.value)}
                >
                  <option value="">-- Chọn --</option>
                    {parentCategories.map(p => (
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
                  disabled={!selectedParentId}
                >
                  <option value="">-- Chọn --</option>
                    {childCategories.map(c => (
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

          {/* Variations Section */}
        <div className="row">
          {variationFields.map((field, idx) => (
            <div key={field.id} className="col-12 col-md-6 mb-3">
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
                        placeholder="Mô Tả"
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
                        placeholder="Tồn kho tối thiểu"
                        {...register(`variations.${idx}.min_stock`)}
                      />
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
          Thêm sản phẩm
        </button>
        <Link to="/admin/product" className="btn btn-secondary">
          Quay lại
        </Link>
      </form>
    </div>
  );
};

export default AddProduct;
