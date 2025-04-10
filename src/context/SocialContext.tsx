
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PostDetails, CommentWithUser } from "@/lib/db-types";
import { getPosts, createPost, toggleLike, addComment, getPostComments } from "@/lib/db";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

interface SocialContextType {
  posts: PostDetails[];
  loading: boolean;
  refreshPosts: () => Promise<void>;
  addPost: (content: string, image?: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  getComments: (postId: string) => Promise<CommentWithUser[]>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

interface SocialProviderProps {
  children: ReactNode;
}

export const SocialProvider = ({ children }: SocialProviderProps) => {
  const [posts, setPosts] = useState<PostDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const refreshPosts = async () => {
    setLoading(true);
    try {
      const fetchedPosts = await getPosts(currentUser?.id);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Load posts on mount and when currentUser changes
  useEffect(() => {
    refreshPosts();
  }, [currentUser?.id]);

  const addPost = async (content: string, image?: string) => {
    if (!currentUser) {
      toast.error('You must be logged in to create a post');
      return;
    }

    try {
      await createPost(currentUser.id, content, image);
      toast.success('Post created successfully!');
      await refreshPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const likePost = async (postId: string) => {
    if (!currentUser) {
      toast.error('You must be logged in to like a post');
      return;
    }

    try {
      const isNowLiked = await toggleLike(currentUser.id, postId);
      
      // Update the posts state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const likeDelta = isNowLiked ? 1 : -1;
          return {
            ...post,
            isLiked: isNowLiked,
            likes_count: post.likes_count + likeDelta
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to update like');
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!currentUser) {
      toast.error('You must be logged in to comment');
      return;
    }

    try {
      await addComment(currentUser.id, postId, content);
      toast.success('Comment added!');
      
      // Update the comments count in posts
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments_count: post.comments_count + 1
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getComments = async (postId: string): Promise<CommentWithUser[]> => {
    try {
      return await getPostComments(postId);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
      return [];
    }
  };

  return (
    <SocialContext.Provider
      value={{
        posts,
        loading,
        refreshPosts,
        addPost,
        likePost,
        addComment,
        getComments
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
