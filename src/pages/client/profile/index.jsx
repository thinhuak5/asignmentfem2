import React, {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import Constanst from "../../../Constanst";
import {Link} from "react-router-dom"; // Sửa lại import cho react-router-dom v6

/* ==========================================================================
   STYLES
   ========================================================================== */
const globalStyles = {
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  color: "#333",
};

const colors = {
    primaryRed: "#E74C3C",
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
    padding: "24px",
  marginBottom: "20px",
};

const styles = {
  pageContainer: {
    display: "flex",
    backgroundColor: colors.lightGreyBackground,
      minHeight: "calc(100vh - 70px)", // Trừ đi chiều cao header
    padding: "20px",
    ...globalStyles,
  },
  sidebar: {
      width: "280px",
      flexShrink: 0,
    marginRight: "20px",
      backgroundColor: colors.white,
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      padding: "0",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    padding: "20px",
    borderBottom: `1px solid ${colors.borderColor}`,
  },
  sidebarAvatar: {
      width: "50px",
      height: "50px",
    borderRadius: "50%",
    marginRight: "15px",
      objectFit: "cover",
  },
  sidebarUserName: {
    fontWeight: "600",
    fontSize: "16px",
    color: colors.darkText,
  },
    sidebarUserEmail: {
    fontSize: "13px",
    color: colors.textGrey,
    marginTop: "2px",
        wordBreak: "break-all",
  },
  sidebarNav: {
      padding: "10px 0",
      listStyle: "none",
      margin: 0,
  },
  sidebarNavItem: {
    display: "flex",
    alignItems: "center",
      padding: "14px 20px",
    cursor: "pointer",
    color: colors.textGrey,
    fontSize: "15px",
      transition: "all 0.2s ease",
      borderLeft: "3px solid transparent",
  },
  sidebarNavItemActive: {
      backgroundColor: "#E9F5FF",
    color: colors.blueLink,
    fontWeight: "600",
    borderLeft: `3px solid ${colors.blueLink}`,
  },
  sidebarNavIcon: {
      marginRight: "15px",
    fontSize: "18px",
      width: "20px",
      textAlign: "center",
  },
  mainContent: {
    flexGrow: 1,
  },
  card: {
    ...commonCardStyles,
  },
  cardHeader: {
      fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
      paddingBottom: "15px",
      borderBottom: `1px solid ${colors.borderColor}`,
    color: colors.darkText,
  },
  formGroup: {
      marginBottom: "20px",
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
  },
  readOnlyValue: {
    fontSize: "15px",
    padding: "10px 0",
    color: colors.textGrey,
  },
  buttonContainer: {
    display: "flex",
      justifyContent: "flex-end",
    marginTop: "25px",
      gap: "10px",
  },
    button: {
    border: "none",
    padding: "10px 25px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
        fontSize: "15px",
        transition: "all 0.2s",
    },
    saveButton: {
        backgroundColor: colors.primaryRed,
        color: colors.white,
    },
    editButton: {
        backgroundColor: "#30A1F6",
        color: colors.white,
  },
  cancelButton: {
    backgroundColor: colors.white,
    color: colors.textGrey,
    border: `1px solid ${colors.borderColor}`,
  },
  errorMsg: {
    color: "red",
    textAlign: "center",
    marginBottom: "15px",
    fontWeight: "600",
    fontSize: "14px",
  },
    link: {
        textDecoration: 'none',
        color: 'inherit'
    }
};


/* ==========================================================================
   SUB-COMPONENTS FOR EACH VIEW
   ========================================================================== */

// --- Component for Personal Information View ---
const PersonalInfoView = ({profile, onSave}) => {
  const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({name: profile.name, phone: profile.phone});
  const [selectedAvatar, setSelectedAvatar] = useState(null);

    const handleSaveClick = () => {
        onSave(editedProfile, selectedAvatar).then(() => {
            setIsEditing(false);
            setSelectedAvatar(null);
        });
    }

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditedProfile({name: profile.name, phone: profile.phone});
        setSelectedAvatar(null);
    }

    return (
    <div style={styles.card}>
        <h3 style={styles.cardHeader}>Thông tin cá nhân</h3>

        {/* Avatar */}
        <div style={{...styles.formGroup, textAlign: 'center'}}>
            <img
                src={selectedAvatar ? URL.createObjectURL(selectedAvatar) : profile.avatar || 'https://via.placeholder.com/100'}
                alt="Avatar"
                style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `3px solid ${colors.borderColor}`
                }}
            />
        {isEditing && (
            <input type="file" accept="image/*" onChange={e => setSelectedAvatar(e.target.files[0])}
                   style={{marginTop: 15, display: 'block', margin: '15px auto 0', width: 'fit-content'}}/>
        )}
      </div>

        {/* Form Fields */}
      <div style={styles.formGroup}>
          <label style={styles.label}>Tên hiển thị:</label>
          {isEditing ? (
              <input type="text" value={editedProfile.name}
                     onChange={e => setEditedProfile({...editedProfile, name: e.target.value})} style={styles.input}/>
          ) : (
              <div style={styles.readOnlyValue}>{profile.name || "Chưa cập nhật"}</div>
          )}
      </div>
        <div style={styles.formGroup}>
            <label style={styles.label}>Email:</label>
            <div style={styles.readOnlyValue}>{profile.email} (Không thể thay đổi)</div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Số điện thoại:</label>
        {isEditing ? (
            <input type="text" value={editedProfile.phone}
                   onChange={e => setEditedProfile({...editedProfile, phone: e.target.value})} style={styles.input}/>
        ) : (
            <div style={styles.readOnlyValue}>{profile.phone || "Chưa cập nhật"}</div>
        )}
      </div>

        {/* Action Buttons */}
        <div style={styles.buttonContainer}>
            {isEditing ? (
                <>
                    <button onClick={handleCancelClick} style={{...styles.button, ...styles.cancelButton}}>Hủy</button>
                    <button onClick={handleSaveClick} style={{...styles.button, ...styles.saveButton}}>Lưu thay đổi
                    </button>
                </>
            ) : (
                <button onClick={() => setIsEditing(true)} style={{...styles.button, ...styles.editButton}}>Chỉnh
                    sửa</button>
        )}
      </div>
    </div>
    );
};

