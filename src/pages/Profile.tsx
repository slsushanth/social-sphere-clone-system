
import { useSocial } from "@/context/SocialContext";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/components/PostCard";
import UserProfile from "@/components/UserProfile";
import CreatePostCard from "@/components/CreatePostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const { posts } = useSocial();
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Get posts by the current user
  const userPosts = posts.filter((post) => post.userId === currentUser.id);

  return (
    <div className="pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <UserProfile user={currentUser} isCurrentUser={true} />
          </div>

          {/* Main content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="create">Create Post</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="space-y-4">
                {userPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      You haven't posted anything yet.
                    </p>
                  </div>
                ) : (
                  userPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="create">
                <CreatePostCard />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
