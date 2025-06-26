import HeaderClient from "../layout/header";
import FooterClient from "../layout/footer";
import { Outlet } from "react-router";

const MainUser = () => {
  return (
    <div>
      <HeaderClient />
      <Outlet />
      <FooterClient />
    </div>
  );
};
export default MainUser;
