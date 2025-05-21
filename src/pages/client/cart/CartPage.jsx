import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Button, Form, Image, Table} from 'react-bootstrap';
import Constanst from "../../../Constanst";
import {useNavigate} from 'react-router-dom';
import {FaMinus, FaPlus, FaTrashAlt} from 'react-icons/fa';
import {jwtDecode} from 'jwt-decode';

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]); // ✅ state sản phẩm được chọn (chứa product_id)
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    const getCartFromAPI = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const response = await fetch(`${Constanst.DOMAIN_API}/api/cart`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const cartData = await response.json();
                    setCart(cartData);
                    // Mặc định chọn tất cả các sản phẩm khi tải giỏ hàng

                } else {
                    throw new Error('Không thể tải giỏ hàng');
                }
            } catch (error) {
                console.error("Lỗi khi lấy giỏ hàng từ API:", error);
                setError("Không thể tải giỏ hàng.");
            }
        } else {
            setCart([]);
            setSelectedItems([]); // Xóa lựa chọn nếu không đăng nhập
        }
    }, []);

    const saveCartToAPI = async (productId, updatedCart) => {
        const token = localStorage.getItem('authToken');
        let productUpdated = {};
        if (token) {
            try {
                // Tìm sản phẩm đã được cập nhật trong giỏ hàng mới
                updatedCart.map(item => {
                    if (item.product_id === productId) {
                        productUpdated = item;
                    }
                });
                const response = await fetch(`${Constanst.DOMAIN_API}/api/cart/update/` + productId, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({cart: productUpdated})
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error saving cart:', errorData);
                    throw new Error('Cập nhật giỏ hàng thất bại');
                }
                console.log('Giỏ hàng đã được cập nhật thành công');
            } catch (error) {
                console.error('Lỗi khi lưu giỏ hàng:', error);
                setError("Không thể lưu giỏ hàng.");
            }
        }
    };

    const deleteCartToAPI = async (productId) => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${Constanst.DOMAIN_API}/api/cart/` + productId, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Xóa sản phẩm khỏi giỏ hàng thất bại.');
            }
            console.log('Sản phẩm đã được xóa khỏi giỏ hàng thành công.');
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
            setError("Không thể xóa sản phẩm khỏi giỏ hàng.");
        }
    };

    const checkLoginStatus = useCallback(() => {
        const token = localStorage.getItem('authToken');

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
                        phone: decodedToken.phone || null
                    });
                } else {
                    setIsLoggedIn(false);
                    setUserInfo(null);
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                setIsLoggedIn(false);
                setUserInfo(null);
                localStorage.removeItem('authToken');
            }
        } else {
            setIsLoggedIn(false);
            setUserInfo(null);
        }
    }, []);

    useEffect(() => {
        getCartFromAPI();
        checkLoginStatus();
    }, [getCartFromAPI, checkLoginStatus]);

    const handleQuantityChange = (productId, action) => {
        const updatedCart = cart.map(item => {
            if (item.product_id === productId) {
                let newQuantity = item.quantity;
                if (action === 'increase' && newQuantity < 10) { // Giới hạn số lượng 10
                    newQuantity += 1;
                } else if (action === 'decrease' && newQuantity > 1) { // Giới hạn số lượng 1
                    newQuantity -= 1;
                }
                return {...item, quantity: newQuantity};
            }
            return item;
        });
        saveCartToAPI(productId, updatedCart);
        setCart(updatedCart);
    };

    const removeFromCart = async (productId) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?");
        if (!confirmDelete) return;

        // Xóa trên API trước
        await deleteCartToAPI(productId);

        // Sau đó cập nhật UI
        const updatedCart = cart.filter(item => item.product_id !== productId);
        setCart(updatedCart);
        setSelectedItems(prev => prev.filter(id => id !== productId)); // cập nhật tick
    };

    const toggleSelectItem = (productId) => {
        setSelectedItems(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === cart.length && cart.length > 0) { // Đảm bảo chỉ bỏ chọn nếu có sản phẩm và tất cả đã chọn
            setSelectedItems([]);
        } else {
            setSelectedItems(cart.map(item => item.product_id));
        }
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            if (selectedItems.includes(item.product_id)) {
                return total + (item.product.price * item.quantity);
            }
            return total;
        }, 0);
    };

    const handleCheckout = async () => { // Thêm async ở đây
        if (!isLoggedIn || !userInfo) {
            navigate('/login', {state: {from: '/cart'}});
            return;
        }

        const selectedCartItems = cart.filter(item => selectedItems.includes(item.product_id));

        if (selectedCartItems.length === 0) {
            setError("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
            return;
        }

        try {
            // Bước 1: Tiến hành tạo đơn hàng (hoặc chuyển sang trang đặt hàng)
            // Trong ví dụ này, chúng ta sẽ chuyển dữ liệu sang trang OrderPage
            // Nếu bạn có API tạo đơn hàng, hãy gọi ở đây trước.
            // Ví dụ:
            // const orderResponse = await fetch(`${Constanst.DOMAIN_API}/api/orders`, {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ items: selectedCartItems, userId: userInfo.id, /* các thông tin khác */ })
            // });
            //
            // if (!orderResponse.ok) {
            //     const errorData = await orderResponse.json();
            //     throw new Error(errorData.message || 'Đặt hàng thất bại.');
            // }

            // Nếu đơn hàng được tạo thành công (hoặc dữ liệu đã sẵn sàng để chuyển đi)
            // Bước 2: Gọi API để xóa các sản phẩm đã chọn khỏi giỏ hàng
            const clearCartResponse = await fetch(`${Constanst.DOMAIN_API}/api/cart/clear-selected`, { // <--- Endpoint mới
                method: 'POST', // Hoặc PUT, DELETE tùy theo thiết kế API của bạn
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ selectedProductIds: selectedItems }) // <--- Gửi các product_id đã chọn
            });

            if (!clearCartResponse.ok) {
                const errorData = await clearCartResponse.json();
                console.error('Lỗi khi xóa sản phẩm đã đặt khỏi giỏ hàng:', errorData);
                setError("Đã đặt hàng nhưng không thể xóa các sản phẩm đã chọn khỏi giỏ hàng. Vui lòng làm mới trang.");
                // Tùy chọn: vẫn điều hướng nếu đơn hàng đã được tạo thành công
            } else {
                console.log('Đã xóa thành công các sản phẩm đã đặt khỏi giỏ hàng.');
                // Bước 3: Sau khi xóa thành công, làm mới giỏ hàng trên UI
                await getCartFromAPI();
            }

            // Bước 4: Điều hướng đến trang đặt hàng/thanh toán với các mặt hàng đã chọn
            navigate('/oder', {
                state: {cartItems: selectedCartItems, userInfo: userInfo}
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
                    variant={selectedItems.length === cart.length && cart.length > 0 ? "secondary" : "info"}
                    className="mb-2"
                    onClick={toggleSelectAll}
                >
                    {selectedItems.length === cart.length && cart.length > 0 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
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
                                    checked={selectedItems.includes(item.product_id)}
                                    onChange={() => toggleSelectItem(item.product_id)}
                                />
                            </td>
                            <td>
                                <Image
                                    src={item.product?.images ? `${Constanst.DOMAIN_API}/uploads/${item.product.images}` : "/path/to/default-image.jpg"}
                                    alt={item.product?.name}
                                    style={{width: '100px', height: 'auto', objectFit: 'contain'}}
                                    thumbnail
                                />
                            </td>
                            <td>{item.product?.name}</td>
                            <td>{item.product?.price?.toLocaleString()} VNĐ</td>
                            <td className="text-center">
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.product_id, 'decrease')}
                                    disabled={item.quantity <= 1}
                                    style={{marginRight: '5px'}}
                                >
                                    <FaMinus/>
                                </Button>
                                <span style={{
                                    margin: '0 10px',
                                    minWidth: '20px',
                                    display: 'inline-block'
                                }}>{item.quantity}</span>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.product_id, 'increase')}
                                    disabled={item.quantity >= 10}
                                    style={{marginLeft: '5px'}}
                                >
                                    <FaPlus/>
                                </Button>
                            </td>
                            <td>{(item.product?.price * item.quantity).toLocaleString()} VNĐ</td>
                            <td>
                                <Button variant="danger" size="sm" onClick={() => removeFromCart(item.product_id)}>
                                    <FaTrashAlt/>
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan={5} className="text-end"><strong>Tổng cộng:</strong></td>
                        <td><strong>{calculateTotal().toLocaleString()} VNĐ</strong></td>
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

            {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

            <div className="flex-grow-1">
                {renderCartItems()}
            </div>

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