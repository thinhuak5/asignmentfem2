import React, {useEffect, useState} from "react";
import {Alert, Button, Form, Modal, Spinner, Table} from "react-bootstrap";
import {FaCheckCircle, FaEdit, FaEye, FaSave, FaSearch, FaTimes, FaTimesCircle,} from "react-icons/fa";
import Constanst from "../../../Constanst";
import "../../../assets/css/OrderList.css";

// ----------- Helper: Tách tỉnh thành từ địa chỉ -------------
function getLastAddressPart(address) {
    if (!address) return "";
    const parts = address.split(",");
    return parts[parts.length - 1].trim();
}

// -------------- Danh sách option filter ---------------
const paymentStatusOptions = [
    {value: "", label: "-- Tất cả thanh toán --"},
    {value: "0", label: "Chưa thanh toán"},
    {value: "1", label: "Đã thanh toán"},
];

const orderStatusOptions = [
    {value: "", label: "-- Tất cả trạng thái --"},
    {value: "1", label: "Chờ xác nhận"},
    {value: "2", label: "Đã xác nhận"},
    {value: "3", label: "Đang giao hàng"},
    {value: "4", label: "Đã giao"},
    {value: "0", label: "Đã hủy"},
];

// ------------ Helper: Badge hiển thị trạng thái ----------
const statusBadge = (status) => {
    switch (status) {
        case 1:
            return <span className="badge bg-warning text-dark">Chờ xác nhận</span>;
        case 2:
            return <span className="badge bg-info text-dark">Đã xác nhận</span>;
        case 3:
            return <span className="badge bg-primary">Đang giao hàng</span>;
        case 4:
            return <span className="badge bg-success">Đã giao</span>;
        case 0:
            return <span className="badge bg-danger">Đã hủy</span>;
        default:
            return <span className="badge bg-secondary">Không xác định</span>;
    }
};

