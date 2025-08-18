// src/pages/admin/user/EditUser.jsx
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom"; // ✅ đúng package
import {Button, Card, Form} from "react-bootstrap";
// ⚠️ chỉnh path cho đúng dự án của bạn
import adminApi from "../../../api/adminApi";

const EditUser = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [errMsg, setErrMsg] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            setErrMsg("");
            try {
                // GET /api/admin/users/:id
                const res = await adminApi.get(`/users/${id}`);
                const data = res.data?.data || res.data;
                setUser(data);
            } catch (err) {
                const http = err?.response?.status;
                if (http === 401 || http === 403) {
                    navigate("/admin-login", {replace: true});
                    return;
                }
                setErrMsg(err?.response?.data?.message || err.message || "Không tìm thấy người dùng");
                // quay về danh sách nếu cần:
                navigate("/admin/user");
            }
        };
        fetchUser();
    }, [id, navigate]);

    const handleStatusChange = async () => {
        if (!user) return;
        setSaving(true);
        try {
            // PUT /api/admin/users/:id
            await adminApi.put(`/users/${id}`, {
                status: Number(user.status), // ép số
            });
            alert("Cập nhật trạng thái thành công");
            navigate("/admin/user");
        } catch (err) {
            const http = err?.response?.status;
            if (http === 401 || http === 403) {
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
                    <Card.Title>
                        Chỉnh sửa trạng thái người dùng: {user.name}{" "}
                        {user.avatar && (
                            <img
                                src={user.avatar}
                                alt="avatar"
                                width="36"
                                height="36"
                                style={{
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                    marginLeft: 8,
                                    verticalAlign: "middle"
                                }}
                            />
                        )}
                    </Card.Title>

                    {errMsg && <div className="alert alert-danger">{errMsg}</div>}

                    <Form onSubmit={(e) => e.preventDefault()}>
                        <Form.Group className="mb-3">
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                value={String(user.status ?? 1)}
                                onChange={(e) => setUser({...user, status: e.target.value})}
                            >
                                <option value="1">Đang hoạt động</option>
                                <option value="0">Không hoạt động</option>
                            </Form.Select>
                        </Form.Group>

                        <Button variant="primary" onClick={handleStatusChange} disabled={saving}>
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