// --- Component for Order History View ---
const OrderHistoryView = () => {
    return (
        <div style={styles.card}>
            <h3 style={styles.cardHeader}>Lịch sử đơn hàng</h3>
            <p>Chức năng này đang được phát triển.</p>
            <p>Bạn có thể xem lịch sử đơn hàng chi tiết tại <Link to="/order-history" style={{color: colors.blueLink}}>trang
                này</Link>.</p>
        </div>
    )
};

// --- Component for Address Management View ---
const AddressView = ({initialAddress, onSave}) => {
    // This is a simplified version. For a full address book, you'd manage an array of addresses.
    const [isEditing, setIsEditing] = useState(false);
    const [address, setAddress] = useState(initialAddress || "");

    const handleSaveClick = () => {
        onSave(address).then(() => {
            setIsEditing(false);
        });
    }

    return (
        <div style={styles.card}>
            <h3 style={styles.cardHeader}>Địa chỉ của tôi</h3>
            <div style={styles.formGroup}>
                <label style={styles.label}>Địa chỉ mặc định:</label>
                {isEditing ? (
                    <textarea value={address} onChange={e => setAddress(e.target.value)}
                              style={{...styles.input, height: '100px', resize: 'vertical'}}
                              placeholder="Nhập địa chỉ đầy đủ của bạn..."></textarea>
                ) : (
                    <div style={styles.readOnlyValue}>{address || "Chưa có địa chỉ."}</div>
                )}
            </div>
            <div style={styles.buttonContainer}>
                {isEditing ? (
                    <>
                        <button onClick={() => {
                            setIsEditing(false);
                            setAddress(initialAddress)
                        }} style={{...styles.button, ...styles.cancelButton}}>Hủy
                        </button>
                        <button onClick={handleSaveClick} style={{...styles.button, ...styles.saveButton}}>Lưu địa chỉ
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} style={{...styles.button, ...styles.editButton}}>
                        {initialAddress ? 'Thay đổi' : 'Thêm địa chỉ'}
                    </button>
                )}
            </div>
        </div>
    )
};


