
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Post, Comment } from "@/lib/types";
import { posts as initialPosts } from "@/lib/data";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

interface SocialContextType {
  posts: Post[];
  addPost: (content: string, image?: string) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

interface SocialProviderProps {
  children: ReactNode;
}

export const SocialProvider = ({ children }: SocialProviderProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const { currentUser } = useAuth();

  const addPost = (content: string, image?: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to create a post");
      return;
    }

    const newPost: Post = {
      id: (posts.length + 1).toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      image,
      likes: 0,
      isLiked: false,
      comments: [],
      createdAt: new Date().toISOString(),
    };

    setPosts([newPost, ...posts]);
    toast.success("Post created successfully!");
  };

  const likePost = (postId: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to like a post");
      return;
    }

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked;
          const likeDelta = newIsLiked ? 1 : -1;
          
          return {
            ...post,
            isLiked: newIsLiked,
            likes: post.likes + likeDelta,
          };
        }
        return post;
      })
    );
  };

  const addComment = (postId: string, content: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to comment");
      return;
    }

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const newComment: Comment = {
            id: `c${post.comments.length + 1}-${postId}`,
            postId,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            content,
            createdAt: new Date().toISOString(),
          };
          
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );
    
    toast.success("Comment added!");
  };

  return (
    <SocialContext.Provider
      value={{
        posts,
        addPost,
        likePost,
        addComment,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error("useSocial must be used within a SocialProvider");
  }
  return context;
};
