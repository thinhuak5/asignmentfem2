import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaList, FaRegFileAlt, FaTags, FaImage, FaCogs, FaTrashAlt } from "react-icons/fa";  // Import các icon từ React Icons
import Constanst from "../../../Constanst";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryParents, setCategoryParents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryParent, setSelectedCategoryParent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  useEffect(() => {
    (async () => {
      await fetchCategoryParents();
      await fetchCategories();
      await fetchProducts();
    })();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/products/list`);
      if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu sản phẩm");
      setProducts(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/list`);
      if (!res.ok) throw new Error("Lỗi khi lấy danh mục con");
      setCategories(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategoryParents = async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/categoryparents`);
      if (!res.ok) throw new Error("Lỗi khi lấy danh mục cha");
      setCategoryParents(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Đã xóa!");
        fetchProducts();
      } else {
        throw new Error((await res.json()).error);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa");
    }
  };

  const getCategoryName = (id) =>
    !id ? "Không có danh mục con" :
    categories.find(c => String(c.id) === String(id))?.name || "Không có danh mục con";

  const getCategoryParentName = (id) =>
    !id ? "Không có danh mục cha" :
    categoryParents.find(p => String(p.id) === String(id))?.name || "Không có danh mục cha";

  const filteredProducts = products.filter(p => {
    const bySearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const byParent = !selectedCategoryParent || String(p.categoryparent_id) === selectedCategoryParent;
    const byCat    = !selectedCategory      || String(p.category_id)       === selectedCategory;
    return bySearch && byParent && byCat;
  });

  const filteredCategoriesByParent = selectedCategoryParent
    ? categories.filter(c => String(c.parent_id) === selectedCategoryParent)
    : categories;

  // Truncate description to 15 characters and add "..."
  const truncateDescription = (description) => {
    return description.length > 15 ? description.substring(0, 15) + "..." : description;
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh sách sản phẩm</h2>
        <Link className="btn btn-success" to="/admin/product/addproduct">
          Thêm sản phẩm
        </Link>
      </div>

      {/* Filters */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedCategoryParent}
            onChange={e => {
              setSelectedCategoryParent(e.target.value);
              setSelectedCategory("");
            }}
          >
            <option value="">-- Lọc danh mục cha --</option>
            {categoryParents.map(p => (
              <option key={p.id} value={String(p.id)}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            disabled={!selectedCategoryParent}
          >
            <option value="">-- Lọc danh mục con --</option>
            {filteredCategoriesByParent.map(c => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <table className="table table-bordered table-hover text-center">
        <thead className="table-dark">
          <tr>
            <th><FaList /> STT</th>
            <th><FaRegFileAlt /> Tên</th>
            <th><FaTags /> Mô tả</th>
            <th><FaTags /> Danh mục con</th>
            <th><FaTags /> Danh mục cha</th>
            <th><FaCogs /> Trạng thái</th>
            <th><FaImage /> Ảnh</th>
            <th><FaCogs /> Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.length === 0
            ? (
              <tr>
                <td colSpan="8">Không có sản phẩm</td>
              </tr>
            )
            : currentProducts.map((p, idx) => (
              <tr key={p.id}>
                <td>{indexOfFirstProduct + idx + 1}</td>
                <td>{p.name}</td>
                <td>{truncateDescription(p.description)}</td>
                <td>{getCategoryName(p.category_id)}</td>
                <td>{getCategoryParentName(p.categoryparent_id)}</td>
                <td>{p.status === 1 ? "Hiển thị" : "Ẩn"}</td>
                <td>
                  {p.variations &&
                   p.variations[0] &&
                   p.variations[0].productImages &&
                   p.variations[0].productImages[0] ? (
                    <img
                      src={p.variations[0].productImages[0].image_url}
                      alt="thumb"
                      width="60"
                      height="60"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <span>Không có ảnh</span>
                  )}
                </td>
                <td>
                  <div className="d-flex">
                    <Link
                      className="btn btn-success me-2"
                      to={`/admin/product/editproduct/${p.id}`}
                    >
                      Sửa
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      <FaTrashAlt /> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>

      {/* Pagination */}
      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => paginate(currentPage - 1)}>Prev</button>
          </li>
          {[...Array(totalPages)].map((_, index) => (
            <li key={index} className={`page-item ${index + 1 === currentPage ? "active" : ""}`}>
              <button className="page-link" onClick={() => paginate(index + 1)}>{index + 1}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ProductList;
