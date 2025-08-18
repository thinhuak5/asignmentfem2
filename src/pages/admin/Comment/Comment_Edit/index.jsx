// src/pages/admin/comment/EditComment.jsx
import React, {useState} from "react";
import {Link} from "react-router-dom";


const EditComment = ({comment, onSave, onCancel}) => {
    // Nếu comment.status là số, ép thành chuỗi để điều khiển <select>
    const initial = comment?.status ?? 0; // 0: chờ duyệt
    const [status, setStatus] = useState(String(initial));

    const handleChange = (e) => setStatus(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Đẩy số về backend (parseInt)
        onSave?.({...comment, status: parseInt(status, 10)});
    };

    return (
        <div className="container">
            <h2>Chỉnh sửa trạng thái bình luận</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Trạng thái</label>
                    <select
                        className="form-select"
                        value={status}
                        onChange={handleChange}
                    >
                        <option value="1">Đã duyệt</option>
                        <option value="0">Chờ duyệt</option>
                        <option value="2">Từ chối</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-success me-2">
                    Lưu
                </button>

                {onCancel ? (
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Hủy
                    </button>
                ) : (
                    <Link to="/admin/comment" className="btn btn-secondary">
                        Hủy
                    </Link>
                )}
            </form>
        </div>
    );
};

export default EditComment;
