import React, {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import Constanst from "../../../Constanst";
import {SnackbarProvider, useSnackbar} from "notistack";
import {Button as RBButton, Modal as RBModal} from "react-bootstrap";

/* ======================= THEME CSS (Modal) ======================= */
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
        background:#E74C3C; border-color:#E74C3C;
      }
      .modal-soft-blue .btn-primary:hover{
        background:#C0392B; border-color:#C0392B;
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

/* ======================= THEME ======================= */
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

/* ======================= STYLES ======================= */
const styles = {
  phoneGroup: {display: "flex", gap: 8, alignItems: "center"},
  phonePrefix: {
    padding: "10px 12px",
    border: `1px solid ${colors.borderColor}`,
    borderRadius: 6,
    background: "#f8f9fa",
    fontWeight: 600,
    userSelect: "none",
  },

  pageContainer: {
    display: "flex",
    backgroundColor: colors.lightGreyBackground,
    minHeight: "calc(100vh - 70px)",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  sidebar: {
    width: 280,
    flexShrink: 0,
    marginRight: 20,
    backgroundColor: colors.white,
    borderRadius: 8,
    boxShadow: cardShadow,
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    padding: 20,
    borderBottom: `1px solid ${colors.borderColor}`,
  },
  sidebarAvatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    marginRight: 15,
    objectFit: "cover",
  },
  sidebarUserName: {fontWeight: 600, fontSize: 16, color: colors.darkText},
  sidebarUserEmail: {
    fontSize: 13,
    color: colors.textGrey,
    wordBreak: "break-all",
  },
  sidebarNav: {padding: "10px 0", listStyle: "none", margin: 0},
  sidebarNavItem: {
    display: "flex",
    alignItems: "center",
    padding: "14px 20px",
    cursor: "pointer",
    color: colors.textGrey,
    fontSize: 15,
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

  mainContent: {flexGrow: 1},
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
  formGroup: {marginBottom: 16},
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
  readOnlyValue: {fontSize: 15, padding: "10px 0", color: colors.textGrey},
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 10,
  },
  button: {
    border: "none",
    padding: "10px 22px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15,
    transition: "all .2s",
  },
  saveButton: {backgroundColor: colors.primaryRed, color: colors.white},
  editButton: {backgroundColor: "#30A1F6", color: colors.white},
  cancelButton: {
    backgroundColor: colors.white,
    color: colors.textGrey,
    border: `1px solid ${colors.borderColor}`,
  },
  errorMsg: {color: "#d93025", textAlign: "left", marginTop: 6, fontSize: 14},

  addrList: {display: "flex", flexDirection: "column", gap: 12},
  addrItem: {
    border: `1px solid ${colors.borderColor}`,
    borderRadius: 8,
    padding: 12,
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: 12,
    alignItems: "start",
  },
  addrActions: {display: "flex", gap: 8},
  pillDefault: {
    display: "inline-block",
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    background: "#E9F5FF",
    color: colors.blueLink,
    marginLeft: 8,
  },
  divider: {height: 1, background: colors.borderColor, margin: "12px 0"},

  addrNameRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 16,
    color: colors.darkText,
    fontWeight: 600,
  },
  addrPhone: {color: colors.textGrey, fontWeight: 500},
  addrLine: {color: colors.textGrey, marginTop: 2},
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

// Provinces & wards
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

/* ========= Phone utils ========= */
const toE164VN = (raw) => {
  if (!raw) return "";
  let d = String(raw).replace(/\D+/g, "");
  if (d.startsWith("84")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  if (!d) return "";
  return `+84${d}`;
};
const isValidE164VNMobile = (e164) => /^\+84[1-9]\d{8}$/.test(e164);
const formatE164VNForView = (rawOrE164) => {
  const e164 = rawOrE164?.startsWith("+84") ? rawOrE164 : toE164VN(rawOrE164);
  const m = e164.match(/^\+84(\d{9})$/);
  if (!m) return rawOrE164 || "";
  const s = m[1];
  return `(+84) ${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6)}`;
};

/* ======================= Personal Info ======================= */
const PersonalInfoView = ({profile, onSave}) => {
  const {enqueueSnackbar} = useSnackbar();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: profile.name,
    phone: profile.phone,
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setEditedProfile({name: profile.name, phone: profile.phone});
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
      enqueueSnackbar("Ảnh không hợp lệ", {variant: "error"});
      return;
    }
    const MAX = 5 * 1024 * 1024;
    if (file.size > MAX) {
      setSelectedAvatar(null);
      setErrorMsg("Ảnh quá lớn (tối đa 5MB).");
      enqueueSnackbar("Ảnh quá lớn", {variant: "error"});
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
      enqueueSnackbar("Không có thay đổi nào để lưu.", {variant: "info"});
      setIsEditing(false);
      setSelectedAvatar(null);
      return;
    }
    if (!validate()) return;
    try {
      await onSave(editedProfile, selectedAvatar);
      enqueueSnackbar("Cập nhật hồ sơ thành công", {variant: "success"});
      setIsEditing(false);
      setSelectedAvatar(null);
    } catch {
      enqueueSnackbar("Cập nhật thất bại", {variant: "error"});
    }
  };

  return (
      <div style={styles.card}>
        <h3 style={styles.cardHeader}>Thông tin cá nhân</h3>

        <div style={{...styles.formGroup, textAlign: "center"}}>
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
                      setEditedProfile({...editedProfile, name: e.target.value})
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
                      setEditedProfile({...editedProfile, phone: e.target.value})
                  }
                  style={styles.input}
                  placeholder="Ví dụ: 09xxxxxxxx"
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
                      setEditedProfile({name: profile.name, phone: profile.phone});
                    }}
                    style={{...styles.button, ...styles.cancelButton}}
                >
                  Hủy
                </button>
                <button
                    onClick={handleSave}
                    style={{...styles.button, ...styles.saveButton}}
                >
                  Lưu thay đổi
                </button>
              </>
          ) : (
              <button
                  onClick={() => setIsEditing(true)}
                  style={{...styles.button, ...styles.editButton}}
              >
                Chỉnh sửa
              </button>
          )}
        </div>
      </div>
  );
};

