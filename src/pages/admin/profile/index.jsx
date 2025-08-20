// src/pages/admin/profile/index.jsx
import React, {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import Constanst from "../../../Constanst";

/* ===== Styles giống client (rút gọn cho phần hồ sơ) ===== */
const colors = {
    primaryRed: "#E74C3C",
    white: "#FFFFFF",
    borderColor: "#E0E0E0",
    textGrey: "#666",
    darkText: "#333",
};

const styles = {
    pageWrap: {maxWidth: 880, margin: "0 auto", padding: "20px"},
    card: {
        backgroundColor: colors.white,
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        padding: "24px",
        marginBottom: "20px",
    },
    cardHeader: {
        fontSize: "20px",
        fontWeight: "600",
        marginBottom: "20px",
        paddingBottom: "15px",
        borderBottom: `1px solid ${colors.borderColor}`,
        color: colors.darkText,
    },
    formGroup: {marginBottom: "20px"},
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
    readOnlyValue: {fontSize: "15px", padding: "10px 0", color: colors.textGrey},
    buttonContainer: {display: "flex", justifyContent: "flex-end", marginTop: "25px", gap: "10px"},
    button: {
        border: "none",
        padding: "10px 25px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "15px",
        transition: "all 0.2s",
    },
    saveButton: {backgroundColor: colors.primaryRed, color: colors.white},
    editButton: {backgroundColor: "#30A1F6", color: colors.white},
    cancelButton: {backgroundColor: colors.white, color: colors.textGrey, border: `1px solid ${colors.borderColor}`},
    errorMsg: {color: "red", textAlign: "center", marginBottom: "15px", fontWeight: "600", fontSize: "14px"},

    roleBadge: {
        display: "inline-block",
        padding: "4px 10px",
        fontSize: 12,
        borderRadius: 999,
        fontWeight: 600,
    },
};

const roleInfo = (role) => {
    if (role === 0) return {label: "Admin", bg: "#FFE8E6", color: "#E74C3C"};
    if (role === 1) return {label: "Nhân viên", bg: "#E9F5FF", color: "#0D6EFD"};
    return {label: "Không xác định", bg: "#F1F1F1", color: "#666"};
};

function PersonalInfoCard({profile, onSave}) {
    const [isEditing, setIsEditing] = useState(false);
    const [edited, setEdited] = useState({name: profile.name, phone: profile.phone});
    const [avatarFile, setAvatarFile] = useState(null);

    const save = async () => {
        await onSave(edited, avatarFile);
        setIsEditing(false);
        setAvatarFile(null);
    };

    const cancel = () => {
        setIsEditing(false);
        setEdited({name: profile.name, phone: profile.phone});
        setAvatarFile(null);
    };

    const r = roleInfo(profile.role);

    return (
        <div style={styles.card}>
            <h3 style={styles.cardHeader}>Thông tin cá nhân</h3>

            <div style={{...styles.formGroup, textAlign: "center"}}>
                <img
                    src={
                        avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar || "https://via.placeholder.com/100"
                    }
                    alt="Avatar"
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `3px solid ${colors.borderColor}`,
                    }}
                />
                {isEditing && (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                        style={{marginTop: 15, display: "block", margin: "15px auto 0", width: "fit-content"}}
                    />
                )}
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Tên hiển thị:</label>
                {isEditing ? (
                    <input
                        style={styles.input}
                        value={edited.name}
                        onChange={(e) => setEdited({...edited, name: e.target.value})}
                    />
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
                    <input
                        style={styles.input}
                        value={edited.phone || ""}
                        onChange={(e) => setEdited({...edited, phone: e.target.value})}
                    />
                ) : (
                    <div style={styles.readOnlyValue}>{profile.phone || "Chưa cập nhật"}</div>
                )}
            </div>

            {/* NEW: Chức vụ (read-only) */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Chức vụ:</label>
                <div className="d-flex align-items-center" style={{gap: 8}}>
          <span
              style={{
                  ...styles.roleBadge,
                  background: r.bg,
                  color: r.color,
              }}
          >
            {r.label}
          </span>
                </div>
            </div>

            <div style={styles.buttonContainer}>
                {isEditing ? (
                    <>
                        <button style={{...styles.button, ...styles.cancelButton}} onClick={cancel}>
                            Hủy
                        </button>
                        <button style={{...styles.button, ...styles.saveButton}} onClick={save}>
                            Lưu thay đổi
                        </button>
                    </>
                ) : (
                    <button style={{...styles.button, ...styles.editButton}} onClick={() => setIsEditing(true)}>
                        Chỉnh sửa
                    </button>
                )}
            </div>
        </div>
    );
}

export default function AdminProfile() {
    const [profile, setProfile] = useState(null);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("Vui lòng đăng nhập.");

            const decoded = jwtDecode(token);
            const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${decoded.id}`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            if (!res.ok) throw new Error("Không thể tải hồ sơ.");
            const user = await res.json();
            setProfile(user);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async (editedData, avatarFile) => {
        try {
            const token = localStorage.getItem("authToken");
            const decoded = jwtDecode(token);
            const formData = new FormData();
            formData.append("name", editedData.name);
            formData.append("phone", editedData.phone || "");
            if (avatarFile) formData.append("avatar", avatarFile);

            const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${decoded.id}`, {
                method: "PUT",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });
            if (!res.ok) throw new Error("Cập nhật thất bại.");
            await fetchProfile();
        } catch (e) {
            setErr(e.message);
        }
    };

    return (
        <div style={styles.pageWrap}>
            {loading && <div style={styles.card}>Đang tải...</div>}
            {err && !loading && <div style={{...styles.card, ...styles.errorMsg}}>{err}</div>}
            {profile && <PersonalInfoCard profile={profile} onSave={handleSave}/>}
        </div>
    );
}
