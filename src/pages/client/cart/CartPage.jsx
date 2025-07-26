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
      const response = await fetch(`${Constants.DOMAIN_API}/api/cart`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => ({message: "Lỗi không xác định"}));
        throw new Error(errorData.message || "Không thể tải giỏ hàng.");
      }

      const cartData = await response.json();
      setCart(cartData);
      if (cartData.length > 0) {
        setSelectedItems(cartData.map((item) => item.id));
      }
      setError("");
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng từ API:", error);
      setError(error.message || "Không thể tải giỏ hàng.");
    }
  }, []);

  const saveCartToAPI = async (cartItemId, newQuantity) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Vui lòng đăng nhập để cập nhật giỏ hàng.");
      return false;
    }

    try {
      const response = await fetch(
          `${Constants.DOMAIN_API}/api/cart/update/${cartItemId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({quantity: newQuantity}),
          }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật giỏ hàng thất bại.");
      }

      setSuccess("Cập nhật số lượng thành công!");
      setTimeout(() => setSuccess(""), 3000);
      return true;
    } catch (error) {
      console.error("Lỗi khi lưu giỏ hàng:", error);
      setError(error.message || "Không thể cập nhật giỏ hàng.");
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
      const response = await fetch(
          `${Constants.DOMAIN_API}/api/cart/${cartItemId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Xóa sản phẩm khỏi giỏ hàng thất bại."
        );
      }

      setSuccess("Xóa sản phẩm khỏi giỏ hàng thành công!");
      setTimeout(() => setSuccess(""), 3000);
      return true;
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
      setError(error.message || "Không thể xóa sản phẩm khỏi giỏ hàng.");
      return false;
    }
  };

  const checkLoginStatus = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          setUserInfo({
            id: decodedToken.id,
            name: decodedToken.name,
            email: decodedToken.email,
            role: decodedToken.role,
            phone: decodedToken.phone || null,
          });
        } else {
          setIsLoggedIn(false);
          setUserInfo(null);
          localStorage.removeItem("authToken");
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUserInfo(null);
        localStorage.removeItem("authToken");
        setError("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
      setCart([]);
      setSelectedItems([]);
    }
  }, []);

  useEffect(() => {
    const fetchCartAndLogin = async () => {
      checkLoginStatus();
      await getCartFromAPI();
    };
    fetchCartAndLogin();
  }, [getCartFromAPI, checkLoginStatus]);

  const getMaxQuantity = (item) => {
    if (item.variation && typeof item.variation.quantity === "number") {
      return item.variation.quantity;
    }
    if (item.product && typeof item.product.quantity === "number") {
      return item.product.quantity;
    }
    return 10; // Default value
  };

  const handleQuantityChange = async (cartItemId, action) => {
    let newQuantity = 0;
    const updatedCart = cart.map((item) => {
      if (item.id === cartItemId) {
        newQuantity = item.quantity;
        const maxQuantity = getMaxQuantity(item);
        if (action === "increase" && newQuantity < maxQuantity) {
          newQuantity += 1;
        } else if (action === "decrease" && newQuantity > 1) {
          newQuantity -= 1;
        }
        return {...item, quantity: newQuantity};
      }
      return item;
    });

    const itemToUpdate = updatedCart.find((item) => item.id === cartItemId);
    if (itemToUpdate) {
      const success = await saveCartToAPI(cartItemId, itemToUpdate.quantity);
      if (success) {
        setCart(updatedCart);
      }
    }
  };

  const removeFromCart = async (cartItemId) => {
    const confirmDelete = window.confirm(
        "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
    );
    if (!confirmDelete) return;

    const success = await deleteCartToAPI(cartItemId);
    if (success) {
      const updatedCart = cart.filter((item) => item.id !== cartItemId);
      setCart(updatedCart);
      setSelectedItems((prev) => prev.filter((id) => id !== cartItemId));
    }
  };

  const toggleSelectItem = (cartItemId) => {
    setSelectedItems((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length && cart.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.id));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      if (selectedItems.includes(item.id)) {
        const itemPrice = Number(
            item.variation?.price || item.product?.price || 0
        );
        return total + itemPrice * Number(item.quantity);
      }
      return total;
    }, 0);
  };

  const handleCheckout = () => {
    if (!isLoggedIn || !userInfo) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    const selectedCartItems = cart.filter((item) =>
        selectedItems.includes(item.id)
    );
    if (selectedCartItems.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    navigate("/oder", {
      state: {
        cartItems: selectedCartItems,
        userInfo: userInfo,
      },
    });
  };

  const renderCartItems = () => {
    if (cart.length === 0) {
      return <Alert variant="info">Giỏ hàng của bạn đang trống.</Alert>;
    }

    return (
      <>
        <Button
            variant={
              selectedItems.length === cart.length && cart.length > 0
                  ? "secondary"
                  : "info"
            }
          className="mb-2"
          onClick={toggleSelectAll}
        >
          {selectedItems.length === cart.length && cart.length > 0
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
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelectItem(item.id)}
                  />
                </td>
                <td>
                  <div className="product">
                    {item.product?.image_url ? (
                      <img
                          src={item.product.image_url}
                        className="product-thumbnail"
                        alt={item.product?.name}
                        style={{
                          width: "60px",
                          height: "60px",
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
                      to={`/product/${item.product?.id || item.product_id}`}
                      className="text-decoration-none fw-semibold"
                  >
                    {item.product?.name || `Sản phẩm ID: ${item.product_id}`}
                  </Link>

                  {item.variation && item.variation.value && (
                      <div style={{fontSize: "0.9em", color: "#666"}}>
                        {item.variation.name && ` (${item.variation.name})`}
                      </div>
                  )}
                </td>

                <td>
                  {(
                      item.variation?.price || item.product?.price
                  )?.toLocaleString()}{" "}
                  VNĐ
                </td>
                <td className="text-center">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, "decrease")}
                    disabled={item.quantity <= 1}
                    style={{
                      marginRight: "5px",
                      borderRadius: "15px",
                      padding: "10px 15px",
                    }}
                  >
                    <FaMinus />
                  </Button>
                  <span
                      style={{
                        margin: "0 10px",
                        minWidth: "20px",
                        display: "inline-block",
                      }}
                  >
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, "increase")}
                    disabled={item.quantity >= getMaxQuantity(item)}
                    style={{
                      marginLeft: "5px",
                      borderRadius: "15px",
                      padding: "10px 15px",
                    }}
                  >
                    <FaPlus />
                  </Button>
                </td>
                <td>
                  {(
                      (item.variation?.price || item.product?.price) *
                      item.quantity
                  )?.toLocaleString() || "N/A"}{" "}
                  VNĐ
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    style={{ borderRadius: "15px", padding: "10px 15px" }}
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
              <td></td>
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
        <div className="text-center mt-4 mb-4">
          <Button variant="success" size="lg" onClick={handleCheckout}>
            {isLoggedIn ? "Tiến hành thanh toán" : "Đăng nhập để thanh toán"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
