import React, {useState} from "react";
import axios from "axios";
import {useForm} from "react-hook-form";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import Constanst from "../../../Constanst";

export default function AdminChangePassword() {
    const {register, handleSubmit, formState: {errors}, watch} = useForm();
    const [serverError, setServerError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const password = watch("password");

    const onSubmit = async (data) => {
        if (!token) {
            setServerError("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
            return;
        }
        setIsLoading(true);
        setServerError(null);
        setSuccessMessage(null);
        try {
            const res = await axios.post(
                `${Constanst.DOMAIN_API}/api/reset-password`,
                {password: data.password, token},
                {headers: {"Content-Type": "application/json"}}
            );
            setSuccessMessage(res.data?.message || "Đổi mật khẩu thành công");
            setTimeout(() => navigate("/admin-login"), 2000);
        } catch (err) {
            setServerError(err?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-5 col-xl-4">
                            <div className="card p-4 shadow-lg border-0 rounded-3">
                                <div className="alert alert-danger">Link đặt lại mật khẩu không hợp lệ hoặc đã hết
                                    hạn.
                                </div>
                                <p className="text-center mt-3">
                                    <Link to="/admin/forgot-password" className="btn btn-primary">Yêu cầu link
                                        mới</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5 col-xl-4">
                        <div className="card p-4 shadow-lg border-0 rounded-3">
                            <h3 className="mb-4 text-center fw-bold">Đặt lại mật khẩu (Quản trị)</h3>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {serverError && <div className="alert alert-danger">{serverError}</div>}
                                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                                <div className="mb-3 text-start">
                                    <label className="form-label">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                        placeholder="Nhập mật khẩu mới"
                                        {...register("password", {
                                            required: "Mật khẩu không được để trống",
                                            minLength: {value: 6, message: "Mật khẩu ít nhất 6 ký tự"},
                                        })}
                                        disabled={isLoading}
                                    />
                                    {errors.password &&
                                        <div className="invalid-feedback">{errors.password.message}</div>}
                                </div>

                                <div className="mb-4 text-start">
                                    <label className="form-label">Xác nhận mật khẩu</label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                                        placeholder="Nhập lại mật khẩu mới"
                                        {...register("confirmPassword", {
                                            required: "Vui lòng xác nhận mật khẩu",
                                            validate: (v) => v === password || "Mật khẩu không khớp",
                                        })}
                                        disabled={isLoading}
                                    />
                                    {errors.confirmPassword &&
                                        <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
                                </div>

                                <button className="btn btn-primary w-100" disabled={isLoading}>
                                    {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                                </button>
                            </form>

                            <p className="mt-4 text-center">
                                <Link to="/admin-login" className="text-decoration-none">Quay lại đăng nhập quản
                                    trị</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
