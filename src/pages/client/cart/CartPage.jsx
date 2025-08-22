import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import Constants from "../../../Constanst";
import { Link, useNavigate } from "react-router-dom";
import { FaMinus, FaPlus, FaTrashAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import "../../../assets/css/CartPage.css";
import { useSnackbar } from "notistack";
const CartPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

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
        const err = await res
          .json()
          .catch(() => ({ message: "Lỗi không xác định khi tải giỏ hàng." }));
        throw new Error(err.message);
      }
      const data = await res.json();
      setCart(data);
      setSelectedItems(data.map((item) => item.id)); // Mặc định chọn tất cả
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
      const res = await fetch(
        `${Constants.DOMAIN_API}/api/cart/update/${cartItemId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: newQty }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
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
      const res = await fetch(
        `${Constants.DOMAIN_API}/api/cart/${cartItemId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
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
        /* Bỏ qua lỗi decode */
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

  const getMaxQuantity = (item) => item.variation?.quantity ?? 10;

  const handleQuantityChange = async (id, action) => {
    const updated = cart.map((item) => {
      if (item.id === id) {
        let qty = item.quantity;
        const max = getMaxQuantity(item);
        if (action === "increase" && qty < max) qty++;
        if (action === "decrease" && qty > 1) qty--;
        return { ...item, quantity: qty };
      }
      return item;
    });
    const item = updated.find((i) => i.id === id);
    if (item && (await saveCartToAPI(id, item.quantity))) {
      setCart(updated);
    }
  };

  const removeFromCart = async (id) => {
  enqueueSnackbar("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?", {
    variant: "warning",
    autoHideDuration: 3000,
    action: (key) => (
      <>
        <button
          onClick={async () => {
            if (await deleteCartToAPI(id)) {
              setCart((prev) => prev.filter((i) => i.id !== id));
              setSelectedItems((sel) => sel.filter((x) => x !== id));
              enqueueSnackbar("Đã xóa sản phẩm khỏi giỏ hàng!", {
                variant: "success",
              });
            } else {
              enqueueSnackbar("Xóa thất bại, thử lại sau!", {
                variant: "error",
              });
            }
            closeSnackbar(key);
          }}
          style={{
            background: "#f44336",
            border: "none",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "8px",
          }}
        >
          Có
        </button>
        <button
          onClick={() => closeSnackbar(key)}
          style={{
            background: "#9e9e9e",
            border: "none",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "8px",
          }}
        >
          Không
        </button>
      </>
    ),
  });
};


  const toggleSelectItem = (id) =>
    setSelectedItems((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );
  const toggleSelectAll = () =>
    setSelectedItems((sel) =>
      sel.length === cart.length ? [] : cart.map((i) => i.id)
    );

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
    navigate("/oder", { state: { cartItems: selected, userInfo } });
  };

  // --- PHẦN RENDER GIAO DIỆN MỚI ---
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
              <Button
                variant="outline-primary"
                size="sm"
                onClick={toggleSelectAll}
              >
                {selectedItems.length === cart.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </Button>
            </div>
            <Table responsive hover className="cart-table align-middle">
              <thead>
                <tr>
                  <th>
                    <Form.Check
                      readOnly
                      checked={
                        selectedItems.length === cart.length && cart.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th colSpan={2}>Sản phẩm</th>
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
                    <td colSpan={2}>
                      <div className="product-info">
                        <img
                          src={
                            item.variation?.image_url ||
                            "https://placehold.co/70"
                          }
                          alt={item.variation?.name}
                          className="product-image"
                        />
                        <div className="product-name">
                          <Link to={`/product/${item.variation?.product_id}`}>
                            {item.variation?.name ||
                              item.variation?.value ||
                              "Sản phẩm không tên"}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>
                        {(item.variation?.price ?? item.price).toLocaleString()}
                        đ
                      </strong>
                    </td>
                    <td className="text-center">
                      <div className="quantity-controls">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() =>
                            handleQuantityChange(item.id, "decrease")
                          }
                          disabled={item.quantity <= 1}
                        >
                          {" "}
                          <FaMinus />{" "}
                        </Button>
                        <span className="quantity-display">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            handleQuantityChange(item.id, "increase")
                          }
                          disabled={item.quantity >= getMaxQuantity(item)}
                        >
                          {" "}
                          <FaPlus />
                        </Button>
                      </div>
                    </td>
                    <td>
                      <strong>
                        {(
                          item.variation?.price * item.quantity
                        ).toLocaleString()}
                        đ
                      </strong>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="delete-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        {" "}
                        <FaTrashAlt />{" "}
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
              <span>{calculateTotal().toLocaleString()}đ</span>
            </div>
            <div className="summary-row">
              <span>Phí giao hàng</span>
              <span>Miễn phí</span>
            </div>
            <div className="summary-row summary-total">
              <span>Tổng cộng</span>
              <span className="total-price">
                {calculateTotal().toLocaleString()}đ
              </span>
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
      </Container>
    </div>
  );
};

export default CartPage;
