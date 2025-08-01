import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import Constanst from "../../../Constanst";

const AddCategory = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState({
        name: "",
        status: "Hiển thị",
        parent_id: "",
    });
    const [categoryParents, setCategoryParents] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Lấy danh mục cha (parent_id === null)
        const fetchCategoryParents = async () => {
            try {
                const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/parents`);
                const data = await res.json();
                if (Array.isArray(data)) setCategoryParents(data);
            } catch (error) {
                console.error("Lỗi khi load category parents:", error);
            }
        };
        fetchCategoryParents();
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setCategory({...category, [name]: value});
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setCategory({...category, image: e.target.files[0]});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!category.name) {
            setErrorMessage("Tên danh mục không được để trống.");
            return;
        }

        const formData = new FormData();
        formData.append("name", category.name);
        formData.append("status", category.status === "Hiển thị" ? 1 : 0);
        if (category.image) {
            formData.append("images", category.image);
        }
        if (category.parent_id) {
            formData.append("parent_id", category.parent_id);
        }

        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/categories/add`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Thêm thất bại");
            }

            alert("Thêm danh mục thành công!");
            navigate("/admin/category");
        } catch (err) {
            console.error("Lỗi:", err.message);
            setErrorMessage("Lỗi khi thêm danh mục: " + err.message);
        }
    };

    return (
        <div className="container">
            <h2>Thêm danh mục</h2>
            <form onSubmit={handleSubmit} className="border p-4 bg-light rounded">
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
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
                    <label className="form-label">Ảnh</label>
                    <input
                        type="file"
                        className="form-control"
                        name="images"
                        accept="image/*"
                        onChange={handleImageChange}
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

                {/* DANH MỤC CHA */}
                <div className="mb-3">
                    <label className="form-label">Danh mục cha</label>
                    <select
                        className="form-select"
                        name="parent_id"
                        value={category.parent_id}
                        onChange={handleChange}
                    >
                        <option value="">-- Chọn danh mục cha --</option>
                        {categoryParents.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-success me-2">
                    Thêm danh mục
                </button>
                <Link to="/admin/category" className="btn btn-secondary">
                    Quay lại
                </Link>
            </form>
        </div>
    );
};

export default AddCategory;
