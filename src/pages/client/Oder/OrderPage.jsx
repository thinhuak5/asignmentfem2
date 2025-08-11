import React, {useCallback, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Alert, Button, Col, Container, Form, InputGroup, Row, Spinner} from "react-bootstrap";
import Constanst from "../../../Constanst";
import '../../../assets/css/OrderPage.css';

const OrderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {cartItems, userInfo} = location.state || {cartItems: [], userInfo: null};
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState(1);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);
    const [discountError, setDiscountError] = useState("");
    const [discountSuccess, setDiscountSuccess] = useState("");
    const [orderSummary, setOrderSummary] = useState({subtotal: 0, discount: 0, total: 0});

    const calculateDiscount = useCallback((subtotal, discount) => {
        if (!discount) return 0;
        let discountAmount = 0;
        if (discount.discount_type === "percent") {
            discountAmount = subtotal * (discount.discount_value / 100);
            if (discount.max_discount_value && discountAmount > discount.max_discount_value) {
                discountAmount = discount.max_discount_value;
            }
        } else if (discount.discount_type === "fixed") {
            discountAmount = discount.discount_value;
        }
        return Math.min(Math.max(0, discountAmount), subtotal);
    }, []);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem("authToken");
            if (!token || !userInfo?.id) {
                setIsLoadingUserInfo(false);
                return;
            }
            try {
                const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${userInfo.id}`, {headers: {Authorization: `Bearer ${token}`}});
                if (res.ok) {
                    const data = await res.json();
                    setName(data.name || "");
                    setPhone(data.phone || "");
                    setAddress(data.address || "");
                }
            } catch (err) {
                console.error("Lỗi khi lấy thông tin người dùng:", err);
            } finally {
                setIsLoadingUserInfo(false);
            }
        };
        fetchUserInfo();
    }, [userInfo]);

    useEffect(() => {
        if (cartItems && cartItems.length > 0) {
            const subtotal = cartItems.reduce((total, item) => (total + (item.variation?.price || 0) * item.quantity), 0);
            const discountAmount = calculateDiscount(subtotal, appliedDiscount);
            const total = subtotal - discountAmount;
            setOrderSummary({
                subtotal: Math.round(subtotal),
                discount: Math.round(discountAmount),
                total: Math.round(total)
            });
        }
    }, [cartItems, appliedDiscount, calculateDiscount]);

    const handleApplyDiscount = async () => {
        setDiscountError("");
        setDiscountSuccess("");
        if (!discountCode.trim()) {
            setDiscountError("Vui lòng nhập mã giảm giá");
            return;
        }
        setIsCheckingDiscount(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setDiscountError("Vui lòng đăng nhập");
                setIsCheckingDiscount(false);
                return;
            }
            const orderValue = cartItems.reduce((total, item) => total + (item.variation?.price || 0) * item.quantity, 0);
            const response = await fetch(`${Constanst.DOMAIN_API}/api/discounts/check`, {
                method: "POST",
                headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
                body: JSON.stringify({code: discountCode, orderValue}),
            });
            const data = await response.json();
            if (response.ok) {
                setAppliedDiscount(data);
                const savedAmount = calculateDiscount(orderValue, data);
                setDiscountSuccess(`Áp dụng mã thành công! Bạn tiết kiệm ${Math.round(savedAmount).toLocaleString()}đ.`);
            } else {
                setDiscountError(data.error || "Mã giảm giá không hợp lệ");
                setAppliedDiscount(null);
            }
        } catch (err) {
            setDiscountError("Có lỗi xảy ra khi kiểm tra mã");
        } finally {
            setIsCheckingDiscount(false);
        }
    };
    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode("");
        setDiscountSuccess("");
        setDiscountError("");
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        if (!name || !phone || !address) {
            setError("Vui lòng nhập đầy đủ thông tin giao hàng.");
            setIsSubmitting(false);
            return;
        }
        if (!cartItems || cartItems.length === 0) {
            setError("Giỏ hàng trống.");
            setIsSubmitting(false);
            return;
        }
        const token = localStorage.getItem("authToken");
        if (!token || !userInfo?.id) {
            setError("Phiên đăng nhập không hợp lệ.");
            setIsSubmitting(false);
            navigate("/login");
            return;
        }
        const validItems = cartItems.filter((item) => item.variation?.id && item.quantity > 0);
        if (validItems.length === 0) {
            setError("Sản phẩm không hợp lệ.");
            setIsSubmitting(false);
            return;
        }
        const orderData = {
            user_id: userInfo.id,
            items: validItems.map((item) => ({
                variationId: item.variation.id,
                quantity: item.quantity,
                price: item.variation.price
            })),
            name, phone, address,
            payment_id: parseInt(paymentMethod),
            payment_status: parseInt(paymentMethod) === 1 ? 0 : 1, status: 1,
            discount_id: appliedDiscount?.id || null,
            discount_amount: orderSummary.discount || 0,
            total_amount: orderSummary.total || 0,
        };

        try {
            let redirectUrl = null;
            let responseData;

            if (paymentMethod === 1) { // COD
                const res = await fetch(`${Constanst.DOMAIN_API}/api/orders/checkout`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
                    body: JSON.stringify(orderData),
                });
                responseData = await res.json();
                if (!res.ok) throw new Error(responseData.message || "Lỗi đặt hàng COD");
            } else if (paymentMethod === 2) { // VNPay
                const res = await fetch(`${Constanst.DOMAIN_API}/api/create-qr`, {
                    method: "POST", headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
                    body: JSON.stringify({
                        ...orderData,
                        vnp_Amount: orderSummary.total * 100,
                        vnp_TxnRef: `ORDER_${Date.now()}`
                    }),
                });
                responseData = await res.json();
                if (!res.ok || !responseData) throw new Error(responseData.message || "Lỗi tạo thanh toán VNPay");
                redirectUrl = responseData;
            } else if (paymentMethod === 3) { // MoMo
                const res = await fetch(`${Constanst.DOMAIN_API}/api/payments/momo`, {
                    method: "POST", headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
                    body: JSON.stringify({...orderData, amount: orderSummary.total, orderId: `ORDER_${Date.now()}`}),
                });
                responseData = await res.json();
                if (!res.ok || !responseData.payUrl) throw new Error(responseData.message || "Lỗi tạo thanh toán MoMo");
                redirectUrl = responseData.payUrl;
            }

            // Xóa các sản phẩm đã chọn khỏi giỏ hàng
            await fetch(`${Constanst.DOMAIN_API}/api/cart/clear-selected-items`, {
                method: "POST", headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
                body: JSON.stringify({selectedCartItemIds: validItems.map((item) => item.id)}),
            });
            localStorage.removeItem("cart"); // Xóa giỏ hàng local cũ nếu có

            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                alert("Đặt hàng thành công!");
                navigate("/order-history?status=success");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    // --- KẾT THÚC KHỐI LOGIC ---

    // Spinner khi tải
    if (isLoadingUserInfo) {
        return <Container className="text-center mt-5 p-5"><Spinner animation="border"/> <p className="mt-2">Đang tải
            thông tin...</p></Container>;
    }
    // Chuyển hướng nếu không có sản phẩm
    if (!cartItems || cartItems.length === 0) {
        return <Container className="text-center mt-5 p-5"><Alert variant="warning">Không có sản phẩm để thanh toán.
            Quay về <Alert.Link href="/cartpage">giỏ hàng</Alert.Link>.</Alert></Container>;
    }

    // --- PHẦN RENDER GIAO DIỆN MỚI ---
    return (
        <div className="order-page-wrapper">
            <Container>
                <h1 className="text-center page-title">Hoàn Tất Đơn Hàng</h1>
                {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
                <Form onSubmit={handlePlaceOrder}>
                    <Row>
                        {/* Cột trái: Thông tin & Thanh toán */}
                        <Col lg={7} className="info-column">
                            <div className="info-section">
                                <h3 className="section-title">Thông tin giao hàng</h3>
                                <Row>
                                    <Col md={12}><Form.Group className="mb-3"><Form.Label>Tên người
                                        nhận</Form.Label><Form.Control type="text" value={name}
                                                                       onChange={(e) => setName(e.target.value)}
                                                                       required/></Form.Group></Col>
                                    <Col md={12}><Form.Group className="mb-3"><Form.Label>Số điện
                                        thoại</Form.Label><Form.Control type="tel" value={phone}
                                                                        onChange={(e) => setPhone(e.target.value)}
                                                                        required/></Form.Group></Col>
                                    <Col md={12}><Form.Group className="mb-3"><Form.Label>Địa chỉ giao hàng</Form.Label><Form.Control
                                        as="textarea" rows={3} value={address}
                                        onChange={(e) => setAddress(e.target.value)} required/></Form.Group></Col>
                                </Row>
                            </div>
                            <div className="info-section">
                                <h3 className="section-title">Phương thức thanh toán</h3>
                                <div className="payment-options">
                                    {/* COD */}
                                    <div className={`payment-option ${paymentMethod === 1 ? 'active' : ''}`}
                                         onClick={() => setPaymentMethod(1)}>
                                        <Form.Check type="radio" id="cod" name="paymentMethod"
                                                    checked={paymentMethod === 1} readOnly/>
                                        <div className="payment-option-label"><strong>Thanh toán khi nhận hàng
                                            (COD)</strong><small>Trả tiền mặt trực tiếp cho shipper khi nhận
                                            hàng.</small></div>
                                    </div>
                                    {/* VNPay */}
                                    <div className={`payment-option ${paymentMethod === 2 ? 'active' : ''}`}
                                         onClick={() => setPaymentMethod(2)}>
                                        <Form.Check type="radio" id="vnpay" name="paymentMethod"
                                                    checked={paymentMethod === 2} readOnly/>
                                        <div className="payment-option-label"><strong>Ví điện tử VNPay</strong><small>Thanh
                                            toán bằng QR Code, thẻ ATM nội địa, thẻ quốc tế.</small></div>
                                    </div>
                                    {/* MoMo */}
                                    <div className={`payment-option ${paymentMethod === 3 ? 'active' : ''}`}
                                         onClick={() => setPaymentMethod(3)}>
                                        <Form.Check type="radio" id="momo" name="paymentMethod"
                                                    checked={paymentMethod === 3} readOnly/>
                                        <div className="payment-option-label"><strong>Ví điện tử MoMo</strong><small>Quét
                                            mã QR để thanh toán bằng ứng dụng MoMo.</small></div>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* Cột phải: Tóm tắt đơn hàng */}
                        <Col lg={5} className="summary-column">
                            <div className="summary-section">
                                <h3 className="section-title">Tóm Tắt Đơn Hàng</h3>
                                <div className="product-summary-list">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="product-summary-item">
                                            <img src={item.variation?.image_url || 'https://placehold.co/60'}
                                                 alt={item.variation?.name} className="product-summary-image"/>
                                            <div className="product-summary-details">
                                                <p className="product-summary-name mb-0">{item.variation?.name || "Sản phẩm"}</p>
                                                <small className="product-summary-meta">Số
                                                    lượng: {item.quantity}</small>
                                            </div>
                                            <p className="product-summary-price mb-0">{(item.variation.price * item.quantity).toLocaleString()}đ</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="discount-box">
                                    {discountSuccess && <Alert variant="success" size="sm">{discountSuccess}</Alert>}
                                    {discountError && <Alert variant="danger" size="sm">{discountError}</Alert>}
                                    {!appliedDiscount ? (
                                        <InputGroup>
                                            <Form.Control placeholder="Nhập mã giảm giá" value={discountCode}
                                                          onChange={(e) => setDiscountCode(e.target.value)}
                                                          disabled={isCheckingDiscount}/>
                                            <Button variant="outline-primary" onClick={handleApplyDiscount}
                                                    disabled={isCheckingDiscount}>
                                                {isCheckingDiscount ? <Spinner size="sm"/> : "Áp dụng"}
                                            </Button>
                                        </InputGroup>
                                    ) : (
                                        <div
                                            className="applied-discount-info d-flex justify-content-between align-items-center">
                                            <div><strong>Đã áp dụng mã: {appliedDiscount.code}</strong></div>
                                            <Button variant="danger" size="sm"
                                                    onClick={handleRemoveDiscount}>Hủy</Button>
                                        </div>
                                    )}
                                </div>

                                <div className="order-totals">
                                    <div className="order-totals-row">
                                        <span>Tạm tính</span><span>{orderSummary.subtotal.toLocaleString()}đ</span>
                                    </div>
                                    {appliedDiscount && <div className="order-totals-row text-success"><strong>Giảm
                                        giá</strong><strong>-{orderSummary.discount.toLocaleString()}đ</strong></div>}
                                    <div className="order-totals-row final-total"><span>Tổng cộng</span><span
                                        className="final-price">{orderSummary.total.toLocaleString()}đ</span></div>
                                </div>
                                <div className="d-grid gap-2 mt-4">
                                    <Button type="submit" size="lg" className="place-order-btn" disabled={isSubmitting}>
                                        {isSubmitting ? <><Spinner as="span" animation="border" size="sm" role="status"
                                                                   aria-hidden="true"/> Đang xử lý...</> : "Đặt Hàng"}
                                    </Button>
                                    <Button variant="outline-secondary" onClick={() => navigate("/cartpage")}>Quay lại
                                        giỏ hàng</Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </div>
    );
};

export default OrderPage;