/* ======================= Address Form (reuse trong popup) ======================= */
const AddressForm = ({value, onChange}) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [err, setErr] = useState("");

  const provinceCode = value?.provinceCode || "";
  const districtCode = value?.districtCode || "";
  const wardCode = value?.wardCode || "";
  const houseNumber = value?.houseNumber || "";
  const recipientName = value?.recipientName || "";

  // Load Provinces
  useEffect(() => {
    setLoadingProvinces(true);
    fetch("https://provinces.open-api.vn/api/p/")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) =>
            setProvinces(data.map((p) => ({code: p.code, name: p.name})))
        )
        .catch(() => setErr("Không tải được danh sách Tỉnh/Thành."))
        .finally(() => setLoadingProvinces(false));
  }, []);

  // Load Districts when province changes
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      onChange?.({...value, districtCode: "", districtName: "", wardCode: "", wardName: ""});
      return;
    }
    setLoadingDistricts(true);
    fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) =>
            setDistricts(data?.districts?.map((d) => ({code: d.code, name: d.name})) || [])
        )
        .catch(() => setErr("Không tải được danh sách Quận/Huyện."))
        .finally(() => setLoadingDistricts(false));
  }, [provinceCode]);

  // Load Wards when district changes
  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      onChange?.({...value, wardCode: "", wardName: ""});
      return;
    }
    setLoadingWards(true);
    fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) =>
            setWards(data?.wards?.map((w) => ({code: w.code, name: w.name})) || [])
        )
        .catch(() => setErr("Không tải được danh sách Phường/Xã."))
        .finally(() => setLoadingWards(false));
  }, [districtCode]);

  const onProvinceChange = (code) => {
    const name = provinces.find((p) => String(p.code) === String(code))?.name || "";
    onChange?.({
      ...value,
      provinceCode: code,
      provinceName: name,
      districtCode: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    });
  };

  const onDistrictChange = (code) => {
    const name = districts.find((d) => String(d.code) === String(code))?.name || "";
    onChange?.({
      ...value,
      districtCode: code,
      districtName: name,
      wardCode: "",
      wardName: "",
    });
  };

  const onWardChange = (code) => {
    const name = wards.find((w) => String(w.code) === String(code))?.name || "";
    onChange?.({...value, wardCode: code, wardName: name});
  };

  const fullAddress = [houseNumber, value?.wardName, value?.districtName, value?.provinceName]
      .filter(Boolean)
      .join(", ");

  return (
      <div style={{marginTop: 8}}>
        {/* Người nhận */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Tên người nhận</label>
          <input
              type="text"
              value={recipientName}
              onChange={(e) => onChange?.({...value, recipientName: e.target.value})}
              style={styles.input}
              placeholder="VD: Nguyễn Văn A"
          />
        </div>

        {/* SĐT */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Số điện thoại người nhận</label>
          <div style={styles.phoneGroup}>
            <div style={styles.phonePrefix}>+84</div>
            <input
                type="tel"
                inputMode="numeric"
                value={String(value?.recipientPhone || "")}
                onChange={(e) => {
                  let d = e.target.value.replace(/\D+/g, "");
                  if (d.length > 10) d = d.slice(0, 10);
                  onChange?.({...value, recipientPhone: d});
                }}
                placeholder="Số Điện Thoại"
                style={{...styles.input, flex: 1}}
            />
          </div>
        </div>

        {/* Province */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Tỉnh / Thành phố</label>
          <select value={provinceCode} onChange={(e) => onProvinceChange(e.target.value)} style={styles.input}>
            <option value="">{loadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành"}</option>
            {provinces.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Quận / Huyện</label>
          <select
              value={districtCode}
              onChange={(e) => onDistrictChange(e.target.value)}
              disabled={!provinceCode || loadingDistricts}
              style={styles.input}
          >
            <option value="">
              {provinceCode
                  ? loadingDistricts
                      ? "Đang tải..."
                      : "Chọn Quận/Huyện"
                  : "Chọn Tỉnh trước"}
            </option>
            {districts.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Ward */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Phường / Xã</label>
          <select
              value={wardCode}
              onChange={(e) => onWardChange(e.target.value)}
              disabled={!districtCode || loadingWards}
              style={styles.input}
          >
            <option value="">
              {districtCode
                  ? loadingWards
                      ? "Đang tải..."
                      : "Chọn Phường/Xã"
                  : "Chọn Quận/Huyện trước"}
            </option>
            {wards.map((w) => (
                <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
        </div>

        {/* House Number */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Số nhà / Địa chỉ chi tiết</label>
          <input
              type="text"
              value={houseNumber}
              onChange={(e) => onChange?.({...value, houseNumber: e.target.value})}
              placeholder="VD: Số 139, Tổ 5, Ấp ..."
              style={styles.input}
          />
        </div>

        {/* Preview */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Xem trước địa chỉ</label>
          <div style={styles.readOnlyValue}>{fullAddress || "Chưa đủ thông tin"}</div>
        </div>

        {err && <div style={styles.errorMsg}>{err}</div>}
      </div>
  );
};


const AddressView = ({initialAddresses, defaultAddressId, onSave}) => {
  const {enqueueSnackbar} = useSnackbar();

  const [addresses, setAddresses] = useState(
      Array.isArray(initialAddresses) ? initialAddresses : []
  );
  const [currentDefaultId, setCurrentDefaultId] = useState(
      defaultAddressId || null
  );

  const [error, setError] = useState("");

  // delete modal
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // unified add/edit modal
  const [showUpsertModal, setShowUpsertModal] = useState(false);
  const [upsertMode, setUpsertMode] = useState("create"); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null); // id khi edit
  const [formValue, setFormValue] = useState(null);


  const persistNow = async (nextList, nextDefault) => {
    try {
      await onSave(nextList, nextDefault);
      setError("");
    } catch (e) {
      enqueueSnackbar(e?.message || "Lỗi lưu địa chỉ", {variant: "error"});
      setError(e?.message || "Lỗi lưu địa chỉ");
    }
  };

  const setDefault = async (id) => {
    const nextList = addresses.map((a) => ({...a, isDefault: a.id === id}));
    setAddresses(nextList);
    setCurrentDefaultId(id);
    enqueueSnackbar("Đã đặt làm địa chỉ mặc định", {variant: "success"});
    // LƯU NGAY
    await persistNow(
        nextList.map((a) => ({
          ...a,
          recipientPhone: toE164VN(a.recipientPhone),
          fullAddress: [a.houseNumber, a.wardName, a.provinceName]
              .filter(Boolean)
              .join(", "),
        })),
        id
    );
  };

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

  const confirmDelete = async () => {
    const id = deleteId;
    const next = addresses.filter((a) => a.id !== id);
    let nextDefault = currentDefaultId;
    if (id === currentDefaultId) nextDefault = next[0]?.id || null;

    const nextWithDefault = next.map((a, idx) => ({
      ...a,
      isDefault:
          (nextDefault && a.id === nextDefault) || (!nextDefault && idx === 0),
    }));

    setAddresses(nextWithDefault);
    setCurrentDefaultId(nextDefault);
    setShowDeleteModal(false);
    setDeleteId(null);
    enqueueSnackbar("Xóa địa chỉ thành công", {variant: "success"});

    // LƯU NGAY
    await persistNow(
        nextWithDefault.map((a) => ({
          ...a,
          recipientPhone: toE164VN(a.recipientPhone),
          fullAddress: [a.houseNumber, a.wardName, a.provinceName]
              .filter(Boolean)
              .join(", "),
        })),
        nextDefault ?? nextWithDefault[0]?.id ?? null
    );
  };

  const validateOne = (a) => {
    if (!a.recipientName || !a.recipientName.trim()) {
      setError("Tên người nhận là bắt buộc.");
      return false;
    }
    const e164 = toE164VN(a.recipientPhone);
    if (!isValidE164VNMobile(e164)) {
      setError("SĐT không hợp lệ (+84…).");
      return false;
    }
    if (!a.houseNumber || !a.provinceCode || !a.wardCode) {
      setError("Thiếu Tỉnh/Thành, Phường/Xã hoặc Số nhà/địa chỉ.");
      return false;
    }
    if (!ADDRESS_ALLOWED_REGEX.test(a.houseNumber)) {
      setError("Địa chỉ có ký tự không hợp lệ.");
      return false;
    }
    return true;
  };

  const openCreateModal = () => {
    setUpsertMode("create");
    setEditingId(null);
    setFormValue({
      id: uuid(),
      recipientName: "",
      recipientPhone: "",
      houseNumber: "",
      wardCode: "",
      wardName: "",
      provinceCode: "",
      provinceName: "",
      fullAddress: "",
    });
    setShowUpsertModal(true);
    setError("");
  };

  const openEditModal = (id) => {
    const target = addresses.find((a) => a.id === id);
    if (!target) return;
    setUpsertMode("edit");
    setEditingId(id);
    setFormValue({...target});
    setShowUpsertModal(true);
    setError("");
  };

  const handleUpsert = async () => {
    if (!formValue) return;
    const a = formValue;

    if (!validateOne(a)) return;

    const full = [a.houseNumber, a.wardName, a.provinceName]
        .filter(Boolean)
        .join(", ");
    if (full.length > 500) {
      setError("Một địa chỉ quá dài (tối đa 500 ký tự).");
      return;
    }
    const e164 = toE164VN(a.recipientPhone);

    let nextList;
    let nextDefault = currentDefaultId;

    if (upsertMode === "create") {
      const newId = a.id || uuid();
      nextList = [
        ...addresses,
        {...a, id: newId, recipientPhone: e164, fullAddress: full},
      ];
      setAddresses(nextList);
      if (!currentDefaultId && nextList.length === 1) {
        nextDefault = newId;
        setCurrentDefaultId(newId);
        nextList = nextList.map((x) => ({...x, isDefault: x.id === newId}));
      }
      enqueueSnackbar("Thêm địa chỉ thành công", {variant: "success"});
    } else {
      nextList = addresses.map((x) =>
          x.id === editingId
              ? {...a, id: editingId, recipientPhone: e164, fullAddress: full}
              : x
      );
      setAddresses(nextList);
      enqueueSnackbar("Cập nhật địa chỉ thành công", {variant: "success"});
    }

    setShowUpsertModal(false);
    setFormValue(null);
    setEditingId(null);

    // LƯU NGAY
    await persistNow(
        nextList.map((x) => ({
          ...x,
          recipientPhone: toE164VN(x.recipientPhone),
          fullAddress: [x.houseNumber, x.wardName, x.provinceName]
              .filter(Boolean)
              .join(", "),
        })),
        nextDefault ?? (nextList[0] && nextList[0].id) ?? null
    );
  };

  return (
      <div style={styles.card}>
        <SoftBlueCSS/>
        <h3 style={styles.cardHeader}>Địa chỉ của tôi</h3>

        <div style={styles.formGroup}>
          {addresses.length === 0 ? (
              <div style={styles.readOnlyValue}>Chưa có địa chỉ.</div>
          ) : (
              <div style={styles.addrList}>
                {addresses.map((a) => {
                  const phoneView = formatE164VNForView(a.recipientPhone);
                  return (
                      <div key={a.id} style={styles.addrItem}>
                        <input
                            type="radio"
                            name="defaultAddress"
                            checked={currentDefaultId === a.id}
                            onChange={() => setDefault(a.id)}
                            title="Chọn làm mặc định (tự lưu)"
                            style={{marginTop: 4}}
                        />

                        <div>
                          <div style={styles.addrNameRow}>
                            <span>{a.recipientName || "—"}</span>
                            {phoneView && <span style={{color: "#c4c4c4"}}>|</span>}
                            {phoneView && (
                                <span style={styles.addrPhone}>{phoneView}</span>
                            )}
                            {a.id === currentDefaultId && (
                                <span style={styles.pillDefault}>Mặc định</span>
                            )}
                          </div>
                          <div style={styles.addrLine}>
                            {a.houseNumber || "Chưa đủ thông tin"}
                          </div>
                          <div style={styles.addrLine}>
                            {[a.wardName, a.provinceName].filter(Boolean).join(", ")}
                          </div>
                        </div>

                        <div style={styles.addrActions}>
                          <button
                              onClick={() => openEditModal(a.id)}
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
                      </div>
                  );
                })}
              </div>
          )}
        </div>

        {/* CHỈ CÒN NÚT THÊM — KHÔNG CÒN NÚT "Lưu" */}
        <div style={{display: "flex", gap: 10}}>
          <button
              onClick={openCreateModal}
              style={{...styles.button, ...styles.editButton}}
          >
            Thêm địa chỉ
          </button>
        </div>

        {error && <div style={{...styles.errorMsg, marginTop: 8}}>{error}</div>}

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
            <RBButton variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Đóng
            </RBButton>
            <RBButton variant="primary" onClick={confirmDelete}>
              Đồng ý xóa
            </RBButton>
          </RBModal.Footer>
        </RBModal>

        {/* Modal THÊM/SỬA (Soft Blue) */}
        <RBModal
            show={showUpsertModal}
            onHide={() => {
              setShowUpsertModal(false);
              setFormValue(null);
              setEditingId(null);
            }}
            centered
            dialogClassName="modal-soft-blue"
            backdrop="static"
            keyboard={false}
            size="lg"
        >
          <RBModal.Header closeButton>
            <RBModal.Title>
              {upsertMode === "create" ? "Thêm địa chỉ" : "Sửa địa chỉ"}
            </RBModal.Title>
          </RBModal.Header>
          <RBModal.Body>
            {formValue && (
                <AddressForm value={formValue} onChange={setFormValue}/>
            )}
            {error && <div style={{...styles.errorMsg, marginTop: 8}}>{error}</div>}
          </RBModal.Body>
          <RBModal.Footer>
            <RBButton
                variant="secondary"
                onClick={() => {
                  setShowUpsertModal(false);
                  setFormValue(null);
                  setEditingId(null);
                }}
            >
              Hủy
            </RBButton>
            <RBButton variant="primary" onClick={handleUpsert}>
              {upsertMode === "create" ? "Thêm" : "Cập nhật"}
            </RBButton>
          </RBModal.Footer>
        </RBModal>
      </div>
  );
};

/* ======================= Main Profile ======================= */
const Profile = () => {
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
          headers: {Authorization: `Bearer ${token}`},
        }),
        fetch(`${Constanst.DOMAIN_API}/api/users/${decoded.id}/addresses`, {
          headers: {Authorization: `Bearer ${token}`},
        }),
      ]);

      if (!userRes.ok) throw new Error("Không thể tải hồ sơ.");
      if (!addrRes.ok) throw new Error("Không thể tải địa chỉ.");

      const user = await userRes.json();
      const addrPayload = await addrRes.json(); // { addresses, defaultAddressId }

      setProfile({
        ...user,
        addresses: (addrPayload.addresses || []).map((a) => ({
          ...a,
          recipientName: a.recipientName || a.recipient_name || "",
          recipientPhone: a.recipientPhone || a.recipient_phone || "",
        })),
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
      headers: {Authorization: `Bearer ${token}`},
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
            body: JSON.stringify({addresses, defaultAddressId}),
          }
      );

      if (!res.ok) throw new Error("Cập nhật địa chỉ thất bại.");

      await fetchProfile();
      // ❌ BỎ enqueueSnackbar ở đây để không bị double
    } catch (err) {
      // ❌ Không snackbar ở đây, chỉ throw để AddressView xử lý
      throw err;
    }
  };


  const renderContent = () => {
    if (loading) return <div style={styles.card}>Đang tải...</div>;
    if (error)
      return <div style={{...styles.card, ...styles.errorMsg}}>{error}</div>;
    if (!profile)
      return <div style={styles.card}>Không tìm thấy dữ liệu hồ sơ.</div>;

    const initialAddresses = Array.isArray(profile.addresses)
        ? profile.addresses
        : [];

    return (
        <>
          {activeView === "info" && (
              <PersonalInfoView profile={profile} onSave={handleSaveProfile}/>
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
        anchorOrigin={{vertical: "top", horizontal: "right"}}
    >
      <Profile/>
    </SnackbarProvider>
);

export default WrappedProfile;
