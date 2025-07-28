import React, {useEffect, useState, useCallback} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Alert, Button, Container, Form, InputGroup, Spinner} from 'react-bootstrap'; // Thêm InputGroup
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

    // States cho mã giảm giá
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);
    const [discountError, setDiscountError] = useState('');
    const [discountSuccess, setDiscountSuccess] = useState('');

    // State cho tổng tiền
    const [orderSummary, setOrderSummary] = useState({
        subtotal: 0,
        discount: 0,
        total: 0
    });

    // Hàm tính toán giảm giá để sử dụng ở nhiều nơi
    const calculateDiscount = useCallback((subtotal, discount) => {
        if (!discount) return 0;
        
        let discountAmount = 0;
        
        if (discount.discount_type === 'percent') {
            // Giảm giá theo phần trăm
            discountAmount = subtotal * (discount.discount_value / 100);
            
            // Kiểm tra giới hạn giảm giá tối đa nếu có
            if (discount.max_discount_value && discountAmount > discount.max_discount_value) {
                discountAmount = discount.max_discount_value;
            }
        } else if (discount.discount_type === 'fixed') {
            // Giảm giá cố định
            discountAmount = discount.discount_value;
        }
        
        // Đảm bảo số tiền giảm giá không âm và không lớn hơn tổng tiền
        return Math.min(Math.max(0, discountAmount), subtotal);
    }, []);

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

    // Tính toán tổng tiền khi cartItems hoặc appliedDiscount thay đổi
    useEffect(() => {
        if (cartItems && cartItems.length > 0) {
            try {
                // Tính tổng tiền trước khi áp dụng giảm giá
                const subtotal = cartItems.reduce((total, item) => {
                    const priceToUse = item.variation?.price || item.product?.price || item.price || 0;
                    return total + priceToUse * item.quantity;
                }, 0);

                console.log('Subtotal before discount:', subtotal);

                // Tính số tiền giảm giá sử dụng hàm calculateDiscount
                const discountAmount = calculateDiscount(subtotal, appliedDiscount);
                console.log('Calculated discount amount:', discountAmount);

                // Tính tổng tiền sau khi áp dụng giảm giá
                const total = subtotal - discountAmount;
                console.log('Final total after discount:', total);

                // Làm tròn số tiền để tránh sai số thập phân
                const roundedSubtotal = Math.round(subtotal);
                const roundedDiscount = Math.round(discountAmount);
                const roundedTotal = Math.round(total);
                
                console.log('Rounded values:', {
                    subtotal: roundedSubtotal,
                    discount: roundedDiscount,
                    total: roundedTotal
                });

                // Cập nhật state với các giá trị đã làm tròn
                setOrderSummary({
                    subtotal: roundedSubtotal,
                    discount: roundedDiscount,
                    total: roundedTotal
                });
            } catch (error) {
                console.error('Error calculating order summary:', error);
            }
        }
    }, [cartItems, appliedDiscount, calculateDiscount]);

    // Hàm kiểm tra và áp dụng mã giảm giá
    const handleApplyDiscount = async () => {
        // Reset các thông báo
        setDiscountError('');
        setDiscountSuccess('');
        
        if (!discountCode.trim()) {
            setDiscountError('Vui lòng nhập mã giảm giá');
            return;
        }

        setIsCheckingDiscount(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setDiscountError('Vui lòng đăng nhập để áp dụng mã giảm giá');
                setIsCheckingDiscount(false);
                return;
            }

            // Tính tổng giá trị đơn hàng hiện tại
            const orderValue = cartItems.reduce((total, item) => {
                const priceToUse = item.variation?.price || item.product?.price || item.price || 0;
                return total + priceToUse * item.quantity;
            }, 0);

            console.log('Checking discount code:', discountCode, 'for order value:', orderValue);

            const response = await fetch(`${Constanst.DOMAIN_API}/api/discounts/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: discountCode,
                    orderValue
                })
            });

            const data = await response.json();
            console.log('Discount API response:', data);

            if (response.ok) {
                // Tính toán giảm giá trực tiếp tại đây
                let discountAmount = 0;
                if (data.discount_type === 'percent') {
                    discountAmount = orderValue * (data.discount_value / 100);
                    if (data.max_discount_value && discountAmount > data.max_discount_value) {
                        discountAmount = data.max_discount_value;
                    }
                } else if (data.discount_type === 'fixed') {
                    discountAmount = data.discount_value;
                }
                
                // Cập nhật trực tiếp orderSummary
                const roundedDiscount = Math.round(discountAmount);
                const roundedTotal = Math.round(orderValue - discountAmount);
                
                setOrderSummary({
                    subtotal: Math.round(orderValue),
                    discount: roundedDiscount,
                    total: roundedTotal
                });
                
                setAppliedDiscount(data);
                setDiscountSuccess(`Đã áp dụng mã giảm giá: ${data.description || discountCode}. Bạn tiết kiệm ${roundedDiscount.toLocaleString()} VNĐ!`);
                
                // Hiển thị thông tin giảm giá trong console để debug
                console.log('Applied discount directly:', {
                    subtotal: Math.round(orderValue),
                    discount: roundedDiscount,
                    total: roundedTotal
                });
            } else {
                setDiscountError(data.error || 'Mã giảm giá không hợp lệ');
                setAppliedDiscount(null);
            }
        } catch (err) {
            console.error('Lỗi khi kiểm tra mã giảm giá:', err);
            setDiscountError('Có lỗi xảy ra khi kiểm tra mã giảm giá');
            setAppliedDiscount(null);
        } finally {
            setIsCheckingDiscount(false);
        }
    };

    // Hàm hủy mã giảm giá đã áp dụng
    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        setDiscountSuccess('');
        setDiscountError('');
    };

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
                variationId: item.variation?.id || null, // Lấy variationId nếu có
                quantity: item.quantity,
                price: item.variation?.price || item.product?.price || item.price // Ưu tiên giá biến thể
            })),
            name,
            phone,
            address,
            payment_id: parseInt(paymentMethod),
            // payment_status: 0 nếu COD, 1 nếu thanh toán trực tuyến (VNPay/MoMo)
            payment_status: parseInt(paymentMethod) === 1 ? 0 : 1,
            status: 1, // Trạng thái mặc định khi đặt hàng (chờ xác nhận)
            // Thêm thông tin giảm giá nếu có
            discount_id: appliedDiscount ? appliedDiscount.id : null,
            discount_amount: orderSummary.discount || 0,
            total_amount: orderSummary.total || 0
        };

        console.log('Submitting order with data:', orderData);

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
                const vnp_Amount = orderSummary.total * 100; // Sử dụng tổng tiền đã trừ giảm giá
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
                const momoAmount = orderSummary.total; // Sử dụng tổng tiền đã trừ giảm giá

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

                {/* Phần mã giảm giá */}
                <div className="discount-section mb-4">
                    <h4>Mã giảm giá</h4>
                    {discountError && <Alert variant="danger">{discountError}</Alert>}
                    {discountSuccess && <Alert variant="success">{discountSuccess}</Alert>}
                    
                    {!appliedDiscount ? (
                        <InputGroup className="mb-3">
                            <Form.Control
                                placeholder="Nhập mã giảm giá"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                disabled={isCheckingDiscount}
                            />
                            <Button 
                                variant="outline-secondary" 
                                onClick={handleApplyDiscount}
                                disabled={isCheckingDiscount}
                            >
                                {isCheckingDiscount ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        <span className="ms-1">Đang kiểm tra...</span>
                                    </>
                                ) : "Áp dụng"}
                            </Button>
                        </InputGroup>
                    ) : (
                        <div className="applied-discount p-3 border rounded mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="mb-1">{appliedDiscount.code}</h5>
                                    <p className="mb-0 text-muted">{appliedDiscount.description}</p>
                                    <p className="mb-0">
                                        {appliedDiscount.discount_type === 'percent' 
                                            ? `Giảm ${appliedDiscount.discount_value}%` 
                                            : `Giảm ${appliedDiscount.discount_value.toLocaleString()} VNĐ`}
                                        {appliedDiscount.max_discount_value && appliedDiscount.discount_type === 'percent' &&
                                            ` (tối đa ${appliedDiscount.max_discount_value.toLocaleString()} VNĐ)`}
                                    </p>
                                    <p className="mb-0 text-success">
                                        <strong>Tiết kiệm: {orderSummary.discount.toLocaleString()} VNĐ</strong>
                                    </p>
                                </div>
                                <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={handleRemoveDiscount}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tổng kết đơn hàng */}
                <div className="order-summary p-3 border rounded mb-4">
                    <h4>Tổng kết đơn hàng</h4>
                    <div className="d-flex justify-content-between mb-2">
                        <span>Tổng tiền hàng:</span>
                        <span>{orderSummary.subtotal.toLocaleString()} VNĐ</span>
                    </div>
                    {appliedDiscount && (
                        <div className="d-flex justify-content-between mb-2 text-success">
                            <span><strong>Giảm giá:</strong></span>
                            <span><strong>
                                {appliedDiscount.discount_type === 'percent' 
                                    ? `${appliedDiscount.discount_value}% (${orderSummary.discount.toLocaleString()} VNĐ)` 
                                    : `${orderSummary.discount.toLocaleString()} VNĐ`}
                            </strong></span>
                        </div>
                    )}
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                        <span>Tổng thanh toán:</span>
                        <span className="text-danger fs-5">{orderSummary.total.toLocaleString()} VNĐ</span>
                    </div>
                    {appliedDiscount && (
                        <div className="text-center mt-2 p-2 bg-light">
                            <p className="mb-0 text-success">
                                <strong>Bạn đã tiết kiệm: {orderSummary.discount.toLocaleString()} VNĐ!</strong>
                            </p>
                        </div>
                    )}
                </div>

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