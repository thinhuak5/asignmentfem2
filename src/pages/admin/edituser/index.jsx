import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from 'react-router';
import Constanst from "../../../Constanst";
import {Button, Card, Form} from 'react-bootstrap';

const EditUser = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${id}`);
                const data = await res.json();
                setUser(data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu người dùng:", error);
                alert("Không tìm thấy người dùng");
                navigate("/admin/user");
            }
        };

        fetchUser();
    }, [id, navigate]);

    const handleUpdateUser = async () => {
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    status: parseInt(user.status),
                    role: parseInt(user.role), // Send the updated role
                }),
            });

            if (!res.ok) throw new Error('Cập nhật thất bại');

            alert("Cập nhật thành công");
            navigate("/admin/user");
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            alert("Lỗi khi cập nhật người dùng");
        }
    };

    if (!user) return <p>Đang tải...</p>;

    return (
        <div className="container">
            <Card>
                <Card.Body>
                    <Card.Title>Chỉnh sửa người dùng: {user.name}</Card.Title>
                    <Form>
                        <Form.Group>
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                value={user.status}
                                onChange={(e) => setUser({...user, status: e.target.value})}
                            >
                                <option value={1}>Đang hoạt động</option>
                                <option value={0}>Khóa</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mt-3">
                            <Form.Label>Vai trò</Form.Label>
                            <Form.Select
                                value={user.role}
                                onChange={(e) => setUser({...user, role: e.target.value})}
                            >

                                <option value={1}>Nhân viên</option>
                                <option value={2}>Người dùng</option>
                            </Form.Select>
                        </Form.Group>

                        <Button className="mt-3" variant="primary" onClick={handleUpdateUser}>
                            Lưu
                        </Button>
                        <Button className="mt-3 ms-2" variant="secondary" onClick={() => navigate("/admin/user")}>
                            Hủy
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default EditUser;
