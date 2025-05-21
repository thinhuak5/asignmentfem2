import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Constanst from "../../../Constanst";
import {Link} from "react-router";
const globalStyles = {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
};

const colors = {
    primaryRed: "#E74C3C", // A red similar to Garena's "Lưu thay đổi" button
    lightGreyBackground: "#F0F2F5",
    white: "#FFFFFF",
    borderColor: "#E0E0E0",
    textGrey: "#666",
    darkText: "#333",
    blueLink: "#007bff",
};

const commonCardStyles = {
    backgroundColor: colors.white,
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    padding: "20px",
    marginBottom: "20px",
};

const styles = {
    pageContainer: {
        display: "flex",
        backgroundColor: colors.lightGreyBackground,
        minHeight: "100vh",
        padding: "20px",
        ...globalStyles,
    },
    sidebar: {
        width: "250px",
        marginRight: "20px",
        ...commonCardStyles,
        padding: "0", // Padding handled by internal elements
        boxShadow: "none", // Sidebar has less prominent shadow
    },
    sidebarHeader: {
        display: "flex",
        alignItems: "center",
        padding: "20px",
        borderBottom: `1px solid ${colors.borderColor}`,
    },
    sidebarAvatar: {
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "#ddd", // Placeholder for avatar
        marginRight: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "30px",
        color: colors.textGrey,
    },
    sidebarUserName: {
        fontWeight: "600",
        fontSize: "16px",
        color: colors.darkText,
    },
    sidebarUserRank: {
        fontSize: "13px",
        color: colors.textGrey,
        marginTop: "2px",
    },
    sidebarNav: {
        paddingTop: "10px",
    },
    sidebarNavItem: {
        display: "flex",
        alignItems: "center",
        padding: "12px 20px",
        cursor: "pointer",
        color: colors.textGrey,
        fontSize: "15px",
    },
    sidebarNavItemActive: {
        backgroundColor: "#E6F0FF", // Lighter blue for active item
        color: colors.blueLink,
        fontWeight: "600",
        borderLeft: `3px solid ${colors.blueLink}`,
    },
    sidebarNavIcon: {
        marginRight: "10px",
        fontSize: "18px",
    },
    mainContent: {
        flexGrow: 1,
    },
    alertBanner: {
        backgroundColor: "#FFF8E0", // Light yellow background
        border: "1px solid #FFD700", // Yellow border
        color: "#8B6B00", // Darker yellow text
        padding: "12px 20px",
        borderRadius: "8px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
    },
    alertIcon: {
        marginRight: "10px",
        fontSize: "18px",
    },
    card: {
        ...commonCardStyles,
    },
    cardHeader: {
        fontSize: "18px",
        fontWeight: "600",
        marginBottom: "15px",
        color: colors.darkText,
    },
    profileSectionGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr", // Two columns for stats
        gap: "20px",
        marginBottom: "20px",
    },
    statItem: {
        // Styles for each stat (F-Point, Freeship, etc.)
    },
    statLabel: {
        fontSize: "14px",
        color: colors.textGrey,
        marginBottom: "5px",
    },
    statValue: {
        fontSize: "22px",
        fontWeight: "700",
        color: colors.darkText,
    },
    profileAvatarWrapper: {
        textAlign: "center",
        marginBottom: "25px",
    },
    profileAvatarImg: {
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        objectFit: "cover",
        border: `3px solid ${colors.blueLink}`,
        boxShadow: "0 2px 8px rgba(0, 123, 255, 0.2)",
    },
    formGroup: {
        marginBottom: "15px",
    },
    label: {
        fontWeight: "600",
        display: "block",
        marginBottom: "8px",
        color: colors.darkText,
        fontSize: "14px",
    },
    input: {
        width: "100%",
        padding: "10px 12px",
        fontSize: "15px",
        borderRadius: "6px",
        border: `1px solid ${colors.borderColor}`,
        boxSizing: "border-box",
        "&:focus": {
            borderColor: colors.blueLink,
            outline: "none",
            boxShadow: `0 0 0 2px rgba(0, 123, 255, 0.2)`,
        },
    },
    readOnlyValue: {
        fontSize: "15px",
        padding: "10px 0",
        color: colors.textGrey,
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "flex-end", // Align buttons to the right
        marginTop: "25px",
    },
    saveButton: {
        backgroundColor: colors.primaryRed,
        color: colors.white,
        border: "none",
        padding: "10px 25px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px",
        marginLeft: "10px",
        transition: "background-color 0.2s",
        "&:hover": {
            backgroundColor: "#C0392B", // Darker red on hover
        },
    },
    cancelButton: {
        backgroundColor: colors.white,
        color: colors.textGrey,
        border: `1px solid ${colors.borderColor}`,
        padding: "10px 25px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px",
        transition: "background-color 0.2s",
        "&:hover": {
            backgroundColor: colors.lightGreyBackground,
        },
    },
    editButton: {
        backgroundColor: "#28A745", // Green for "Cập Nhật"
        color: colors.white,
        border: "none",
        padding: "10px 25px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px",
        transition: "background-color 0.2s",
        "&:hover": {
            backgroundColor: "#218838",
        },
    },
    linkText: {
        color: colors.blueLink,
        cursor: "pointer",
        marginLeft: "10px",
        fontSize: "14px",
    },
    errorMsg: {
        color: "red",
        textAlign: "center",
        marginBottom: "15px",
        fontWeight: "600",
        fontSize: "14px",
    },
};

