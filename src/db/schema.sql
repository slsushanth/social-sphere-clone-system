
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  avatar TEXT,
  bio TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);

-- Followers table
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- Row Level Security Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY users_select_policy ON users 
  FOR SELECT USING (true);

CREATE POLICY users_insert_policy ON users 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY users_update_policy ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY posts_select_policy ON posts 
  FOR SELECT USING (true);

CREATE POLICY posts_insert_policy ON posts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY posts_update_policy ON posts 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY posts_delete_policy ON posts 
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY comments_select_policy ON comments 
  FOR SELECT USING (true);

CREATE POLICY comments_insert_policy ON comments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY comments_update_policy ON comments 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY comments_delete_policy ON comments 
  FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY likes_select_policy ON likes 
  FOR SELECT USING (true);

CREATE POLICY likes_insert_policy ON likes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY likes_delete_policy ON likes 
  FOR DELETE USING (auth.uid() = user_id);

-- Followers policies
CREATE POLICY followers_select_policy ON followers 
  FOR SELECT USING (true);

CREATE POLICY followers_insert_policy ON followers 
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY followers_delete_policy ON followers 
  FOR DELETE USING (auth.uid() = follower_id);

-- Create helpful views
CREATE VIEW post_details AS
SELECT 
  p.id,
  p.content,
  p.image,
  p.created_at,
  p.user_id,
  u.name AS user_name,
  u.username AS user_username,
  u.avatar AS user_avatar,
  COUNT(DISTINCT l.id) AS likes_count,
  COUNT(DISTINCT c.id) AS comments_count
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY p.id, u.id
ORDER BY p.created_at DESC;

-- Create function to check if post is liked by user
CREATE OR REPLACE FUNCTION is_post_liked(post_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM likes 
    WHERE post_id = post_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  followers_count BIGINT,
  following_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM followers WHERE following_id = user_uuid) AS followers_count,
    (SELECT COUNT(*) FROM followers WHERE follower_id = user_uuid) AS following_count;
END;
$$ LANGUAGE plpgsql;

-- Sample data insertion (can be used for testing)
INSERT INTO users (id, name, username, email, avatar, bio, password_hash)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'John Doe', 'johndoe', 'john@example.com', 'https://i.pravatar.cc/150?img=1', 'Software engineer passionate about web development', '$2a$10$somehashhere'),
  ('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'janesmith', 'jane@example.com', 'https://i.pravatar.cc/150?img=2', 'UX/UI Designer | Creating beautiful interfaces', '$2a$10$somehashhere'),
  ('00000000-0000-0000-0000-000000000003', 'Alex Johnson', 'alexj', 'alex@example.com', 'https://i.pravatar.cc/150?img=3', 'Tech enthusiast and photographer', '$2a$10$somehashhere');

-- Insert some sample posts
INSERT INTO posts (id, user_id, content, image)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Just launched my new website! Check it out and let me know what you think. #webdev #coding', 'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=500&auto=format&fit=crop'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Here''s my latest UI design for a fitness app. What do you think of the color scheme? #design #UI', 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Just hiked Mount Rainier! The views were absolutely breathtaking. #hiking #nature #adventure', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop');

-- Insert sample comments
INSERT INTO comments (post_id, user_id, content)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Looks amazing! Great work!'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'The design is fantastic. Would love to hear more about the tech stack you used.'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Love the colors! Very modern and sleek.'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'So jealous! That view is incredible!'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'How long did the hike take? I''ve been wanting to try that trail.');

-- Insert sample likes
INSERT INTO likes (user_id, post_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003');

-- Insert sample followers
INSERT INTO followers (follower_id, following_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001');
