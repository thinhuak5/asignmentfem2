import React, {useMemo, useState} from "react";
import {Link} from "react-router-dom";

const MOCK_POSTS = [
    {
        id: 101,
        title: "7 Cuốn sách hay để bắt đầu hành trình đọc",
        category: "Gợi ý sách",
        author: "Lan Anh",
        date: "2025-07-01",
        status: 1,
        thumbnail:
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: 102,
        title: "Tâm lý học đằng sau thói quen đọc mỗi ngày",
        category: "Tâm lý học",
        author: "Minh Đức",
        date: "2025-06-24",
        status: 1,
        thumbnail:
            "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: 103,
        title: "5 mẹo ghi chú giúp nhớ lâu hơn",
        category: "Kỹ năng",
        author: "Hà My",
        date: "2025-06-11",
        status: 0,
        thumbnail:
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: 104,
        title: "Review: “Sapiens” – hành trình của loài người",
        category: "Review",
        author: "Quốc Bảo",
        date: "2025-05-28",
        status: 1,
        thumbnail:
            "https://images.unsplash.com/photo-1463320726281-696a485928c7?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: 105,
        title: "Set up góc đọc sách tối giản",
        category: "Lifestyle",
        author: "Thu Uyên",
        date: "2025-05-12",
        status: 1,
        thumbnail:
            "https://images.unsplash.com/photo-1494759100210-856f4ea42174?q=80&w=400&auto=format&fit=crop",
    },
];

const CATEGORIES = ["Tất cả", "Gợi ý sách", "Tâm lý học", "Kỹ năng", "Review", "Lifestyle"];
const STATUS = ["Tất cả", "Đã xuất bản", "Bản nháp"];

const statusBadge = (st) =>
    st === 1 ? (
        <span className="badge text-bg-success">Đã xuất bản</span>
    ) : (
        <span className="badge text-bg-secondary">Bản nháp</span>
    );

/** Trang quản trị Blog (UI tĩnh) */
const Blog = () => {
    const [rows, setRows] = useState(MOCK_POSTS);
    const [q, setQ] = useState("");
    const [cat, setCat] = useState("");
    const [st, setSt] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Lọc dữ liệu client-side (demo)
    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        return rows.filter((r) => {
            const okText =
                !qq ||
                r.title.toLowerCase().includes(qq) ||
                r.author.toLowerCase().includes(qq) ||
                r.category.toLowerCase().includes(qq);
            const okCat = !cat || cat === "Tất cả" || r.category === cat;
            const okSt =
                !st ||
                st === "Tất cả" ||
                (st === "Đã xuất bản" && r.status === 1) ||
                (st === "Bản nháp" && r.status === 0);
            return okText && okCat && okSt;
        });
    }, [rows, q, cat, st]);

    const openDelete = (id) => {
        setDeleteId(id);
        setShowModal(true);
    };

    const confirmDelete = () => {
        // Demo: xoá ngay trên UI, không gọi API
        setRows((prev) => prev.filter((p) => p.id !== deleteId));
        setShowModal(false);
        setDeleteId(null);
    };

    return (
        <div className="container py-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="m-0">Quản lý Blog</h2>
                <div className="d-flex gap-2">
                    <Link to="/admin/blog/create" className="btn btn-primary">
                        Thêm bài viết
                    </Link>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="card border-0 shadow-sm rounded-4 mb-3">
                <div className="card-body">
                    <div className="row g-2">
                        <div className="col-lg-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm theo tiêu đề, tác giả, danh mục…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                aria-label="Tìm kiếm bài viết"
                            />
                        </div>
                        <div className="col-lg-3">
                            <select
                                className="form-select"
                                value={cat}
                                onChange={(e) => setCat(e.target.value)}
                                aria-label="Lọc theo danh mục"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-3">
                            <select
                                className="form-select"
                                value={st}
                                onChange={(e) => setSt(e.target.value)}
                                aria-label="Lọc theo trạng thái"
                            >
                                {STATUS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bảng danh sách */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead className="table-light">
                        <tr>
                            <th style={{width: 72}}>ID</th>
                            <th>Tiêu đề</th>
                            <th style={{width: 160}}>Danh mục</th>
                            <th style={{width: 140}}>Tác giả</th>
                            <th style={{width: 140}}>Ngày</th>
                            <th style={{width: 140}}>Trạng thái</th>
                            <th style={{width: 170}} className="text-center">
                                Hành động
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.length > 0 ? (
                            filtered.map((p) => (
                                <tr key={p.id}>
                                    <td className="text-muted">{p.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                className="rounded-3 overflow-hidden flex-shrink-0"
                                                style={{width: 56, height: 56}}
                                            >
                                                <img
                                                    src={p.thumbnail}
                                                    alt={p.title}
                                                    className="w-100 h-100"
                                                    style={{objectFit: "cover"}}
                                                />
                                            </div>
                                            <div>
                                                <div className="fw-semibold">{p.title}</div>
                                                <div className="small text-muted">
                                                    <span className="me-2">{p.category}</span>•{" "}
                                                    <span className="ms-2">{p.author}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{p.category}</td>
                                    <td>{p.author}</td>
                                    <td>{new Date(p.date).toLocaleDateString("vi-VN")}</td>
                                    <td>{statusBadge(p.status)}</td>
                                    <td className="text-center">
                                        <div className="btn-group btn-group-sm">
                                            <Link
                                                to={`/admin/blog/edit/${p.id}`}
                                                className="btn btn-outline-primary"
                                                title="Sửa"
                                            >
                                                Sửa
                                            </Link>
                                            <Link
                                                to={`/blog/${p.id}`}
                                                className="btn btn-outline-secondary"
                                                title="Xem"
                                            >
                                                Xem
                                            </Link>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => openDelete(p.id)}
                                                title="Xóa"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">
                                    Không có bài viết phù hợp.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal xác nhận xoá (Bootstrap 5.3 UI tĩnh) */}
            {showModal && (
                <>
                    <div
                        className="modal fade show"
                        style={{display: "block"}}
                        tabIndex={-1}
                        aria-modal="true"
                        role="dialog"
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title">Xác nhận xoá</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    Bạn chắc chắn muốn xoá bài viết có ID <strong>{deleteId}</strong>?
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={confirmDelete}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="modal-backdrop fade show"
                        style={{backgroundColor: "rgba(0,0,0,.15)"}}
                    />
                </>
            )}
        </div>
    );
};

export default Blog;
