import HeaderAdmin from "../layout/header";
import FooterAdmin from "../layout/footer";
import "../../../assets/admin/css/styleadmin.css";
import {Outlet} from "react-router";


const MainAdmin = () => {
    return ( // return chỉ chạy 1 thẻ div 
        <div className="main-layout">
            <HeaderAdmin/>
            <div className="content">
                <Outlet/>
            </div>
            <FooterAdmin/>
        </div>
    );
  };
  export default MainAdmin;
  