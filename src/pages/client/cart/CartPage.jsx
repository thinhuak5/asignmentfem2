import React, {useCallback, useEffect, useState} from "react";
import {Alert, Button, Form, Table} from "react-bootstrap";
import Constanst from "../../../Constanst";
import {useNavigate} from "react-router-dom";
import {FaMinus, FaPlus, FaTrashAlt} from "react-icons/fa";
import {jwtDecode} from "jwt-decode";

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  const getCartFromAPI = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const response = await fetch(`${Constanst.DOMAIN_API}/api/cart`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const cartData = await response.json();
          setCart(cartData);
          if (cartData.length > 0) {
            setSelectedItems(cartData.map((item) => item.id));
          }
        } else {
          throw new Error("Không thể tải giỏ hàng");
        }
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng từ API:", error);
        setError("Không thể tải giỏ hàng.");
      }
    } else {
      setCart([]);
      setSelectedItems([]); // Clear selection if not logged in
    }
  }, []);

  const saveCartToAPI = async (cartItemId, newQuantity) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Không có token xác thực.");
      return;
    }

    try {
      const response = await fetch(
        `${Constanst.DOMAIN_API}/api/cart/update/${cartItemId}`, // <-- Use cartItemId
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: newQuantity }), // <-- Only send quantity
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error saving cart:", errorData);
        throw new Error("Cập nhật giỏ hàng thất bại");
      }
      console.log("Giỏ hàng đã được cập nhật thành công");
    } catch (error) {
      console.error("Lỗi khi lưu giỏ hàng:", error);
      setError("Không thể lưu giỏ hàng.");
    }
  };

  const deleteCartToAPI = async (cartItemId) => {
    // <-- Accept cartItemId
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Không có token xác thực.");
      return;
    }
    try {
      const response = await fetch(
        `${Constanst.DOMAIN_API}/api/cart/${cartItemId}`, // <-- Use cartItemId
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
      console.log("Sản phẩm đã được xóa khỏi giỏ hàng thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
      setError("Không thể xóa sản phẩm khỏi giỏ hàng.");
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
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUserInfo(null);
        localStorage.removeItem("authToken");
      }
    } else {
      setCart([]);
      setSelectedItems([]); // Clear selection if not logged in
    }
  }, []);

  useEffect(() => {
    // Function to fetch cart and check login status
    const fetchCartAndLogin = async () => {
      await getCartFromAPI();
      checkLoginStatus();
    };
    fetchCartAndLogin();
  }, [getCartFromAPI, checkLoginStatus]);

  useEffect(() => {
    // Function to fetch additional images if missing
    const fetchMissingProductImages = async () => {
      const updatedCart = await Promise.all(
        cart.map(async (item) => {
          // Check both variation and product to ensure correct image fetching
          if (
            !item.product?.productImages &&
            !item.product?.images &&
            (!item.variation || !item.product)
          ) {
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
          }
          return item;
        })
      );
      setCart(updatedCart);
    };

    if (
      cart.length > 0 &&
      cart.some(
        (item) =>
          !item.product?.productImages &&
          !item.product?.images &&
          (!item.variation || !item.product)
      )
    ) {
      fetchMissingProductImages();
    }
    // eslint-disable-next-line
  }, [cart]);

  // getMaxQuantity: Restrict maximum quantity based on stock of selected product or variation
  const getMaxQuantity = (item) => {
    // If there's a variation, prioritize variation quantity
    if (item.variation && typeof item.variation.quantity === "number") {
      return item.variation.quantity;
    }
    // If no variation, use main product quantity
    if (item.product && typeof item.product.quantity === "number") {
      return item.product.quantity;
    }
    // Default value if no stock information
    return 10; // Or another appropriate default value
  };

  const handleQuantityChange = (cartItemId, action) => {
    // Parameter is cartItemId (ID of the cart item)
    let newQuantity = 0; // Initialize variable to store the new quantity of the item being updated

    const updatedCart = cart.map((item) => {
      if (item.id === cartItemId) {
        // FIX LOGIC: Compare with the UNIQUE ID of the cart item
        newQuantity = item.quantity; // Get current quantity of that item
        const maxQuantity = getMaxQuantity(item);

        if (action === "increase" && newQuantity < maxQuantity) {
          newQuantity += 1;
        } else if (action === "decrease" && newQuantity > 1) {
          newQuantity -= 1;
        }
        return { ...item, quantity: newQuantity }; // Return the item with updated quantity
      }
      return item; // Return other unchanged items
    });

    // Call API to save changes only for the CHANGED ITEM
    // Find the new quantity of the item that was just updated from `updatedCart`
    const itemToUpdate = updatedCart.find((item) => item.id === cartItemId);
    if (itemToUpdate) {
      // Ensure the item is found
      saveCartToAPI(cartItemId, itemToUpdate.quantity);
    }

    setCart(updatedCart); // Update local state for immediate UI response
  };

  const removeFromCart = async (cartItemId) => {
    // Parameter is cartItemId
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
    );
    if (!confirmDelete) return;

    // Delete from API first, using cartItemId
    await deleteCartToAPI(cartItemId);

    // Then update UI, filter by cartItemId
    const updatedCart = cart.filter((item) => item.id !== cartItemId);
    setCart(updatedCart);
    setSelectedItems((prev) => prev.filter((id) => id !== cartItemId)); // Update tick
  };

  const toggleSelectItem = (cartItemId) => {
    // Parameter is cartItemId
    setSelectedItems((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length && cart.length > 0) {
      // Ensure deselect only if there are products and all are selected
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.id)); // FIX LOGIC: Use item.id to select all
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      if (selectedItems.includes(item.id)) {
        // FIX LOGIC: Compare with cart item ID
        // Prioritize variation price, if not available, use main product price
        const itemPrice = Number(
          item.variation?.price || item.product?.price || 0
        ); // FIX LOGIC: Ensure itemPrice is always a number
        return total + itemPrice * Number(item.quantity); // FIX LOGIC: Ensure quantity is also a number
      }
      return total;
    }, 0);
  };

  const handleCheckout = async () => {
    if (!isLoggedIn || !userInfo) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    const selectedCartItems = cart.filter(
      (item) => selectedItems.includes(item.id) // FIX LOGIC: Filter by cart item ID
    );

    if (selectedCartItems.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    // Map selected cart items to their unique cart IDs for clearing on backend
    const selectedCartItemIdsToClear = selectedCartItems.map((item) => item.id); // FIX LOGIC: Send selected cart item IDs

    try {
      const clearCartResponse = await fetch(
        `${Constanst.DOMAIN_API}/api/cart/clear-selected-items`, // FIX LOGIC: Endpoint for clearing by cart item ID
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedCartItemIds: selectedCartItemIdsToClear,
          }), // Send selected cart item IDs
        }
      );

      if (!clearCartResponse.ok) {
        const errorData = await clearCartResponse.json();
        console.error("Lỗi khi xóa sản phẩm đã đặt khỏi giỏ hàng:", errorData);
        setError(
          "Đã đặt hàng nhưng không thể xóa các sản phẩm đã chọn khỏi giỏ hàng. Vui lòng làm mới trang."
        );
      } else {
        console.log("Đã xóa thành công các sản phẩm đã đặt khỏi giỏ hàng.");
        await getCartFromAPI(); // Refresh cart after successful clearing
      }

      navigate("/oder", {
        state: { cartItems: selectedCartItems, userInfo: userInfo },
      });
    } catch (error) {
      console.error("Lỗi trong quá trình thanh toán:", error);
      setError(error.message || "Đã có lỗi xảy ra khi xử lý thanh toán.");
    }
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
                    {console.log("item.product", item.product)}
                    {Array.isArray(item.product?.productImages) &&
                    item.product.productImages.length > 0 ? (
                      <img
                        src={`${Constanst.DOMAIN_API}/uploads/${item.product.productImages[0].image_url}`}
                        className="product-thumbnail"
                        alt={item.product?.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "contain",
                        }}
                      />
                    ) : item.product?.images ? (
                      <img
                        src={`${Constanst.DOMAIN_API}/uploads/${
                          item.product.images.split(",")[0]
                        }`}
                        className="product-thumbnail"
                        alt={item.product?.name}
                        style={{
                          width: "100px",
                          height: "auto",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <span>Không có ảnh</span>
                    )}
                  </div>
                </td>
                <td>
                  {item.product?.name}
                  {item.variation &&
                    item.variation.value && ( // Only display variation value if it exists
                      <div style={{ fontSize: "0.9em", color: "#666" }}>
                        {item.variation.name && ` (${item.variation.name})`}{" "}
                        {/* Display variation name if exists */}
                      </div>
                    )}
                </td>
                <td>
                  {(item.variation?.price || item.product?.price) // Prioritize variation price
                    ?.toLocaleString()}{" "}
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
                  {/* Cột Thành tiền: Ưu tiên giá của biến thể, sau đó là giá của sản phẩm chính */}
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
