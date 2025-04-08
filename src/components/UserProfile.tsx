
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/lib/types";

interface UserProfileProps {
  user: User;
  isCurrentUser?: boolean;
}

const UserProfile = ({ user, isCurrentUser = false }: UserProfileProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6 px-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-bold mt-4">{user.name}</h2>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          
          {user.bio && (
            <p className="text-sm text-center mt-3">{user.bio}</p>
          )}
          
          <div className="flex justify-center space-x-6 mt-4">
            <div className="text-center">
              <p className="font-bold">{user.followers}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{user.following}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>
          
          {!isCurrentUser && (
            <Button 
              className="mt-4 w-full bg-social-blue hover:bg-social-darkBlue"
            >
              Follow
            </Button>
          )}
          
          {isCurrentUser && (
            <Button 
              variant="outline" 
              className="mt-4 w-full"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
