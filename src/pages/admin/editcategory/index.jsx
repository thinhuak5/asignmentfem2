import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import Constanst from "../../../Constanst";

const EditCategory = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState({
        name: "",
        status: "Hiển thị",
        images: null,
        parent_id: "", // ✅ Thêm parent_id
    });
    const [newImage, setNewImage] = useState(null);
    const [categoryParents, setCategoryParents] = useState([]); // ✅ Danh sách danh mục cha

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy chi tiết danh mục cần sửa
                const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/${id}`);
                const data = await res.json();

                if (!res.ok) throw new Error("Không tìm thấy danh mục");

                setCategory({
                    name: data.name,
                    status: data.status === 1 ? "Hiển thị" : "Ẩn",
                    images: data.images || null,
                    parent_id: data.parent_id || "", // ✅ Gán parent_id nếu có
                });

                // Lấy danh sách danh mục cha
                const resParents = await fetch(`${Constanst.DOMAIN_API}/api/categoryparents`);
                const parentData = await resParents.json();
                if (Array.isArray(parentData)) {
                    setCategoryParents(parentData);
                }
            } catch (err) {
                console.error(err);
                alert("Lỗi khi tải dữ liệu danh mục");
                navigate("/admin/category");
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setCategory({...category, [name]: value});
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const status = category.status === "Hiển thị" ? 1 : 0;

        const formData = new FormData();
        formData.append("name", category.name);
        formData.append("status", status);
        formData.append("old_image", category.images || "");
        if (newImage) formData.append("images", newImage);
        if (category.parent_id) formData.append("parent_id", category.parent_id); // ✅ Thêm parent_id

        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/${id}`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Cập nhật thất bại");
            }

            alert("Cập nhật danh mục thành công!");
            navigate("/admin/category");
        } catch (err) {
            console.error(err.message);
            alert("Lỗi khi cập nhật danh mục: " + err.message);
        }
    };

    return (
        <div className="container">
            <h2>Sửa danh mục</h2>
            <form onSubmit={handleSubmit} className="border p-4 bg-light rounded" encType="multipart/form-data">
                <div className="mb-3">
                    <label className="form-label">Tên danh mục</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={category.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Trạng thái</label>
                    <select
                        className="form-select"
                        name="status"
                        value={category.status}
                        onChange={handleChange}
                    >
                        <option value="Hiển thị">Hiển thị</option>
                        <option value="Ẩn">Ẩn</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Danh mục cha</label>
                    <select
                        className="form-select"
                        name="parent_id"
                        value={category.parent_id}
                        onChange={handleChange}
                    >
                        <option value="">-- Chọn danh mục cha --</option>
                        {categoryParents.map((parent) => (
                            <option key={parent.id} value={parent.id}>
                                {parent.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Ảnh hiện tại</label>
                    <div>
                        {category.images ? (
                            <img
                                src={`${Constanst.DOMAIN_API}/uploads/${category.images}`}
                                alt="Ảnh danh mục"
                                width="100"
                                height="100"
                                style={{objectFit: "cover"}}
                            />
                        ) : (
                            <span>Chưa có ảnh</span>
                        )}
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Chọn ảnh mới (nếu muốn thay đổi)</label>
                    <input
                        type="file"
                        className="form-control"
                        name="images"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>

                <button type="submit" className="btn btn-success me-2">
                    Cập nhật danh mục
                </button>
                <Link to="/admin/category" className="btn btn-secondary">
                    Quay lại
                </Link>
            </form>
        </div>
    );
};

export default EditCategory;
