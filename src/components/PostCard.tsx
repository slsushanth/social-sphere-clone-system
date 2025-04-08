
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Post } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { useSocial } from "@/context/SocialContext";
import { useAuth } from "@/context/AuthContext";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const { likePost, addComment } = useSocial();
  const { isAuthenticated } = useAuth();

  const handleLike = () => {
    likePost(post.id);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() === "") return;
    
    addComment(post.id, commentText);
    setCommentText("");
  };

  const formattedDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "some time ago";
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <CardHeader className="pt-4 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.userAvatar} />
            <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{post.userName}</div>
            <div className="text-xs text-muted-foreground">
              {formattedDate(post.createdAt)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm md:text-base text-left mb-3">{post.content}</p>
        {post.image && (
          <div className="rounded-md overflow-hidden">
            <img
              src={post.image}
              alt="Post image"
              className="w-full h-auto object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col py-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={handleLike}
              disabled={!isAuthenticated}
            >
              <Heart
                className={`h-5 w-5 ${
                  post.isLiked ? "fill-red-500 text-red-500" : "text-gray-500"
                }`}
              />
              <span>{post.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-5 w-5 text-gray-500" />
              <span>{post.comments.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              disabled={!isAuthenticated}
            >
              <Share2 className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="w-full mt-3">
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start space-x-2 mt-2 pb-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.userAvatar} />
                  <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-secondary rounded-lg px-3 py-2 flex-1">
                  <div className="flex justify-between">
                    <div className="font-medium text-sm">{comment.userName}</div>
                    <div className="text-xs text-muted-foreground">
                      {formattedDate(comment.createdAt)}
                    </div>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}

            {isAuthenticated && (
              <form onSubmit={handleComment} className="mt-3 flex space-x-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-social-blue hover:bg-social-darkBlue"
                  disabled={!commentText.trim()}
                >
                  Post
                </Button>
              </form>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
