// App.js
import './App.css';
import {Navigate, Route, Routes} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import {SnackbarProvider} from 'notistack'; // thông bao
import AdminLogin from './pages/admin/login';
import AdminProfile from './pages/admin/profile';
import Home from './pages/client/home';
import Login from './pages/client/login';
import Dashboard from './pages/admin/dashboard';
import Product from './pages/admin/product';
import MainUser from './components/user/MainUser';
import MainAdmin from './components/admin/MainAdmin';
import ProductClient from './pages/client/product';
import About from "./pages/client/about";
// import Blog from './pages/client/blog';
import BlogList from './pages/client/blog/BlogList'
import BlogPostDetail from './pages/client/blog/BlogPostDetail'; 
import Contact from './pages/client/contact';
import Order from './pages/admin/order';
import User from './pages/admin/user/inex'; // (lưu ý: có thể bạn muốn 'index')
import EditProduct from "./pages/admin/editproduct";
import CategoryList from "./pages/admin/category";
import Register from './pages/client/register';
import Comment from './pages/admin/Comment';
import AdminCommentEdit from './pages/admin/Comment/Comment_Edit/AdminCommentEdit';
import EditComment from './pages/admin/Comment/Comment_Edit';
import ProductDetail from './pages/client/productdetail';
import CartPage from './pages/client/cart/CartPage';
import Profile from './pages/client/profile';
import OrderPage from './pages/client/Oder/OrderPage';
import OrderHistory from './pages/client/OrderHistory/OrderHistory';
import EditUser from './pages/admin/edituser';
import PaymentResult from './pages/client/PaymentResult';
import AddProduct from './pages/admin/addproduct';
import AddCategory from './pages/admin/addcategory';
import EditCategory from './pages/admin/editcategory';
import ForgotPassword from './pages/client/forgot-password';
import ChangePassword from './pages/client/forgot-password/change';
import ContactMessages from './pages/admin/contactMessages';
import ContactMessageID from './pages/admin/contactMessageID';
import ChatGPTComponent from './components/ChatGPTComponent';
import ChatGNMComponent from './components/ChatGNMComponent';
import ChatBoxMessage from './components/ChatBoxMessage';
import DiscountAdmin from './pages/admin/discount';
import AddDiscount from './pages/admin/discount/addDiscount';
import EditDiscount from './pages/admin/discount/editDiscount';

/** Guard cho khu vực /admin: Bắt buộc qua admin-login + token role admin (0/1) */
function AdminGate({children}) {
    const adminAuthed = typeof window !== 'undefined' && sessionStorage.getItem('adminAuthed') === '1';
    if (!adminAuthed) return <Navigate to="/admin-login" replace/>;

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) return <Navigate to="/admin-login" replace/>;

    try {
        const decoded = jwtDecode(token);
        const expired = decoded.exp * 1000 <= Date.now();
        const isAdminRole = decoded.role === 0 || decoded.role === 1;
        if (expired || !isAdminRole) {
            try {
                sessionStorage.removeItem('adminAuthed');
            } catch {
            }
            return <Navigate to="/admin-login" replace/>;
        }
    } catch {
        try {
            sessionStorage.removeItem('adminAuthed');
        } catch {
        }
        return <Navigate to="/admin-login" replace/>;
    }

    return children;
}

function App() {
    return (
        <SnackbarProvider
            maxSnack={3}
            autoHideDuration={1000}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            <Routes>
                {/* USER */}
                <Route path='/' element={<MainUser/>}>
                    <Route index element={<Home/>}/>
                    <Route path='product' element={<ProductClient/>}/>
                    <Route path="/product/:id" element={<ProductDetail/>}/>
                    <Route path='login' element={<Login/>}/>
                    <Route path='forgot-password' element={<ForgotPassword/>}/>
                    <Route path='forgot-password/change' element={<ChangePassword/>}/>
                    <Route path='about' element={<About/>}/>
                    {/* <Route path='blog' element={<Blog/>}/> */}
                    <Route path="/blog" element={<BlogList />} />
                    <Route path="/blog/:id" element={<BlogPostDetail />} />
                    <Route path='contact' element={<Contact/>}/>
                    <Route path='cartpage' element={<CartPage/>}/>
                    <Route path='register' element={<Register/>}/>
                    <Route path='profile' element={<Profile/>}/>
                    <Route path='oder' element={<OrderPage/>}/>
                    <Route path='order-history' element={<OrderHistory/>}/>
                    <Route path="/payment-result" element={<PaymentResult/>}/>
                    <Route path="/chatGPT" element={<ChatGPTComponent/>}/>
                    <Route path="/chatGNM" element={<ChatGNMComponent/>}/>
                    <Route path="/chatBox" element={<ChatBoxMessage/>}/>
                </Route>

                {/* >>>>>> ĐẶT RIÊNG Ở ROOT, KHÔNG NẰM TRONG /admin <<<<<< */}
                <Route path="/admin-login" element={<AdminLogin/>}/>

                {/* ADMIN (bọc bởi AdminGate) */}
                <Route
                    path="/admin"
                    element={
                        <AdminGate>
                            <MainAdmin/>
                        </AdminGate>
                    }
                >
                    <Route index element={<Dashboard/>}/>
                    <Route path="profile" element={<AdminProfile/>}/>
                    <Route path="order" element={<Order/>}/>
                    <Route path="user" element={<User/>}/>
                    <Route path="user/edituser/:id" element={<EditUser/>}/>
                    <Route path="comment" element={<Comment/>}/>
                    <Route path="review_edit/:reviewId" element={<AdminCommentEdit/>}/>
                    <Route path="comment_edit" element={<EditComment/>}/>
                    <Route path="product" element={<Product/>}/>
                    <Route path="product/addproduct" element={<AddProduct/>}/>
                    <Route path="product/editproduct/:id" element={<EditProduct/>}/>
                    <Route path="category" element={<CategoryList/>}/>
                    <Route path="category/addcategory" element={<AddCategory/>}/>
                    <Route path="category/editcategory/:id" element={<EditCategory/>}/>
                    <Route path="contact" element={<ContactMessages/>}/>
                    <Route path="contact/reply/:id" element={<ContactMessageID/>}/>
                    <Route path="discount" element={<DiscountAdmin/>}/>
                    <Route path="discount/add" element={<AddDiscount/>}/>
                    <Route path="discount/edit/:id" element={<EditDiscount/>}/>
                </Route>
            </Routes>
        </SnackbarProvider>
    );
}

export default App;