
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "lucide-react";
import { useSocial } from "@/context/SocialContext";
import { useAuth } from "@/context/AuthContext";

const CreatePostCard = () => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const { addPost } = useSocial();
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() === "") return;

    addPost(content, imageUrl || undefined);
    setContent("");
    setImageUrl("");
    setShowImageInput(false);
  };

  return (
    <Card className="mb-6 shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-4">
          <div className="flex space-x-3">
            <Avatar>
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${currentUser.name.split(" ")[0]}?`}
              className="flex-1 resize-none"
              rows={3}
            />
          </div>
          
          {showImageInput && (
            <div className="mt-3">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL..."
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between py-3 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-social-darkGray"
            onClick={() => setShowImageInput(!showImageInput)}
          >
            <Image className="h-5 w-5 mr-2" />
            Photo
          </Button>
          
          <Button
            type="submit"
            className="bg-social-blue hover:bg-social-darkBlue"
            size="sm"
            disabled={!content.trim()}
          >
            Post
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePostCard;
