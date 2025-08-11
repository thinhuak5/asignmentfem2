import React, {useCallback, useEffect, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {Alert, Badge, Button, Card, Container, Form, Modal, Spinner,} from "react-bootstrap";
import Constanst from "../../../Constanst"; // Đảm bảo đường dẫn đúng

// Thêm một component Style để chứa CSS tùy chỉnh.
// Trong dự án thực tế, bạn nên đưa vào file CSS riêng.
const CustomStyles = () => (
    <style type="text/css">{`
    .order-card {
      border: 1px solid #dee2e6;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 78, 146, 0.08);
      transition: all 0.3s ease-in-out;
    }

    .order-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 78, 146, 0.15);
    }

    .order-card-header {
      background-color: #004E92;
      color: white;
      font-weight: 500;
      border-bottom: 0;
      border-top-left-radius: calc(0.5rem - 1px);
      border-top-right-radius: calc(0.5rem - 1px);
    }

    .product-item-row {
      display: flex;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f1f1f1;
    }
    .product-item-row:last-child {
      border-bottom: none;
    }

    .product-item-image {
      width: 70px;
      height: 70px;
      object-fit: contain;
      border-radius: 0.25rem;
      background-color: #f8f9fa;
      margin-right: 1rem;
    }
    
    .product-item-details {
       flex-grow: 1;
    }
    
    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
    }

    .btn-custom-danger {
      background-color: #d9534f;
      border-color: #d43f3a;
      color: white;
    }
    .btn-custom-danger:hover {
      background-color: #c9302c;
      border-color: #ac2925;
    }
    
    .modal-header-custom {
        background-color: #004E92;
        color: white;
    }
    .modal-header-custom .btn-close {
        filter: invert(1) grayscale(100%) brightness(200%);
    }
    
  `}</style>
);

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
          text: "Thanh toán đơn hàng thành công! Cảm ơn bạn đã mua sắm.",
      });

      const token = localStorage.getItem("authToken");
      const cartItemIds = JSON.parse(
        sessionStorage.getItem("vnp_cart_item_ids") || "[]"
      );

        if (cartItemIds.length > 0 && token) {
        fetch(`${Constanst.DOMAIN_API}/api/vnpay-success`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cartItemIds }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Xóa cart sau VNPAY:", data);
            sessionStorage.removeItem("vnp_cart_item_ids");
            localStorage.removeItem("cart");
          })
          .catch((err) => console.error("Lỗi khi xóa cart:", err));
      }
    } else if (message === "failed") {
      setPaymentMessage({
        variant: "danger",
          text: "Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.",
      });
    }

      if (message) {
          setTimeout(() => {
              const newUrl = window.location.pathname;
              window.history.replaceState({}, "", newUrl);
              setPaymentMessage(null); // Ẩn thông báo sau khi xóa URL
          }, 5000);
      }
  }, [routerLocation.search]);

    // Tất cả các hàm logic giữ nguyên
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
        month: "2-digit",
        day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
      return new Date(dateString).toLocaleString("vi-VN", options);
  };
  const getOrderStatus = (status) => {
    switch (status) {
        case 1:
            return <Badge bg="warning" text="dark">Chờ xác nhận</Badge>;
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
            return <Badge bg="warning" text="dark">Chưa thanh toán</Badge>;
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
            return "Chuyển khoản qua VNPAY";
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
        navigate("/login", {state: {from: "/order-history"}});
      return;
    }

    try {
      const res = await fetch(`${Constanst.DOMAIN_API}/api/orders/history`, {
          headers: {Authorization: `Bearer ${token}`},
      });

      if (res.ok) {
        const data = await res.json();
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(data);
      } else {
        let errorMsg = `Lỗi ${res.status}: Không thể tải lịch sử đơn hàng.`;
        if (res.status === 401 || res.status === 403) {
            errorMsg = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.";
          localStorage.removeItem("authToken");
          navigate("/login", { state: { from: "/order-history" } });
        }
        setError(errorMsg);
        setOrders([]);
      }
    } catch (err) {
      console.error("Lỗi mạng khi fetch lịch sử đơn hàng:", err);
      setError("Lỗi mạng, không thể kết nối đến máy chủ.");
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

    try {
      const res = await fetch(
        `${Constanst.DOMAIN_API}/api/orders/${orderToCancel}/cancel`,
        {
            method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
            body: JSON.stringify({reason: finalReason}),
        }
      );

      if (res.ok) {
          alert(`Đã gửi yêu cầu hủy cho đơn hàng #${orderToCancel}.`);
          handleCloseCancelModal();
          fetchOrderHistory();
      } else {
        const errorData = await res.json();
          alert(`Lỗi khi hủy đơn hàng: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
        alert(`Lỗi mạng, không thể hủy đơn hàng #${orderToCancel}.`);
    } finally {
      setIsCancelling(false);
    }
  };
    const calculateOrderTotal = (order) => {
        const total = order.total_amount ?? order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
        return total - (order.discount_amount || 0);
  };

  if (loading) {
    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="text-center">
                <Spinner animation="border" role="status" style={{width: '3rem', height: '3rem', color: '#004E92'}}>
                    <span className="visually-hidden">Đang tải...</span>
                </Spinner>
                <p className="mt-3 fs-5">Đang tải lịch sử đơn hàng...</p>
            </div>
      </Container>
    );
  }

  return (
      <>
          <CustomStyles/>
          <Container className="mt-4 mb-5 min-vh-100">
              <h2 className="mb-4 text-center" style={{color: '#004E92', fontWeight: 'bold'}}>
                  Lịch Sử Đơn Hàng
              </h2>

              {paymentMessage && (
                  <Alert variant={paymentMessage.variant} onClose={() => setPaymentMessage(null)} dismissible>
                      {paymentMessage.text}
                  </Alert>
              )}

              {error && <Alert variant="danger">{error}</Alert>}

              {!error && orders.length === 0 && (
                  <Card className="text-center p-5">
                      <Card.Body>
                          <h4 style={{color: '#6c757d'}}>Bạn chưa có đơn hàng nào.</h4>
                          <p>Hãy bắt đầu mua sắm ngay thôi!</p>
                          <Button as={Link} to="/" variant="primary"
                                  style={{backgroundColor: '#004E92', borderColor: '#004E92'}}>
                              Về trang chủ
                          </Button>
                      </Card.Body>
                  </Card>
              )}

              {!error &&
                  orders.map((order) => (
                      <Card key={order.id} className="order-card">
                          <Card.Header as="h5"
                                       className="order-card-header d-flex justify-content-between align-items-center flex-wrap">
                              <span>Mã đơn: #{order.id}</span>
                              {getOrderStatus(order.status)}
                          </Card.Header>
                          <Card.Body>
                              <div className="info-grid mb-3">
                                  <div><strong>Ngày đặt:</strong> {formatDate(order.createdAt)}</div>
                                  <div><strong>Người nhận:</strong> {order.name}</div>
                                  <div><strong>Điện thoại:</strong> {order.phone}</div>
                                  <div><strong>Địa chỉ:</strong> {order.address}</div>
                                  <div><strong>Thanh
                                      toán:</strong> {getPaymentMethod(order.payment_id)} - {getPaymentStatus(order.payment_status)}
                                  </div>
                                  {order.status === 0 && order.cancellation_reason && (
                                      <div className="text-danger"><strong>Lý do
                                          hủy:</strong> {order.cancellation_reason}</div>
                                  )}
                              </div>

                              <hr/>

                              <h6>Chi tiết sản phẩm</h6>
                {order.items && order.items.length > 0 ? (
                    <div>
                        {order.items.map((item) => (
                            <div key={item.id} className="product-item-row">
                                <img
                                    src={item.variation?.image_url || 'https://via.placeholder.com/150'}
                                    alt={item.variation?.name || "Product"}
                                    className="product-item-image"
                                />
                                <div className="product-item-details">
                                    <Link to={`/product/${item.product_id}`}
                                          className="text-decoration-none fw-semibold" style={{color: '#004E92'}}>
                                        {item.variation?.name || `Sản phẩm ID: ${item.product_id}`}
                                    </Link>
                                    <div className="text-muted">Số lượng: {item.quantity}</div>
                                </div>
                                <div className="text-end">
                                    <div className="fw-bold">
                                        {(item.quantity * item.price).toLocaleString()} VNĐ
                                    </div>
                                    <div className="text-muted small">
                                        {item.price.toLocaleString()} VNĐ / sp
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Không có thông tin sản phẩm.</p>
                )}
                          </Card.Body>
                          <Card.Footer className="bg-light d-flex justify-content-between align-items-center">
                              <div className="fw-bold fs-5" style={{color: '#004E92'}}>
                                  <span>Tổng tiền: </span>
                                  <span>{calculateOrderTotal(order).toLocaleString()} VNĐ</span>
                                  {order.discount_amount > 0 && (
                                      <div className="text-success small fw-normal">
                                          (Đã giảm: {order.discount_amount.toLocaleString()} VNĐ)
                                      </div>
                                  )}
                              </div>
                {order.status === 1 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleShowCancelModal(order.id)}
                  >
                    Hủy đơn hàng
                  </Button>
                )}
                          </Card.Footer>
                      </Card>
          ))}
          </Container>

          {/* Modal Hủy Đơn Hàng (đã tùy chỉnh header) */}
      <Modal show={showCancelModal} onHide={handleCloseCancelModal} centered>
          <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Hủy Đơn Hàng #{orderToCancel}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vui lòng chọn lý do bạn muốn hủy đơn hàng:</p>
          <Form>
            <Form.Group controlId="cancelReasonSelect">
              {cancellationReasons.map((reason, idx) => (
                <Form.Check
                    key={idx} type="radio" id={`reason-${idx}`} label={reason}
                    name="cancelReason" value={reason} checked={cancelReason === reason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mb-2"
                />
              ))}
            </Form.Group>
            {cancelReason === "Khác (ghi rõ lý do)" && (
              <Form.Group controlId="otherReasonTextarea" className="mt-3">
                <Form.Label>Lý do khác:</Form.Label>
                <Form.Control
                    as="textarea" rows={3} value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Vui lòng mô tả lý do cụ thể..."
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCancelModal} disabled={isCancelling}>
            Đóng
          </Button>
          <Button
            variant="danger"
            onClick={confirmCancelOrder}
            disabled={isCancelling || (!cancelReason && !otherReason)}
          >
            {isCancelling ? (
                <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"
                           className="me-2"/> Đang hủy...</>
            ) : "Xác nhận Hủy"}
          </Button>
        </Modal.Footer>
      </Modal>
      </>
  );
};

export default OrderHistory;