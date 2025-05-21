import React, {useState} from "react";
import {Link, useNavigate} from "react-router"; // Đổi thành "react-router-dom"
import Constanst from "../../../Constanst";

const AddCategory = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState({
        name: "",
        status: "Hiển thị",
    });
    const [errorMessage, setErrorMessage] = useState("");  // Thêm trạng thái cho lỗi

    const handleChange = (e) => {
        const {name, value} = e.target;
        setCategory({...category, [name]: value});
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
        <div className="container mt-5">
            <h2>Thêm danh mục</h2>
            <form onSubmit={handleSubmit} className="border p-4 bg-light rounded">
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>} {/* Hiển thị lỗi nếu có */}
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
                        name="image"
                        accept="image/*"
                        onChange={(e) => setCategory({...category, image: e.target.files[0]})}
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
