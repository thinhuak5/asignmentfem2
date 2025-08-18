// src/pages/admin/user/UserList.jsx
import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
// ⚠️ Cập nhật path cho đúng cấu trúc dự án
import adminApi from "../../../api/adminApi";

const roleLabel = (role) => {
    if (role === 0) return "Super Admin";
    if (role === 1) return "Admin";
    return "User";
};

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
    const [loading, setLoading] = useState(true);

    const handleAuthError = (err) => {
        const code = err?.response?.status;
        if (code === 401 || code === 403) {
            navigate("/admin-login", {replace: true});
            return true;
        }
        return false;
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Admin list: GET /api/admin/users/list
            const res = await adminApi.get("/users/list");
            const data = res.data?.data || res.data || [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            if (handleAuthError(err)) return;
            console.error("Lỗi khi tải người dùng:", err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
        try {
            // Admin delete: DELETE /api/admin/users/:id
            await adminApi.delete(`/users/${id}`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
            alert("Người dùng đã được xóa!");
        } catch (err) {
            if (handleAuthError(err)) return;
            console.error("Lỗi khi xóa người dùng:", err);
            alert(err?.response?.data?.message || "Có lỗi xảy ra khi xóa người dùng.");
        }
    };

    const filteredUsers = users.filter((user) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
            !q ||
            user.name?.toLowerCase().includes(q) ||
            user.username?.toLowerCase().includes(q) ||
            user.email?.toLowerCase().includes(q) ||
            user.phone?.toLowerCase().includes(q);

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && Number(user.status) === 1) ||
            (statusFilter === "inactive" && Number(user.status) !== 1);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Danh sách người dùng</h2>
                <Link className="btn btn-success" to="/admin/user/adduser">
                    Thêm người dùng
                </Link>
            </div>

            <div className="mb-4 d-flex gap-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo tên, username, email hoặc số điện thoại..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    className="form-select rounded"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{maxWidth: "200px"}}
                >
                    <option value="all">Tất cả</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                </select>
            </div>

            {loading ? (
                <div className="py-5 text-center">Đang tải...</div>
            ) : (
                <table className="table table-bordered table-hover text-center">
                    <thead className="table-dark">
                    <tr>
                        <th>STT</th>
                        <th>Tên</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Trạng thái</th>
                        <th>Role</th>
                        <th>Avatar</th>
                        <th>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.length === 0 ? (
                        <tr>
                            <td colSpan="9">Không có người dùng nào</td>
                        </tr>
                    ) : (
                        filteredUsers.map((user, index) => (
                            <tr key={user.id}>
                                <td>{index + 1}</td>
                                <td>{user.name}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>
                    <span
                        className={`badge ${
                            Number(user.status) === 1 ? "bg-success" : "bg-danger"
                        }`}
                    >
                      {Number(user.status) === 1
                          ? "Đang hoạt động"
                          : "Không hoạt động"}
                    </span>
                                </td>
                                <td>{roleLabel(Number(user.role))}</td>
                                <td>
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Avatar"
                                            width="60"
                                            height="60"
                                            style={{objectFit: "cover", borderRadius: "5px"}}
                                            onError={(e) => {
                                                e.currentTarget.src = "/no-avatar.png";
                                            }}
                                        />
                                    ) : (
                                        "Không có"
                                    )}
                                </td>
                                <td>
                                    <Link
                                        className="btn btn-warning btn-sm me-2"
                                        to={`/admin/user/edituser/${user.id}`}
                                    >
                                        Sửa
                                    </Link>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserList;
