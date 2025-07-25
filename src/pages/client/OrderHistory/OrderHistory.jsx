
import React, {useCallback, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Accordion, Alert, Badge, Button, Container, Form, Modal, Spinner, Table,} from "react-bootstrap";
import Constanst from "../../../Constanst";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State cho Modal hủy đơn hàng
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Các lý do hủy cố định
  const cancellationReasons = [
    "Đổi ý, không muốn mua nữa",
    "Tìm thấy sản phẩm tốt hơn/giá rẻ hơn",
    "Đặt nhầm sản phẩm/số lượng",
    "Thời gian giao hàng quá lâu",
    "Không liên hệ được với người bán/shop",
    "Khác (ghi rõ lý do)",
  ];

  const routerLocation = useLocation();
  const [paymentMessage, setPaymentMessage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const message = params.get("message");

    if (message === "success") {
      setPaymentMessage({
        variant: "success",
        text: "Thanh toán đơn hàng thành công!",
      });

      const token = localStorage.getItem("authToken");
      const cartItemIds = JSON.parse(sessionStorage.getItem("vnp_cart_item_ids") || "[]");

      if (cartItemIds.length > 0) {
        fetch(`${Constanst.DOMAIN_API}/api/vnpay-success`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({cartItemIds}),
        })
            .then((res) => res.json())
            .then((data) => {
              console.log("Xóa cart sau VNPAY:", data);
              sessionStorage.removeItem("vnp_cart_item_ids");
              localStorage.removeItem("cart");
            })
            .catch((err) => console.error("Lỗi khi xóa cart:", err));
      }
    }

    if (message === "failed") {
      setPaymentMessage({
        variant: "danger",
        text: "Thanh toán thất bại. Vui lòng thử lại.",
      });
    }

    setTimeout(() => {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }, 3000);
  }, [routerLocation.search]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const getOrderStatus = (status) => {
    switch (status) {
      case 1:
        return (
          <Badge bg="warning" text="dark">
            Chờ xác nhận
          </Badge>
        );
      case 2:
        return <Badge bg="info">Đã xác nhận</Badge>;
      case 3:
        return <Badge bg="primary">Đang giao hàng</Badge>;
      case 4:
        return <Badge bg="success">Đã giao</Badge>;
      case 0:
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  const getPaymentStatus = (status) => {
    switch (status) {
      case 0:
        return (
          <Badge bg="warning" text="dark">
            Chưa thanh toán
          </Badge>
        );
      case 1:
        return <Badge bg="success">Đã thanh toán</Badge>;
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  const getPaymentMethod = (method) => {
    switch (method) {
      case 1:
        return "Thanh toán khi nhận hàng (COD)";
      case 2:
        return "Chuyển khoản ngân hàng";
      case 3:
        return "Ví điện tử";
      default:
        return "Không xác định";
    }
  };

  const fetchOrderHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Vui lòng đăng nhập để xem lịch sử đơn hàng.");
      setLoading(false);
      navigate("/login", { state: { from: "/order-history" } });
      return;
    }

    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/orders/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(data);
      } else {
        let errorMsg = `Lỗi ${res.status}: Không thể tải lịch sử đơn hàng.`;
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
        }

        if (res.status === 401 || res.status === 403) {
          errorMsg =
            "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.";
          localStorage.removeItem("authToken");
          navigate("/login", { state: { from: "/order-history" } });
        }
        setError(errorMsg);
        setOrders([]);
      }
    } catch (err) {
      console.error("Lỗi mạng khi fetch lịch sử đơn hàng:", err);
      setError("Lỗi mạng, không thể kết nối đến máy chủ.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  const handleShowCancelModal = (orderId) => {
    setOrderToCancel(orderId);
    setCancelReason("");
    setOtherReason("");
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setOrderToCancel(null);
    setCancelReason("");
    setOtherReason("");
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel || (!cancelReason && !otherReason)) {
      alert("Vui lòng chọn hoặc nhập lý do hủy đơn hàng.");
      return;
    }

    let finalReason = cancelReason;
    if (cancelReason === "Khác (ghi rõ lý do)") {
      if (!otherReason.trim()) {
        alert("Vui lòng ghi rõ lý do hủy.");
        return;
      }
      finalReason = otherReason.trim();
    }

    setIsCancelling(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      setIsCancelling(false);
      navigate("/login", { state: { from: "/order-history" } });
      return;
    }

    try {
      const res = await fetch(
        `${Constanst.DOMAIN_API}/api/orders/${orderToCancel}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: finalReason }),
        }
      );

      if (res.ok) {
        alert(
          `Đơn hàng #${orderToCancel} đã được hủy thành công với lý do: ${finalReason}`
        );
        handleCloseCancelModal();
        fetchOrderHistory();
      } else {
        const errorData = await res.json();
        alert(
          `Lỗi khi hủy đơn hàng #${orderToCancel}: ${
            errorData.message || res.statusText
          }`
        );
      }
    } catch (error) {
      console.error("Lỗi mạng khi hủy đơn hàng:", error);
      alert(
        `Lỗi mạng, không thể hủy đơn hàng #${orderToCancel}. Vui lòng thử lại.`
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const calculateOrderTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p>Đang tải lịch sử đơn hàng...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5 min-vh-100">
      <h2 className="mb-4 text-center">Lịch sử Đơn Hàng</h2>
      {paymentMessage && (
        <Alert variant={paymentMessage.variant} className="mt-3">
          {paymentMessage.text}
        </Alert>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!error && orders.length === 0 && (
        <Alert variant="info">Bạn chưa có đơn hàng nào.</Alert>
      )}

      {!error && orders.length > 0 && (
        <Accordion defaultActiveKey="0" alwaysOpen>
          {orders.map((order, index) => (
            <Accordion.Item
              eventKey={index.toString()}
              key={order.id}
              className="mb-3 shadow-sm"
            >
              <Accordion.Header>
                <div className="d-flex justify-content-between w-100 me-3 flex-wrap">
                  <span className="col-12 col-md-3">
                    <strong>Mã đơn:</strong> #{order.id}
                  </span>
                  <span className="col-12 col-md-3">
                    <strong>Ngày đặt:</strong> {formatDate(order.createdAt)}
                  </span>
                  <span className="col-12 col-md-3">
                    <strong>Trạng thái:</strong> {getOrderStatus(order.status)}
                  </span>
                  <span className="col-12 col-md-3 fw-bold text-md-end">
                    Tổng tiền:{" "}
                    {order.totalAmount
                      ? order.totalAmount.toLocaleString()
                      : calculateOrderTotal(order.items).toLocaleString()}{" "}
                    VNĐ
                  </span>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <h5>Thông tin nhận hàng</h5>
                <p>
                  <strong>Người nhận:</strong> {order.name}
                </p>
                <p>
                  <strong>Điện thoại:</strong> {order.phone}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {order.address}
                </p>
                <p>
                  <strong>Thanh toán:</strong>{" "}
                  {getPaymentMethod(order.payment_id)} -{" "}
                  {getPaymentStatus(order.payment_status)}
                </p>

                {order.status === 0 && order.cancellation_reason && (
                  <p className="text-danger">
                    <strong>Lý do hủy:</strong> {order.cancellation_reason}
                  </p>
                )}

                <h6 className="mt-3">Các sản phẩm đã đặt:</h6>
                {order.items && order.items.length > 0 ? (
                  <Table striped bordered hover responsive size="sm">
                    <thead>
                      <tr>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="product-thumbnail">
                              {item.product?.image_url ? (
                                <img
                                  src={item.product.image_url}
                                  className="product-thumbnail"
                                  alt={item.product?.name}
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "contain",
                                  }}
                                />
                              ) : (
                                <span>Không có ảnh</span>
                              )}
                            </div>
                          </td>
                          <td>
                            {item.selectedVariation ? (
                              <>
                                {item.product?.name}
                                <div className="text-muted small">
                                  ({item.selectedVariation.name})
                                </div>
                              </>
                            ) : (
                              item.product?.name ||
                              `Sản phẩm ID: ${item.product_id}`
                            )}
                          </td>
                          <td>{item.quantity}</td>
                          <td>
                            {item.price ? item.price.toLocaleString() : "N/A"}{" "}
                            VNĐ
                          </td>
                          <td>
                            {item.price && item.quantity
                              ? (item.quantity * item.price).toLocaleString()
                              : "N/A"}{" "}
                            VNĐ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p>Không có thông tin chi tiết sản phẩm cho đơn hàng này.</p>
                )}

                {order.status === 1 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleShowCancelModal(order.id)}
                    className="mt-3"
                  >
                    Hủy đơn hàng
                  </Button>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      <Modal show={showCancelModal} onHide={handleCloseCancelModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Hủy Đơn Hàng #{orderToCancel}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vui lòng chọn lý do bạn muốn hủy đơn hàng:</p>
          <Form>
            <Form.Group controlId="cancelReasonSelect">
              {cancellationReasons.map((reason, idx) => (
                <Form.Check
                  key={idx}
                  type="radio"
                  id={`reason-${idx}`}
                  label={reason}
                  name="cancelReason"
                  value={reason}
                  checked={cancelReason === reason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mb-2"
                />
              ))}
            </Form.Group>

            {cancelReason === "Khác (ghi rõ lý do)" && (
              <Form.Group controlId="otherReasonTextarea" className="mt-3">
                <Form.Label>Lý do khác:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Vui lòng mô tả lý do cụ thể..."
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseCancelModal}
            disabled={isCancelling}
          >
            Đóng
          </Button>
          <Button
            variant="danger"
            onClick={confirmCancelOrder}
            disabled={isCancelling || (!cancelReason && !otherReason)}
          >
            {isCancelling ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Đang hủy...
              </>
            ) : (
              "Xác nhận Hủy Đơn Hàng"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderHistory;
