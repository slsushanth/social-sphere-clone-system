
export interface DBUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBPost {
  id: string;
  user_id: string;
  content: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DBLike {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface DBFollower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface PostDetails {
  id: string;
  content: string;
  image: string | null;
  created_at: string;
  user_id: string;
  user_name: string;
  user_username: string;
  user_avatar: string | null;
  likes_count: number;
  comments_count: number;
}

export interface UserStats {
  followers_count: number;
  following_count: number;
}
