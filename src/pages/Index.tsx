
import { Outlet } from "react-router-dom";
import NavBar from "@/components/NavBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-social-lightGray">
      <NavBar />
      <Outlet />
    </div>
  );
};

export default Index;
