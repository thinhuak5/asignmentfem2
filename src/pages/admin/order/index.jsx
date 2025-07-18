import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Spinner, Table } from "react-bootstrap";
import Constanst from "../../../Constanst";
import "../../../assets/css/OrderList.css";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [updatedPaymentStatus, setUpdatedPaymentStatus] = useState({});
  const [updatedOrderStatus, setUpdatedOrderStatus] = useState({});
  const [cancelReasonAdmin, setCancelReasonAdmin] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15;
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const response = await fetch(`${Constanst.DOMAIN_API}/api/oders`, {
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Lỗi ${response.status}: Không thể lấy dữ liệu đơn hàng`
        );
      }
      const data = await response.json();
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
    const orderToEdit = orders.find((order) => order.id === id);
    if (orderToEdit) {
      setUpdatedPaymentStatus((prev) => ({
        ...prev,
        [id]: orderToEdit.payment_status ?? 0,
      }));
      setUpdatedOrderStatus({ [id]: orderToEdit.status });
      if (orderToEdit.status === 0) {
        setCancelReasonAdmin(orderToEdit.cancellation_reason || "");
      } else {
        setCancelReasonAdmin("");
      }
    }
  };

  const handlePaymentStatusChange = (id, value) => {
    setUpdatedPaymentStatus({ ...updatedPaymentStatus, [id]: parseInt(value) });
  };

  const handleOrderStatusChange = (id, value) => {
    const newStatus = parseInt(value);
    setUpdatedOrderStatus({ ...updatedOrderStatus, [id]: newStatus });
    if (newStatus === 0) {
      setCancelReasonAdmin("");
    } else {
      setCancelReasonAdmin("");
    }
  };

  const handleSave = async (id) => {
    const payment_status = updatedPaymentStatus[id];
    const status = updatedOrderStatus[id];
    let reasonForCancellation = null;

    if (status === 0 && !cancelReasonAdmin.trim()) {
      alert("Vui lòng nhập lý do hủy đơn hàng.");
      return;
    }

    reasonForCancellation = cancelReasonAdmin.trim();

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const response = await fetch(`${Constanst.DOMAIN_API}/api/oders/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          payment_status,
          status,
          cancellation_reason: reasonForCancellation,
        }),
      });

      if (response.ok) {
        alert(`Đơn hàng ID ${id} đã được cập nhật.`);
        setEditingOrderId(null);
        setCancelReasonAdmin("");
        fetchOrders();
      } else {
        const errorData = await response.json();
        setError(
          `Lỗi khi cập nhật đơn hàng ID ${id}: ${
            errorData.message || response.statusText
          }`
        );
      }
    } catch (error) {
      console.error("Lỗi cập nhật đơn hàng:", error);
      setError(`Lỗi mạng khi cập nhật đơn hàng ID ${id}.`);
    }
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
    setCancelReasonAdmin("");
  };

  return (
    <div className="container">
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
        <>
          <Table striped bordered hover responsive className="text-center">
            <thead className="table-dark">
              <tr>
                <th>STT</th>
                <th>Tên</th>
                <th>Điện thoại</th>
                <th>Thanh toán</th>
                <th>Trạng thái thanh toán</th>
                <th>Trạng thái đơn hàng</th>
                <th>Lý do hủy</th>
                <th>Địa chỉ</th>
                <th>Ngày tạo</th>
                <th>Ngày cập nhật</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="11">Không có đơn hàng nào</td>
                </tr>
              ) : (
                currentOrders.map((order, index) => (
                  <tr key={order.id}>
                    <td>{indexOfFirstOrder + index + 1}</td>
                    <td>{order.name}</td>
                    <td>{order.phone}</td>
                    <td>
                      {order.payment_id === 1
                        ? "COD"
                        : order.payment_id === 2
                        ? "Chuyển khoản"
                        : "Không xác định"}
                    </td>
                    <td>
                      {editingOrderId === order.id ? (
                        order.payment_id === 2 ? (
                          <Form.Control as="select" disabled value={1}>
                            <option value={1}>Đã thanh toán</option>
                          </Form.Control>
                        ) : (
                          <Form.Control
                            as="select"
                            value={
                              updatedPaymentStatus[order.id] ??
                              order.payment_status
                            }
                            onChange={(e) =>
                              handlePaymentStatusChange(
                                order.id,
                                e.target.value
                              )
                            }
                          >
                            <option
                              value={0}
                              disabled={order.payment_status === 1}
                            >
                              Chưa thanh toán
                            </option>
                            <option value={1}>Đã thanh toán</option>
                          </Form.Control>
                        )
                      ) : order.payment_id === 2 ||
                        order.payment_status === 1 ? (
                        "Đã thanh toán"
                      ) : (
                        "Chưa thanh toán"
                      )}
                    </td>
                    <td>
                      {editingOrderId === order.id ? (
                        <Form.Control
                          as="select"
                          value={updatedOrderStatus[order.id]}
                          onChange={(e) =>
                            handleOrderStatusChange(order.id, e.target.value)
                          }
                        >
                          {[
                            { value: 1, label: "Chờ xác nhận" },
                            { value: 2, label: "Đã xác nhận" },
                            { value: 3, label: "Đang giao hàng" },
                            { value: 4, label: "Đã giao" },
                            { value: 0, label: "Đã hủy" },
                          ].map((option) =>
                            option.value >= order.status ||
                            option.value === 0 ? (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ) : null
                          )}
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
                      {order.status === 0 ? (
                        editingOrderId === order.id &&
                        updatedOrderStatus[order.id] === 0 ? (
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={cancelReasonAdmin}
                            onChange={(e) =>
                              setCancelReasonAdmin(e.target.value)
                            }
                            placeholder="Lý do hủy..."
                          />
                        ) : (
                          order.cancellation_reason || "Không có lý do"
                        )
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{order.address}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>{new Date(order.updatedAt).toLocaleString()}</td>
                    <td>
                      {editingOrderId === order.id ? (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleSave(order.id)}
                          >
                            Lưu
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="ms-2"
                            onClick={handleCancelEdit}
                          >
                            Hủy
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEdit(order.id)}
                        >
                          Sửa
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="d-flex justify-content-center mt-3">
            <nav>
              <ul className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <li
                      key={number}
                      className={`page-item ${
                        currentPage === number ? "active" : ""
                      }`}
                    >
                      <button
                        onClick={() => paginate(number)}
                        className="page-link"
                      >
                        {number}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderList;
