import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BlogPostDetail.css';

// Dữ liệu danh mục dự phòng
const FAKE_CATEGORIES = [
    { id: 'all', name: 'Tin Tức Chung' },
    { id: 'reviews', name: 'Đánh Giá' },
    { id: 'guides', name: 'Hướng Dẫn' },
];

const BlogPostDetail = () => {
    const { id } = useParams();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const [postRes, commentsRes, categoriesRes] = await Promise.all([
                        fetch(`https://technicalsupport.id.vn/api/v1/posts/${id}`),
                        fetch(`https://technicalsupport.id.vn/api/v1/posts/${id}/comments`),
                        fetch(`https://technicalsupport.id.vn/api/v1/categories`)
                    ]);

                    // Xử lý bài viết
                    if (!postRes.ok) throw new Error('Không thể tải bài viết.');
                    const postData = await postRes.json();
                    if (postData.success) setPost(postData.data);
                    else throw new Error(postData.message || 'Không tìm thấy bài viết.');
                    
                    // XỬ LÝ BÌNH LUẬN - **SỬA LỖI TẠI ĐÂY**
                    if (commentsRes.ok) {
                        const commentsData = await commentsRes.json();
                        // Dữ liệu bình luận nằm trong `data.data`
                        if (commentsData.success && commentsData.data && Array.isArray(commentsData.data.data)) {
                            setComments(commentsData.data.data);
                        } else {
                            setComments([]); // Nếu không có bình luận, set mảng rỗng
                        }
                    } else {
                        console.error("Lỗi khi tải bình luận.");
                        setComments([]);
                    }
                    
                    // XỬ LÝ DANH MỤC - **THÊM LOGIC DỰ PHÒNG**
                    if (categoriesRes.ok) {
                        const categoriesData = await categoriesRes.json();
                        if (categoriesData.success && categoriesData.data.length > 0) {
                            setCategories(categoriesData.data);
                        } else {
                            // Nếu API không lỗi nhưng không có data, dùng dữ liệu giả
                            console.warn("API không trả về danh mục, sử dụng dữ liệu giả.");
                            setCategories(FAKE_CATEGORIES);
                        }
                    } else {
                        // Nếu API lỗi, dùng dữ liệu giả
                        console.error("Lỗi khi tải danh mục, sử dụng dữ liệu giả.");
                        setCategories(FAKE_CATEGORIES);
    
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // NEW: Component đệ quy để hiển thị bình luận và các bình luận con
    const Comment = ({ comment }) => (
        <div className="comment-item" style={{ marginLeft: comment.parent_id ? '30px' : '0' }}>
            {/* Nếu là bình luận con thì thêm lề trái */}
            <div className="comment-author">{comment.user?.name || 'Anonymous'}</div>
            <p className="comment-content">{comment.content}</p>
            <small className="comment-date">{formatDate(comment.created_at)}</small>
            {/* Nếu có bình luận con (children), render chúng */}
            {comment.children && comment.children.length > 0 && (
                <div className="comment-replies">
                    {comment.children.map(reply => <Comment key={reply.id} comment={reply} />)}
                </div>
            )}
        </div>
    );

    if (loading) return <p className="container text-center py-5">Đang tải...</p>;
    if (error) return <p className="container text-center text-danger py-5">Lỗi: {error}</p>;
    if (!post) return <p className="container text-center py-5">Không có dữ liệu bài viết.</p>;

    // Lọc ra các bình luận gốc (không có parent_id) để render
    const rootComments = comments.filter(comment => !comment.parent_id);

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-lg-8">
                    <article className="blog-post-detail">
                        <h1 className="post-title">{post.title}</h1>
                        <p className="post-meta">
                            Ngày đăng: {new Date(post.created_at).toLocaleDateString('vi-VN')}
                        </p>
                        <img src={post.image} alt={post.title} className="img-fluid rounded mb-4 post-image" />
                        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
                    </article>

                    <section className="comments-section mt-5">
                        <h3 className="section-title">Bình luận ({comments.length})</h3>
                        <div className="comment-list">
                            {rootComments.length > 0 ? (
                                rootComments.map(comment => <Comment key={comment.id} comment={comment} />)
                            ) : (
                                <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                            )}
                        </div>
                    </section>
                </div>

                <div className="col-lg-4">
                    <div className="sidebar-widget">
                        <h4 className="widget-title">Danh mục</h4>
                        <ul className="list-group list-group-flush category-list">
                            {/* **SỬA LỖI**: Dùng Link đến /blog thay vì reload trang */}
                            <Link to="/blog" className="list-group-item">
                                Tất cả bài viết
                            </Link>
                            {categories.map(cat => (
                                // Khi nhấn vào danh mục, chuyển về trang blog
                                <Link to="/blog" key={cat.id} className="list-group-item">
                                    {cat.name}
                                </Link>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-4">
                        <Link to="/blog" className="btn btn-outline-primary w-100">
                            ← Quay lại danh sách Blog
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPostDetail;