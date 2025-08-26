// src/pages/admin/user/UserList.jsx
import React, {useEffect, useMemo, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {FaCheckCircle, FaEdit, FaTimesCircle, FaTrashAlt} from "react-icons/fa";
import adminApi from "../../../api/adminApi";

const roleLabel = (role) => {
    switch (Number(role)) {
        case 0:
            return "Admin";
        case 1:
            return "Nhân viên";
        default:
            return "Khách hàng";
    }
};

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
    const [loading, setLoading] = useState(true);

    // Toast
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    // Modal xóa
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const toast = (msg, type = "success") => {
        setToastType(type);
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Lấy id & role hiện tại từ token để điều khiển UI (ẩn/hiện nút)
    const {myId, myRole} = useMemo(() => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return {myId: null, myRole: null};
            const dec = jwtDecode(token);
            const id = dec?.id ?? dec?.userId ?? null;
            const roleNum = typeof dec?.role === "number" ? dec.role : Number(dec?.role);
            return {myId: id, myRole: roleNum};
        } catch {
            return {myId: null, myRole: null};
        }
    }, []);

    const isSuperAdmin = myRole === 0;

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
            toast("Lỗi tải dữ liệu người dùng", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line
    }, []);

    // Đếm số tài khoản admin (role = 0) — dùng cho rule "Sửa"
    const adminCount = useMemo(
        () => users.reduce((acc, u) => (Number(u.role) === 0 ? acc + 1 : acc), 0),
        [users]
    );

    // Quy tắc hiển thị nút Sửa:
    // - Chỉ Super Admin mới có nút Sửa nói chung
    // - Không cho sửa chính mình
    // - Không sửa tài khoản Admin (an toàn) — và nếu có >=2 admin thì càng không
    const canEditUser = (user) => {
        if (!isSuperAdmin) return false;
        const isTargetAdmin = Number(user.role) === 0;
        const isMe = String(user.id) === String(myId);
        if (isMe) return false;
        if (isTargetAdmin) return false;
        if (adminCount >= 2 && isTargetAdmin) return false;
        return true; // chỉ user không phải admin
    };

    // Quy tắc xoá:
    // - Chỉ Super Admin mới thấy nút xoá
    // - KHÔNG xoá chính mình
    // - KHÔNG xoá bất kỳ tài khoản Admin nào
    const canDeleteUser = (user) => {
        if (!isSuperAdmin) return false;
        const isTargetAdmin = Number(user.role) === 0;
        const isMe = String(user.id) === String(myId);
        if (isMe) return false;
        if (isTargetAdmin) return false;
        return true;
    };

    // Mở modal xóa (giống product)
    const openDeleteModal = (user) => {
        if (!canDeleteUser(user)) {
            const isMe = String(user.id) === String(myId);
            const isTargetAdmin = Number(user.role) === 0;
            toast(
                isMe
                    ? "Không thể xóa chính mình."
                    : isTargetAdmin
                        ? "Không thể xóa tài khoản Admin."
                        : "Bạn không có quyền xóa.",
                "error"
            );
            return;
        }
        setDeleteId(user.id);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setShowModal(false);
        try {
            await adminApi.delete(`/users/${deleteId}`); // DELETE /api/admin/users/:id
            setUsers((prev) => prev.filter((u) => String(u.id) !== String(deleteId)));
            toast("Đã xóa!", "success");
        } catch (err) {
            if (handleAuthError(err)) return;
            console.error("Lỗi khi xóa người dùng:", err);
            console.log(err);
            
            const msg = err?.response?.data?.message || "Giỏ hàng hoặc đơn hàng của người dùng đang chờ xử lý!";
            toast(msg, "error");
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
        <div className="container position-relative">
            {/* Toast (giống product) */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="position-fixed top-0 end-0 p-3"
                style={{zIndex: 1060}}
            >
                {showToast && (
                    <div
                        className={`toast show align-items-center text-white bg-${
                            toastType === "success" ? "success" : "danger"
                        } border-0`}
                        role="alert"
                    >
                        <div className="d-flex align-items-center">
                            {toastType === "success" ? (
                                <FaCheckCircle className="me-2 fs-4"/>
                            ) : (
                                <FaTimesCircle className="me-2 fs-4"/>
                            )}
                            <div className="toast-body">{toastMessage}</div>
                            <button
                                type="button"
                                className="btn-close btn-close-white ms-auto me-2"
                                onClick={() => setShowToast(false)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Danh sách người dùng</h2>

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
                        <th>Chức vụ</th>
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
                        filteredUsers.map((user, index) => {
                            const allowEdit = canEditUser(user);
                            const allowDelete = canDeleteUser(user);
                            const isMe = String(user.id) === String(myId);
                            const isTargetAdmin = Number(user.role) === 0;

                            return (
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
                        {Number(user.status) === 1 ? "Đang hoạt động" : "Không hoạt động"}
                      </span>
                                    </td>
                                    <td>{roleLabel(user.role)}</td>
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
                                        <div className="d-flex">
                                            {/* Nút Sửa giống product (màu xanh + icon) */}
                                            {isSuperAdmin ? (
                                                allowEdit ? (
                                                    <Link
                                                        className="btn btn-success btn-sm me-2"
                                                        to={`/admin/user/edituser/${user.id}`}
                                                        title="Sửa người dùng"
                                                    >
                                                        <FaEdit/> Sửa
                                                    </Link>
                                                ) : (
                                                    <button
                                                        className="btn btn-success btn-sm me-2"
                                                        disabled
                                                        title={
                                                            isMe
                                                                ? "Không thể sửa chính mình."
                                                                : isTargetAdmin
                                                                    ? "Không thể sửa tài khoản Admin."
                                                                    : "Bạn không có quyền sửa."
                                                        }
                                                    >
                                                        <FaEdit/> Sửa
                                                    </button>
                                                )
                                            ) : (
                                                <span className="text-muted me-2">—</span>
                                            )}

                                            {/* Nút Xóa giống product (màu đỏ + modal + toast) */}
                                            {isSuperAdmin ? (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => openDeleteModal(user)}
                                                    disabled={!allowDelete}
                                                    title={
                                                        isMe
                                                            ? "Không thể xóa chính mình."
                                                            : isTargetAdmin
                                                                ? "Không thể xóa tài khoản Admin."
                                                                : "Xóa người dùng"
                                                    }
                                                >
                                                    <FaTrashAlt/> Xóa
                                                </button>
                                            ) : (
                                                <span className="text-muted">—</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            )}

            {/* Modal xóa (giống product) */}
            {showModal && (
                <>
                    <div
                        className="modal fade show"
                        style={{display: "block"}}
                        tabIndex={-1}
                        aria-modal="true"
                        role="dialog"
                    >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Xác nhận xóa</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    <p>Bạn chắc chắn muốn xóa người dùng này?</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </div>
    );
};

export default UserList;
