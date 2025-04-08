
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocial } from "@/context/SocialContext";
import PostCard from "@/components/PostCard";
import CreatePostCard from "@/components/CreatePostCard";
import UserProfile from "@/components/UserProfile";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/data";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { posts } = useSocial();
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState(users.slice(0, 3));

  useEffect(() => {
    if (currentUser) {
      // Filter out current user from suggestions
      setSuggestedUsers(
        users.filter(user => user.id !== currentUser.id).slice(0, 3)
      );
    }
  }, [currentUser]);

  return (
    <div className="pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2">
            {isAuthenticated ? (
              <>
                <CreatePostCard />
                <div>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">Welcome to SocialSphere</h2>
                <p className="mb-6">
                  Connect with friends, share moments, and discover what's happening in the world.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button 
                    className="bg-social-blue hover:bg-social-darkBlue"
                    onClick={() => navigate('/register')}
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="hidden md:block">
            {isAuthenticated && currentUser && (
              <UserProfile user={currentUser} isCurrentUser={true} />
            )}
            
            <div className="mt-6">
              <h3 className="font-medium mb-4">Suggested For You</h3>
              {suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs"
                  >
                    Follow
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <a href="#" className="hover:underline">About</a>
                <a href="#" className="hover:underline">Help</a>
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
              </div>
              <p className="mt-2">© 2025 SocialSphere</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
