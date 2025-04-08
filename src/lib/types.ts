
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  createdAt: string;
}
