import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {FaCogs, FaImage, FaList, FaRegFileAlt, FaTags, FaTrashAlt} from "react-icons/fa";
import Constanst from "../../../Constanst";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
    const [selectedParentId, setSelectedParentId] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  useEffect(() => {
      fetchCategories();
      fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/products/list`);
      setProducts(await res.json());
    } catch (err) {
        console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/list`);
      setCategories(await res.json());
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
          alert("Lỗi khi xóa");
      }
    } catch (err) {
        console.error(err);
        alert("Lỗi khi xóa");
    }
  };

    // Danh mục cha và con
    const parentCategories = categories.filter(c => c.parent_id === null);
    const childCategories = selectedParentId
        ? categories.filter(c => String(c.parent_id) === String(selectedParentId))
        : [];

  const getCategoryName = (id) =>
      categories.find(c => String(c.id) === String(id))?.name || "Không có";

    const getParentName = (child_id) => {
        const cat = categories.find(c => String(c.id) === String(child_id));
        if (!cat || !cat.parent_id) return "Không có";
        return getCategoryName(cat.parent_id);
    };

  const filteredProducts = products.filter(p => {
      const bySearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      let byParent = true, byChild = true;
      if (selectedParentId) {
          const cat = categories.find(c => String(c.id) === String(p.category_id));
          byParent = cat && String(cat.parent_id) === String(selectedParentId);
      }
      if (selectedCategoryId) {
          byChild = String(p.category_id) === String(selectedCategoryId);
      }
      return bySearch && byParent && byChild;
  });

    // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

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
            value={selectedParentId}
            onChange={e => {
                setSelectedParentId(e.target.value);
                setSelectedCategoryId(""); // Reset con khi đổi cha
            }}
          >
            <option value="">-- Lọc danh mục cha --</option>
              {parentCategories.map(p => (
              <option key={p.id} value={String(p.id)}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedCategoryId}
            onChange={e => setSelectedCategoryId(e.target.value)}
            disabled={!selectedParentId}
          >
            <option value="">-- Lọc danh mục con --</option>
              {childCategories.map(c => (
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
              <th><FaTags/> Danh mục cha</th>
            <th><FaTags /> Danh mục con</th>
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
                  <td>{(p.description && p.description.length > 15)
                      ? p.description.substring(0, 15) + "..." : p.description}
                  </td>
                  <td>{getParentName(p.category_id)}</td>
                <td>{getCategoryName(p.category_id)}</td>
                <td>{p.status === 1 ? "Hiển thị" : "Ẩn"}</td>
                <td>
                    {p.variations && p.variations[0] && p.variations[0].productImages && p.variations[0].productImages[0] ? (
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
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
          </li>
          {[...Array(totalPages)].map((_, index) => (
            <li key={index} className={`page-item ${index + 1 === currentPage ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ProductList;
