import React, {useCallback, useEffect, useState} from "react";
import {Alert, Button, Button as RBButton, Col, Container, Form, Modal as RBModal, Row, Table,} from "react-bootstrap";
import Constants from "../../../Constanst";
import {Link, useNavigate} from "react-router-dom";
import {FaMinus, FaPlus, FaTrashAlt} from "react-icons/fa";
import {jwtDecode} from "jwt-decode";
import "../../../assets/css/CartPage.css";
import {useSnackbar} from "notistack";

/* ===== SoftBlue modal theme (dùng chung) ===== */
const SoftBlueCSS = () => (
    <style>{`
    .modal-soft-blue .modal-content{
      background:#ffffff;
      border:1px solid #cfe3ff;
      box-shadow:0 10px 30px rgba(20,60,120,.15);
      border-radius:14px;
    }
    .modal-soft-blue .modal-header{
      background:#eaf3ff;
      color:#0b3d91;
      border-bottom:1px solid #cfe3ff;
      border-top-left-radius:14px;
      border-top-right-radius:14px;
    }
    .modal-soft-blue .modal-title{ font-weight:600; }
    .modal-soft-blue .modal-body{ color:#193b6a; }
    .modal-soft-blue .btn-primary{
      background:#E74C3C; border-color:#E74C3C;
    }
    .modal-soft-blue .btn-primary:hover{
      background:#C0392B; border-color:#C0392B;
    }
    .modal-soft-blue .btn-secondary{
      background:#e9f2ff; color:#0b3d91; border-color:#cfe3ff;
    }
    .modal-soft-blue .btn-secondary:hover{
      background:#dbeaff; color:#0b3d91; border-color:#bed7ff;
    }
    .modal-soft-blue .btn-close{
      filter: invert(24%) sepia(16%) saturate(1783%) hue-rotate(189deg) brightness(90%) contrast(88%);
    }
  `}</style>
);

const formatVND = (value) => {
    const num = Number(value) || 0;
    return num.toLocaleString("vi-VN", {maximumFractionDigits: 0}).replace(/\u00A0/g, "") + "đ";
};

