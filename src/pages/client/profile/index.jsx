import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Constanst from "../../../Constanst";
import { SnackbarProvider, useSnackbar } from "notistack";
import { Modal as RBModal, Button as RBButton } from "react-bootstrap";

const SoftBlueCSS = () => (
  <style>{`
    .modal-soft-blue .modal-content{
      background:#ffffff;
      border:1px solid #cfe3ff;
      box-shadow:0 10px 30px rgba(20,60,120,.15);
      border-radius:14px;
    }
    .modal-soft-blue .modal-header{
      background:#eaf3ff;
      color:#0b3d91;
      border-bottom:1px solid #cfe3ff;
      border-top-left-radius:14px;
      border-top-right-radius:14px;
    }
    .modal-soft-blue .modal-title{ font-weight:600; }
    .modal-soft-blue .modal-body{ color:#193b6a; }
   .modal-soft-blue .btn-primary{
  background:#E74C3C;  /* đỏ */
  border-color:#E74C3C;
}
.modal-soft-blue .btn-primary:hover{
  background:#C0392B;  /* đỏ đậm khi hover */
  border-color:#C0392B;
}

    .modal-soft-blue .btn-secondary{
      background:#e9f2ff; color:#0b3d91; border-color:#cfe3ff;
    }
    .modal-soft-blue .btn-secondary:hover{
      background:#dbeaff; color:#0b3d91; border-color:#bed7ff;
    }
    .modal-soft-blue .btn-close{
      filter: invert(24%) sepia(16%) saturate(1783%) hue-rotate(189deg) brightness(90%) contrast(88%);
    }
  `}</style>
);

const colors = {
  primaryRed: "#E74C3C",
  lightGreyBackground: "#F0F2F5",
  white: "#FFFFFF",
  borderColor: "#E0E0E0",
  textGrey: "#666",
  darkText: "#333",
  blueLink: "#007bff",
};

const cardShadow = "0 2px 8px rgba(0,0,0,0.05)";

