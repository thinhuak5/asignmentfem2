import React, {useCallback, useEffect, useState} from "react";
import {Alert, Button, Form, Table} from "react-bootstrap";
import Constants from "../../../Constanst";
import {Link, useNavigate} from "react-router-dom";
import {FaMinus, FaPlus, FaTrashAlt} from "react-icons/fa";
import {jwtDecode} from "jwt-decode";

const CartPage = () => {
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
            headers: {Authorization: `Bearer ${token}`},
      });
        if (!res.ok) {
            const err = await res.json().catch(() => ({message: "Lỗi"}));
            throw new Error(err.message);
      }
        const data = await res.json();
        setCart(data);
        setSelectedItems(data.map((item) => item.id));
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
                body: JSON.stringify({quantity: newQty}),
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
        const res = await fetch(`${Constants.DOMAIN_API}/api/cart/${cartItemId}`, {
            method: "DELETE",
            headers: {Authorization: `Bearer ${token}`},
        });
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
      getCartFromAPI();
  }, [checkLoginStatus, getCartFromAPI]);

  const getMaxQuantity = (item) => {
      return item.variation && typeof item.variation.quantity === "number"
          ? item.variation.quantity
          : 10;
  };

    const handleQuantityChange = async (id, action) => {
        const updated = cart.map((item) => {
            if (item.id === id) {
                let qty = item.quantity;
                const max = getMaxQuantity(item);
                if (action === "increase" && qty < max) qty++;
                if (action === "decrease" && qty > 1) qty--;
                return {...item, quantity: qty};
      }
      return item;
    });
        const item = updated.find((i) => i.id === id);
        if (item && (await saveCartToAPI(id, item.quantity))) {
            setCart(updated);
    }
  };

    const removeFromCart = async (id) => {
        if (!window.confirm("Xóa sản phẩm này?")) return;
        if (await deleteCartToAPI(id)) {
            setCart(cart.filter((i) => i.id !== id));
            setSelectedItems((sel) => sel.filter((x) => x !== id));
    }
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
          setError("Vui lòng chọn ít nhất một sản phẩm.");
      return;
    }
      const selected = cart.filter((i) => selectedItems.includes(i.id));
      navigate("/oder", {state: {cartItems: selected, userInfo}});
  };

  const renderCartItems = () => {
    if (cart.length === 0) {
        return <Alert variant="info">Giỏ hàng trống.</Alert>;
    }
    return (
      <>
        <Button
          className="mb-2"
          variant={selectedItems.length === cart.length ? "secondary" : "info"}
          onClick={toggleSelectAll}
        >
            {selectedItems.length === cart.length
                ? "Bỏ chọn tất cả"
                : "Chọn tất cả"}
        </Button>

        <Table responsive hover className="align-middle">
          <thead>
            <tr>
              <th>Chọn</th>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
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
                <td>
                    {item.variation?.image_url ? (
                        <img
                            src={item.variation.image_url}
                            alt={item.variation.name}
                            style={{
                                width: 60,
                                height: 60,
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <span>Không có ảnh</span>
                    )}
                </td>
                <td>
                    <Link to={`/product/${item.variation?.product_id}`} className="fw-semibold">
                        {item.variation?.name || item.variation?.value || "Không có tên"}
                  </Link>
                </td>
                <td>
                    {item.variation?.price
                        ? item.variation.price.toLocaleString()
                        : item.price?.toLocaleString()} VNĐ
                </td>
                <td className="text-center">
                  <Button
                      size="sm"
                    variant="outline-danger"
                    onClick={() => handleQuantityChange(item.id, "decrease")}
                    disabled={item.quantity <= 1}
                  >
                    <FaMinus />
                  </Button>
                    <span style={{margin: "0 10px"}}>{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleQuantityChange(item.id, "increase")}
                    disabled={item.quantity >= getMaxQuantity(item)}
                  >
                    <FaPlus />
                  </Button>
                </td>
                <td>
                    {(item.variation?.price * item.quantity).toLocaleString()} VNĐ
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <FaTrashAlt />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="text-end">
                <strong>Tổng cộng:</strong>
              </td>
              <td>
                <strong>{calculateTotal().toLocaleString()} VNĐ</strong>
              </td>
                <td/>
            </tr>
          </tfoot>
        </Table>
      </>
    );
  };

  return (
    <div className="container mt-4 pb-5 min-vh-100 d-flex flex-column">
      <h2 className="mb-4 text-center">Giỏ Hàng Của Bạn</h2>
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
      <div className="flex-grow-1">{renderCartItems()}</div>
      {cart.length > 0 && (
          <div className="text-center mt-4">
              <Button size="lg" variant="success" onClick={handleCheckout}>
            {isLoggedIn ? "Tiến hành thanh toán" : "Đăng nhập để thanh toán"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