// Dummy icons for demonstration (replace with actual icon library like FontAwesome)
const Icon = ({ name, style }) => {
    let iconContent = "";
    switch (name) {
        case "user": iconContent = "👤"; break;
        case "map-marker": iconContent = "📍"; break;
        case "lock": iconContent = "🔒"; break;
        case "gtgt": iconContent = "📄"; break;
        case "gift": iconContent = "🎁"; break;
        case "order": iconContent = "🛒"; break;
        case "voucher": iconContent = "🎟️"; break;
        case "f-point": iconContent = "✨"; break;
        case "notification": iconContent = "🔔"; break;
        case "heart": iconContent = "❤️"; break;
        case "book": iconContent = "📚"; break;
        case "comment": iconContent = "💬"; break;
        case "warning": iconContent = "⚠️"; break;
        default: iconContent = "";
    }
    return <span style={{ ...style, lineHeight: 1 }}>{iconContent}</span>;
};

const Profile = () => {
    const [profile, setProfile] = useState({
        username: "",
        name: "",
        email: "",
        phone: "",
        avatar: "",
        address: "", // Giữ trường address
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({
        name: "",
        phone: "",
        address: "", // Giữ trường address trong editedProfile
    });

    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [activeNavItem, setActiveNavItem] = useState("personalInfo"); // For sidebar navigation

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setError("Vui lòng đăng nhập trước.");
                setLoading(false);
                return;
            }

            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;

            const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error(`Không thể lấy dữ liệu hồ sơ. Mã lỗi: ${res.status}`);
            }

            const data = await res.json();

            setProfile(data);
            setEditedProfile({
                name: data.name,
                phone: data.phone,
                address: data.address || "", // Đảm bảo gán giá trị cho address
            });
            setError("");
        } catch (err) {
            console.error("Lỗi lấy dữ liệu hồ sơ:", err);
            setError("Không thể lấy dữ liệu hồ sơ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile({ ...editedProfile, [name]: value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedAvatar(file);
            // Optionally, show a preview of the selected image
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;

            if (!userId) {
                throw new Error("Không tìm thấy ID người dùng từ token.");
            }

            const formData = new FormData();
            formData.append("name", editedProfile.name);
            formData.append("phone", editedProfile.phone);
            formData.append("address", editedProfile.address); // Gửi trường address
            if (selectedAvatar) {
                formData.append("avatar", selectedAvatar);
            }

            const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Không thể cập nhật thông tin người dùng");
            }

            // Refetch profile to update UI
            fetchProfile();
            setIsEditing(false); // Exit edit mode
            setSelectedAvatar(null); // Clear selected avatar
        } catch (err) {
            console.error("Lỗi khi lưu thay đổi:", err);
            setError("Không thể lưu thay đổi, vui lòng thử lại.");
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedProfile({
            name: profile.name,
            phone: profile.phone,
            address: profile.address || "",
        });
        setSelectedAvatar(null);
        setError(""); // Clear any previous error
    };

    const renderProfileInfo = () => (
        <div style={styles.card}>
            <h3 style={styles.cardHeader}>Hồ sơ cá nhân</h3>

            <div style={styles.profileAvatarWrapper}>
                {profile.avatar ? (
                    <img
                        src={`${Constanst.DOMAIN_API}/uploads/${profile.avatar}`}
                        alt="Avatar"
                        style={styles.profileAvatarImg}
                    />
                ) : (
                    <div style={{...styles.profileAvatarImg, backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: colors.textGrey}}>
                        No Avatar
                    </div>
                )}
                {isEditing && (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ marginTop: 15, display: "block", margin: "0 auto", width: "fit-content" }}
                    />
                )}
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Tên:</label>
                {/* Assuming 'name' field from API contains both first and last name, or adjust as needed */}
                <div style={styles.readOnlyValue}>{profile.name || "Chưa cập nhật"}</div>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Số điện thoại:</label>
                {isEditing ? (
                    <input
                        type="text"
                        name="phone"
                        value={editedProfile.phone}
                        onChange={handleEditChange}
                        style={styles.input}
                    />
                ) : (
                    <div style={styles.readOnlyValue}>
                        {profile.phone || "Chưa cập nhật"}
                        {profile.phone && <span style={styles.linkText}>Thay đổi</span>}
                    </div>
                )}
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Email:</label>
                <div style={styles.readOnlyValue}>
                    {profile.email || "Chưa cập nhật"}
                    {!profile.email && <span style={styles.linkText}>Thêm mới</span>}
                </div>
            </div>

            {/* Thêm trường địa chỉ */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Địa chỉ:</label>
                {isEditing ? (
                    <input
                        type="text"
                        name="address"
                        value={editedProfile.address}
                        onChange={handleEditChange}
                        style={styles.input}
                    />
                ) : (
                    <div style={styles.readOnlyValue}>
                        {profile.address || "Chưa cập nhật"}
                    </div>
                )}
            </div>


            {isEditing && (
                <div style={styles.buttonContainer}>
                    <button onClick={handleCancelEdit} style={styles.cancelButton}>
                        Hủy
                    </button>
                    <button onClick={handleSave} style={styles.saveButton}>
                        Lưu thay đổi
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div style={styles.pageContainer}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <div style={styles.sidebarAvatar}>
                        {profile.avatar ? (
                            <img
                                src={`${Constanst.DOMAIN_API}/uploads/${profile.avatar}`}
                                alt="Avatar"
                                style={styles.sidebarAvatar}
                            />
                        ) : (
                            <Icon name="user" />
                        )}
                    </div>
                    <div>
                        <div style={styles.sidebarUserName}>Thành viên Bạc</div>
                        <div style={styles.sidebarUserRank}>F-Point tích lũy 0</div>
                        <div style={styles.sidebarUserRank}>Thêm 30.000 để nâng hạng Vàng</div>
                    </div>
                </div>
                <ul style={styles.sidebarNav}>
                    <li
                        style={{ ...styles.sidebarNavItem, ...(activeNavItem === "personalInfo" && styles.sidebarNavItemActive) }}
                        onClick={() => setActiveNavItem("personalInfo")}
                    >
                        <Icon name="user" style={styles.sidebarNavIcon} /> Thông tin tài khoản
                    </li>
                    <li
                        style={{ ...styles.sidebarNavItem, ...(activeNavItem === "myOrders" && styles.sidebarNavItemActive) }}
                        onClick={() => setActiveNavItem("myOrders")}
                    >
                        <Icon name="order" style={styles.sidebarNavIcon} /> <Link to="/order-history">Đơn hàng của
                        tôi</Link>
                    </li>
                    <li
                        style={{ ...styles.sidebarNavItem, ...(activeNavItem === "changePassword" && styles.sidebarNavItemActive) }}
                        onClick={() => setActiveNavItem("changePassword")}
                    >
                        <Icon name="lock" style={styles.sidebarNavIcon} /> Đổi mật khẩu
                    </li>
                    <li
                        style={{ ...styles.sidebarNavItem, ...(activeNavItem === "gtgt" && styles.sidebarNavItemActive) }}
                        onClick={() => setActiveNavItem("gtgt")}
                    >
                        <Icon name="gtgt" style={styles.sidebarNavIcon} /> Thông tin xuất hóa đơn GTGT
                    </li>
                    <li
                        style={{ ...styles.sidebarNavItem, ...(activeNavItem === "memberPrivileges" && styles.sidebarNavItemActive) }}
                        onClick={() => setActiveNavItem("memberPrivileges")}
                    >
                        <Icon name="gift" style={styles.sidebarNavIcon} /> Ưu đãi thành viên
                    </li>

                    <li
                        style={{ ...styles.sidebarNavItem, ...(activeNavItem === "vouchers" && styles.sidebarNavItemActive) }}
                        onClick={() => setActiveNavItem("vouchers")}
                    >
                        <Icon name="voucher" style={styles.sidebarNavIcon} /> Ví voucher <span style={{ backgroundColor: colors.primaryRed, color: colors.white, borderRadius: "50%", width: "18px", height: "18px", display: "inline-flex", justifyContent: "center", alignItems: "center", fontSize: "11px", marginLeft: "5px" }}>24</span>
                    </li>
                    <li
                        style={{ ...styles.sidebarNavItem, ...(activeNavItem === "fPointFreeship" && styles.sidebarNavItemActive) }}
                        onClick={() => setActiveNavItem("fPointFreeship")}
                    >
                        <Icon name="f-point" style={styles.sidebarNavIcon} /> Tài khoản F-Point / Freeship
                    </li>
                    <li
                        style={{ ...styles.sidebarNavItem, ...(activeNavItem === "notifications" && styles.sidebarNavItemActive) }}
                        onClick={() => setActiveNavItem("notifications")}
                    >
                        <Icon name="notification" style={styles.sidebarNavIcon} /> Thông Báo
                    </li>
                    <li
                        style={{ ...styles.sidebarNavItem, ...(activeNavItem === "wishlist" && styles.sidebarNavItemActive) }}
                        onClick={() => setActiveNavItem("wishlist")}
                    >
                        <Icon name="heart" style={styles.sidebarNavIcon} /> Sản phẩm yêu thích
                    </li>
                    <li
                        style={{ ...styles.sidebarNavItem, ...(activeNavItem === "myBooks" && styles.sidebarNavItemActive) }}
                        onClick={() => setActiveNavItem("myBooks")}
                    >
                        <Icon name="book" style={styles.sidebarNavIcon} /> Sách theo bộ
                    </li>
                    <li
                        style={{ ...styles.sidebarNavItem, ...(activeNavItem === "myReviews" && styles.sidebarNavItemActive) }}
                        onClick={() => setActiveNavItem("myReviews")}
                    >
                        <Icon name="comment" style={styles.sidebarNavIcon} /> Nhận xét của tôi
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Alert Banner */}
                <div style={styles.alertBanner}>
                    <Icon name="warning" style={styles.alertIcon} />
                    <span>Bạn vui lòng cập nhật thông tin tài khoản: <span style={styles.linkText}>Cập nhật thông tin ngay</span></span>
                </div>

                {/* Benefits Card */}
                <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                    <div style={{ ...styles.card, flex: 1 }}>
                        <h3 style={styles.cardHeader}>Ưu đãi của bạn</h3>
                        <div style={styles.profileSectionGrid}>
                            <div style={styles.statItem}>
                                <div style={styles.statLabel}>F-Point hiện có</div>
                                <div style={styles.statValue}>0</div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={styles.statLabel}>Freeship hiện có</div>
                                <div style={styles.statValue}>0 lần</div>
                            </div>
                        </div>
                        <div style={{ textAlign: "right", fontSize: "14px" }}>
                            <span style={styles.linkText}>Xem chi tiết</span>
                        </div>
                    </div>

                    <div style={{ ...styles.card, flex: 1 }}>
                        <h3 style={styles.cardHeader}>Thành tích năm 2025</h3>
                        <div style={styles.profileSectionGrid}>
                            <div style={styles.statItem}>
                                <div style={styles.statLabel}>Số đơn hàng</div>
                                <div style={styles.statValue}>0 đơn hàng</div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={styles.statLabel}>Đã thanh toán</div>
                                <div style={styles.statValue}>0 đ</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information Card */}
                {loading ? (
                    <div style={styles.card}>Đang tải dữ liệu...</div>
                ) : error ? (
                    <div style={{ ...styles.card, ...styles.errorMsg }}>{error}</div>
                ) : (
                    <>
                        {renderProfileInfo()}
                        {!isEditing && (
                            <div style={styles.buttonContainer}>
                                <button onClick={() => setIsEditing(true)} style={styles.editButton}>
                                    Cập Nhật
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;