/* ==========================================================================
   MAIN PROFILE COMPONENT
   ========================================================================== */
const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState("info"); // 'info', 'orders', 'address'

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("Vui lòng đăng nhập.");

            const decodedToken = jwtDecode(token);
            const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${decodedToken.id}`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            if (!res.ok) throw new Error("Không thể tải hồ sơ.");

            const data = await res.json();
            setProfile(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSaveProfile = async (editedData, avatarFile) => {
        try {
            const token = localStorage.getItem("authToken");
            const decodedToken = jwtDecode(token);

            const formData = new FormData();
            formData.append("name", editedData.name);
            formData.append("phone", editedData.phone);
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${decodedToken.id}`, {
                method: "PUT",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });

            if (!res.ok) throw new Error("Cập nhật thất bại.");

            await fetchProfile(); // Refresh profile data
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSaveAddress = async (newAddress) => {
        try {
            const token = localStorage.getItem("authToken");
            const decodedToken = jwtDecode(token);

            // Use a different endpoint or a specific field update
            const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${decodedToken.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({address: newAddress}),
            });

            if (!res.ok) throw new Error("Cập nhật địa chỉ thất bại.");
            await fetchProfile(); // Refresh data
        } catch (err) {
            setError(err.message);
        }
    }

    const renderContent = () => {
        if (loading) return <div style={styles.card}>Đang tải...</div>;
        if (error) return <div style={{...styles.card, ...styles.errorMsg}}>{error}</div>;
        if (!profile) return <div style={styles.card}>Không tìm thấy dữ liệu hồ sơ.</div>

        switch (activeView) {
            case "info":
                return <PersonalInfoView profile={profile} onSave={handleSaveProfile}/>;
            case "orders":
                return <OrderHistoryView/>;
            case "address":
                return <AddressView initialAddress={profile.address} onSave={handleSaveAddress}/>;
            default:
                return null;
        }
    };

  return (
    <div style={styles.pageContainer}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
          {profile && (
              <div style={styles.sidebarHeader}>
                  <img src={profile.avatar || 'https://via.placeholder.com/50'} alt="Avatar"
                       style={styles.sidebarAvatar}/>
                  <div>
                      <div style={styles.sidebarUserName}>{profile.name || "Người dùng mới"}</div>
                      <div style={styles.sidebarUserEmail}>{profile.email}</div>
                  </div>
              </div>
          )}
        <ul style={styles.sidebarNav}>
          <li
              style={{...styles.sidebarNavItem, ...(activeView === "info" && styles.sidebarNavItemActive)}}
              onClick={() => setActiveView("info")}
          >
              <span style={styles.sidebarNavIcon}>👤</span> Thông tin tài khoản
          </li>
          <li
              style={{...styles.sidebarNavItem, ...(activeView === "orders" && styles.sidebarNavItemActive)}}
              onClick={() => setActiveView("orders")}
          >
              <span style={styles.sidebarNavIcon}>🛒</span>
              <Link to="/order-history" style={styles.link}>Lịch sử đơn hàng</Link>
          </li>
          <li
              style={{...styles.sidebarNavItem, ...(activeView === "address" && styles.sidebarNavItemActive)}}
              onClick={() => setActiveView("address")}
          >
              <span style={styles.sidebarNavIcon}>📍</span> Địa chỉ
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
          {renderContent()}
      </div>
    </div>
  );
};

export default Profile;