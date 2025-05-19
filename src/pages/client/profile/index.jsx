import React, { useEffect, useState } from "react";
import Constanst from "../../../Constanst"; // Đảm bảo Constanst.DOMAIN_API chứa URL đúng của API của bạn
import { jwtDecode } from "jwt-decode"; // Sử dụng jwtDecode thay vì jwt_decode

const Profile = () => {
    const [profile, setProfile] = useState({
        username: "",
        name: "",
        email: "",
        phone: "",
        avatar: ""  // thêm avatar vào state
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu
    const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
    const [editedProfile, setEditedProfile] = useState({
        name: "",
        phone: ""
    });

    // Hàm lấy dữ liệu hồ sơ từ backend
    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('authToken'); // Lấy token từ localStorage
            if (!token) {
                setError("Vui lòng đăng nhập trước.");
                setLoading(false);
                return;
            }

            const decodedToken = jwtDecode(token); // Giải mã token
            const userId = decodedToken.id; // Lấy ID người dùng từ token

            const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}` // Gửi token trong header để xác thực
                }
            });

            // Kiểm tra mã phản hồi HTTP
            console.log("Mã phản hồi:", res.status); // In ra mã trạng thái

            if (!res.ok) {
                throw new Error(`Không thể lấy dữ liệu hồ sơ. Mã lỗi: ${res.status}`);
            }

            const data = await res.json();
            console.log("Dữ liệu nhận được từ API:", data); // In ra dữ liệu trả về từ API

            if (data.error) {
                throw new Error(data.error);
            }

            setProfile(data);
            setError("");
            setEditedProfile({ name: data.name, phone: data.phone });
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

    // Hàm lưu thay đổi
    const handleSave = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id; // Lấy ID người dùng từ token

            const res = await fetch(`${Constanst.DOMAIN_API}/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editedProfile.name,
                    phone: editedProfile.phone
                })
            });

            if (!res.ok) {
                throw new Error("Không thể cập nhật thông tin người dùng");
            }

            const updatedUser = await res.json();
            setProfile((prevProfile) => ({
                ...prevProfile,
                name: updatedUser.name,
                phone: updatedUser.phone
            })); // Cập nhật lại hồ sơ với thông tin đã sửa
            setIsEditing(false); // Dừng chế độ chỉnh sửa
        } catch (err) {
            console.error("Lỗi khi lưu thay đổi:", err);
            setError("Không thể lưu thay đổi, vui lòng thử lại.");
        }
    };


    // Render thông tin profile
    const renderProfileInfo = () => (
        <div className="card p-4">
            <div className="mb-3">
                <strong>Avatar:</strong><br />
                {profile.avatar ? (
                    <img
                        src={`${Constanst.DOMAIN_API}/uploads/${profile.avatar}`}
                        alt="Avatar"
                        style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }}
                    />
                ) : (
                    <span>Chưa có ảnh đại diện</span>
                )}
            </div>
            <div className="mb-3">
                <strong>Username:</strong> {profile.username}
            </div>
            <div className="mb-3">
                <strong>Name:</strong>
                {isEditing ? (
                    <input
                        type="text"
                        name="name"
                        value={editedProfile.name}
                        onChange={handleEditChange}
                        className="form-control"
                    />
                ) : (
                    profile.name
                )}
            </div>
            <div className="mb-3">
                <strong>Email:</strong> {profile.email}
            </div>
            <div className="mb-3">
                <strong>Phone:</strong>
                {isEditing ? (
                    <input
                        type="text"
                        name="phone"
                        value={editedProfile.phone}
                        onChange={handleEditChange}
                        className="form-control"
                    />
                ) : (
                    profile.phone
                )}
            </div>
            {isEditing ? (
                <div>
                    <button onClick={handleSave} className="btn btn-primary">Lưu</button>
                    <button onClick={() => setIsEditing(false)} className="btn btn-secondary ml-2">Hủy</button>
                </div>
            ) : (
                <button onClick={() => setIsEditing(true)} className="btn btn-warning">Sửa</button>
            )}
        </div>
    );


    return (
        <div className="container mt-5">
            <h1>Hồ Sơ Tài Khoản</h1>
            {loading ? (
                <div>Đang tải dữ liệu...</div> // Thông báo khi đang tải dữ liệu
            ) : error ? (
                <div className="alert alert-danger">{error}</div> // Hiển thị lỗi nếu có
            ) : (
                renderProfileInfo() // Hiển thị thông tin hồ sơ nếu không có lỗi
            )}
        </div>
    );
};

export default Profile;
