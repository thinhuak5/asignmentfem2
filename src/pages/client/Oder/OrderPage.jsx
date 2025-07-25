import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Alert, Button, Container, Form, Spinner} from 'react-bootstrap'; // Thêm Spinner và Container
import Constanst from '../../../Constanst';

const OrderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Giả định cartItems sẽ bao gồm thông tin product và variation nếu có
    const { cartItems, userInfo } = location.state || {};
    
    // States cho thông tin giao hàng
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    
    // State cho phương thức thanh toán
    const [paymentMethod, setPaymentMethod] = useState(1); // 1 = COD
    
    // States cho UI feedback
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true); // Thêm state loading cho user info

    // useEffect để fetch thông tin người dùng khi component mount hoặc userInfo thay đổi
    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('authToken');
            if (!token || !userInfo?.id) {
                // Nếu không có token hoặc userInfo, dừng fetch và set loading false
                setIsLoadingUserInfo(false);
                return;
            }

            try {
                const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${userInfo.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setName(data.name || '');
                    setPhone(data.phone || '');
                    setAddress(data.address || '');
                } else {
                    console.warn('Không thể lấy thông tin người dùng.');
                }
            } catch (err) {
                console.error('Lỗi khi lấy thông tin người dùng:', err);
            } finally {
                setIsLoadingUserInfo(false); // Dù thành công hay thất bại, set loading false
            }
        };

        fetchUserInfo();
    }, [userInfo]); // Depend on userInfo to refetch if it changes (e.g., after login)

    // Hàm xử lý khi đặt hàng
    const handlePlaceOrder = async (e) => {
        e.preventDefault(); // Ngăn chặn hành vi submit mặc định của form
        setError(''); // Reset lỗi
        setIsSubmitting(true); // Bắt đầu trạng thái submit

        // Kiểm tra thông tin giao hàng
        if (!name || !phone || !address) {
            setError('Vui lòng nhập đầy đủ thông tin giao hàng.');
            setIsSubmitting(false);
            return;
        }

        // Kiểm tra giỏ hàng
        if (!cartItems || cartItems.length === 0) {
            setError('Giỏ hàng của bạn đang trống. Không thể đặt hàng.');
            setIsSubmitting(false);
            return;
        }

        // Kiểm tra token và user info
        const token = localStorage.getItem('authToken');
        if (!token || !userInfo?.id) {
            setError('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
            setIsSubmitting(false);
            navigate('/login', { state: { from: '/order' } });
            return;
        }

        // Lọc các sản phẩm hợp lệ trong giỏ hàng
        // Giả định cartItem có các trường như: { id, quantity, product_id, variation_id, product { ... }, variation { ... } }
        const validItems = cartItems.filter(item => 
            (item.product?.id || item.product_id) && item.quantity > 0
        );

        if (validItems.length === 0) {
            setError('Danh sách sản phẩm không hợp lệ. Vui lòng kiểm tra giỏ hàng.');
            setIsSubmitting(false);
            return;
        }

        // Chuẩn bị dữ liệu đặt hàng
        const orderData = {
            user_id: userInfo.id,
            items: validItems.map(item => ({
                productId: item.product?.id || item.product_id, // Lấy productId
                // --- THÊM variationId VÀO ĐÂY ---
                variationId: item.variation?.id || null, // Lấy variationId nếu có
                // ---------------------------------
                quantity: item.quantity,
                // --- ĐẢM BẢO LẤY GIÁ CỦA BIẾN THỂ NẾU CÓ ---
                price: item.variation?.price || item.product?.price || item.price // Ưu tiên giá biến thể
                // ------------------------------------------
            })),
            name,
            phone,
            address,
            payment_id: parseInt(paymentMethod),
            // payment_status: 0 nếu COD, 1 nếu thanh toán trực tuyến (VNPay/MoMo)
            payment_status: parseInt(paymentMethod) === 1 ? 0 : 1,
            status: 1 // Trạng thái mặc định khi đặt hàng (chờ xác nhận)
        };

        try {
            if (paymentMethod === 1) {
                // Xử lý thanh toán COD
                const res = await fetch(`${Constanst.DOMAIN_API}/api/orders/checkout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(orderData),
                });

                if (res.ok) {
                    // Xóa giỏ hàng sau khi đặt thành công (trên server và client)
                    await fetch(`${Constanst.DOMAIN_API}/api/cart/clear-selected-items`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            selectedCartItemIds: validItems.map((item) => item.id),
                        }),
                    });

                    localStorage.removeItem('cart'); // Xóa giỏ hàng trong localStorage

                    // Thông báo và chuyển hướng
                    alert("Đặt hàng thành công!");
                    navigate('/order-history?message=success'); // Chuyển hướng với query param
                } else {
                    const result = await res.json();
                    setError(result.message || "Có lỗi xảy ra khi đặt hàng COD.");
                }
            } else if (paymentMethod === 2) {
                // Xử lý thanh toán VNPay
                const vnp_Amount = validItems.reduce((total, item) => {
                    // Lấy giá ưu tiên biến thể cho tổng tiền
                    const priceToUse = item.variation?.price || item.product?.price || item.price || 0;
                    return total + priceToUse * item.quantity;
                }, 0) * 100; // VNPay sử dụng đơn vị "đồng ×100" (vd: 10.000đ → 1.000.000)

                const vnp_TxnRef = `ORDER_${Date.now()}_${userInfo.id}`; // Mã giao dịch duy nhất

                const res = await fetch(`${Constanst.DOMAIN_API}/api/create-qr`, { // Hoặc API tạo URL VNPay
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...orderData, // Gửi cả dữ liệu đơn hàng để backend có thể lưu tạm
                        vnp_Amount,
                        vnp_TxnRef
                    }),
                });

                const result = await res.json();
                if (res.ok && result) {
                    // Lưu lại cartItemIds để xử lý sau khi thanh toán thành công
                    sessionStorage.setItem("vnp_cart_item_ids", JSON.stringify(validItems.map(item => item.id)));
                    sessionStorage.setItem("vnp_pending", "true");
                    window.location.href = result;
                } else {
                    setError(result.message || "Không thể tạo thanh toán VNPay.");
                }
            } else if (paymentMethod === 3) {
                // Xử lý thanh toán MoMo
                const momoAmount = validItems.reduce((total, item) => {
                    // Lấy giá ưu tiên biến thể cho tổng tiền
                    const priceToUse = item.variation?.price || item.product?.price || item.price || 0;
                    return total + priceToUse * item.quantity;
                }, 0);

                const res = await fetch(`${Constanst.DOMAIN_API}/api/payments/momo`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...orderData, // Gửi cả dữ liệu đơn hàng để backend có thể lưu tạm
                        amount: momoAmount,
                        orderId: `ORDER_${Date.now()}_${userInfo.id}` // Mã giao dịch MoMo
                    }),
                });

                const result = await res.json();

                if (res.ok && result.payUrl) {
                    // Chuyển hướng đến URL thanh toán MoMo
                    window.location.href = result.payUrl;
                } else {
                    setError(result.message || "Không thể tạo thanh toán MoMo.");
                }
            }


        } catch (err) {
            console.error("Order error:", err);
            setError("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false); // Kết thúc trạng thái submit
        }
    };

    // Hiển thị spinner trong khi tải thông tin người dùng
    if (isLoadingUserInfo) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Đang tải thông tin...</span>
                </Spinner>
                <p>Đang tải thông tin người dùng...</p>
            </Container>
        );
    }

    return (
        <div className="container mt-4">
            <h2>Thông Tin Giao Hàng</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handlePlaceOrder}>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Tên người nhận</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nhập tên người nhận"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPhone">
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formAddress">
                    <Form.Label>Địa chỉ giao hàng</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Nhập địa chỉ chi tiết"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Phương thức thanh toán</Form.Label>
                    <Form.Check
                        type="radio"
                        id="cod"
                        label="Thanh toán khi nhận hàng (COD)"
                        name="paymentMethod"
                        value={1}
                        checked={paymentMethod === 1}
                        onChange={(e) => setPaymentMethod(parseInt(e.target.value))}
                    />
                    <Form.Check
                        type="radio"
                        id="vnpay"
                        label="Thanh toán VNPay (ATM, QR Code...)"
                        name="paymentMethod"
                        value={2}
                        checked={paymentMethod === 2}
                        onChange={(e) => setPaymentMethod(parseInt(e.target.value))}
                    />
                    <Form.Check
                        type="radio"
                        id="momo"
                        label="Thanh toán MoMo"
                        name="paymentMethod"
                        value={3}
                        checked={paymentMethod === 3}
                        onChange={(e) => setPaymentMethod(parseInt(e.target.value))}
                    />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Đang đặt hàng...
                        </>
                    ) : (
                        "Hoàn tất đặt hàng"
                    )}
                </Button>
                <Button variant="secondary" className="ms-2" onClick={() => navigate('/cartpage')}>
                    Quay lại giỏ hàng
                </Button>
            </Form>
        </div>
    );
};

export default OrderPage;