import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import Constanst from "../../../Constanst";

const AddCategoryParent = () => {
    const navigate = useNavigate();
    const [categoryParent, setCategoryParent] = useState({
        name: "",
        status: "Hiển thị",
        image: null,
    });
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const {name, value} = e.target;
        setCategoryParent({...categoryParent, [name]: value});
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setCategoryParent({...categoryParent, image: e.target.files[0]});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!categoryParent.name) {
            setErrorMessage("Tên danh mục cha không được để trống.");
            return;
        }

        const formData = new FormData();
        formData.append("name", categoryParent.name);
        formData.append("status", categoryParent.status === "Hiển thị" ? 1 : 0);
        if (categoryParent.image) {
            formData.append("image", categoryParent.image);
        }

        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/categoryparents/add`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Thêm thất bại");
            }

            alert("Thêm danh mục cha thành công!");
            navigate("/admin/categoryparent");
        } catch (err) {
            console.error("Lỗi:", err.message);
            setErrorMessage("Lỗi khi thêm danh mục cha: " + err.message);
        }
    };

    return (
        <div className="container">
            <h2>Thêm danh mục cha</h2>
            <form onSubmit={handleSubmit} className="border p-4 bg-light rounded">
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

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
                    <label className="form-label">Ảnh</label>
                    <input
                        type="file"
                        className="form-control"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
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

                <button type="submit" className="btn btn-success me-2">
                    Thêm danh mục cha
                </button>
                <Link to="/admin/categoryparent" className="btn btn-secondary">
                    Quay lại
                </Link>
            </form>
        </div>
    );
};

export default AddCategoryParent;
