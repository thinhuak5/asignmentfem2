import React, { useState, useEffect } from "react";
import { Table, Button, Form, Spinner, Alert } from "react-bootstrap"; // Import Spinner và Alert
import Constanst from "../../../Constanst";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [updatedPaymentStatus, setUpdatedPaymentStatus] = useState({});
    const [updatedOrderStatus, setUpdatedOrderStatus] = useState({});
    const [cancelReasonAdmin, setCancelReasonAdmin] = useState(''); // Thêm state để lưu lý do hủy từ admin

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            // Lấy token nếu có, để xác thực ở backend (nếu cần)
            // const token = localStorage.getItem('adminAuthToken'); // Giả sử admin có token riêng
            const headers = {
                'Content-Type': 'application/json',
            };
            // if (token) {
            //     headers['Authorization'] = `Bearer ${token}`;
            // }

            const response = await fetch(`${Constanst.DOMAIN_API}/api/oders`, { headers }); // Đổi lại thành 'orders' nếu API đã đổi
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi ${response.status}: Không thể lấy dữ liệu đơn hàng`);
            }
            const data = await response.json();
            // Sắp xếp đơn hàng theo ngày tạo mới nhất lên đầu (tùy chọn)
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(data);
        } catch (err) {
            console.error("Lỗi fetch đơn hàng:", err);
            setError(err.message || "Lỗi khi lấy dữ liệu đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleEdit = (id) => {
        setEditingOrderId(id);
        const orderToEdit = orders.find(order => order.id === id);
        if (orderToEdit) {
            setUpdatedPaymentStatus({ [id]: orderToEdit.payment_status });
            setUpdatedOrderStatus({ [id]: orderToEdit.status });
            // Nếu đơn hàng đang ở trạng thái hủy, lấy lý do hủy
            if (orderToEdit.status === 0) {
                setCancelReasonAdmin(orderToEdit.cancellation_reason || '');
            } else {
                setCancelReasonAdmin('');
            }
        }
    };

    const handlePaymentStatusChange = (id, value) => {
        setUpdatedPaymentStatus({ ...updatedPaymentStatus, [id]: parseInt(value) });
    };

    const handleOrderStatusChange = (id, value) => {
        const newStatus = parseInt(value);
        setUpdatedOrderStatus({ ...updatedOrderStatus, [id]: newStatus });
        // Nếu chuyển sang trạng thái hủy, cần reset hoặc hỏi lý do
        if (newStatus === 0) { // Nếu chuyển sang trạng thái hủy
            // Bạn có thể mở một modal yêu cầu lý do hủy tại đây cho admin
            // Hiện tại, chúng ta sẽ để một trường input/textarea để admin nhập
            setCancelReasonAdmin(''); // Reset lý do khi chọn Hủy
        } else {
            setCancelReasonAdmin(''); // Xóa lý do nếu không phải hủy
        }
    };

    const handleSave = async (id) => {
        const payment_status = updatedPaymentStatus[id];
        const status = updatedOrderStatus[id];
        let reasonForCancellation = null;

        if (status === 0) { // Nếu admin đổi trạng thái thành "Đã hủy"
            if (!cancelReasonAdmin.trim()) {
                alert("Vui lòng nhập lý do hủy đơn hàng.");
                return;
            }
            reasonForCancellation = cancelReasonAdmin.trim();
        }

        try {
            // Lấy token nếu có, để xác thực ở backend (nếu cần)
            // const token = localStorage.getItem('adminAuthToken');
            const headers = {
                'Content-Type': 'application/json',
            };
            // if (token) {
            //     headers['Authorization'] = `Bearer ${token}`;
            // }

            const response = await fetch(`${Constanst.DOMAIN_API}/api/oders/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({ payment_status, status, cancellation_reason: reasonForCancellation }), // Gửi lý do hủy
            });

            if (response.ok) {
                alert(`Đơn hàng ID ${id} đã được cập nhật.`);
                setEditingOrderId(null);
                setCancelReasonAdmin(''); // Reset lý do sau khi lưu
                fetchOrders();
            } else {
                const errorData = await response.json();
                setError(`Lỗi khi cập nhật đơn hàng ID ${id}: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error("Lỗi cập nhật đơn hàng:", error);
            setError(`Lỗi mạng khi cập nhật đơn hàng ID ${id}.`);
        }
    };

    const handleCancelEdit = () => {
        setEditingOrderId(null);
        setCancelReasonAdmin(''); // Reset lý do khi hủy chỉnh sửa
    };

    return (
        <div className="container mt-5">
            <h2>Danh sách đơn hàng</h2>
            {loading && (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </Spinner>
                    <p>Đang tải dữ liệu đơn hàng...</p>
                </div>
            )}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && (
                <Table striped bordered hover responsive className="text-center">
                    <thead className="table-dark">
                    <tr>
                        <th>STT</th>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Điện thoại</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái thanh toán</th>
                        <th>Trạng thái đơn hàng</th>
                        <th>Lý do hủy</th> {/* Thêm cột lý do hủy */}
                        <th>ID Người dùng</th>
                        <th>Địa chỉ</th>
                        <th>Ngày tạo</th>
                        <th>Ngày cập nhật</th>
                        <th>Hành Động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan="13">Không có đơn hàng nào</td>
                        </tr>
                    ) : (
                        orders.map((order, index) => (
                            <tr key={order.id}>
                                <td>{index + 1}</td>
                                <td>{order.id}</td>
                                <td>{order.name}</td>
                                <td>{order.phone}</td>
                                <td>
                                    {order.payments === 1 ? "COD" :
                                        order.payments === 2 ? "Chuyển khoản" : "Không xác định"}
                                </td>
                                <td>
                                    {editingOrderId === order.id ? (
                                        <Form.Control
                                            as="select"
                                            value={updatedPaymentStatus[order.id]}
                                            onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                        >
                                            <option value={0}>Chưa thanh toán</option>
                                            <option value={1}>Đã thanh toán</option>
                                        </Form.Control>
                                    ) : (
                                        order.payment_status === 1 ? "Đã thanh toán" : "Chưa thanh toán"
                                    )}
                                </td>
                                <td>
                                    {editingOrderId === order.id ? (
                                        <Form.Control
                                            as="select"
                                            value={updatedOrderStatus[order.id]}
                                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                        >
                                            <option value={1}>Chờ xác nhận</option>
                                            <option value={2}>Đã xác nhận</option>
                                            <option value={3}>Đang giao hàng</option>
                                            <option value={4}>Đã giao</option>
                                            <option value={0}>Đã hủy</option> {/* Đặt cuối cùng cho dễ nhìn */}
                                        </Form.Control>
                                    ) : (
                                        {
                                            1: "Chờ xác nhận",
                                            2: "Đã xác nhận",
                                            3: "Đang giao hàng",
                                            4: "Đã giao",
                                            0: "Đã hủy",
                                        }[order.status] || "Không xác định"
                                    )}
                                </td>
                                <td>
                                    {order.status === 0 ? ( // Chỉ hiển thị lý do nếu trạng thái là "Đã hủy"
                                        editingOrderId === order.id && updatedOrderStatus[order.id] === 0 ? (
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                value={cancelReasonAdmin}
                                                onChange={(e) => setCancelReasonAdmin(e.target.value)}
                                                placeholder="Lý do hủy..."
                                            />
                                        ) : (
                                            order.cancellation_reason || "Không có lý do"
                                        )
                                    ) : (
                                        "-" // Hiển thị dấu gạch ngang nếu không phải đơn hủy
                                    )}
                                </td>
                                <td>{order.user_id}</td>
                                <td>{order.address}</td>
                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                <td>{new Date(order.updatedAt).toLocaleString()}</td>
                                <td>
                                    {editingOrderId === order.id ? (
                                        <>
                                            <Button variant="success" size="sm" onClick={() => handleSave(order.id)}>Lưu</Button>
                                            <Button variant="secondary" size="sm" className="ms-2" onClick={handleCancelEdit}>Hủy</Button>
                                        </>
                                    ) : (
                                        <Button variant="warning" size="sm" onClick={() => handleEdit(order.id)}>Sửa</Button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </Table>
            )}
        </div>
    );
};
export default OrderList;