const styles = {
  pageContainer: {
    display: "flex",
    backgroundColor: colors.lightGreyBackground,
    minHeight: "calc(100vh - 70px)",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  sidebar: {
    width: "280px",
    flexShrink: 0,
    marginRight: "20px",
    backgroundColor: colors.white,
    borderRadius: "8px",
    boxShadow: cardShadow,
    padding: 0,
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
  sidebarUserName: { fontWeight: 600, fontSize: 16, color: colors.darkText },
  sidebarUserEmail: {
    fontSize: 13,
    color: colors.textGrey,
    wordBreak: "break-all",
  },
  sidebarNav: { padding: "10px 0", listStyle: "none", margin: 0 },
  sidebarNavItem: {
    display: "flex",
    alignItems: "center",
    padding: "14px 20px",
    cursor: "pointer",
    color: colors.textGrey,
    fontSize: "15px",
    transition: "all .2s ease",
    borderLeft: "3px solid transparent",
  },
  sidebarNavItemActive: {
    backgroundColor: "#E9F5FF",
    color: colors.blueLink,
    fontWeight: 600,
    borderLeft: `3px solid ${colors.blueLink}`,
  },
  sidebarNavIcon: {
    marginRight: 15,
    fontSize: 18,
    width: 20,
    textAlign: "center",
  },
  mainContent: { flexGrow: 1 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    boxShadow: cardShadow,
    padding: 24,
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: `1px solid ${colors.borderColor}`,
    color: colors.darkText,
  },
  formGroup: { marginBottom: 20 },
  label: {
    fontWeight: 600,
    display: "block",
    marginBottom: 8,
    color: colors.darkText,
    fontSize: 14,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 15,
    borderRadius: 6,
    border: `1px solid ${colors.borderColor}`,
    boxSizing: "border-box",
  },
  readOnlyValue: { fontSize: 15, padding: "10px 0", color: colors.textGrey },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 25,
    gap: 10,
  },
  button: {
    border: "none",
    padding: "10px 25px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15,
    transition: "all .2s",
  },
  saveButton: { backgroundColor: colors.primaryRed, color: colors.white },
  editButton: { backgroundColor: "#30A1F6", color: colors.white },
  cancelButton: {
    backgroundColor: colors.white,
    color: colors.textGrey,
    border: `1px solid ${colors.borderColor}`,
  },
  errorMsg: { color: "red", textAlign: "left", marginTop: 6, fontSize: 14 },
  // Address
  addrList: { display: "flex", flexDirection: "column", gap: 12 },
  addrItem: {
    border: `1px solid ${colors.borderColor}`,
    borderRadius: 8,
    padding: 12,
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: 12,
    alignItems: "center",
  },
  addrActions: { display: "flex", gap: 8 },
  pillDefault: {
    display: "inline-block",
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    background: "#E9F5FF",
    color: colors.blueLink,
    marginLeft: 8,
  },
  divider: { height: 1, background: colors.borderColor, margin: "16px 0" },
};

/* ======================= Helpers ======================= */
const uuid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const dedupeBy = (arr, getKey) => {
  const seen = new Set();
  return (Array.isArray(arr) ? arr : []).filter((item) => {
    const k = String(getKey(item));
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// Normalize provinces & wards
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

const normalizeWards = (arr) => {
  const list = (Array.isArray(arr) ? arr : [])
    .map((w) => ({
      code: w?.ward_code ?? w?.code ?? w?.id ?? w?.value ?? "",
      name: w?.ward_name ?? w?.name ?? w?.full_name ?? w?.text ?? "",
    }))
    .filter((w) => w.code && w.name);
  return dedupeBy(list, (x) => x.code);
};

const ADDRESS_ALLOWED_REGEX = /^[0-9A-Za-zÀ-ỹ\s,./-]+$/u;

/* ======================= Personal Info ======================= */
const PersonalInfoView = ({ profile, onSave }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: profile.name,
    phone: profile.phone,
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setEditedProfile({ name: profile.name, phone: profile.phone });
  }, [profile]);

  const PHONE_REGEX = /^0\d{8,10}$/;

  const handleAvatarPick = (file) => {
    setErrorMsg("");
    if (!file) return;
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowed.includes(file.type)) {
      setSelectedAvatar(null);
      setErrorMsg("Định dạng ảnh không hợp lệ (JPG/PNG/WEBP/GIF).");
      enqueueSnackbar("Ảnh không hợp lệ", { variant: "error" });
      return;
    }
    const MAX = 5 * 1024 * 1024;
    if (file.size > MAX) {
      setSelectedAvatar(null);
      setErrorMsg("Ảnh quá lớn (tối đa 5MB).");
      enqueueSnackbar("Ảnh quá lớn", { variant: "error" });
      return;
    }
    setSelectedAvatar(file);
  };

  const noChanges =
    (editedProfile.name || "") === (profile.name || "") &&
    (editedProfile.phone || "") === (profile.phone || "") &&
    !selectedAvatar;

  const validate = () => {
    if (!editedProfile.name || !editedProfile.name.trim()) {
      setErrorMsg("Tên hiển thị là bắt buộc.");
      return false;
    }
    if (!editedProfile.phone || !PHONE_REGEX.test(editedProfile.phone.trim())) {
      setErrorMsg("Số điện thoại phải bắt đầu bằng 0 và dài 9–11 chữ số.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const handleSave = async () => {
    if (noChanges) {
      enqueueSnackbar("Không có thay đổi nào để lưu.", { variant: "info" });
      setIsEditing(false);
      setSelectedAvatar(null);
      return;
    }
    if (!validate()) return;
    try {
      await onSave(editedProfile, selectedAvatar);
      enqueueSnackbar("Cập nhật hồ sơ thành công", { variant: "success" });
      setIsEditing(false);
      setSelectedAvatar(null);
    } catch {
      enqueueSnackbar("Cập nhật thất bại", { variant: "error" });
    }
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
            onChange={(e) => handleAvatarPick(e.target.files[0])}
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
        <label style={styles.label}>Tên hiển thị</label>
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
        <label style={styles.label}>Email</label>
        <div style={styles.readOnlyValue}>{profile.email}</div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Số điện thoại</label>
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

      {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}

      <div style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <button
              onClick={() => {
                setIsEditing(false);
                setSelectedAvatar(null);
                setEditedProfile({ name: profile.name, phone: profile.phone });
              }}
              style={{ ...styles.button, ...styles.cancelButton }}
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
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

/* ======================= Address Form (không có nút Lưu riêng) ======================= */
const AddressForm = ({ value, onChange, onCancel }) => {
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [err, setErr] = useState("");

  // value: { houseNumber, provinceCode, provinceName, wardCode, wardName }
  const provinceCode = value?.provinceCode || "";
  const wardCode = value?.wardCode || "";
  const houseNumber = value?.houseNumber || "";

  useEffect(() => {
    setLoadingProvinces(true);
    fetch("https://34tinhthanh.com/api/provinces")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setProvinces(normalizeProvinces(data)))
      .catch(() => setErr("Không tải được danh sách Tỉnh/Thành."))
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      onChange?.({ ...value, wardCode: "", wardName: "" });
      return;
    }
    setLoadingWards(true);
    fetch(
      `https://34tinhthanh.com/api/wards?province_code=${encodeURIComponent(
        provinceCode
      )}`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setWards(normalizeWards(data)))
      .catch(() => setErr("Không tải được danh sách Phường/Xã."))
      .finally(() => setLoadingWards(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCode]);

  const onProvinceChange = (code) => {
    const name =
      provinces.find((p) => String(p.code) === String(code))?.name || "";
    onChange?.({
      ...value,
      provinceCode: code,
      provinceName: name,
      wardCode: "",
      wardName: "",
    });
  };
  const onWardChange = (code) => {
    const name = wards.find((w) => String(w.code) === String(code))?.name || "";
    onChange?.({ ...value, wardCode: code, wardName: name });
  };
  const onHouseChange = (text) => {
    onChange?.({ ...value, houseNumber: text });
  };

  const fullAddress = [houseNumber, value?.wardName, value?.provinceName]
    .filter(Boolean)
    .join(", ");

  return (
    <div style={{ marginTop: 8 }}>
      {/* Thứ tự: Tỉnh/Thành -> Phường/Xã -> Số nhà/địa chỉ */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Tỉnh / Thành phố</label>
        <select
          value={provinceCode}
          onChange={(e) => onProvinceChange(e.target.value)}
          style={styles.input}
        >
          <option value="">
            {loadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành"}
          </option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Phường / Xã</label>
        <select
          value={wardCode}
          onChange={(e) => onWardChange(e.target.value)}
          disabled={!provinceCode || loadingWards}
          style={styles.input}
        >
          <option value="">
            {provinceCode
              ? loadingWards
                ? "Đang tải..."
                : "Chọn Phường/Xã"
              : "Chọn Tỉnh trước"}
          </option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Số nhà / Địa chỉ chi tiết</label>
        <input
          type="text"
          value={houseNumber}
          onChange={(e) => onHouseChange(e.target.value)}
          placeholder="VD: 123, ngõ 45, đường ABC"
          style={styles.input}
        />
        {houseNumber && !ADDRESS_ALLOWED_REGEX.test(houseNumber) && (
          <div style={styles.errorMsg}>
            Địa chỉ chỉ được dùng chữ, số, khoảng trắng và , . / -
          </div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Xem trước địa chỉ</label>
        <div style={styles.readOnlyValue}>
          {fullAddress || "Chưa đủ thông tin"}
        </div>
      </div>

      {err && <div style={styles.errorMsg}>{err}</div>}

      {/* Không có nút Lưu riêng, chỉ có Hủy bản nháp (nếu cần) */}
      {onCancel && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{ ...styles.button, ...styles.cancelButton }}
          >
            Hủy thêm mới
          </button>
        </div>
      )}
    </div>
  );
};

/* ======================= Address View ======================= */
const AddressView = ({ initialAddresses, defaultAddressId, onSave }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [addresses, setAddresses] = useState(
    Array.isArray(initialAddresses) ? initialAddresses : []
  );
  const [currentDefaultId, setCurrentDefaultId] = useState(
    defaultAddressId || null
  );

  const [editingId, setEditingId] = useState(null);
  const [newDraft, setNewDraft] = useState(null); // bản nháp địa chỉ mới
  const [error, setError] = useState("");

  // Xóa địa chỉ (modal)
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // render dòng mô tả ngắn
  const partsLine = (a) =>
    [a.houseNumber, a.wardName, a.provinceName].filter(Boolean).join(" • ") ||
    "Chưa đủ thông tin";

  const setDefault = (id) => {
    setCurrentDefaultId(id);
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const toggleEdit = (id) => setEditingId((cur) => (cur === id ? null : id));

  const updateAddress = (id, next) =>
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...next } : a))
    );

  const handleDelete = (id) => {
    if (addresses.length <= 1) {
      setError("Không thể xóa: cần có ít nhất một địa chỉ.");
      enqueueSnackbar("Không thể xóa: cần có ít nhất một địa chỉ.", {
        variant: "warning",
      });
      return;
    }
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const id = deleteId;
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
    setShowDeleteModal(false);
    setDeleteId(null);
    setEditingId((cur) => (cur === id ? null : cur));
    enqueueSnackbar("Xóa địa chỉ thành công", { variant: "success" });
  };

  const handleSaveAll = () => {
    setError("");

    // Gom danh sách cuối cùng (bao gồm draft nếu có)
    const combined = [...addresses];
    let draftId = null;

    if (newDraft) {
      // Validate draft trước khi thêm vào combined
      if (
        !newDraft.houseNumber ||
        !newDraft.provinceCode ||
        !newDraft.wardCode
      ) {
        setError("Địa chỉ mới cần đủ Tỉnh/Thành, Phường/Xã và Số nhà/địa chỉ.");
        return;
      }
      if (!ADDRESS_ALLOWED_REGEX.test(newDraft.houseNumber)) {
        setError("Địa chỉ chỉ được dùng chữ, số, khoảng trắng và , . / -");
        return;
      }
      const full = [
        newDraft.houseNumber,
        newDraft.wardName,
        newDraft.provinceName,
      ]
        .filter(Boolean)
        .join(", ");
      if (full.length > 500) {
        setError("Địa chỉ mới quá dài (tối đa 500 ký tự).");
        return;
      }
      draftId = uuid();
      combined.push({ id: draftId, ...newDraft });
    }

    if (!combined.length) {
      setError("Vui lòng thêm ít nhất một địa chỉ.");
      return;
    }

    // Validate toàn bộ trước khi gửi
    for (const a of combined) {
      if (!a.houseNumber || !a.provinceCode || !a.wardCode) {
        setError("Mỗi địa chỉ cần đủ Tỉnh/Thành, Phường/Xã và Số nhà/địa chỉ.");
        return;
      }
      if (!ADDRESS_ALLOWED_REGEX.test(a.houseNumber)) {
        setError("Một địa chỉ có ký tự không hợp lệ.");
        return;
      }
      const full = [a.houseNumber, a.wardName, a.provinceName]
        .filter(Boolean)
        .join(", ");
      if (full.length > 500) {
        setError("Một địa chỉ quá dài (tối đa 500 ký tự).");
        return;
      }
    }

    const defaultId = currentDefaultId || draftId || combined[0].id;
    const normalized = combined.map((a) => ({
      ...a,
      isDefault: a.id === defaultId,
      fullAddress: [a.houseNumber, a.wardName, a.provinceName]
        .filter(Boolean)
        .join(", "),
    }));

    // Chỉ parent hiển thị snackbar cho thao tác lưu để tránh trùng 2 thông báo
    onSave(normalized, defaultId);
    setNewDraft(null);
    setEditingId(null);
  };

  return (
    <div style={styles.card}>
      <SoftBlueCSS />
      <h3 style={styles.cardHeader}>Địa chỉ của tôi</h3>

      <div style={styles.formGroup}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>
          Danh sách địa chỉ
        </div>

        {addresses.length === 0 ? (
          <div style={styles.readOnlyValue}>Chưa có địa chỉ.</div>
        ) : (
          <div style={styles.addrList}>
            {addresses.map((a) => (
              <div key={a.id} style={styles.addrItem}>
                <input
                  type="radio"
                  name="defaultAddress"
                  checked={currentDefaultId === a.id}
                  onChange={() => setDefault(a.id)}
                  title="Chọn làm mặc định"
                />

                <div>
                  <div style={{ fontWeight: 600 }}>
                    {a.fullAddress || "Chưa đủ thông tin"}
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
                    {partsLine(a)}
                  </div>
                </div>

                <div style={styles.addrActions}>
                  <button
                    onClick={() => toggleEdit(a.id)}
                    style={{
                      ...styles.button,
                      ...styles.cancelButton,
                      padding: "8px 12px",
                    }}
                  >
                    {editingId === a.id ? "Đóng chỉnh sửa" : "Sửa"}
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
                      value={a}
                      onChange={(next) => updateAddress(a.id, next)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {!newDraft ? (
        <button
          onClick={() =>
            setNewDraft({
              id: uuid(),
              houseNumber: "",
              wardCode: "",
              wardName: "",
              provinceCode: "",
              provinceName: "",
              fullAddress: "",
            })
          }
          style={{ ...styles.button, ...styles.editButton }}
        >
          Thêm địa chỉ
        </button>
      ) : (
        <div style={{ marginTop: 12 }}>
          <div style={styles.divider} />
          <AddressForm
            value={newDraft}
            onChange={setNewDraft}
            onCancel={() => setNewDraft(null)}
          />
        </div>
      )}

      {error && <div style={styles.errorMsg}>{error}</div>}

      <div style={styles.buttonContainer}>
        <button
          onClick={handleSaveAll}
          style={{ ...styles.button, ...styles.saveButton }}
        >
          Lưu
        </button>
      </div>

      {/* Modal XÓA (Soft Blue) */}
      <RBModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        dialogClassName="modal-soft-blue"
        backdrop="static"
        keyboard={false}
      >
        <RBModal.Header closeButton>
          <RBModal.Title>Xác nhận xóa</RBModal.Title>
        </RBModal.Header>
        <RBModal.Body>
          <p>Bạn có chắc chắn muốn xóa địa chỉ này không?</p>
        </RBModal.Body>
        <RBModal.Footer>
          <RBButton
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Đóng
          </RBButton>
          <RBButton variant="primary" onClick={confirmDelete}>
            Đồng ý xóa
          </RBButton>
        </RBModal.Footer>
      </RBModal>
    </div>
  );
};

/* ======================= Main Profile ======================= */
const Profile = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("info"); // 'info' | 'address'

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Vui lòng đăng nhập.");
      const decoded = jwtDecode(token);

      const [userRes, addrRes] = await Promise.all([
        fetch(`${Constanst.DOMAIN_API}/api/users/${decoded.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${Constanst.DOMAIN_API}/api/users/${decoded.id}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
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
      setError("");
    } catch (err) {
      setError(err.message || "Lỗi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (editedData, avatarFile) => {
    const token = localStorage.getItem("authToken");
    const decoded = jwtDecode(token);
    const formData = new FormData();
    formData.append("name", editedData.name);
    formData.append("phone", editedData.phone);
    if (avatarFile) formData.append("avatar", avatarFile);

    const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${decoded.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Cập nhật thất bại.");
    await fetchProfile();
  };

  const handleSaveAddresses = async (addresses, defaultAddressId) => {
    try {
      const token = localStorage.getItem("authToken");
      const decoded = jwtDecode(token);
      const res = await fetch(
        `${Constanst.DOMAIN_API}/api/users/${decoded.id}/addresses-bulk`,
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
      enqueueSnackbar("Lưu địa chỉ thành công", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(err.message || "Lưu địa chỉ thất bại", {
        variant: "error",
      });
    }
  };

  const renderContent = () => {
    if (loading) return <div style={styles.card}>Đang tải...</div>;
    if (error)
      return <div style={{ ...styles.card, ...styles.errorMsg }}>{error}</div>;
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
              ...(activeView === "address" && styles.sidebarNavItemActive),
            }}
            onClick={() => setActiveView("address")}
          >
            <span style={styles.sidebarNavIcon}>📍</span> Địa chỉ
          </li>
        </ul>
      </div>

      {/* Main */}
      <div style={styles.mainContent}>{renderContent()}</div>
    </div>
  );
};

/* ======================= Wrapped (Snackbar top-right) ======================= */
const WrappedProfile = () => (
  <SnackbarProvider
    maxSnack={3}
    autoHideDuration={2500}
    anchorOrigin={{ vertical: "top", horizontal: "right" }}
  >
    <Profile />
  </SnackbarProvider>
);

export default WrappedProfile;
