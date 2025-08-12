import React, { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Constanst from "../../../Constanst";
import { Link } from "react-router-dom";

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
    minHeight: "calc(100vh - 70px)",
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
  mainContent: { flexGrow: 1 },
  card: { ...commonCardStyles },
  cardHeader: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: `1px solid ${colors.borderColor}`,
    color: colors.darkText,
  },
  formGroup: { marginBottom: "20px" },
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
  saveButton: { backgroundColor: colors.primaryRed, color: colors.white },
  editButton: { backgroundColor: "#30A1F6", color: colors.white },
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
  link: { textDecoration: "none", color: "inherit" },

  // Address
  addrList: { display: "flex", flexDirection: "column", gap: "12px" },
  addrItem: {
    border: `1px solid ${colors.borderColor}`,
    borderRadius: "8px",
    padding: "12px",
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: "12px",
    alignItems: "center",
  },
  addrActions: { display: "flex", gap: "8px" },
  pillDefault: {
    display: "inline-block",
    fontSize: "12px",
    padding: "2px 8px",
    borderRadius: "999px",
    background: "#E9F5FF",
    color: colors.blueLink,
    marginLeft: "8px",
  },
  divider: { height: 1, background: colors.borderColor, margin: "16px 0" },
};

/* ==========================================================================
   HELPERS
   ========================================================================== */
