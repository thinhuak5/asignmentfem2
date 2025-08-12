import React, {useCallback, useEffect, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {Accordion, Alert, Badge, Button, Container, Form, Modal, Spinner, Table,} from "react-bootstrap";
import Constanst from "../../../Constanst";

const OrderHistory = () => {
    // ====== Soft blue theme (CSS in JS) ======
    const SoftBlueCSS = () => (
        <style>{`
      .modal-soft-blue .modal-content{
        background:#f2f8ff;               /* nền xanh nhạt */
        border:1px solid #cfe3ff;
        box-shadow:0 10px 30px rgba(20,60,120,.15);
        border-radius:14px;
      }
      .modal-soft-blue .modal-header{
        background:#eaf3ff;               /* header xanh nhạt hơn */
        color:#0b3d91;                     /* chữ xanh đậm */
        border-bottom:1px solid #cfe3ff;
        border-top-left-radius:14px;
        border-top-right-radius:14px;
      }
      .modal-soft-blue .modal-title{
        font-weight:600;
      }
      .modal-soft-blue .modal-body{
        color:#193b6a;
      }
      .modal-soft-blue .btn-primary{
        background:#56a6ff;                /* nút OK xanh nhạt */
        border-color:#56a6ff;
      }
      .modal-soft-blue .btn-primary:hover{
        background:#3e90fb;
        border-color:#3e90fb;
      }
      .modal-soft-blue .btn-secondary{
        background:#e9f2ff;
        color:#0b3d91;
        border-color:#cfe3ff;
      }
      .modal-soft-blue .btn-secondary:hover{
        background:#dbeaff;
        color:#0b3d91;
        border-color:#bed7ff;
      }
      .modal-soft-blue .btn-close{
        filter: invert(24%) sepia(16%) saturate(1783%) hue-rotate(189deg) brightness(90%) contrast(88%);
      }
    `}</style>
    );

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

    // Modal hủy
  const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);

    // Modal kết quả/thông báo (dùng chung)
    const [resultModal, setResultModal] = useState({
        show: false,
        title: "",
        message: "",
    });
    const [resultOnClose, setResultOnClose] = useState(null);

    const openResultModal = (title, message, onClose = null) => {
        setResultModal({show: true, title, message});
        setResultOnClose(() => onClose);
    };
    const closeResultModal = () => {
        setResultModal((s) => ({...s, show: false}));
        if (typeof resultOnClose === "function") {
            const fn = resultOnClose;
            setResultOnClose(null);
            setTimeout(fn, 0);
        }
    };

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
      const cartItemIds = JSON.parse(
        sessionStorage.getItem("vnp_cart_item_ids") || "[]"
      );

      if (cartItemIds.length > 0) {
        fetch(`${Constanst.DOMAIN_API}/api/vnpay-success`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cartItemIds }),
        })
          .then((res) => res.json())
            .then(() => {
            sessionStorage.removeItem("vnp_cart_item_ids");
            localStorage.removeItem("cart");
          })
            .catch(() => {
            });
      }
    }

    if (message === "failed") {
      setPaymentMessage({
        variant: "danger",
        text: "Thanh toán thất bại. Vui lòng thử lại.",
      });
    }

      const t = setTimeout(() => {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }, 3000);
      return () => clearTimeout(t);
  }, [routerLocation.search]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      });
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
        const msg = "Vui lòng đăng nhập để xem lịch sử đơn hàng.";
        setError(msg);
        openResultModal("Cần đăng nhập", msg, () =>
            navigate("/login", {state: {from: "/order-history"}})
        );
      setLoading(false);
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
        } catch {
        }
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("authToken");
            openResultModal(
                "Phiên đăng nhập hết hạn",
                "Vui lòng đăng nhập lại.",
                () => navigate("/login", {state: {from: "/order-history"}})
            );
        } else {
            openResultModal("Không thể tải dữ liệu", errorMsg);
        }
        setError(errorMsg);
        setOrders([]);
      }
    } catch {
        const msg = "Lỗi mạng, không thể kết nối đến máy chủ.";
        setError(msg);
      setOrders([]);
        openResultModal("Lỗi mạng", msg);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  useEffect(() => {
    const fetchMissingProductImages = async () => {
      const updatedOrders = await Promise.all(
        orders.map(async (order) => {
          if (!order.items || order.items.length === 0) return order;
          const updatedItems = await Promise.all(
            order.items.map(async (item) => {
              if (
                item.product &&
                !item.product.productImages &&
                !item.product.images
              ) {
                try {
                  const res = await fetch(
                    `${Constanst.DOMAIN_API}/api/products/${item.product_id}`
                  );
                  if (res.ok) {
                    const data = await res.json();
                    return {
                      ...item,
                      product: {
                        ...item.product,
                        productImages: data.productImages,
                        images: data.images,
                      },
                    };
                  }
                } catch {
                }
              }
              return item;
            })
          );
          return { ...order, items: updatedItems };
        })
      );
      setOrders(updatedOrders);
    };

    if (
      orders.length > 0 &&
      orders.some(
          (o) =>
              o.items &&
              o.items.some(
                  (it) =>
                      it.product &&
                      !it.product.productImages &&
                      !it.product.images
          )
      )
    ) {
      fetchMissingProductImages();
    }
  }, [orders]);

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
        openResultModal(
            "Thiếu lý do hủy",
            "Vui lòng chọn hoặc nhập lý do hủy đơn hàng."
        );
      return;
    }

    let finalReason = cancelReason;
    if (cancelReason === "Khác (ghi rõ lý do)") {
      if (!otherReason.trim()) {
          openResultModal("Thiếu lý do khác", "Vui lòng ghi rõ lý do hủy.");
        return;
      }
      finalReason = otherReason.trim();
    }

    setIsCancelling(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
        openResultModal(
            "Phiên đăng nhập hết hạn",
            "Vui lòng đăng nhập lại để tiếp tục hủy đơn.",
            () => navigate("/login", {state: {from: "/order-history"}})
        );
      setIsCancelling(false);
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
            body: JSON.stringify({reason: finalReason}),
        }
      );

      if (res.ok) {
          openResultModal(
              "Hủy đơn hàng thành công",
              `Đơn hàng #${orderToCancel} đã được hủy với lý do: ${finalReason}`
        );
          handleCloseCancelModal();
          fetchOrderHistory();
      } else {
        const errorData = await res.json();
          openResultModal(
              "Hủy đơn hàng thất bại",
              `Lỗi khi hủy đơn #${orderToCancel}: ${errorData.message || res.statusText}`
        );
      }
    } catch {
        openResultModal(
            "Lỗi mạng",
            `Không thể hủy đơn #${orderToCancel}. Vui lòng thử lại.`
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const calculateOrderTotal = (items) => {
    if (!items || items.length === 0) return 0;
      return items.reduce((sum, item) => {
          const price = Number(item.price) || 0;
          const qty = Number(item.quantity) || 0;
          return sum + price * qty;
      }, 0);
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
        <SoftBlueCSS/>

      <h2 className="mb-4 text-center">Lịch sử Đơn Hàng</h2>

      {paymentMessage && (
        <Alert variant={paymentMessage.variant} className="mt-3">
          {paymentMessage.text}
        </Alert>
      )}

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
                    {(order.total_amount !== undefined
                      ? order.total_amount
                      : calculateOrderTotal((order.items) - (order.discount_amount || 0)
                    )).toLocaleString()}{" "}
                    VNĐ
                    {order.discount_amount > 0 && (
                      <div className="text-success small">
                        (Đã giảm: {order.discount_amount.toLocaleString()} VNĐ)
                      </div>
                    )}
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
                                {item.variation?.image_url ? (
                                <img
                                    src={item.variation.image_url}
                                    alt={item.variation?.name || "Product Image"}
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
                            <Link
                              to={`/product/${item.product_id}`}
                              className="text-decoration-none fw-semibold"
                            >
                                {item.variation?.name ||
                                `Sản phẩm ID: ${item.product_id}`}
                            </Link>

                            {item.selectedVariation && (
                              <div className="text-muted small">
                                ({item.selectedVariation.name})
                              </div>
                            )}
                          </td>

                          <td>{item.quantity}</td>
                          <td>
                              {item.price
                                  ? Number(item.price).toLocaleString()
                                  : "N/A"}{" "}
                            VNĐ
                          </td>
                          <td>
                            {item.price && item.quantity
                                ? (
                                    Number(item.quantity) * Number(item.price)
                                ).toLocaleString()
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

                  {/* Nút hủy (khi Chờ xác nhận) */}
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

        {/* Modal Hủy Đơn Hàng - tông xanh nước nhạt */}
        <Modal
            show={showCancelModal}
            onHide={handleCloseCancelModal}
            centered
            dialogClassName="modal-soft-blue"
            backdrop="static"
            keyboard={false}
        >
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
              variant="primary"
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

        {/* Modal Thông báo/Kết quả - tông xanh nước nhạt */}
        <Modal
            show={resultModal.show}
            onHide={closeResultModal}
            centered
            dialogClassName="modal-soft-blue"
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>{resultModal.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>{resultModal.message}</div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={closeResultModal}>
                    OK
                </Button>
            </Modal.Footer>
        </Modal>
    </Container>
  );
};

export default OrderHistory;
