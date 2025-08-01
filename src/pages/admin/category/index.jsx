import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import Constanst from "../../../Constanst";

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterParentId, setFilterParentId] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/list`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setCategories(data);
                } else {
                    console.error("Dữ liệu danh mục không hợp lệ:", data);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            try {
                const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/${id}`, {
                    method: "DELETE",
                });

                if (!res.ok) {
                    throw new Error("Không thể xóa danh mục");
                }

                setCategories(categories.filter(category => category.id !== id));
                alert("Danh mục đã được xóa!");
            } catch (error) {
                console.error("Lỗi khi xóa danh mục:", error);
                alert("Có lỗi xảy ra khi xóa danh mục.");
            }
        }
    };

    // Lấy tên danh mục cha theo parent_id từ mảng categories
    const getParentName = (parent_id) => {
        if (!parent_id) return "Không có";
        const parent = categories.find(cat => cat.id === parent_id);
        return parent ? parent.name : "Không có";
    };

    // Các danh mục cha (parent_id === null) cho dropdown lọc
    const parentCategories = categories.filter(cat => cat.parent_id === null);

    // Lọc theo tên và theo danh mục cha nếu có
    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesParent = filterParentId ? category.parent_id === parseInt(filterParentId) : true;
        return matchesSearch && matchesParent;
    });

    return (
        <div className="container">
            <h2>Danh sách danh mục</h2>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                    type="text"
                    className="form-control w-50"
                    placeholder="Tìm kiếm theo tên danh mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="form-select w-25 ms-3"
                    value={filterParentId}
                    onChange={(e) => setFilterParentId(e.target.value)}
                >
                    <option value="">-- Lọc theo danh mục cha --</option>
                    {parentCategories.map(parent => (
                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                    ))}
                </select>
                <Link to="/admin/category/addcategory" className="btn btn-primary ms-3">
                    Thêm danh mục
                </Link>
            </div>

            <table className="table table-bordered">
                <thead className="table-dark">
                <tr>
                    <th>Id</th>
                    <th>Tên danh mục</th>
                    <th>Ảnh</th>
                    <th>Trạng thái</th>
                    <th>Danh mục cha</th>
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {filteredCategories.length > 0 ? filteredCategories.map(category => (
                    <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>{category.name}</td>
                        <td>
                            {category.images ? (
                                <img
                                    src={category.images}
                                    alt="category"
                                    width="60"
                                    height="60"
                                    style={{objectFit: "cover"}}
                                />
                            ) : (
                                <span>Không có ảnh</span>
                            )}
                        </td>
                        <td>{category.status === 1 ? "Hiển thị" : "Ẩn"}</td>
                        <td>{getParentName(category.parent_id)}</td>
                        <td>
                            <Link to={`/admin/category/editcategory/${category.id}`}
                                  className="btn btn-warning btn-sm me-2">Sửa</Link>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(category.id)}>
                                Xóa
                            </button>
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="6" className="text-center">Không tìm thấy danh mục phù hợp</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryList;
