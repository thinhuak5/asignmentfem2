import React, {useEffect, useState} from "react";
import axios from "axios";
import {useForm} from "react-hook-form";
import {useNavigate, useSearchParams} from "react-router-dom";
import emailjs from "@emailjs/browser";
import Constanst from "../../../Constanst";
import {GoogleLogin, GoogleOAuthProvider} from "@react-oauth/google";
import {useSnackbar} from "notistack";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();
  const [loading, setLoading] = useState(false); // ⬅️ loading state

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
    const maxSize = 1024 * 1024 * 15;
    const types = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    for (let file of files) {
      if (!types.includes(file.type)) return "Ảnh không đúng định dạng";
      if (file.size > maxSize)
        return `Kích thước ảnh "${file.name}" quá lớn (tối đa 15MB)`;
    }
    return true;
  };

  const handleRegister = async (data) => {
    setLoading(true); // ⬅️ bật loading
    try {
      let formData = new FormData();
      formData.append("username", data.username);
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);

      if (queryParams.get("id")) {
        alert("Chức năng cập nhật chưa hỗ trợ.");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        `${Constanst.DOMAIN_API}/api/register`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      enqueueSnackbar(res.data.message || "Đăng ký thành công!", {
        variant: "success",
      });

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
        enqueueSnackbar("Mail chào mừng gửi thành công!", {
          variant: "success",
        });
      } catch {
        enqueueSnackbar("Đăng ký thành công nhưng gửi mail thất bại!", {
          variant: "error",
        });
      }

      navigate("/login");
    } catch (err) {
      if (err.response) {
        enqueueSnackbar(
          err.response.data.message || "Có lỗi xảy ra từ server",
          { variant: "error" }
        );
      } else if (err.request) {
        enqueueSnackbar("Không thể kết nối đến server.", { variant: "error" });
      } else {
        enqueueSnackbar(`Lỗi: ${err.message}`, { variant: "error" });
      }
    } finally {
      setLoading(false); // ⬅️ tắt loading
    }
  };

  const handleSuccess = async (response) => {
    const { credential } = response;
    try {
      const res = await axios.post(`${Constanst.DOMAIN_API}/api/login-google`, {
        tokenGoogle: credential,
      });
      localStorage.setItem("authToken", res.data.token);
      enqueueSnackbar(res.data.message || "Đăng nhập Google thành công!", {
        variant: "success",
      });
      window.location.href = "/";
    } catch (err) {
      enqueueSnackbar(
        err?.response?.data?.message || "Đăng nhập Google thất bại!",
        { variant: "error" }
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
                <div className="mb-3">
                  <label className="form-label">Tên đăng nhập</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập tên đăng nhập"
                    {...register("username", {
                      required: "Tên đăng nhập là bắt buộc",
                    })}
                  />
                  {errors.username && (
                    <small className="text-danger">
                      {errors.username.message}
                    </small>
                  )}
                </div>

                {/* Họ và tên */}
                <div className="mb-3">
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập họ và tên"
                    {...register("name", { required: "Họ và tên là bắt buộc" })}
                  />
                  {errors.name && (
                    <small className="text-danger">{errors.name.message}</small>
                  )}
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Nhập email"
                    {...register("email", {
                      required: "Email là bắt buộc",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Email không hợp lệ",
                      },
                    })}
                  />
                  {errors.email && (
                    <small className="text-danger">
                      {errors.email.message}
                    </small>
                  )}
                </div>

                {/* Mật khẩu */}
                <div className="mb-3">
                  <label className="form-label">Mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu"
                    {...register("password", {
                      required: "Mật khẩu là bắt buộc",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu tối thiểu 6 ký tự",
                      },
                    })}
                  />
                  {errors.password && (
                    <small className="text-danger">
                      {errors.password.message}
                    </small>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang xử lý...
                    </span>
                  ) : queryParams.get("id") ? (
                    "Cập nhật"
                  ) : (
                    "Đăng ký"
                  )}
                </button>
              </form>

              <div className="d-flex flex-column justify-content-center mt-3 mx-auto w-100%">
                <GoogleOAuthProvider clientId="174189579193-5an9p6b13u20aeut0qdhkrudiflha8gk.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => console.log("Login Failed")}
                    useOneTap={false}
                    text="signin_with"
                    shape="pill"
                    theme="outline"
                    size="large"
                    width="300"
                  />
                </GoogleOAuthProvider>
              </div>

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
