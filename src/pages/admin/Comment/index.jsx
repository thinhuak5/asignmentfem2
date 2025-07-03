import React, {useState} from "react";
import {Link} from 'react-router';

const Comment = () => {
    const [showStatus] = useState(true);

    const comments = [
        {
            id: 1,
            image: "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/06/413/anh-anime-cute-7.jpg",
            name: "Nguyen Van A",
            content: "Bài viết hay",
            status: "Đã duyệt"
        },
        {
            id: 2,
            image: "https://www.vietnamworks.com/hrinsider/wp-content/uploads/2023/12/hinh-anh-cute-anime-001.jpg",
            name: "Tran Thi B",
            content: "Tuyệt vời!",
            status: "Chờ duyệt"
        },
        {
            id: 3,
            image: "https://inkythuatso.com/uploads/images/2022/05/anh-anime-boy-cute-dang-yeu-104311024-04-11-17-30.jpg",
            name: "Le Van C",
            content: "Cần thêm thông tin",
            status: "Đã duyệt"
        },
    ];

    return (
        <div className="container">
            <h2>Danh sách bình luận</h2>
            <table className="table table-bordered table-striped">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Hình ảnh</th>
                    <th>Tên</th>
                    <th>Nội dung</th>
                    <th className={showStatus ? "" : "d-none"}>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {comments.map((comment) => (
                    <tr key={comment.id}>
                        <td>{comment.id}</td>
                        <td><img src={comment.image} alt="avatar" className="rounded-circle" width="40" height="40"/>
                        </td>
                        <td>{comment.name}</td>
                        <td>{comment.content}</td>
                        <td className={showStatus ? "" : "d-none"}>{comment.status}</td>
                        <td>
                            <Link to="/admin/comment_edit">
                                <button className="btn btn-primary btn-sm me-2">Sửa</button>
                            </Link>
                            <Link to="/admin/comment">
                                <button className="btn btn-secondary btn-sm">Xóa</button>
                            </Link>

                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Comment;
