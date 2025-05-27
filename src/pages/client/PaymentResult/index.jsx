// src/pages/PaymentResult.jsx
import {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';

const PaymentResult = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const status = params.get('status');

    useEffect(() => {
        if (status === 'success') {
            alert("Thanh toán VNPay thành công!");
            localStorage.removeItem('cart');
            navigate('/order-history');
        } else {
            alert("Thanh toán thất bại hoặc bị huỷ!");
            navigate('/cart');
        }
    }, [status, navigate]);

    return null;
};

export default PaymentResult;
