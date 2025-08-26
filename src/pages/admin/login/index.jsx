// src/pages/admin/login/index.jsx
import React, {useState} from "react";
import axios from "axios";
import {useForm} from "react-hook-form";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import Constanst from "../../../Constanst";

export default function AdminLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const finishAdminLogin = (token) => {
    localStorage.setItem("authToken", token); // dùng cho API (adminApi)
    sessionStorage.setItem("adminAuthed", "1"); // cờ phiên admin
    const from = location.state?.from?.pathname || "/admin";
    navigate(from, { replace: true });
    // Nếu app của bạn dựa vào token để render menu, reload để đồng bộ UI:
    window.location.reload();
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await axios.post(`${Constanst.DOMAIN_API}/api/login`, data, {
        headers: { "Content-Type": "application/json" },
      });
      const token = res?.data?.token;
      if (!token) throw new Error("Không nhận được token");

      const decoded = jwtDecode(token);
      // Chỉ cho phép role 0 (Admin) hoặc 1 (Nhân viên) vào khu vực admin
      const isAdminRole = decoded.role === 0 || decoded.role === 1;
      if (!isAdminRole) {
        setServerError("Bạn không có quyền truy cập khu vực quản trị.");
        return;
      }

      finishAdminLogin(token);
    } catch (err) {
      setServerError(
        err?.response?.data?.message ||
          err?.message ||
          "Đăng nhập thất bại. Vui lòng thử lại."
      );
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
              <h3 className="mb-4 text-center fw-bold">Đăng nhập quản trị</h3>

              <form onSubmit={handleSubmit(onSubmit)}>
                {serverError && (
                  <div className="alert alert-danger">{serverError}</div>
                )}

                <div className="mb-3 text-start">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    id="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="admin@example.com"
                    disabled={isLoading}
                    autoComplete="username"
                    {...register("email", {
                      required: "Email không được để trống",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Email không hợp lệ",
                      },
                    })}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email.message}
                    </div>
                  )}
                </div>

                <div className="mb-3 text-start">
                  <label htmlFor="password" className="form-label">
                    Mật khẩu <span className="text-danger">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    placeholder="••••••"
                    disabled={isLoading}
                    autoComplete="current-password"
                    {...register("password", {
                      required: "Mật khẩu không được để trống",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu ít nhất 6 ký tự",
                      },
                    })}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password.message}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  {/* Dùng chung flow quên mật khẩu của client */}
                    <Link to="/admin/forgot-password" className="text-decoration-none">
                    Quên mật khẩu?
                  </Link>

                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 btn-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </form>

              <p className="mt-4 text-center">
                <Link to="/">← Về trang khách</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
