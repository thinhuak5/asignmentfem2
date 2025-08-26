import React from "react";

const SupportFloatingButtons = () => {
  const phoneNumber = "0795-895-167";
  const zaloPhone = "0795895167";
  const facebookShareLink =
    "https://www.facebook.com/share/1ADfFnarQ6/?mibextid=wwXIfr";
  const tiktokUsername = "daynguyen129";

  const [showPhone, setShowPhone] = React.useState(false);

  const buttons = [
    {
      href: `https://zalo.me/${zaloPhone}`,
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ34hAi0nFqCiPseEaWVFAYie9Y8O1DjfnHkw&s",
      alt: "Zalo Chat",
      type: "link",
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYM4cttbB5IrzpiT-OvqbgCdTu6O5iDYpN3g&s",
      alt: "Gọi điện",
      type: "phone", // không phải link
    },
    {
      href: facebookShareLink,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/1024px-2023_Facebook_icon.svg.png",
      alt: "Facebook Share",
      type: "link",
    },
    {
      href: `https://www.tiktok.com/@${tiktokUsername}`,
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs0i-4EZR_5A2wcSp2U3RDpftq-g_oogsyZA&s",
      alt: "TikTok",
      type: "link",
    },
  ];

  return (
    <div
      style={{ position: "fixed", bottom: 20, right: 20, zIndex: 2147483647 }}
    >
      {buttons.map((btn, index) => (
        <div key={index} style={{ position: "relative", marginBottom: 10 }}>
          {btn.type === "link" ? (
            <a
              href={btn.href}
              target="_blank"
              rel="noopener noreferrer"
              title={btn.alt}
              style={{
                display: "block",
                borderRadius: "50%",
                overflow: "hidden",
                width: 50,
                height: 50,
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <img
                src={btn.img}
                alt={btn.alt}
                width="50"
                height="50"
                style={{ objectFit: "cover" }}
              />
            </a>
          ) : (
            // Nút điện thoại
            <div style={{ position: "relative", display: "inline-block" }}>
              <div
                style={{
                  borderRadius: "50%",
                  overflow: "hidden",
                  width: 52,
                  height: 52,
                  boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.2)";
                  setShowPhone(true);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  setShowPhone(false);
                }}
                title={btn.alt}
              >
                <img
                  src={btn.img}
                  alt={btn.alt}
                  width="60"
                  height="60"
                  style={{
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              </div>

              {/* Tooltip chỉ hiển thị số, không nền */}
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "-200%",
                  transform: showPhone
                    ? "translateX(-50%) scale(1)"
                    : "translateX(-50%) scale(0.8)",
                  backgroundColor: "#30a1f6", // nền xanh
                  color: "#fff", // chữ trắng
                  fontSize: "25px",
                  fontWeight: "600",
                  opacity: showPhone ? 1 : 0,
                  transition: "all 0.35s ease-in-out",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  zIndex: 2147483647,
                  maxWidth: "180px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: "center",
                  padding: "6px 12px", // thêm khoảng cách chữ với khung
                  borderRadius: "8px", // bo tròn góc
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)", // đổ bóng cho nổi bật
                }}
              >
                {phoneNumber}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SupportFloatingButtons;