const uuid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(16).slice(2)}`);

const dedupeBy = (arr, getKey) => {
  const seen = new Set();
  return (Array.isArray(arr) ? arr : []).filter((item) => {
    const k = String(getKey(item));
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// Provinces
const normalizeProvinces = (arr) => {
  const list = (Array.isArray(arr) ? arr : [])
    .map((p) => ({
      code:
        p?.province_code ??
        p?.code ??
        p?.ProvinceCode ??
        p?.id ??
        p?.value ??
        "",
      name: p?.name ?? p?.province_name ?? p?.full_name ?? p?.text ?? "",
    }))
    .filter((p) => p.code && p.name);
  return dedupeBy(list, (x) => x.code);
};

// Wards
const normalizeWards = (arr) => {
  const list = (Array.isArray(arr) ? arr : [])
    .map((w) => ({
      code: w?.ward_code ?? w?.code ?? w?.id ?? w?.value ?? "",
      name: w?.ward_name ?? w?.name ?? w?.full_name ?? w?.text ?? "",
    }))
    .filter((w) => w.code && w.name);
  return dedupeBy(list, (x) => x.code);
};

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

// Personal info
const PersonalInfoView = ({ profile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: profile.name,
    phone: profile.phone,
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleSaveClick = () => {
    onSave(editedProfile, selectedAvatar).then(() => {
      setIsEditing(false);
      setSelectedAvatar(null);
    });
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedProfile({ name: profile.name, phone: profile.phone });
    setSelectedAvatar(null);
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.cardHeader}>Thông tin cá nhân</h3>

      <div style={{ ...styles.formGroup, textAlign: "center" }}>
        <img
          src={
            selectedAvatar
              ? URL.createObjectURL(selectedAvatar)
              : profile.avatar || "https://via.placeholder.com/100"
          }
          alt="Avatar"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
            border: `3px solid ${colors.borderColor}`,
          }}
        />
        {isEditing && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedAvatar(e.target.files[0])}
            style={{
              marginTop: 15,
              display: "block",
              margin: "15px auto 0",
              width: "fit-content",
            }}
          />
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Tên hiển thị:</label>
        {isEditing ? (
          <input
            type="text"
            value={editedProfile.name}
            onChange={(e) =>
              setEditedProfile({ ...editedProfile, name: e.target.value })
            }
            style={styles.input}
          />
        ) : (
          <div style={styles.readOnlyValue}>
            {profile.name || "Chưa cập nhật"}
          </div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Email:</label>
        <div style={styles.readOnlyValue}>
          {profile.email} (Không thể thay đổi)
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Số điện thoại:</label>
        {isEditing ? (
          <input
            type="text"
            value={editedProfile.phone}
            onChange={(e) =>
              setEditedProfile({ ...editedProfile, phone: e.target.value })
            }
            style={styles.input}
          />
        ) : (
          <div style={styles.readOnlyValue}>
            {profile.phone || "Chưa cập nhật"}
          </div>
        )}
      </div>

      <div style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <button
              onClick={handleCancelClick}
              style={{ ...styles.button, ...styles.cancelButton }}
            >
              Hủy
            </button>
            <button
              onClick={handleSaveClick}
              style={{ ...styles.button, ...styles.saveButton }}
            >
              Lưu thay đổi
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            style={{ ...styles.button, ...styles.editButton }}
          >
            Chỉnh sửa
          </button>
        )}
      </div>
    </div>
  );
};

// Orders (placeholder)
const OrderHistoryView = () => (
  <div style={styles.card}>
    <h3 style={styles.cardHeader}>Lịch sử đơn hàng</h3>
    <p>Chức năng này đang được phát triển.</p>
    <p>
      Bạn có thể xem lịch sử đơn hàng chi tiết tại{" "}
      <Link to="/order-history" style={{ color: colors.blueLink }}>
        trang này
      </Link>
      .
    </p>
  </div>
);

// Address form
const AddressForm = ({ initialValue, onSubmit, onCancel }) => {
  const [houseNumber, setHouseNumber] = useState(
    initialValue?.houseNumber || ""
  );
  const [provinceCode, setProvinceCode] = useState(
    initialValue?.provinceCode || ""
  );
  const [wardCode, setWardCode] = useState(initialValue?.wardCode || "");

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoadingProvinces(true);
    fetch("https://34tinhthanh.com/api/provinces")
      .then((r) => {
        if (!r.ok) throw new Error("FETCH_PROVINCES_FAILED");
        return r.json();
      })
      .then((data) => setProvinces(normalizeProvinces(data)))
      .catch(() => setErr("Không tải được danh sách Tỉnh/Thành."))
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      setWardCode("");
      return;
    }
    setLoadingWards(true);
    fetch(
      `https://34tinhthanh.com/api/wards?province_code=${encodeURIComponent(
        provinceCode
      )}`
    )
      .then((r) => {
        if (!r.ok) throw new Error("FETCH_WARDS_FAILED");
        return r.json();
      })
      .then((data) => setWards(normalizeWards(data)))
      .catch(() => setErr("Không tải được danh sách Phường/Xã."))
      .finally(() => setLoadingWards(false));
  }, [provinceCode]);

  const provinceName =
    provinces.find((p) => String(p.code) === String(provinceCode))?.name || "";
  const wardName =
    wards.find((w) => String(w.code) === String(wardCode))?.name || "";

  const fullAddress = [houseNumber, wardName, provinceName]
    .filter(Boolean)
    .join(", ");

  const submit = () => {
    setErr("");
    if (!houseNumber || !provinceCode || !wardCode) {
      setErr("Vui lòng nhập Số nhà/địa chỉ, chọn Tỉnh/Thành và Phường/Xã.");
      return;
    }
    onSubmit({
      houseNumber,
      provinceCode,
      provinceName,
      wardCode,
      wardName,
      fullAddress,
    });
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Số nhà / Địa chỉ chi tiết</label>
        <input
          type="text"
          value={houseNumber}
          onChange={(e) => setHouseNumber(e.target.value)}
          placeholder="VD: 123, ngõ 45, đường ABC"
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Tỉnh / Thành phố</label>
        <select
          value={provinceCode}
          onChange={(e) => setProvinceCode(e.target.value)}
          style={styles.input}
        >
          <option value="">
            {loadingProvinces ? "Đang tải..." : "— Chọn Tỉnh/Thành —"}
          </option>
          {provinces.map((p, idx) => (
            <option key={`${p.code}-${idx}`} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Phường / Xã</label>
        <select
          value={wardCode}
          onChange={(e) => setWardCode(e.target.value)}
          disabled={!provinceCode || loadingWards}
          style={styles.input}
        >
          <option value="">
            {provinceCode
              ? loadingWards
                ? "Đang tải..."
                : "— Chọn Phường/Xã —"
              : "— Chọn Tỉnh trước —"}
          </option>
          {wards.map((w, idx) => (
            <option key={`${w.code}-${idx}`} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Xem trước địa chỉ</label>
        <div style={styles.readOnlyValue}>
          {fullAddress || "— Chưa đủ thông tin —"}
        </div>
      </div>

      {err && <div style={styles.errorMsg}>{err}</div>}

      <div style={styles.buttonContainer}>
        <button
          onClick={onCancel}
          style={{ ...styles.button, ...styles.cancelButton }}
        >
          Hủy
        </button>
        <button
          onClick={submit}
          style={{ ...styles.button, ...styles.saveButton }}
        >
          Lưu
        </button>
      </div>
    </div>
  );
};

// Address list & manage
const AddressView = ({ initialAddresses, defaultAddressId, onSave }) => {
  const [addresses, setAddresses] = useState(
    Array.isArray(initialAddresses) ? initialAddresses : []
  );
  const [currentDefaultId, setCurrentDefaultId] = useState(
    defaultAddressId || null
  );

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const legacyTextAddress = useMemo(() => null, []);

  const setDefault = (id) => {
    setCurrentDefaultId(id);
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const handleAdd = (form) => {
    const id = uuid();
    const newAddr = {
      id,
      houseNumber: form.houseNumber,
      wardCode: form.wardCode,
      wardName: form.wardName,
      provinceCode: form.provinceCode,
      provinceName: form.provinceName,
      fullAddress: form.fullAddress,
      isDefault: addresses.length === 0,
    };
    const next = [...addresses, newAddr];
    setAddresses(next);
    if (next.length === 1) setCurrentDefaultId(id);
    setIsAdding(false);
  };

  const handleEdit = (id, form) => {
    setAddresses((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              houseNumber: form.houseNumber,
              wardCode: form.wardCode,
              wardName: form.wardName,
              provinceCode: form.provinceCode,
              provinceName: form.provinceName,
              fullAddress: form.fullAddress,
            }
          : a
      )
    );
    setEditingId(null);
  };

  const handleDelete = (id) => {
    const next = addresses.filter((a) => a.id !== id);
    let nextDefault = currentDefaultId;
    if (id === currentDefaultId) nextDefault = next[0]?.id || null;

    setAddresses(
      next.map((a, idx) => ({
        ...a,
        isDefault:
          (nextDefault && a.id === nextDefault) || (!nextDefault && idx === 0),
      }))
    );
    setCurrentDefaultId(nextDefault);
  };

  const handleSaveAll = () => {
    setError("");
    if (!addresses.length) {
      setError("Vui lòng thêm ít nhất một địa chỉ.");
      return;
    }
    const defaultId = currentDefaultId || addresses[0].id;
    const normalized = addresses.map((a) => ({
      ...a,
      isDefault: a.id === defaultId,
    }));
    onSave(normalized, defaultId);
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.cardHeader}>Địa chỉ của tôi</h3>

      <div style={styles.formGroup}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Danh sách địa chỉ</div>
        {addresses.length === 0 ? (
          <div style={styles.readOnlyValue}>Chưa có địa chỉ.</div>
        ) : (
          <div style={styles.addrList}>
            {addresses.map((a, idx) => (
              <div
                key={`${a.id}-${a.wardCode}-${a.provinceCode}-${idx}`}
                style={styles.addrItem}
              >
                <input
                  type="radio"
                  name="defaultAddress"
                  checked={currentDefaultId === a.id}
                  onChange={() => setDefault(a.id)}
                  title="Chọn làm mặc định"
                />

                <div>
                  <div style={{ fontWeight: 600 }}>
                    {a.fullAddress}
                    {a.id === currentDefaultId && (
                      <span style={styles.pillDefault}>Mặc định</span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: colors.textGrey,
                      marginTop: 4,
                    }}
                  >
                    {a.houseNumber} • {a.wardName} • {a.provinceName}
                  </div>
                </div>

                <div style={styles.addrActions}>
                  <button
                    onClick={() => setDefault(a.id)}
                    style={{
                      ...styles.button,
                      ...styles.editButton,
                      padding: "8px 12px",
                    }}
                  >
                    Đặt mặc định
                  </button>
                  <button
                    onClick={() => setEditingId(a.id)}
                    style={{
                      ...styles.button,
                      ...styles.cancelButton,
                      padding: "8px 12px",
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    style={{
                      ...styles.button,
                      ...styles.cancelButton,
                      padding: "8px 12px",
                    }}
                  >
                    Xóa
                  </button>
                </div>

                {editingId === a.id && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={styles.divider} />
                    <AddressForm
                      initialValue={a}
                      onCancel={() => setEditingId(null)}
                      onSubmit={(form) => handleEdit(a.id, form)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAdding ? (
        <div className="add-address">
          <button
            onClick={() => setIsAdding(true)}
            style={{ ...styles.button, ...styles.editButton }}
          >
            Thêm địa chỉ
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <div style={styles.divider} />
          <AddressForm
            initialValue={null}
            onCancel={() => setIsAdding(false)}
            onSubmit={handleAdd}
          />
        </div>
      )}

      {error && <div style={styles.errorMsg}>{error}</div>}

      <div style={styles.buttonContainer}>
        <button
          onClick={handleSaveAll}
          style={{ ...styles.button, ...styles.saveButton }}
        >
          Lưu thay đổi
        </button>
      </div>

      {legacyTextAddress && (
        <div style={{ marginTop: 16, color: colors.textGrey, fontSize: 13 }}>
          * Hệ thống cũ đang dùng 1 chuỗi địa chỉ. Khi bạn thêm địa chỉ mới,
          dữ liệu sẽ chuyển sang danh sách địa chỉ.
        </div>
      )}
    </div>
  );
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

      // Lấy user + địa chỉ từ user_addresses
      const [userRes, addrRes] = await Promise.all([
        fetch(`${Constanst.DOMAIN_API}/api/users/${decodedToken.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${Constanst.DOMAIN_API}/api/users/${decodedToken.id}/addresses`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      if (!userRes.ok) throw new Error("Không thể tải hồ sơ.");
      if (!addrRes.ok) throw new Error("Không thể tải địa chỉ.");

      const user = await userRes.json();
      const addrPayload = await addrRes.json(); // { addresses, defaultAddressId }

      setProfile({
        ...user,
        addresses: addrPayload.addresses || [],
        defaultAddressId: addrPayload.defaultAddressId || null,
      });
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
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await fetch(
        `${Constanst.DOMAIN_API}/api/users/${decodedToken.id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Cập nhật thất bại.");
      await fetchProfile();
    } catch (err) {
      setError(err.message);
    }
  };

  // Lưu vào bảng user_addresses
  const handleSaveAddresses = async (addresses, defaultAddressId) => {
    try {
      const token = localStorage.getItem("authToken");
      const decodedToken = jwtDecode(token);

      const res = await fetch(
        `${Constanst.DOMAIN_API}/api/users/${decodedToken.id}/addresses-bulk`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ addresses, defaultAddressId }),
        }
      );

      if (!res.ok) throw new Error("Cập nhật địa chỉ thất bại.");
      await fetchProfile();
      alert("Đã lưu địa chỉ.");
    } catch (err) {
      setError(err.message);
    }
  };

  const renderContent = () => {
    if (loading) return <div style={styles.card}>Đang tải...</div>;
    if (error)
      return (
        <div style={{ ...styles.card, ...styles.errorMsg }}>{error}</div>
      );
    if (!profile)
      return <div style={styles.card}>Không tìm thấy dữ liệu hồ sơ.</div>;

    const initialAddresses = Array.isArray(profile.addresses)
      ? profile.addresses
      : [];

    return (
      <>
        {activeView === "info" && (
          <PersonalInfoView profile={profile} onSave={handleSaveProfile} />
        )}
        {activeView === "orders" && <OrderHistoryView />}
        {activeView === "address" && (
          <AddressView
            initialAddresses={initialAddresses}
            defaultAddressId={profile.defaultAddressId}
            onSave={handleSaveAddresses}
          />
        )}
      </>
    );
  };

  return (
    <div style={styles.pageContainer}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        {profile && (
          <div style={styles.sidebarHeader}>
            <img
              src={profile.avatar || "https://via.placeholder.com/50"}
              alt="Avatar"
              style={styles.sidebarAvatar}
            />
            <div>
              <div style={styles.sidebarUserName}>
                {profile.name || "Người dùng mới"}
              </div>
              <div style={styles.sidebarUserEmail}>{profile.email}</div>
            </div>
          </div>
        )}
        <ul style={styles.sidebarNav}>
          <li
            style={{
              ...styles.sidebarNavItem,
              ...(activeView === "info" && styles.sidebarNavItemActive),
            }}
            onClick={() => setActiveView("info")}
          >
            <span style={styles.sidebarNavIcon}>👤</span> Thông tin tài khoản
          </li>
          <li
            style={{
              ...styles.sidebarNavItem,
              ...(activeView === "orders" && styles.sidebarNavItemActive),
            }}
            onClick={() => setActiveView("orders")}
          >
            <span style={styles.sidebarNavIcon}>🛒</span>
            <Link to="/order-history" style={styles.link}>
              Lịch sử đơn hàng
            </Link>
          </li>
          <li
            style={{
              ...styles.sidebarNavItem,
              ...(activeView === "address" && styles.sidebarNavItemActive),
            }}
            onClick={() => setActiveView("address")}
          >
            <span style={styles.sidebarNavIcon}>📍</span> Địa chỉ
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>{renderContent()}</div>
    </div>
  );
};

export default Profile;
