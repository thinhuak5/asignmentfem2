import React, { useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import emailjs from "@emailjs/browser";
import Constanst from "../../../Constanst"; // Đường dẫn tới file config của bạn
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
const Register = () => {
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm({
    defaultValues: {
      username: "",
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  useEffect(() => {
    if (queryParams.get("id")) {
      getUserInfo();
    }
  }, [queryParams]);

  const getUserInfo = async () => {
    try {
      const res = await axios.get(
        `${Constanst.DOMAIN_API}/auth/user?id=${queryParams.get("id")}`
      );
      setValue("username", res.data.data.username);
      setValue("name", res.data.data.name);
      setValue("email", res.data.data.email);
      setValue("phone", res.data.data.phone);
    } catch (e) {
      console.log("Lỗi lấy thông tin user:", e);
    }
  };

  const validateAvatar = (files) => {
    if (queryParams.get("id") && (!files || files.length === 0)) return true;
    if (!files || files.length === 0) return "Bạn phải chọn ảnh đại diện";

    const maxSize = 1024 * 1024 * 15; // 15MB
    const types = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    for (let file of files) {
      if (!types.includes(file.type))
        return "Ảnh không đúng định dạng (jpg, jpeg, png, webp, gif)";
      if (file.size > maxSize)
        return `Kích thước ảnh "${file.name}" quá lớn (tối đa 15MB)`;
    }
    return true;
  };

  const handleRegister = async (data) => {
    try {
      let formData = new FormData();
      formData.append("username", data.username);
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("password", data.password);

      if (data.avatar && data.avatar.length > 0) {
        formData.append("avatar", data.avatar[0]);
      }

      if (queryParams.get("id")) {
        // Chức năng cập nhật user (chưa triển khai)
        alert("Chức năng cập nhật chưa hỗ trợ trong ví dụ này.");
        return;
      }

      // Gửi dữ liệu đăng ký lên backend
      const res = await axios.post(
        `${Constanst.DOMAIN_API}/api/register`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(res.data.message || "Đăng ký thành công!");

      // Gửi mail chào mừng qua EmailJS
      const templateParams = {
        to_name: data.name || data.username,
        to_email: data.email,
      };

      try {
        await emailjs.send(
          "service_j7ecpgl",
          "template_hzhlkpf",
          templateParams,
          "eI2hATDjbArRM5Snh"
        );
        alert("mail chào mừng gửi thành công");
        console.log("Mail chào mừng đã được gửi thành công");
      } catch (mailError) {
        console.error("Lỗi gửi mail chào mừng:", mailError);
        alert(
          "Đăng ký thành công, nhưng gửi mail chào mừng thất bại. Vui lòng thử lại sau."
        );
      }

      navigate("/login");
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      if (err.response) {
        alert(
          `Đăng ký thất bại: ${
            err.response.data.message || "Có lỗi xảy ra từ server"
          }`
        );
      } else if (err.request) {
        alert("Đăng ký thất bại: Không thể kết nối đến server.");
      } else {
        alert(`Đăng ký thất bại: ${err.message}`);
      }
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
      alert(res.data.message || "Đăng nhập Google thành công!");
      window.location.href = "/";
    } catch (err) {
      console.error("Lỗi đăng nhập Google:", err);
      alert(
        err?.response?.data?.message ||
          "Đăng nhập Google thất bại, vui lòng thử lại!"
      );
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card p-4 shadow-lg border-0 rounded-3">
              <h3 className="mb-4 text-center fw-bold">
                {queryParams.get("id")
                  ? "Cập nhật thông tin"
                  : "Đăng ký tài khoản"}
              </h3>
              <form onSubmit={handleSubmit(handleRegister)}>
                {/* Username */}
                <div className="mb-3 text-start">
                  <label htmlFor="username" className="form-label">
                    Tên đăng nhập <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.username ? "is-invalid" : ""
                    }`}
                    id="username"
                    placeholder="Nhập tên đăng nhập"
                    {...register("username", {
                      required: "Vui lòng nhập tên đăng nhập",
                      minLength: {
                        value: 3,
                        message: "Tên đăng nhập tối thiểu 3 ký tự",
                      },
                    })}
                  />
                  {errors.username && (
                    <div className="invalid-feedback">
                      {errors.username.message}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="mb-3 text-start">
                  <label htmlFor="name" className="form-label">
                    Họ và Tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    id="name"
                    placeholder="Nhập họ và tên"
                    {...register("name", {
                      required: "Vui lòng nhập họ và tên",
                    })}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">
                      {errors.name.message}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="mb-3 text-start">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="email"
                    placeholder="Nhập địa chỉ email"
                    {...register("email", {
                      required: "Vui lòng nhập email",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Địa chỉ email không hợp lệ",
                      },
                    })}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email.message}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="mb-3 text-start">
                  <label htmlFor="phone" className="form-label">
                    Số điện thoại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${
                      errors.phone ? "is-invalid" : ""
                    }`}
                    id="phone"
                    placeholder="Nhập số điện thoại"
                    {...register("phone", {
                      required: "Vui lòng nhập số điện thoại",
                      pattern: {
                        value:
                          /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    })}
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">
                      {errors.phone.message}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="mb-3 text-start">
                  <label htmlFor="password" className="form-label">
                    Mật khẩu <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    id="password"
                    placeholder="Nhập mật khẩu"
                    {...register("password", {
                      required: {
                        value: !queryParams.get("id"),
                        message: "Vui lòng nhập mật khẩu",
                      },
                      minLength: {
                        value: 6,
                        message: "Mật khẩu tối thiểu 6 ký tự",
                      },
                    })}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password.message}
                    </div>
                  )}
                  {queryParams.get("id") && (
                    <small className="form-text text-muted">
                      Để trống nếu không muốn thay đổi mật khẩu.
                    </small>
                  )}
                </div>

                {/* Avatar */}
                <div className="mb-4">
                  <label htmlFor="avatar" className="form-label">
                    Ảnh đại diện
                  </label>
                  <input
                    type="file"
                    className={`form-control ${
                      errors.avatar ? "is-invalid" : ""
                    }`}
                    id="avatar"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    {...register("avatar", {
                      validate: (files) => validateAvatar(files),
                    })}
                  />
                  {errors.avatar && (
                    <div className="invalid-feedback">
                      {errors.avatar.message}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button type="submit" className="btn btn-primary w-100 btn-lg">
                  {queryParams.get("id") ? "Cập nhật" : "Đăng ký"}
                </button>
              </form>
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
              {!queryParams.get("id") && (
                <p className="mt-3 text-center">
                  Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
