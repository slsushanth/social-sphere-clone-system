
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Home, LogOut, Search, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const NavBar = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-social-blue">SocialSphere</span>
            </Link>
          </div>

          {isAuthenticated && (
            <div className="hidden md:block flex-1 max-w-md mx-10">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  className="pl-10 w-full"
                  placeholder="Search..."
                  type="text"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/')}
                >
                  <Home className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <div className="relative">
                  <Avatar 
                    className="cursor-pointer" 
                    onClick={() => navigate('/profile')}
                  >
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback>
                      {currentUser?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5 text-red-500" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  className="bg-social-blue hover:bg-social-darkBlue"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
