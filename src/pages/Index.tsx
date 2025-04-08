
import { Outlet } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/context/AuthContext";
import { SocialProvider } from "@/context/SocialContext";

const Index = () => {
  return (
    <AuthProvider>
      <SocialProvider>
        <div className="min-h-screen bg-social-lightGray">
          <NavBar />
          <Outlet />
        </div>
      </SocialProvider>
    </AuthProvider>
  );
};

export default Index;
