import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import "../../../assets/css/Contact.css";
import { SnackbarProvider } from "notistack";
import { useSnackbar } from "notistack";

const Contact = () => {
  const { enqueueSnackbar } = useSnackbar();
  const form = useRef();

  const sendEmail = async (e) => {
    e.preventDefault();

    const formData = {
      name: form.current.name.value.trim(),
      email: form.current.email.value.trim(),
      message: form.current.message.value.trim(),
    };

    try {
      // 1. Gửi email bằng EmailJS
      await emailjs.sendForm(
        "service_j7ecpgl",
        "template_5wpey53",
        form.current,
        "eI2hATDjbArRM5Snh"
      );

      // 2. Gửi dữ liệu đến backend Node.js
      const resp = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Kiểm tra phản hồi từ backend
      if (!resp.ok) {
        const data = await resp.json().catch(() => null);
        const msg = data?.message || `Server trả về ${resp.status}`;
        throw new Error(msg);
      }
      enqueueSnackbar("Phản hồi đã được gửi.", { variant: "success" });
      form.current.reset();
    } catch (error) {
      console.error("Lỗi khi gửi:", error);
     enqueueSnackbar('Gửi thất bại!', { variant: 'error' });
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container container py-5">
        <h2 className="text-center contact-title">Liên Hệ Với Chúng Tôi</h2>
        <p className="text-center contact-subtitle">
          Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại gửi tin nhắn cho chúng
          tôi.
          <br />
          Vui lòng đọc <a href="#">Câu hỏi thường gặp (FAQ)</a> trước khi gửi.
        </p>

        <div className="form-wrapper">
          <form ref={form} onSubmit={sendEmail} className="contact-form">
            <div className="mb-3">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Tên của bạn"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Email của bạn"
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                name="message"
                className="form-control"
                placeholder="Tin nhắn của bạn"
                rows="5"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary submit-btn">
              Gửi tin nhắn
            </button>
          </form>
        </div>

        {/* Quyền lợi của khách hàng */}
        <div className="benefits-section">
          <h3 className="benefits-title">Quyền Lợi Của Khách Hàng</h3>
          <div className="benefits-grid">
            {[
              "✅ Miễn phí giao hàng cho đơn hàng từ 500.000đ.",
              "✅ Đổi trả dễ dàng trong vòng 7 ngày nếu có lỗi từ nhà sản xuất.",
              "✅ Hỗ trợ tư vấn tận tình từ đội ngũ CSKH chuyên nghiệp.",
              "✅ Nhận ưu đãi đặc biệt khi đăng ký thành viên thân thiết.",
            ].map((text, index) => (
              <div key={index} className="benefit-item">
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