const paymentBadge = (payment_id, payment_status) => {
    if (payment_id === 2 || payment_status === 1) {
        return <span className="badge bg-success">Đã thanh toán</span>;
    }
    return <span className="badge bg-warning text-dark">Chưa thanh toán</span>;
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [updatedPaymentStatus, setUpdatedPaymentStatus] = useState({});
  const [updatedOrderStatus, setUpdatedOrderStatus] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15;
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
    const [selectedOrderStatus, setSelectedOrderStatus] = useState("");
    const [searchOrderCode, setSearchOrderCode] = useState(""); // Search state

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    // Modal chi tiết
    const [showDetail, setShowDetail] = useState(false);
    const [detailOrder, setDetailOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // --- FILTER & PAGINATION ---
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

    // --- FILTER logic ---
    const filteredOrders = orders.filter((order) => {
        let byPayment = true;
        let byStatus = true;
        let bySearch = true;
        if (selectedPaymentStatus !== "") {
            if (selectedPaymentStatus === "1") {
                byPayment = order.payment_id === 2 || order.payment_status === 1;
            } else {
                byPayment = order.payment_id !== 2 && order.payment_status === 0;
            }
        }
        if (selectedOrderStatus !== "") {
            byStatus = String(order.status) === selectedOrderStatus;
        }
        if (searchOrderCode.trim() !== "") {
            const keyword = searchOrderCode.trim().toLowerCase();
            bySearch =
                (order.txn_ref && order.txn_ref.toLowerCase().includes(keyword)) ||
                String(order.id).includes(keyword);
        }
        return byPayment && byStatus && bySearch;
    });

    const currentOrders = filteredOrders.slice(
        indexOfFirstOrder,
        indexOfLastOrder
    );
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    // --- FETCH DATA ---
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
        const headers = {"Content-Type": "application/json"};
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
      setError(err.message || "Lỗi khi lấy dữ liệu đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

    // --- EDIT/UPDATE ---
  const handleEdit = (id) => {
    setEditingOrderId(id);
    const orderToEdit = orders.find((order) => order.id === id);
    if (orderToEdit) {
      setUpdatedPaymentStatus((prev) => ({
        ...prev,
        [id]: orderToEdit.payment_status ?? 0,
      }));
      setUpdatedOrderStatus({ [id]: orderToEdit.status });
    }
  };

  const handlePaymentStatusChange = (id, value) => {
    setUpdatedPaymentStatus({ ...updatedPaymentStatus, [id]: parseInt(value) });
  };

  const handleOrderStatusChange = (id, value) => {
      setUpdatedOrderStatus({...updatedOrderStatus, [id]: parseInt(value)});
  };

  const handleSave = async (id) => {
    const payment_status = updatedPaymentStatus[id];
    const status = updatedOrderStatus[id];
    try {
        const headers = {"Content-Type": "application/json"};
      const response = await fetch(`${Constanst.DOMAIN_API}/api/oders/${id}`, {
        method: "PUT",
        headers,
          body: JSON.stringify({payment_status, status}),
      });

      if (response.ok) {
          setShowToast(true);
          setToastType("success");
          setToastMessage(
              <>
                  <FaCheckCircle className="me-1"/> Cập nhật đơn hàng thành công!
              </>
          );
        setEditingOrderId(null);
        fetchOrders();
          setTimeout(() => setShowToast(false), 2500);
      } else {
        const errorData = await response.json();
          setToastType("danger");
          setShowToast(true);
          setToastMessage(
              <>
                  <FaTimesCircle className="me-1"/> Lỗi cập nhật đơn hàng:{" "}
                  {errorData.message || response.statusText}
              </>
        );
          setTimeout(() => setShowToast(false), 3500);
      }
    } catch (error) {
        setToastType("danger");
        setShowToast(true);
        setToastMessage(
            <>
                <FaTimesCircle className="me-1"/> Lỗi mạng khi cập nhật đơn hàng.
            </>
        );
        setTimeout(() => setShowToast(false), 3500);
    }
  };

    const handleCancelEdit = () => setEditingOrderId(null);

    // --- DETAIL MODAL ---
    const openDetail = async (order) => {
        setShowDetail(true);
        setDetailLoading(true);
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/oders/${order.id}`);
            const data = await res.json();
            setDetailOrder(data);
        } catch {
            setDetailOrder(null);
    }
        setDetailLoading(false);
  };

    const closeDetail = () => {
        setShowDetail(false);
        setDetailOrder(null);
  };

    // --- RENDER ---
  return (
      <div className="container py-3 position-relative">
          {/* Toast popup góc trên phải */}
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
                      aria-live="assertive"
                      aria-atomic="true"
                  >
                      <div className="d-flex align-items-center">
                          <div className="toast-body">{toastMessage}</div>
                          <button
                              type="button"
                              className="btn-close btn-close-white ms-auto me-2"
                              onClick={() => setShowToast(false)}
                          ></button>
                      </div>
                  </div>
              )}
          </div>

          <h2 className="mb-4">Danh sách đơn hàng</h2>
          {/* Filter + Search */}
          <div className="row mb-4 g-3 align-items-end">
              <div className="col-md-4">
                  <Form.Select
                      value={selectedPaymentStatus}
                      onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  >
                      {paymentStatusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                              {opt.label}
                          </option>
                      ))}
                  </Form.Select>
              </div>
              <div className="col-md-4">
                  <Form.Select
                      value={selectedOrderStatus}
                      onChange={(e) => setSelectedOrderStatus(e.target.value)}
                  >
                      {orderStatusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                              {opt.label}
                          </option>
                      ))}
                  </Form.Select>
              </div>
              <div className="col-md-4">
                  <Form.Group className="d-flex" controlId="orderCodeSearch">
                      <Form.Control
                          type="text"
                          placeholder="Tìm kiếm mã đơn hàng..."
                          value={searchOrderCode}
                          onChange={(e) => {
                              setSearchOrderCode(e.target.value);
                              setCurrentPage(1);
                          }}
                      />
                      <span className="input-group-text bg-white border-0">
              <FaSearch/>
            </span>
                  </Form.Group>
              </div>
          </div>

      {loading && (
          <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p>Đang tải dữ liệu đơn hàng...</p>
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <>
            <Table
                striped
                bordered
                hover
                responsive
                className="text-center align-middle"
            >
            <thead className="table-dark">
              <tr>
                <th>STT</th>
                  <th>Mã Đơn</th>
                <th>Tên</th>
                <th>Điện thoại</th>
                <th>Thanh toán</th>
                <th>Trạng thái thanh toán</th>
                <th>Trạng thái đơn hàng</th>
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
                      <td>
                          <Button
                              size="sm"
                              variant="link"
                              style={{textDecoration: "underline"}}
                              onClick={() => openDetail(order)}
                              title="Xem chi tiết"
                          >
                              <FaEye className="me-1"/>
                              {order.id}
                          </Button>
                      </td>
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
                            <Form.Select disabled value={1}>
                            <option value={1}>Đã thanh toán</option>
                            </Form.Select>
                        ) : (
                            <Form.Select
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
                            </Form.Select>
                        )
                      ) : (
                          paymentBadge(order.payment_id, order.payment_status)
                      )}
                    </td>
                    <td>
                      {editingOrderId === order.id ? (
                          <Form.Select
                          value={updatedOrderStatus[order.id]}
                          onChange={(e) =>
                            handleOrderStatusChange(order.id, e.target.value)
                          }
                        >
                              {orderStatusOptions
                                  .filter(
                                      (opt) =>
                                          opt.value === "" ||
                                          opt.value === "0" ||
                                          parseInt(opt.value) >= order.status
                                  )
                                  .map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                                  ))}
                          </Form.Select>
                      ) : (
                          statusBadge(order.status)
                      )}
                    </td>
                      {/* Địa chỉ: Chỉ hiện tên tỉnh */}
                      <td>{getLastAddressPart(order.address)}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>{new Date(order.updatedAt).toLocaleString()}</td>
                    <td>
                      {editingOrderId === order.id ? (
                          <div className="d-flex justify-content-center align-items-center gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleSave(order.id)}
                          >
                              <FaSave className="me-1"/> Lưu
                          </Button>
                          <Button
                              variant="danger"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                              <FaTimes className="me-1"/> Hủy
                          </Button>
                          </div>
                      ) : (
                        <Button
                            variant="success"
                          size="sm"
                          onClick={() => handleEdit(order.id)}
                            className="d-flex align-items-center justify-content-center"
                        >
                            <FaEdit className="me-1"/> Sửa
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
                          onClick={() => setCurrentPage(number)}
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

            {/* Modal xem chi tiết đơn hàng */}
            <Modal show={showDetail} onHide={closeDetail} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaEye className="me-2"/>
                        Chi tiết đơn hàng
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailLoading ? (
                        <div className="text-center my-4">
                            <Spinner animation="border" role="status"/>
                        </div>
                    ) : detailOrder ? (
                        <>
                            <div className="mb-2">
                                <strong>Mã đơn:</strong>{" "}
                                {detailOrder.id} <br/>
                                <strong>Khách hàng:</strong> {detailOrder.name} <br/>
                                <strong>SĐT:</strong> {detailOrder.phone} <br/>
                                <strong>Địa chỉ:</strong> {detailOrder.address} <br/>
                                <strong>Thời gian tạo:</strong>{" "}
                                {new Date(detailOrder.createdAt).toLocaleString()} <br/>
                                <strong>Thanh toán:</strong>{" "}
                                {paymentBadge(
                                    detailOrder.payment_id,
                                    detailOrder.payment_status
                                )}{" "}
                                <br/>
                                <strong>Trạng thái:</strong>{" "}
                                {statusBadge(detailOrder.status)}
                            </div>
                            <hr/>
                            <h5 className="mt-3">Danh sách sản phẩm</h5>
                            {Array.isArray(detailOrder.items) &&
                            detailOrder.items.length > 0 ? (
                                <Table size="sm" bordered hover>
                                    <thead className="table-light">
                                    <tr>
                                        <th>STT</th>
                                        <th>Ảnh</th>
                                        <th>Sản phẩm</th>
                                        <th>Đơn giá</th>
                                        <th>Số lượng</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {detailOrder.items.map((item, idx) => (
                                        <tr key={item.id || idx}>
                                            <td>{idx + 1}</td>
                                            <td>
                                                {item.variation?.image_url ? (
                                                    <img
                                                        src={item.variation.image_url}
                                                        alt={item.product_name || "Ảnh"}
                                                        style={{
                                                            width: 48,
                                                            height: 48,
                                                            objectFit: "cover",
                                                            borderRadius: 6,
                                                            border: "1px solid #eee",
                                                        }}
                                                    />
                                                ) : (
                                                    <span style={{color: "#999", fontSize: 12}}>
                                  Không có ảnh
                                </span>
                                                )}
                                            </td>
                                            <td>{item.variation.name || "--"}</td>
                                            <td>
                                                {(
                                                    item.variation?.price ?? item.price
                                                )?.toLocaleString()}
                                                đ
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td className="fw-bold">
                                                {(
                                                    (item.variation?.price ?? item.price) *
                                                    item.quantity
                                                ).toLocaleString()}
                                                đ
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan={5} className="text-end fw-bold">
                                            Tổng cộng
                                        </td>
                                        <td className="fw-bold text-danger">
                                            {detailOrder.total_amount
                                                .toLocaleString()}
                                            đ { detailOrder.discount_amount > 0 && (
                                                <span className="text-muted"> (-{detailOrder.discount_amount.toLocaleString()} đ)</span>
                                            )}
                                        </td>
                                    </tr>
                                    </tbody>
                                </Table>
                            ) : (
                                <div>Không có sản phẩm trong đơn hàng này.</div>
                            )}
                        </>
                    ) : (
                        <Alert variant="danger">
                            Không lấy được chi tiết đơn hàng hoặc đơn hàng không tồn tại.
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeDetail}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
      )}
    </div>
  );
};

export default OrderList;
