
import { DBUser, PostDetails, CommentWithUser } from "./db-types";
import { User, Post, Comment } from "./types";

/**
 * Adapts a DBUser to the User interface needed by UI components
 */
export function adaptUserToUIFormat(dbUser: DBUser, followersCount: number = 0, followingCount: number = 0): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    username: dbUser.username,
    email: dbUser.email,
    avatar: dbUser.avatar || 'https://i.pravatar.cc/150?img=1', // Fallback avatar
    bio: dbUser.bio || undefined,
    followers: followersCount,
    following: followingCount
  };
}

/**
 * Adapts a PostDetails to the Post interface needed by UI components
 */
export function adaptPostToUIFormat(post: PostDetails, comments: CommentWithUser[] = []): Post {
  return {
    id: post.id,
    userId: post.user_id,
    userName: post.user_name,
    userAvatar: post.user_avatar || 'https://i.pravatar.cc/150?img=1', // Fallback avatar
    content: post.content,
    image: post.image || undefined,
    likes: post.likes_count,
    isLiked: post.isLiked || false,
    comments: comments.map(adaptCommentToUIFormat),
    createdAt: post.created_at
  };
}

/**
 * Adapts a CommentWithUser to the Comment interface needed by UI components
 */
export function adaptCommentToUIFormat(comment: CommentWithUser): Comment {
  return {
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    userName: comment.userName,
    userAvatar: comment.userAvatar || 'https://i.pravatar.cc/150?img=1', // Fallback avatar
    content: comment.content,
    createdAt: comment.createdAt
  };
}
