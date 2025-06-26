import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import Constanst from "../../../Constanst";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // danh mục con
  const [categoryParents, setCategoryParents] = useState([]); // danh mục cha
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryParent, setSelectedCategoryParent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      await fetchCategoryParents();
      await fetchCategories();
      await fetchProducts();
    };
    fetchData();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/products/list`);
      if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu sản phẩm");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Lỗi fetch product:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/list`);
      if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu danh mục con");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Lỗi fetch categories:", err);
    }
  };

  const fetchCategoryParents = async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/categoryparents`);
      if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu danh mục cha");
      const data = await res.json();
      setCategoryParents(data);
    } catch (err) {
      console.error("Lỗi fetch category parents:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
      try {
        const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          alert("Sản phẩm đã được xóa!");
          fetchProducts();
        } else {
          const errorData = await res.json();
          console.error("Lỗi xóa sản phẩm:", errorData);
          alert("Lỗi khi xóa sản phẩm");
        }
      } catch (err) {
        console.error("Lỗi khi xóa sản phẩm:", err);
        alert("Lỗi khi xóa sản phẩm");
      }
    }
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Không có danh mục con";
    const category = categories.find(
      (cat) => String(cat.id) === String(categoryId)
    );
    return category?.name || "Không có danh mục con";
  };

  const getCategoryParentName = (categoryParentId) => {
    if (!categoryParentId) return "Không có danh mục cha";
    const parent = categoryParents.find(
      (p) => String(p.id) === String(categoryParentId)
    );
    return parent?.name || "Không có danh mục cha";
  };

  // Lọc sản phẩm dựa trên tìm kiếm, danh mục cha và danh mục con
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesParent =
      selectedCategoryParent === "" ||
      String(product.categoryparent_id) === selectedCategoryParent;

    const matchesCategory =
      selectedCategory === "" ||
      String(product.category_id) === selectedCategory;

    return matchesSearch && matchesParent && matchesCategory;
  });

  // Lọc danh mục con theo danh mục cha đã chọn (để dropdown danh mục con chỉ hiện con của cha đã chọn)
  const filteredCategoriesByParent = selectedCategoryParent
    ? categories.filter(
        (cat) => String(cat.parent_id) === selectedCategoryParent
      )
    : categories;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh sách sản phẩm</h2>
        <Link className="btn btn-success" to="/admin/product/addproduct">
          Thêm sản phẩm
        </Link>
      </div>

      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedCategoryParent}
            onChange={(e) => {
              setSelectedCategoryParent(e.target.value);
              setSelectedCategory(""); // reset danh mục con khi đổi cha
            }}
          >
            <option value="">-- Lọc theo danh mục cha --</option>
            {categoryParents.map((parent) => (
              <option key={parent.id} value={String(parent.id)}>
                {parent.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={!selectedCategoryParent}
          >
            <option value="">-- Lọc theo danh mục con --</option>
            {filteredCategoriesByParent.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="table table-bordered table-hover text-center">
        <thead className="table-dark">
          <tr>
            <th>STT</th>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Danh mục con</th>
            <th>Danh mục cha</th>
            <th>Trạng thái</th>
            <th>Ảnh</th>
            <th>Mô tả</th>
            <th>Giá KM</th>
            <th>Số lượng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan="11">Không có sản phẩm nào</td>
            </tr>
          ) : (
            filteredProducts.map((product, index) => (
              <tr key={product.id}>
                <td>{index + 1}</td>
                <td>{product.name}</td>
                <td>{product.price?.toLocaleString() || "Không có"}</td>
                <td>{getCategoryName(product.category_id)}</td>
                <td>{getCategoryParentName(product.categoryparent_id)}</td>
                <td>{product.status === 1 ? "Hiển thị" : "Ẩn"}</td>
                <td>
                  {Array.isArray(product.productImages) &&
                  product.productImages.length > 0 ? (
                    <img
                      src={`${Constanst.DOMAIN_API}/uploads/${product.productImages[0].image_url}`}
                      alt="product"
                      width="60"
                      height="60"
                      style={{ objectFit: "cover" }}
                    />
                  ) : product.images ? (
                    <img
                      src={`${Constanst.DOMAIN_API}/uploads/${
                        product.images.split(",")[0]
                      }`}
                      alt="product"
                      width="60"
                      height="60"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <span>Không có ảnh</span>
                  )}
                </td>
                <td>{product.description}</td>
                <td>
                  {product.discount_price?.toLocaleString() || "Không có"}
                </td>
                <td>{product.quantity ?? 0}</td>
                <td>
                  <Link
                    className="btn btn-success me-2"
                    to={`/admin/product/editproduct/${product.id}`}
                  >
                    Sửa
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(product.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
