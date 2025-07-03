import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import Constanst from "../../../Constanst";

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [serverError, setServerError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [cooldown, setCooldown] = useState(0);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const onSubmit = async (data) => {
        if (cooldown > 0) {
            setServerError(`Vui lòng đợi ${cooldown} giây trước khi thử lại.`);
            return;
        }

        setIsLoading(true);
        setServerError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post(
                `${Constanst.DOMAIN_API}/api/forgot-password`,
                data,
                { headers: { 'Content-Type': 'application/json' } }
            );
            setSuccessMessage(response.data.message);
            setCooldown(60); 

        } catch (err) {
            if (err.response?.status === 429) {
                setCooldown(3600);
                setServerError(err.response.data.message);
            } else if (err.response?.data?.message) {
                setServerError(err.response.data.message);
            } else {
                setServerError("Có lỗi xảy ra. Vui lòng thử lại sau.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5 col-xl-4">
                        <div className="card p-4 shadow-lg border-0 rounded-3">
                            <h3 className="mb-4 text-center fw-bold">Quên mật khẩu</h3>
                            <p className="text-center text-muted mb-4">
                                Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
                            </p>
                            
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {serverError && (
                                    <div className="alert alert-danger">{serverError}</div>
                                )}
                                {successMessage && (
                                    <div className="alert alert-success">{successMessage}</div>
                                )}

                                <div className="mb-4 text-start">
                                    <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
                                    <input
                                        id="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        placeholder="Nhập địa chỉ email"
                                        {...register("email", {
                                            required: "Email không được để trống",
                                            pattern: {
                                                value: /^\S+@\S+$/i,
                                                message: "Email không hợp lệ"
                                            }
                                        })}
                                        disabled={isLoading || cooldown > 0}
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100 btn-lg" 
                                    disabled={isLoading || cooldown > 0}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Đang xử lý...
                                        </>
                                    ) : cooldown > 0 ? (
                                        `Thử lại sau ${cooldown} giây`
                                    ) : (
                                        "Gửi yêu cầu"
                                    )}
                                </button>
                            </form>

                            <p className="mt-4 text-center">
                                <Link to="/login" className="text-decoration-none">Quay lại đăng nhập</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
