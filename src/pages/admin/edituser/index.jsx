// src/pages/admin/user/EditUser.jsx
import React, {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Button, Card, Form} from "react-bootstrap";
import {jwtDecode} from "jwt-decode";
import adminApi from "../../../api/adminApi";

const roleLabel = (r) => {
    switch (Number(r)) {
        case 0:
            return "Admin";
        case 1:
            return "Nhân viên";
        default:
            return "Khách hàng";
    }
};

const EditUser = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [errMsg, setErrMsg] = useState("");

    // Lấy info người đăng nhập hiện tại
    const me = useMemo(() => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return null;
            return jwtDecode(token);
        } catch {
            return null;
        }
    }, []);

    const isAdmin = Number(me?.role) === 0;
    const isSelf = String(me?.id) === String(id);

    useEffect(() => {
        const fetchUser = async () => {
            setErrMsg("");
            try {
                const res = await adminApi.get(`/users/${id}`); // GET /api/admin/users/:id
                const data = res.data?.data || res.data;
                setUser(data);
            } catch (err) {
                const http = err?.response?.status;
                if (http === 401 || http === 403) {
                    navigate("/admin-login", {replace: true});
                    return;
                }
                setErrMsg(err?.response?.data?.message || err.message || "Không tìm thấy người dùng");
                navigate("/admin/user");
            }
        };
        fetchUser();
    }, [id, navigate]);

    const handleSave = async () => {
        if (!user) return;
        if (!isAdmin) {
            alert("Bạn không có quyền sửa. Chỉ Admin mới được phép.");
            return;
        }
        if (isSelf) {
            alert("Admin không được phép sửa chính mình trong khu vực quản trị.");
            return;
        }

        setSaving(true);
        try {
            // Chỉ cho phép status (0/1) và role (1/2)
            const payload = {
                status: Number(user.status) === 1 ? 1 : 0,
                role: [1, 2].includes(Number(user.role)) ? Number(user.role) : 2,
            };
            await adminApi.put(`/users/${id}`, payload); // PUT /api/admin/users/:id
            alert("Cập nhật người dùng thành công");
            navigate("/admin/user");
        } catch (err) {
            const http = err?.response?.status;
            if (http === 401 || http === 403) {
                alert(err?.response?.data?.message || "Bạn không có quyền thực hiện thao tác này.");
                navigate("/admin-login", {replace: true});
                return;
            }
            alert(err?.response?.data?.message || err.message || "Lỗi khi cập nhật người dùng");
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <p className="m-3">Đang tải...</p>;

    return (
        <div className="container">
            <Card className="mt-3">
                <Card.Body>
                    <Card.Title className="d-flex align-items-center">
                        <span>Chỉnh sửa người dùng: {user.name}</span>
                        {user.avatar && (
                            <img
                                src={user.avatar}
                                alt="avatar"
                                width="36"
                                height="36"
                                style={{objectFit: "cover", borderRadius: "50%", marginLeft: 8}}
                                onError={(e) => {
                                    e.currentTarget.src = "/no-avatar.png";
                                }}
                            />
                        )}
                    </Card.Title>

                    {errMsg && <div className="alert alert-danger">{errMsg}</div>}

                    <Form onSubmit={(e) => e.preventDefault()}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control value={user.email} disabled/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                value={String(user.status ?? 1)}
                                onChange={(e) => setUser({...user, status: e.target.value})}
                                disabled={!isAdmin || isSelf}
                            >
                                <option value="1">Đang hoạt động</option>
                                <option value="0">Không hoạt động (Khóa)</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Chức vụ</Form.Label>
                            <Form.Select
                                value={String(user.role ?? 2)}
                                onChange={(e) => setUser({...user, role: e.target.value})}
                                disabled={!isAdmin || isSelf}
                            >
                                {/* Chỉ cho phép 1/2; không có 0 trong select */}
                                <option value="1">Nhân viên</option>
                                <option value="2">Khách hàng</option>
                            </Form.Select>
                            <Form.Text className="text-muted">
                                Hiện tại: <strong>{roleLabel(user.role)}</strong>
                            </Form.Text>
                        </Form.Group>

                        <Button variant="primary" onClick={handleSave} disabled={saving || !isAdmin || isSelf}>
                            {saving ? "Đang lưu..." : "Lưu"}
                        </Button>
                        <Button className="ms-2" variant="secondary" onClick={() => navigate("/admin/user")}
                                disabled={saving}>
                            Hủy
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default EditUser;
