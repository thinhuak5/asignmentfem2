import React, {useEffect, useState} from "react";
import {Link} from 'react-router'; // ✅ Đổi đúng thành react-router-dom
import Constanst from "../../../Constanst";

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/list`);  // Fixed template string
                const data = await res.json();

                if (Array.isArray(data)) {
                    setCategories(data);
                } else {
                    console.error("Dữ liệu không phải là mảng:", data);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh mục:", error);
            }
        };

        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            try {
                const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/${id}`, {
                    method: 'DELETE',
                });

                if (!res.ok) {
                    throw new Error('Không thể xóa danh mục');
                }

                setCategories(categories.filter(category => category.id !== id));
                alert("Danh mục đã được xóa!");
            } catch (error) {
                console.error("Lỗi khi xóa danh mục:", error);
                alert("Có lỗi xảy ra khi xóa danh mục.");
            }
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mt-5">
            <h2>Danh sách danh mục</h2>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                    type="text"
                    className="form-control w-50"
                    placeholder="Tìm kiếm theo tên danh mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {filteredCategories.map((category) => (
                    <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>{category.name}</td>


                        <td>
                            <img
                                src={`${Constanst.DOMAIN_API}/uploads/${category.images}`}
                                alt="category"
                                width="60"
                                height="60"
                                style={{objectFit: "cover"}}
                            />

                        </td>
                        <td>{category.status === 1 ? "Hiển thị" : "Ẩn"}</td>
                        <td>
                            <Link
                                to={`/admin/category/editcategory/${category.id}`}
                                className="btn btn-warning btn-sm me-2"
                            >
                                Sửa
                            </Link>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(category.id)}
                            >
                                Xóa
                            </button>
                        </td>
                    </tr>
                ))}
                {filteredCategories.length === 0 && (
                    <tr>
                        <td colSpan="4" className="text-center">Không tìm thấy danh mục phù hợp</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryList;
