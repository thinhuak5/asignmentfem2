import React from "react";

const SupportFloatingButtons = () => {
  const phoneNumber = "0795895167"; // 📞 Số điện thoại
  const zaloPhone = "0795895167";   // 🔁 Số Zalo
  const facebookShareLink = "https://www.facebook.com/share/14FenYdyB3H/?mibextid=wwXIfr"; // ✅ Đúng link share
  const tiktokUsername = "daynguyen129"; // 🔁 Tài khoản TikTok

  const buttons = [
    {
      href: `https://zalo.me/${zaloPhone}`,
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ34hAi0nFqCiPseEaWVFAYie9Y8O1DjfnHkw&s",
      alt: "Zalo Chat",
    },
    {
      href: `tel:${phoneNumber}`,
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYM4cttbB5IrzpiT-OvqbgCdTu6O5iDYpN3g&s",
      alt: "Gọi điện",
    },
    {
      href: facebookShareLink,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/1024px-2023_Facebook_icon.svg.png",
      alt: "Facebook Share",
    },
    {
      href: `https://www.tiktok.com/@${tiktokUsername}`,
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs0i-4EZR_5A2wcSp2U3RDpftq-g_oogsyZA&s",
      alt: "TikTok",
    },
  ];

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
      {buttons.map((btn, index) => (
        <a
          key={index}
          href={btn.href}
          target="_blank"
          rel="noopener noreferrer"
          title={btn.alt}
          style={{
            display: "block",
            marginBottom: "10px",
            borderRadius: "50%",
            overflow: "hidden",
            width: "50px",
            height: "50px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.3s ease", // 🌀 Hiệu ứng mượt
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <img
            src={btn.img}
            alt={btn.alt}
            width="50"
            height="50"
            style={{ objectFit: "cover" }}
          />
        </a>
      ))}
    </div>
  );
};

export default SupportFloatingButtons;