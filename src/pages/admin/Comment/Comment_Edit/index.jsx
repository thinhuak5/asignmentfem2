import React, {useState} from "react";
import {Link} from "react-router";

const EditComment = ({comment, onSave, onCancel}) => {
    const [status, setStatus] = useState(comment?.status || "Chờ duyệt");

    const handleChange = (e) => {
        setStatus(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({...comment, status});
    };

    return (

        <div className="container">
            <h2>Chỉnh sửa trạng thái bình luận</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Trạng thái</label>
                    <select className="form-control" value={status} onChange={handleChange}>
                        <option value="Đã duyệt">Đã duyệt</option>
                        <option value="Chờ duyệt">Chờ duyệt</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-success me-2">Lưu</button>
                <Link to="/admin/comment">
                    <button className="btn btn-secondary btn-sm">Hủy</button>
                </Link>
            </form>
        </div>
    );
};

export default EditComment;
