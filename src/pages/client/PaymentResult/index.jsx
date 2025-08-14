// src/pages/PaymentResult.jsx
import {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import Constanst from '../../../Constanst';

const PaymentResult = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const status = params.get('status');

    useEffect(() => {
        if (status === 'success') {
            // xóa giỏ hàng khi thanh toán thành công
            const token = localStorage.getItem("authToken");
            const cartItemIds = JSON.parse(sessionStorage.getItem("pending_cart_item_ids") || "[]");
            
            if (cartItemIds.length > 0) {
                fetch(`${Constanst.DOMAIN_API}/api/cart/clear-selected-items`, {
                    method: "POST",
                    headers: { 
                        Authorization: `Bearer ${token}`, 
                        "Content-Type": "application/json" 
                    },
                    body: JSON.stringify({ selectedCartItemIds: cartItemIds }),
                }).then(() => {
                    sessionStorage.removeItem("pending_cart_item_ids");
                    localStorage.removeItem('cart');
                }).catch(err => {
                    console.error("Error clearing cart:", err);
                });
            } else {
                localStorage.removeItem('cart');
            }
            
            alert("Thanh toán VNPay thành công!");
            navigate('/order-history?message=success');
        } else {
            alert("Thanh toán thất bại hoặc bị huỷ!");
            // Don't clear cart if payment failed
            sessionStorage.removeItem("pending_cart_item_ids");
            navigate('/cart');
        }
    }, [status, navigate]);

    return null;
};

export default PaymentResult;
