import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import Constanst from "../../../Constanst";

const CategoryParentList = () => {
    const [categoryParents, setCategoryParents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetch(`${Constanst.DOMAIN_API}/api/categoryparents`)
            .then((res) => res.json())
            .then((data) => setCategoryParents(data))
            .catch((err) => console.error(err));
    }, []);

    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
            fetch(`${Constanst.DOMAIN_API}/api/categoryparents/${id}`, {
                method: "DELETE",
            })
                .then((res) => {
                    if (res.ok) {
                        setCategoryParents(categoryParents.filter((item) => item.id !== id));
                        alert("Xóa danh mục thành công");
                    } else {
                        alert("Xóa thất bại");
                    }
                })
                .catch((err) => {
                    console.error(err);
                    alert("Lỗi server khi xóa danh mục");
                });
        }
    };

    const filteredCategoryParents = categoryParents.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mt-5">
            <h2>Danh sách danh mục cha</h2>

            {/* Thanh công cụ: tìm kiếm + thêm mới */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                    type="text"
                    className="form-control w-50"
                    placeholder="Tìm kiếm danh mục cha..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Link to="/admin/categoryparent/add" className="btn btn-primary ms-3">
                    Thêm danh mục
                </Link>
            </div>

            {/* Bảng danh sách */}
            <table className="table table-bordered">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Tên danh mục cha</th>
                    <th>Ảnh</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {filteredCategoryParents.length > 0 ? (
                    filteredCategoryParents.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.name}</td>
                            <td>
                                {item.image ? (
                                    <img
                                        src={`${Constanst.DOMAIN_API}/uploads/${item.image}`}
                                        alt={item.name}
                                        width="60"
                                        height="60"
                                        style={{objectFit: "cover"}}
                                    />
                                ) : (
                                    "Chưa có ảnh"
                                )}
                            </td>
                            <td>{item.status === 1 ? "Hiển thị" : "Ẩn"}</td>
                            <td>
                                <Link
                                    to={`/admin/categoryparent/edit/${item.id}`}
                                    className="btn btn-warning btn-sm me-2"
                                >
                                    Sửa
                                </Link>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="text-center">
                            Không tìm thấy danh mục phù hợp
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryParentList;
