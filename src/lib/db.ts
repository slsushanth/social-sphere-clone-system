
import { initializeDatabase, query, generateUUID } from './mysql';
import { DBUser, DBPost, DBComment, PostDetails, UserStats, UserWithStats, CommentWithUser } from './db-types';
import { toast } from 'sonner';

// Initialize the database on startup
initializeDatabase().catch(console.error);

// User related functions
export async function getCurrentUser(userId?: string): Promise<DBUser | null> {
  if (!userId) return null;
  
  try {
    const users = await query<DBUser[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getUserProfile(username: string): Promise<UserWithStats | null> {
  try {
    // Get user
    const users = await query<DBUser[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) return null;
    
    const user = users[0];
    
    // Get followers count
    const followersResult = await query<{count: number}[]>(
      'SELECT COUNT(*) as count FROM followers WHERE following_id = ?',
      [user.id]
    );
    
    // Get following count
    const followingResult = await query<{count: number}[]>(
      'SELECT COUNT(*) as count FROM followers WHERE follower_id = ?',
      [user.id]
    );
    
    return {
      ...user,
      followers_count: followersResult[0].count,
      following_count: followingResult[0].count
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Post related functions
export async function getPosts(currentUserId?: string): Promise<PostDetails[]> {
  try {
    const posts = await query<PostDetails[]>('SELECT * FROM post_details');
    
    if (!currentUserId) return posts;
    
    // Check which posts are liked by the current user
    const postsWithLiked = await Promise.all(
      posts.map(async (post) => {
        const likes = await query<any[]>(
          'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
          [post.id, currentUserId]
        );
        
        return {
          ...post,
          isLiked: likes.length > 0
        };
      })
    );
    
    return postsWithLiked;
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
}

export async function getUserPosts(userId: string, currentUserId?: string): Promise<PostDetails[]> {
  try {
    const posts = await query<PostDetails[]>(
      'SELECT * FROM post_details WHERE user_id = ?',
      [userId]
    );
    
    if (!currentUserId) return posts;
    
    // Check which posts are liked by the current user
    const postsWithLiked = await Promise.all(
      posts.map(async (post) => {
        const likes = await query<any[]>(
          'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
          [post.id, currentUserId]
        );
        
        return {
          ...post,
          isLiked: likes.length > 0
        };
      })
    );
    
    return postsWithLiked;
  } catch (error) {
    console.error('Error getting user posts:', error);
    return [];
  }
}

export async function createPost(userId: string, content: string, image?: string): Promise<DBPost | null> {
  if (!userId) {
    toast.error('You must be logged in to create a post');
    return null;
  }
  
  try {
    const postId = generateUUID();
    await query(
      'INSERT INTO posts (id, user_id, content, image) VALUES (?, ?, ?, ?)',
      [postId, userId, content, image || null]
    );
    
    const posts = await query<DBPost[]>(
      'SELECT * FROM posts WHERE id = ?', 
      [postId]
    );
    
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error('Error creating post:', error);
    toast.error('Error creating post');
    return null;
  }
}

// Comments related functions
export async function getPostComments(postId: string): Promise<CommentWithUser[]> {
  try {
    const comments = await query<any[]>(
      `SELECT c.*, u.name as user_name, u.avatar as user_avatar, u.username as user_username
       FROM comments c 
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );
    
    return comments.map(comment => ({
      id: comment.id,
      postId: comment.post_id,
      userId: comment.user_id,
      userName: comment.user_name,
      userAvatar: comment.user_avatar,
      content: comment.content,
      createdAt: comment.created_at
    }));
  } catch (error) {
    console.error('Error getting post comments:', error);
    return [];
  }
}

export async function addComment(userId: string, postId: string, content: string): Promise<DBComment | null> {
  if (!userId) {
    toast.error('You must be logged in to comment');
    return null;
  }
  
  try {
    const commentId = generateUUID();
    await query(
      'INSERT INTO comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)',
      [commentId, postId, userId, content]
    );
    
    const comments = await query<DBComment[]>(
      'SELECT * FROM comments WHERE id = ?',
      [commentId]
    );
    
    return comments.length > 0 ? comments[0] : null;
  } catch (error) {
    console.error('Error adding comment:', error);
    toast.error('Error adding comment');
    return null;
  }
}

// Likes related functions
export async function toggleLike(userId: string, postId: string): Promise<boolean> {
  if (!userId) {
    toast.error('You must be logged in to like a post');
    return false;
  }
  
  try {
    // Check if the user already liked the post
    const likes = await query<any[]>(
      'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );
    
    if (likes.length > 0) {
      // Unlike the post
      await query(
        'DELETE FROM likes WHERE id = ?',
        [likes[0].id]
      );
      return false; // No longer liked
    } else {
      // Like the post
      const likeId = generateUUID();
      await query(
        'INSERT INTO likes (id, post_id, user_id) VALUES (?, ?, ?)',
        [likeId, postId, userId]
      );
      return true; // Now liked
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    toast.error('Error updating like');
    return false;
  }
}

// Followers related functions
export async function toggleFollow(currentUserId: string, userId: string): Promise<boolean> {
  if (!currentUserId) {
    toast.error('You must be logged in to follow users');
    return false;
  }
  
  if (currentUserId === userId) {
    toast.error('You cannot follow yourself');
    return false;
  }
  
  try {
    // Check if already following
    const followers = await query<any[]>(
      'SELECT * FROM followers WHERE follower_id = ? AND following_id = ?',
      [currentUserId, userId]
    );
    
    if (followers.length > 0) {
      // Unfollow
      await query(
        'DELETE FROM followers WHERE id = ?',
        [followers[0].id]
      );
      return false; // No longer following
    } else {
      // Follow
      const followId = generateUUID();
      await query(
        'INSERT INTO followers (id, follower_id, following_id) VALUES (?, ?, ?)',
        [followId, currentUserId, userId]
      );
      return true; // Now following
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    toast.error('Error updating follow status');
    return false;
  }
}

export async function isFollowing(currentUserId: string, userId: string): Promise<boolean> {
  if (!currentUserId) return false;
  
  try {
    const followers = await query<any[]>(
      'SELECT * FROM followers WHERE follower_id = ? AND following_id = ?',
      [currentUserId, userId]
    );
    
    return followers.length > 0;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

export async function getSuggestedUsers(currentUserId?: string, limit = 5): Promise<Partial<DBUser>[]> {
  try {
    if (!currentUserId) {
      // If not logged in, just get some random users
      return await query<Partial<DBUser>[]>(
        'SELECT id, name, username, avatar FROM users LIMIT ?',
        [limit]
      );
    }
    
    // Get users that the current user is not following
    return await query<Partial<DBUser>[]>(
      `SELECT u.id, u.name, u.username, u.avatar 
       FROM users u
       WHERE u.id != ? 
       AND NOT EXISTS (
         SELECT 1 FROM followers f
         WHERE f.follower_id = ? AND f.following_id = u.id
       )
       LIMIT ?`,
      [currentUserId, currentUserId, limit]
    );
  } catch (error) {
    console.error('Error getting suggested users:', error);
    return [];
  }
}

// Login and Register Functions
export async function loginUser(email: string, password: string): Promise<DBUser | null> {
  try {
    // In a real app, you'd hash the password and compare with stored hash
    const users = await query<DBUser[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      toast.error('Invalid email or password');
      return null;
    }
    
    // For demo purposes, we'll accept any password for our sample users
    return users[0];
  } catch (error) {
    console.error('Error logging in:', error);
    toast.error('Login failed');
    return null;
  }
}

export async function registerUser(
  name: string,
  email: string,
  username: string,
  password: string
): Promise<DBUser | null> {
  try {
    // Check if user exists
    const existingUsers = await query<DBUser[]>(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existingUsers.length > 0) {
      toast.error('Email or username already exists');
      return null;
    }
    
    // In a real app, you'd hash the password
    const passwordHash = password; // This should be hashed in production
    const userId = generateUUID();
    const avatar = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
    
    await query(
      'INSERT INTO users (id, name, username, email, avatar, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, username, email, avatar, passwordHash]
    );
    
    const users = await query<DBUser[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error registering user:', error);
    toast.error('Registration failed');
    return null;
  }
}
