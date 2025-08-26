import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Constanst from "../../../Constanst";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { SnackbarProvider } from "notistack";
import { useSnackbar } from "notistack";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await axios.post(
        `${Constanst.DOMAIN_API}/api/login`,
        data,
        { headers: { "Content-Type": "application/json" } }
      );

      const token = response.data?.token;
      if (token) {
        localStorage.setItem("authToken", token);
        const decodedToken = jwtDecode(token);

        sessionStorage.setItem("userId", decodedToken.id);
        sessionStorage.setItem("userRole", decodedToken.role);

        if (decodedToken.role === 1) {
          navigate("/admin");
        } else {
          navigate("/");
        }

        window.location.reload(); // reload để cập nhật UI
      } else {
        setServerError(response.data.message || "Không nhận được token.");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleSuccess = async (response) => {
    const { credential } = response;
    try {
      const res = await axios.post(`${Constanst.DOMAIN_API}/api/login-google`, {
        tokenGoogle: credential,
      });
      localStorage.setItem("authToken", res.data.token);
      console.log(res.data.token); // Phải là chuỗi JWT
      // alert(res.data.message || "Đăng nhập Google thành công!");
      enqueueSnackbar(res.data.message, { variant: "success" });
      window.location.href = "/";
    } catch (err) {
      console.error("Lỗi đăng nhập Google:", err);
      alert(
        err?.response?.data?.message ||
          "Đăng nhập Google thất bại, vui lòng thử lại!"
      );
      enqueueSnackbar(
        err?.response?.data?.message ||
          "Đăng nhập Google thất bại, vui lòng thử lại!",
        { variant: "error" }
      );
    }
  };
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div className="card p-4 shadow-lg border-0 rounded-3">
              <h3 className="mb-4 text-center fw-bold">Đăng nhập</h3>
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
                    placeholder="Nhập địa chỉ email"
                    {...register("email", {
                      required: "Email không được để trống",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Email không hợp lệ",
                      },
                    })}
                    disabled={isLoading}
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
                    placeholder="Nhập mật khẩu"
                    {...register("password", {
                      required: "Mật khẩu không được để trống",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu ít nhất 6 ký tự",
                      },
                    })}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password.message}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <a href="/forgot-password" className="text-decoration-none">
                    Quên mật khẩu?
                  </a>
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
                      ></span>
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </form>
              <div className="d-flex flex-column justify-content-center mt-3 mx-auto">
                <GoogleOAuthProvider clientId="174189579193-5an9p6b13u20aeut0qdhkrudiflha8gk.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => {
                      console.log("Login Failed");
                    }}
                    useOneTap={false}
                    text="signin_with"
                    shape="pill"
                    theme="outline"
                    size="large"
                    width="300"
                  />
                </GoogleOAuthProvider>
              </div>

              <p className="mt-4 text-center">
                Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
