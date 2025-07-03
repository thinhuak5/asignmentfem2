import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import Constanst from "../../../Constanst";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${Constanst.DOMAIN_API}/api/users/list`);
                if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu người dùng");
                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error("Lỗi khi tải người dùng:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            try {
                const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${id}`, {
                    method: "DELETE",
                });

                if (!res.ok) throw new Error("Không thể xóa người dùng");

                setUsers(users.filter((user) => user.id !== id));
                alert("Người dùng đã được xóa!");
            } catch (error) {
                console.error("Lỗi khi xóa người dùng:", error);
                alert("Có lỗi xảy ra khi xóa người dùng.");
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const q = searchQuery.toLowerCase();

        const matchesSearch =
            user.name.toLowerCase().includes(q) ||
            user.username.toLowerCase().includes(q) ||
            user.email.toLowerCase().includes(q) ||
            (user.phone && user.phone.toLowerCase().includes(q));

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && user.status === 1) ||
            (statusFilter === "inactive" && user.status !== 1);

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
                    className="form-select rounded" // thêm rounded vào đây
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{maxWidth: "200px"}}
                >
                    <option value="all">Tất cả</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                </select>
            </div>

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
                                        user.status === 1 ? "bg-success" : "bg-danger"
                                    }`}
                                >
                                    {user.status === 1 ? "Đang hoạt động" : "Không hoạt động"}
                                </span>
                            </td>
                            <td>{user.role === 1 ? "Admin" : "User"}</td>
                            <td>
                                {user.avatar ? (
                                    <img
                                        src={`${Constanst.DOMAIN_API}/uploads/${user.avatar}`} // phải có /uploads/
                                        alt="Avatar"
                                        width="60"
                                        height="60"
                                        style={{objectFit: "cover", borderRadius: "5px"}}
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
        </div>
    );
};

export default UserList;
