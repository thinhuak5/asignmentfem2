import './App.css';
import {Route, Routes} from 'react-router';
import Home from './pages/client/home';
import Login from './pages/client/login';
import Dashboard from './pages/admin/dashboard';
import Product from './pages/admin/product';
import MainUser from './components/user/MainUser';
import MainAdmin from './components/admin/MainAdmin';
import ProductClient from './pages/client/product';
import About from './pages/client/about';
import Services from './pages/client/services';
import Blog from './pages/client/blog';
import Contact from './pages/client/contact';
import Order from './pages/admin/order';
import User from './pages/admin/user/inex';
import AddProduct from './pages/admin/addproduct';
import EditProduct from './pages/admin/editproduct';
import CategoryList from './pages/admin/category';
import AddCategory from './pages/admin/addcategory';
import EditCategory from './pages/admin/editcategory';
import Register from './pages/client/register';
import Comment from './pages/admin/Comment';
import EditComment from './pages/admin/Comment/Comment_Edit';
import ProductDetail from './pages/client/productdetail';
import CartPage from './pages/client/cart/CartPage';
import Profile from './pages/client/profile';
import OrderPage from './pages/client/Oder/OrderPage';
import OrderHistory from './pages/client/OrderHistory/OrderHistory';
import EditUser from './pages/admin/edituser';
import CategoryParentList from './pages/admin/categoryparent/';
import AddCategoryParent from './pages/admin/addcategoryparent';
import EditCategoryParent from './pages/admin/editcategoryparent';

function App() {
  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<MainUser/>}>
        <Route index element={<Home/>}/>
        <Route path="product" element={<ProductClient/>}/>
        <Route path="product/:id" element={<ProductDetail/>}/>
        <Route path="login" element={<Login/>}/>
        <Route path="about" element={<About/>}/>
        <Route path="services" element={<Services/>}/>
        <Route path="blog" element={<Blog/>}/>
        <Route path="contact" element={<Contact/>}/>
        <Route path="cartpage" element={<CartPage/>}/>
        <Route path="register" element={<Register/>}/>
        <Route path="profile" element={<Profile/>}/>
        <Route path="oder" element={<OrderPage/>}/>
        <Route path="order-history" element={<OrderHistory/>}/>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<MainAdmin/>}>
        <Route index element={<Dashboard/>}/>
        <Route path="order" element={<Order/>}/>
        <Route path="user" element={<User/>}/>
        <Route path="user/edituser/:id" element={<EditUser/>}/>
        <Route path="comment" element={<Comment/>}/>
        <Route path="comment_edit" element={<EditComment/>}/>
        <Route path="product" element={<Product/>}/>
        <Route path="product/addproduct" element={<AddProduct/>}/>
        <Route path="product/editproduct/:id" element={<EditProduct/>}/>
        <Route path="category" element={<CategoryList/>}/>
        <Route path="category/addcategory" element={<AddCategory/>}/>
        <Route path="category/editcategory/:id" element={<EditCategory/>}/>
        {/* Route danh mục cha */}
        <Route path="categoryparent" element={<CategoryParentList/>}/>
        <Route path="categoryparent/add" element={<AddCategoryParent/>}/>
        <Route path="categoryparent/edit/:id" element={<EditCategoryParent/>}/>
      </Route>
    </Routes>
  );
}

export default App;
