import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Alert, Button, Form} from 'react-bootstrap';
import Constanst from '../../../Constanst';

const OrderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems, userInfo } = location.state || {};
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(1); // 1 = COD
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('authToken');
            if (!token || !userInfo?.id) return;

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
            }
        };

        fetchUserInfo();
    }, [userInfo]);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!name || !phone || !address) {
            setError('Vui lòng nhập đầy đủ thông tin giao hàng.');
            setIsSubmitting(false);
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            setError('Giỏ hàng của bạn đang trống. Không thể đặt hàng.');
            setIsSubmitting(false);
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token || !userInfo?.id) {
            setError('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
            setIsSubmitting(false);
            navigate('/login', { state: { from: '/order' } });
            return;
        }

        const validItems = cartItems.filter(item => item.id && item.quantity > 0);

        if (validItems.length === 0) {
            setError('Danh sách sản phẩm không hợp lệ. Vui lòng kiểm tra giỏ hàng.');
            setIsSubmitting(false);
            return;
        }

        const orderData = {
            user_id: userInfo.id,
            items: validItems.map(item => ({
                productId: item.product?.id || item.product_id,
                quantity: item.quantity,
                price: item.product?.price || item.price
            })),
            name,
            phone,
            address,
            payment_id: parseInt(paymentMethod),
            payment_status: parseInt(paymentMethod) === 1 ? 0 : 1,
            status: 1
        };

        try {
            if (paymentMethod === 1) {
                // COD
                const res = await fetch(`${Constanst.DOMAIN_API}/api/orders/checkout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(orderData),
                });

                if (res.ok) {
                    await fetch(`${Constanst.DOMAIN_API}/api/cart/clear`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    localStorage.removeItem('cart');
                    alert("Đặt hàng thành công!");
                    navigate('/order-history');
                } else {
                    const result = await res.json();
                    setError(result.message || "Có lỗi xảy ra khi đặt hàng.");
                }
            } else if (paymentMethod === 2) {
                const vnp_Amount = validItems.reduce((total, item) => {
                    const price = item.product?.price || item.price || 0;
                    return total + price * item.quantity;
                }, 0) * 100; // VNPay dùng đơn vị là đồng ×100 (vd: 10.000đ → 1.000.000)

                const vnp_TxnRef = `ORDER_${Date.now()}`; // Mã giao dịch, chồng có thể tuỳ ý tạo

                const res = await fetch(`${Constanst.DOMAIN_API}/api/create-qr`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...orderData,
                        vnp_Amount,
                        vnp_TxnRef
                    }),
                });

                const result = await res.json();
                if (res.ok && result) {
                    window.location.href = result;
                } else {
                    setError(result.message || "Không thể tạo thanh toán VNPay.");
                }
            }

        } catch (err) {
            console.error("Order error:", err);
            setError("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                </Form.Group>

                <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang đặt hàng..." : "Hoàn tất đặt hàng"}
                </Button>
                <Button variant="secondary" className="ms-2" onClick={() => navigate('/cart')}>
                    Quay lại giỏ hàng
                </Button>
            </Form>
        </div>
    );
};

export default OrderPage;
