import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BlogList.css'; // Đổi tên file CSS để rõ ràng hơn

const FAKE_CATEGORIES = [
    { id: 'all', name: 'Tin Tức Chung' },
    { id: 'reviews', name: 'Đánh Giá' },
    { id: 'guides', name: 'Hướng Dẫn' },
];

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('https://technicalsupport.id.vn/api/v1/categories');
                const data = await res.json();
                if (data.success && data.data.length > 0) {
                    setCategories(data.data);
                } else {
                    throw new Error('API không trả về danh mục.');
                }
            } catch (err) {
                console.error("Lỗi khi tải danh mục, sử dụng dữ liệu giả:", err);
                setCategories(FAKE_CATEGORIES);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            
            if (typeof selectedCategory === 'string') {
                setPosts([]);
                setLoading(false);
                return;
            }

            let apiUrl = 'https://technicalsupport.id.vn/api/v1/posts';
            if (selectedCategory) {
                apiUrl = `https://technicalsupport.id.vn/api/v1/categories/${selectedCategory}/posts`;
            }

            try {
                const res = await fetch(apiUrl);
                const data = await res.json();
                if (data.success) {
                    setPosts(data.data);
                } else {
                    setPosts([]);
                }
            } catch (err) {
                setError(err.message);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [selectedCategory]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    return (
        <div className="container py-5">
            <div className="row">
                {/* ==== CỘT NỘI DUNG CHÍNH (8/12) ==== */}
                <div className="col-lg-8">
                    <h1 className="mb-4">Bài viết mới nhất</h1>
                    
                    {loading && <p className="text-center">Đang tải bài viết...</p>}
                    {error && <p className="text-center text-danger">Lỗi khi tải bài viết: {error}</p>}

                    {!loading && !error && (
                        <div className="row">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    // Mỗi bài viết chiếm 1/2 chiều rộng của cột chính trên màn hình vừa
                                    <div className="col-md-6 mb-4" key={post.id}>
                                        <Link to={`/blog/${post.id}`} className="card-link">
                                            <div className="card h-100 shadow-sm blog-card">
                                                <img src={post.image} className="card-img-top" alt={post.title} />
                                                <div className="card-body d-flex flex-column">
                                                    <h5 className="card-title">{post.title}</h5>
                                                    <p className="card-text text-muted flex-grow-1">{post.excerpt}</p>
                                                    <small className="text-muted">Ngày đăng: {formatDate(post.created_at)}</small>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center w-100">Không tìm thấy bài viết nào.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ==== CỘT SIDEBAR (4/12) ==== */}
                <div className="col-lg-4">
                    <div className="sidebar-widget">
                        <h4 className="widget-title">Danh mục</h4>
                        <ul className="list-group list-group-flush category-list">
                            <li 
                                className={`list-group-item ${!selectedCategory ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                Tất cả bài viết
                            </li>
                            {categories.map(cat => (
                                <li 
                                    key={cat.id} 
                                    className={`list-group-item ${selectedCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Bạn có thể thêm các widget khác ở đây, ví dụ: Bài viết gần đây, Tags, etc. */}
                </div>
            </div>
        </div>
    );
};

export default BlogList;