const CartPage = () => {
    const {enqueueSnackbar} = useSnackbar();
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

    /* ===== Helpers ===== */
    const getAvailableQty = (item) => Math.max(0, item?.variation?.quantity ?? 0);
    const getMaxQuantity = (item) => getAvailableQty(item);

  const getCartFromAPI = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setCart([]);
      setSelectedItems([]);
      setError("Vui lòng đăng nhập để xem giỏ hàng.");
      return;
    }
    try {
      const res = await fetch(`${Constants.DOMAIN_API}/api/cart`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
          const err = await res.json().catch(() => ({
              message: "Lỗi không xác định khi tải giỏ hàng.",
          }));
        throw new Error(err.message);
      }
      const data = await res.json();

        // Clamp theo tồn kho hiện tại
        const normalized = data.map((it) => {
            const avail = getAvailableQty(it);
            const safeQty = Math.max(0, Math.min(Number(it.quantity || 1), avail));
            return {...it, quantity: safeQty};
        });

        setCart(normalized);
        setSelectedItems(normalized.map((item) => item.id)); // mặc định chọn tất cả
      setError("");
    } catch (e) {
      console.error(e);
      setError(e.message || "Không thể tải giỏ hàng.");
    }
  }, []);

  const saveCartToAPI = async (cartItemId, newQty) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Vui lòng đăng nhập để cập nhật giỏ hàng.");
      return false;
    }
    try {
        const res = await fetch(`${Constants.DOMAIN_API}/api/cart/update/${cartItemId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({quantity: newQty}),
        });
      if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (err?.code === "insufficient_stock") {
              enqueueSnackbar(err.message || "Vượt quá tồn kho.", {variant: "error"});
          }
          throw new Error(err?.message || "Cập nhật giỏ thất bại.");
      }
      setSuccess("Cập nhật số lượng thành công!");
      setTimeout(() => setSuccess(""), 3000);
      return true;
    } catch (e) {
      console.error(e);
      setError(e.message || "Cập nhật thất bại.");
      return false;
    }
  };

  const deleteCartToAPI = async (cartItemId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Vui lòng đăng nhập để xóa sản phẩm.");
      return false;
    }
    try {
        const res = await fetch(`${Constants.DOMAIN_API}/api/cart/${cartItemId}`, {
            method: "DELETE",
            headers: {Authorization: `Bearer ${token}`},
        });
      if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || "Xóa thất bại.");
      }
      setSuccess("Xóa sản phẩm thành công!");
      setTimeout(() => setSuccess(""), 3000);
      return true;
    } catch (e) {
      console.error(e);
      setError(e.message || "Xóa thất bại.");
      return false;
    }
  };

  const checkLoginStatus = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          setUserInfo({
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
          });
          return;
        }
      } catch {
      }
      localStorage.removeItem("authToken");
      setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    setIsLoggedIn(false);
    setUserInfo(null);
    setCart([]);
    setSelectedItems([]);
  }, []);

  useEffect(() => {
    checkLoginStatus();
    if (localStorage.getItem("authToken")) {
      getCartFromAPI();
    }
  }, [checkLoginStatus, getCartFromAPI]);

  const handleQuantityChange = async (id, action) => {
    const updated = cart.map((item) => {
        if (item.id !== id) return item;
        const max = getMaxQuantity(item);
        let qty = Number(item.quantity) || 1;

        if (action === "increase") {
            if (qty >= max) {
                enqueueSnackbar(`Chỉ còn ${max} sản phẩm trong kho.`, {variant: "warning"});
                return item;
            }
            qty++;
        }
        if (action === "decrease" && qty > 1) {
            qty--;
        }
        return {...item, quantity: qty};
    });

    const item = updated.find((i) => i.id === id);
    if (item && (await saveCartToAPI(id, item.quantity))) {
      setCart(updated);
    }
  };

    /* ====== Popup xác nhận xóa (thay cho snackbar hỏi-đáp) ====== */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const askRemoveItem = (id) => {
        setPendingDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmRemoveItem = async () => {
        if (!pendingDeleteId) return;
        const ok = await deleteCartToAPI(pendingDeleteId);
        if (ok) {
            setCart((prev) => prev.filter((i) => i.id !== pendingDeleteId));
            setSelectedItems((sel) => sel.filter((x) => x !== pendingDeleteId));
        }
        setShowDeleteModal(false);
        setPendingDeleteId(null);
    };

    const cancelRemoveItem = () => {
        setShowDeleteModal(false);
        setPendingDeleteId(null);
  };

  const toggleSelectItem = (id) =>
      setSelectedItems((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));

  const toggleSelectAll = () =>
      setSelectedItems((sel) => (sel.length === cart.length ? [] : cart.map((i) => i.id)));

  const calculateTotal = () =>
    cart.reduce((sum, item) => {
      if (selectedItems.includes(item.id) && item.variation?.price) {
        return sum + item.variation.price * item.quantity;
      }
      return sum;
    }, 0);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    if (selectedItems.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }
    const selected = cart.filter((i) => selectedItems.includes(i.id));
      const violated = selected.filter((i) => i.quantity > getAvailableQty(i));
      if (violated.length > 0) {
          const names = violated.map((i) => i.variation?.name || "Sản phẩm").join(", ");
          setError(`Một số sản phẩm vượt quá tồn kho: ${names}. Vui lòng điều chỉnh.`);
          enqueueSnackbar("Có sản phẩm vượt quá tồn kho, vui lòng điều chỉnh.", {
              variant: "warning",
          });
          return;
      }
    navigate("/oder", { state: { cartItems: selected, userInfo } });
  };

    /* =============== RENDER =============== */
  const renderCartContent = () => {
    if (!isLoggedIn) {
      return (
        <Alert variant="warning" className="text-center">
          Vui lòng <Link to="/login">đăng nhập</Link> để xem giỏ hàng của bạn.
        </Alert>
      );
    }
    if (cart.length === 0) {
      return (
        <Alert variant="info" className="cart-empty-alert">
          Giỏ hàng của bạn đang trống.
          <br />
          <Link to="/">Tiếp tục mua sắm</Link>
        </Alert>
      );
    }

    return (
      <Row>
        <Col lg={8}>
          <div className="cart-items-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Sản phẩm trong giỏ</h4>
                <Button variant="outline-primary" size="sm" onClick={toggleSelectAll}>
                    {selectedItems.length === cart.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </Button>
            </div>
            <Table responsive hover className="cart-table align-middle">
              <thead>
                <tr>
                  <th>
                    <Form.Check
                        checked={selectedItems.length === cart.length && cart.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                    <th>Hình ảnh</th>
                    <th>Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th className="text-center">Số lượng</th>
                  <th>Thành tiền</th>
                  <th>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Form.Check
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                      />
                    </td>

                      {/* Cột HÌNH ẢNH */}
                      <td style={{width: 80}}>
                          <img
                              src={item.variation?.image_url || "https://placehold.co/70"}
                              alt={item.variation?.name || "product"}
                              className="product-image"
                              style={{width: 70, height: 70, objectFit: "cover", borderRadius: 8}}
                          />
                      </td>

                      {/* Cột TÊN SẢN PHẨM */}
                      <td>
                          <Link to={`/product/${item.variation?.product_id}`}>
                              {item.variation?.name || item.variation?.value || "Sản phẩm không tên"}
                          </Link>
                    </td>

                    <td>
                        <strong>{formatVND(item.variation?.price ?? item.price)}</strong>
                    </td>

                    <td className="text-center">
                      <div className="quantity-controls">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleQuantityChange(item.id, "decrease")}
                          disabled={item.quantity <= 1}
                          title={item.quantity <= 1 ? "Tối thiểu 1" : "Giảm số lượng"}
                        >
                            <FaMinus/>
                        </Button>
                          <span className="quantity-display">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleQuantityChange(item.id, "increase")}
                          disabled={item.quantity >= getMaxQuantity(item)}
                          title={
                              item.quantity >= getMaxQuantity(item)
                                  ? "Đã đạt tối đa tồn kho"
                                  : "Tăng số lượng"
                          }
                        >
                          <FaPlus />
                        </Button>
                      </div>
                    </td>

                    <td>
                        <strong>
                            {formatVND((item.variation?.price || 0) * (item.quantity || 0))}
                        </strong>
                    </td>

                      <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="delete-btn"
                        onClick={() => askRemoveItem(item.id)}
                        title="Xóa sản phẩm khỏi giỏ"
                      >
                          <FaTrashAlt/>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>

        <Col lg={4}>
          <div className="cart-summary">
            <h3 className="summary-title">Tóm tắt đơn hàng</h3>
            <div className="summary-row">
              <span>Tạm tính ({selectedItems.length} sản phẩm)</span>
                <span>{formatVND(calculateTotal())}</span>
            </div>
            <div className="summary-row">
              <span>Phí giao hàng</span>
              <span>Miễn phí</span>
            </div>
            <div className="summary-row summary-total">
              <span>Tổng cộng</span>
                <span className="total-price">{formatVND(calculateTotal())}</span>
            </div>
            <Button
              size="lg"
              className="checkout-btn mt-3"
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
            >
              Tiến hành thanh toán
            </Button>
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <div className="cart-page-wrapper">
        <SoftBlueCSS/>
      <Container>
        <h2 className="cart-title text-center">Giỏ Hàng Của Bạn</h2>
        {success && (
          <Alert variant="success" onClose={() => setSuccess("")} dismissible>
            {success}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        {renderCartContent()}

          {/* ===== Popup xác nhận xóa (Soft Blue) ===== */}
          <RBModal
              show={showDeleteModal}
              onHide={cancelRemoveItem}
              centered
              dialogClassName="modal-soft-blue"
              backdrop="static"
              keyboard={false}
          >
              <RBModal.Header closeButton>
                  <RBModal.Title>Xác nhận xóa</RBModal.Title>
              </RBModal.Header>
              <RBModal.Body>
                  <p>Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?</p>
              </RBModal.Body>
              <RBModal.Footer>
                  <RBButton variant="secondary" onClick={cancelRemoveItem}>
                      Đóng
                  </RBButton>
                  <RBButton variant="primary" onClick={confirmRemoveItem}>
                      Đồng ý xóa
                  </RBButton>
              </RBModal.Footer>
          </RBModal>
      </Container>
    </div>
  );
};

export default CartPage;
