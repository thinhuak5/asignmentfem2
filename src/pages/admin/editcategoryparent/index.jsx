import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import Constanst from "../../../Constanst";

const EditCategoryParent = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [categoryParent, setCategoryParent] = useState({
        name: "",
        status: "Hiển thị",
        image: null,
    });
    const [newImage, setNewImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${Constanst.DOMAIN_API}/api/categoryparents/${id}`);
                if (!res.ok) throw new Error("Không tìm thấy danh mục cha");
                const data = await res.json();

                setCategoryParent({
                    name: data.name,
                    status: data.status === 1 ? "Hiển thị" : "Ẩn",
                    image: data.image || null,
                });
            } catch (err) {
                console.error(err);
                alert("Lỗi khi tải dữ liệu danh mục cha");
                navigate("/admin/categoryparent");
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setCategoryParent({...categoryParent, [name]: value});
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", categoryParent.name);
        formData.append("status", categoryParent.status === "Hiển thị" ? 1 : 0);
        formData.append("old_image", categoryParent.image || "");
        if (newImage) formData.append("image", newImage);

        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/categoryparents/${id}`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Cập nhật thất bại");
            }

            alert("Cập nhật danh mục cha thành công!");
            navigate("/admin/categoryparent");
        } catch (err) {
            console.error(err.message);
            alert("Lỗi khi cập nhật danh mục cha: " + err.message);
        }
    };

    return (
        <div className="container">
            <h2>Sửa danh mục cha</h2>
            <form onSubmit={handleSubmit} className="border p-4 bg-light rounded" encType="multipart/form-data">
                <div className="mb-3">
                    <label className="form-label">Tên danh mục cha</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={categoryParent.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Trạng thái</label>
                    <select
                        className="form-select"
                        name="status"
                        value={categoryParent.status}
                        onChange={handleChange}
                    >
                        <option value="Hiển thị">Hiển thị</option>
                        <option value="Ẩn">Ẩn</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Ảnh hiện tại</label>
                    <div>
                        {categoryParent.image ? (
                            <img
                                src={`${Constanst.DOMAIN_API}/uploads/${categoryParent.image}`}
                                alt="Ảnh danh mục cha"
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
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                <button type="submit" className="btn btn-success me-2">
                    Cập nhật danh mục cha
                </button>
                <Link to="/admin/categoryparent" className="btn btn-secondary">
                    Quay lại
                </Link>
            </form>
        </div>
    );
};

export default EditCategoryParent;
