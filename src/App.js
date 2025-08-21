import './App.css';
import {Route, Routes} from 'react-router';


import Home from './pages/client/home';
import Login from './pages/client/login';
import Dashboard from './pages/admin/dashboard';
import Product from './pages/admin/product';
import MainUser from './components/user/MainUser';
import MainAdmin from './components/admin/MainAdmin';
import ProductClient from './pages/client/product';
import About from "./pages/client/about";
import Blog from './pages/client/blog';
import Contact from './pages/client/contact';
import Order from './pages/admin/order';
import User from './pages/admin/user/inex';
import EditProduct from "./pages/admin/editproduct";
import CategoryList from "./pages/admin/category";
import Register from './pages/client/register';
import Comment from './pages/admin/Comment'
import AdminCommentEdit from './pages/admin/Comment/Comment_Edit/AdminCommentEdit';
import EditComment from './pages/admin/Comment/Comment_Edit'
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


function App() {


    return (
        <Routes>
            <Route path='/' element={<MainUser/>}>

                <Route index element={<Home/>}/>
                <Route path='product'
                       element={<ProductClient/>}/>
                <Route path="/product/:id" element={<ProductDetail/>}/>
                <Route path='login' element={<Login/>}/>
                <Route path='forgot-password' element={<ForgotPassword/>}/>
                <Route path='forgot-password/change' element={<ChangePassword/>}/>
                <Route path='about' element={<About/>}/>
                <Route path='blog' element={<Blog/>}/>
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
            </Route> {/* Trang user */}

            {/* Admin Routes */}
            <Route path="/admin" element={<MainAdmin/>}>
                <Route index element={<Dashboard/>}/>
                <Route path="order" element={<Order/>}/>
                <Route path="user" element={<User/>}/>
                <Route path="user/edituser/:id" element={<EditUser/>}/>
                <Route path="comment" element={<Comment/>}/>
                <Route path="/admin/review_edit/:reviewId" element={<AdminCommentEdit/>}/>
                <Route path="comment_edit" element={<EditComment/>}/>
                <Route path="product" element={<Product/>}/>
                <Route path="product/addproduct" element={<AddProduct/>}/>
                <Route path="product/editproduct/:id" element={<EditProduct/>}/>
                <Route path="category" element={<CategoryList/>}/>
                <Route path="category/addcategory" element={<AddCategory/>}/>
                <Route path="category/editcategory/:id" element={<EditCategory/>}/>
                <Route path="contact" element={<ContactMessages/>}/>
                <Route path="contact/reply/:id" element={<ContactMessageID/>}/>
                {/* Route danh mục cha */}

                {/* Route mã giảm giá */}
                <Route path="discount" element={<DiscountAdmin/>}/>
                <Route path="discount/add" element={<AddDiscount/>}/>
                <Route path="discount/edit/:id" element={<EditDiscount/>}/>
            </Route>
        </Routes>
    );
}

export default App;
