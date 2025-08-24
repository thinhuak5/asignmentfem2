import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import {
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaSave,
  FaSearch,
  FaTimes,
  FaTimesCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import adminApi from "../../../api/adminApi";
import "../../../assets/css/OrderList.css";

/* ===================== helpers ===================== */
const getLastAddressPart = (address) => {
  if (!address) return "";
  const parts = address.split(",");
  return parts[parts.length - 1].trim();
};
const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const fmtMoney = (v) => n(v).toLocaleString("vi-VN");
const fmtDT = (v) => (v ? new Date(v).toLocaleString() : "");

const calcTotals = (order) => {
  const items = Array.isArray(order?.items) ? order.items : [];
  const subtotal = items.reduce((sum, it) => {
    const unit = n(it?.variation?.price ?? it?.price);
    const qty = n(it?.quantity);
    return sum + unit * qty;
  }, 0);
  const discount = n(order?.discount_amount);
  const backendTotal = n(order?.total_amount);
  const totalForDisplay =
    backendTotal > 0 ? backendTotal : Math.max(0, subtotal - discount);
  return { subtotal, discount, totalForDisplay };
};

/* ===================== select options ===================== */
const paymentMethodOptions = [
  { value: "", label: "-- Tất cả phương thức --" },
  { value: "1", label: "COD" },
  { value: "2", label: "Chuyển khoản" },
];

const paymentStatusOptions = [
  { value: "", label: "-- Tất cả thanh toán --" },
  { value: "0", label: "Chưa thanh toán" },
  { value: "1", label: "Đã thanh toán" },
];

const orderStatusOptions = [
  { value: "1", label: "Chờ xác nhận" },
  { value: "2", label: "Đã xác nhận" },
  { value: "3", label: "Đang giao hàng" },
  { value: "4", label: "Đã giao" },
  { value: "0", label: "Đã hủy" },
];

/* ===================== badges ===================== */
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

/* ===================== transition rules ===================== */
/** Kiểm tra hợp lệ khi chuyển trạng thái */
const canTransition = (from, to) => {
  if (from === to) return true;
  // Hủy chỉ từ 1 hoặc 2
  if (to === 0) return from === 1 || from === 2;
  // Không lùi trạng thái
  if (to < from) return false;
  // Cho phép tiến thẳng (1→3, 2→4...) tùy nghiệp vụ, ở đây cho phép
  return true;
};

/* ===================== component ===================== */
const OrderList = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [updatedPaymentStatus, setUpdatedPaymentStatus] = useState({});
  const [updatedOrderStatus, setUpdatedOrderStatus] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15;

  // filters
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("");
  const [searchOrderCode, setSearchOrderCode] = useState("");

  // toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // detail modal
  const [showDetail, setShowDetail] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  /* ========== style ẩn mũi tên cho select khi edit ========== */
  const selectNoArrowStyle = {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: "none",
  };

  /* ===================== data ===================== */
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.get("/orders");
      const data = res.data?.data || res.data || [];
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(data);
    } catch (err) {
      const http = err?.response?.status;
      if (http === 401 || http === 403) {
        navigate("/admin-login", { replace: true });
        return;
      }
      setError(
        err?.response?.data?.message || err.message || "Lỗi khi lấy dữ liệu đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  /* ===================== filters ===================== */
  const filteredOrders = orders.filter((order) => {
    let byMethod = true;
    let byPayment = true;
    let byStatus = true;
    let bySearch = true;

    if (selectedPaymentMethod !== "") {
      byMethod = String(order.payment_id) === selectedPaymentMethod;
    }

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

    return byMethod && byPayment && byStatus && bySearch;
  });

  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  /* ===================== inline edit ===================== */
  const handleEdit = (id) => {
    setEditingOrderId(id);
    const orderToEdit = orders.find((o) => o.id === id);
    if (orderToEdit) {
      setUpdatedPaymentStatus((prev) => ({
        ...prev,
        [id]: orderToEdit.payment_status ?? 0,
      }));
      setUpdatedOrderStatus({ [id]: orderToEdit.status });
    }
  };

  const handlePaymentStatusChange = (id, value) =>
    setUpdatedPaymentStatus({
      ...updatedPaymentStatus,
      [id]: parseInt(value, 10),
    });

  const handleOrderStatusChange = (id, value) =>
    setUpdatedOrderStatus({
      ...updatedOrderStatus,
      [id]: parseInt(value, 10),
    });

  const handleSave = async (id) => {
    const current = orders.find((o) => o.id === id);
    if (!current) return;

    const toStatus = updatedOrderStatus[id];
    const newPaymentStatus =
      updatedPaymentStatus[id] ?? current.payment_status;

    /* ==== VALIDATIONS ==== */
    // 1) Rule chuyển trạng thái tổng quát
    if (!canTransition(current.status, toStatus)) {
      setToastType("danger");
      setShowToast(true);
      setToastMessage(
        <>
          <FaTimesCircle className="me-1" />
          Chuyển trạng thái không hợp lệ.
        </>
      );
      setTimeout(() => setShowToast(false), 3200);
      return;
    }

    // 2) Ràng buộc thanh toán theo phương thức
    // 2a) Nếu là Chuyển khoản, luôn phải "Đã thanh toán"
    if (current.payment_id === 2 && newPaymentStatus !== 1) {
      setToastType("danger");
      setShowToast(true);
      setToastMessage(
        <>
          <FaTimesCircle className="me-1" />
          Đơn chuyển khoản phải ở trạng thái "Đã thanh toán".
        </>
      );
      setTimeout(() => setShowToast(false), 3200);
      return;
    }

    // 2b) Nếu là COD và chuyển sang "Đã giao", yêu cầu đã thanh toán
    if (toStatus === 4 && current.payment_id === 1 && newPaymentStatus !== 1) {
      setToastType("danger");
      setShowToast(true);
      setToastMessage(
        <>
          <FaTimesCircle className="me-1" />
          Đơn COD phải "Đã thanh toán" trước khi kết thúc (Đã giao).
        </>
      );
      setTimeout(() => setShowToast(false), 3200);
      return;
    }

    try {
      await adminApi.put(`/orders/${id}`, {
        payment_status: newPaymentStatus,
        status: toStatus,
      });
      setShowToast(true);
      setToastType("success");
      setToastMessage(
        <>
          <FaCheckCircle className="me-1" /> Cập nhật đơn hàng thành công!
        </>
      );
      setEditingOrderId(null);
      fetchOrders();
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      const http = err?.response?.status;
      if (http === 401 || http === 403) {
        navigate("/admin-login", { replace: true });
        return;
      }
      setToastType("danger");
      setShowToast(true);
      setToastMessage(
        <>
          <FaTimesCircle className="me-1" />
          {err?.response?.data?.message || err.message || "Lỗi cập nhật đơn hàng"}
        </>
      );
      setTimeout(() => setShowToast(false), 3500);
    }
  };

  const handleCancelEdit = () => setEditingOrderId(null);

  /* ===================== detail ===================== */
  const openDetail = async (order) => {
    setShowDetail(true);
    setDetailLoading(true);
    try {
      const res = await adminApi.get(`/orders/${order.id}`);
      setDetailOrder(res.data?.data || res.data);
    } catch {
      setDetailOrder(null);
    }
    setDetailLoading(false);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setDetailOrder(null);
  };

  /* ===================== render ===================== */
  return (
    <div className="container py-3 position-relative">
      {/* Toast */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="position-fixed top-0 end-0 p-3"
        style={{ zIndex: 1060 }}
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

      {/* Filters */}
      <div className="row mb-4 g-3 align-items-end">
        <div className="col-md-4">
          <Form.Select
            value={selectedPaymentMethod}
            onChange={(e) => {
              setSelectedPaymentMethod(e.target.value);
              setCurrentPage(1);
            }}
          >
            {paymentMethodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </div>

        <div className="col-md-4">
          <Form.Select
            value={selectedPaymentStatus}
            onChange={(e) => {
              setSelectedPaymentStatus(e.target.value);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              setSelectedOrderStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            {orderStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </div>

        <div className="col-12">
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
              <FaSearch />
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
                <th>Phương thức TT</th>
                <th>Trạng thái thanh toán</th>
                <th>Trạng thái đơn</th>
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
                        style={{ textDecoration: "underline" }}
                        onClick={() => openDetail(order)}
                        title="Xem chi tiết"
                      >
                        <FaEye className="me-1" />
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
                          <Form.Select disabled value={1} style={selectNoArrowStyle}>
                            <option value={1}>Đã thanh toán</option>
                          </Form.Select>
                        ) : (
                          <Form.Select
                            style={selectNoArrowStyle}
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
                          style={selectNoArrowStyle}
                          value={updatedOrderStatus[order.id]}
                          onChange={(e) =>
                            handleOrderStatusChange(order.id, e.target.value)
                          }
                        >
                          {orderStatusOptions
                            .filter((opt) => {
                              // "Đã hủy" (0) chỉ hiện khi từ 1 hoặc 2
                              if (opt.value === "0") return order.status <= 2;

                              // Các option khác: chỉ tiến, không lùi
                              return (
                                opt.value === "" ||
                                parseInt(opt.value || "0", 10) >= order.status
                              );
                            })
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

                    <td>{getLastAddressPart(order.address)}</td>
                    <td>{fmtDT(order.createdAt)}</td>
                    <td>{fmtDT(order.updatedAt)}</td>

                    <td>
                      {editingOrderId === order.id ? (
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleSave(order.id)}
                          >
                            <FaSave className="me-1" /> Lưu
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            <FaTimes className="me-1" /> Hủy
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleEdit(order.id)}
                          className="d-flex align-items-center justify-content-center"
                          disabled={[0, 4].includes(order.status)} // khóa sửa khi Đã hủy/Đã giao
                          title={[0, 4].includes(order.status) ? "Trạng thái đã kết thúc, không thể sửa" : "Sửa"}
                        >
                          <FaEdit className="me-1" /> Sửa
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Pagination */}
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

          {/* Modal chi tiết */}
          <Modal show={showDetail} onHide={closeDetail} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>
                <FaEye className="me-2" />
                Chi tiết đơn hàng
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {detailLoading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" role="status" />
                </div>
              ) : detailOrder ? (
                <>
                  <div className="mb-2">
                    <strong>Mã đơn:</strong> {detailOrder.id} <br />
                    <strong>Khách hàng:</strong> {detailOrder.name} <br />
                    <strong>SĐT:</strong> {detailOrder.phone} <br />
                    <strong>Địa chỉ:</strong> {detailOrder.address} <br />
                    <strong>Thời gian tạo:</strong> {fmtDT(detailOrder.createdAt)} <br />
                    <strong>Thanh toán:</strong>{" "}
                    {paymentBadge(
                      detailOrder.payment_id,
                      detailOrder.payment_status
                    )}{" "}
                    <br />
                    <strong>Trạng thái:</strong> {statusBadge(detailOrder.status)}
                  </div>
                  <hr />
                  <h5 className="mt-3">Danh sách sản phẩm</h5>
                  {Array.isArray(detailOrder.items) && detailOrder.items.length > 0 ? (
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
                                <span style={{ color: "#999", fontSize: 12 }}>
                                  Không có ảnh
                                </span>
                              )}
                            </td>
                            <td>{item.variation?.name || "--"}</td>
                            <td>{fmtMoney(item.variation?.price ?? item.price)}đ</td>
                            <td>{item.quantity}</td>
                            <td className="fw-bold">
                              {fmtMoney(n(item.variation?.price ?? item.price) * n(item.quantity))}đ
                            </td>
                          </tr>
                        ))}
                        {(() => {
                          const { discount, totalForDisplay } = calcTotals(detailOrder);
                          return (
                            <tr>
                              <td colSpan={5} className="text-end fw-bold">Tổng cộng</td>
                              <td className="fw-bold text-danger">
                                {fmtMoney(totalForDisplay)} đ
                                {discount > 0 && (
                                  <span className="text-muted"> (-{fmtMoney(discount)} đ)</span>
                                )}
                              </td>
                            </tr>
                          );
                        })()}
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
