
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { DBUser, DBPost, DBComment, PostDetails, UserStats } from './db-types';

// These will need to be replaced with actual values when connected to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// User related functions
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return data as DBUser | null;
}

export async function getUserProfile(username: string) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
    
  if (!user) return null;
  
  const { data: stats } = await supabase
    .rpc('get_user_stats', { user_uuid: user.id });
    
  return {
    ...user,
    ...(stats as UserStats)
  };
}

// Post related functions
export async function getPosts() {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: posts } = await supabase
    .from('post_details')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (!posts || !user) return posts || [];
  
  // Check which posts are liked by the current user
  const postsWithLiked = await Promise.all(
    posts.map(async (post) => {
      const { data: isLiked } = await supabase
        .rpc('is_post_liked', { 
          post_uuid: post.id, 
          user_uuid: user.id 
        });
        
      return {
        ...post,
        isLiked: isLiked || false
      };
    })
  );
  
  return postsWithLiked;
}

export async function getUserPosts(userId: string) {
  const { data: posts } = await supabase
    .from('post_details')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  return posts || [];
}

export async function createPost(content: string, image?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('You must be logged in to create a post');
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content,
      image: image || null
    })
    .select()
    .single();
    
  if (error) throw error;
  return data as DBPost;
}

// Comments related functions
export async function getPostComments(postId: string) {
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      users:user_id (
        name,
        username,
        avatar
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
    
  return comments?.map(comment => ({
    id: comment.id,
    postId: comment.post_id,
    userId: comment.user_id,
    userName: comment.users.name,
    userAvatar: comment.users.avatar,
    content: comment.content,
    createdAt: comment.created_at
  })) || [];
}

export async function addComment(postId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('You must be logged in to comment');
  
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content
    })
    .select()
    .single();
    
  if (error) throw error;
  return data as DBComment;
}

// Likes related functions
export async function toggleLike(postId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('You must be logged in to like a post');
  
  // Check if the user already liked the post
  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();
    
  if (existingLike) {
    // Unlike the post
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id);
      
    if (error) throw error;
    return false; // No longer liked
  } else {
    // Like the post
    const { error } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: user.id
      });
      
    if (error) throw error;
    return true; // Now liked
  }
}

// Followers related functions
export async function toggleFollow(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('You must be logged in to follow users');
  if (user.id === userId) throw new Error('You cannot follow yourself');
  
  // Check if already following
  const { data: existingFollow } = await supabase
    .from('followers')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .maybeSingle();
    
  if (existingFollow) {
    // Unfollow
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('id', existingFollow.id);
      
    if (error) throw error;
    return false; // No longer following
  } else {
    // Follow
    const { error } = await supabase
      .from('followers')
      .insert({
        follower_id: user.id,
        following_id: userId
      });
      
    if (error) throw error;
    return true; // Now following
  }
}

export async function isFollowing(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { data } = await supabase
    .from('followers')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .maybeSingle();
    
  return !!data;
}

export async function getSuggestedUsers(limit = 5) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // If not logged in, just get some random users
    const { data } = await supabase
      .from('users')
      .select('id, name, username, avatar')
      .limit(limit);
      
    return data || [];
  }
  
  // Get users that the current user is not following
  // This is a simplified suggestion algorithm
  const { data: following } = await supabase
    .from('followers')
    .select('following_id')
    .eq('follower_id', user.id);
    
  const followingIds = following?.map(f => f.following_id) || [];
  followingIds.push(user.id); // Add current user to exclude
  
  const { data } = await supabase
    .from('users')
    .select('id, name, username, avatar')
    .not('id', 'in', `(${followingIds.join(',')})`)
    .limit(limit);
    
  return data || [];
}
