
import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root', // Default MySQL username - you may need to change this
  password: '', // Default empty password - you may need to change this
  database: 'social_network', // Make sure to create this database in MySQL
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to execute queries
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params || []);
  return rows as T;
}

// Connect to MySQL and create database if it doesn't exist
export async function initializeDatabase() {
  try {
    // First create a connection without specifying a database
    const tempConnection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root', // Default MySQL username - you may need to change this
      password: '', // Default empty password - you may need to change this
    });

    // Create database if it doesn't exist
    await tempConnection.execute('CREATE DATABASE IF NOT EXISTS social_network');
    await tempConnection.end();

    // Execute schema file
    const schemaQuery = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      avatar VARCHAR(255),
      bio TEXT,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Posts table
    CREATE TABLE IF NOT EXISTS posts (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      content TEXT NOT NULL,
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Comments table
    CREATE TABLE IF NOT EXISTS comments (
      id VARCHAR(36) PRIMARY KEY,
      post_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Likes table
    CREATE TABLE IF NOT EXISTS likes (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      post_id VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, post_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Followers table
    CREATE TABLE IF NOT EXISTS followers (
      id VARCHAR(36) PRIMARY KEY,
      follower_id VARCHAR(36) NOT NULL,
      following_id VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create view for post details
    CREATE OR REPLACE VIEW post_details AS
    SELECT 
      p.id,
      p.content,
      p.image,
      p.created_at,
      p.user_id,
      u.name AS user_name,
      u.username AS user_username,
      u.avatar AS user_avatar,
      (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC;
    `;

    // Execute schema creation
    const queries = schemaQuery.split(';').filter(q => q.trim());
    for (const q of queries) {
      if (q.trim()) {
        await query(q);
      }
    }

    // Insert sample data if tables are empty
    const usersCount = await query<any[]>('SELECT COUNT(*) as count FROM users');
    if (usersCount[0].count === 0) {
      // Insert sample users
      await query(`
        INSERT INTO users (id, name, username, email, avatar, bio, password_hash)
        VALUES 
          ('00000000-0000-0000-0000-000000000001', 'John Doe', 'johndoe', 'john@example.com', 'https://i.pravatar.cc/150?img=1', 'Software engineer passionate about web development', 'password_hash_1'),
          ('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'janesmith', 'jane@example.com', 'https://i.pravatar.cc/150?img=2', 'UX/UI Designer | Creating beautiful interfaces', 'password_hash_2'),
          ('00000000-0000-0000-0000-000000000003', 'Alex Johnson', 'alexj', 'alex@example.com', 'https://i.pravatar.cc/150?img=3', 'Tech enthusiast and photographer', 'password_hash_3')
      `);

      // Insert sample posts
      await query(`
        INSERT INTO posts (id, user_id, content, image)
        VALUES
          ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Just launched my new website! Check it out and let me know what you think. #webdev #coding', 'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=500&auto=format&fit=crop'),
          ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Here''s my latest UI design for a fitness app. What do you think of the color scheme? #design #UI', 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop'),
          ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Just hiked Mount Rainier! The views were absolutely breathtaking. #hiking #nature #adventure', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop')
      `);

      // Insert sample comments
      await query(`
        INSERT INTO comments (id, post_id, user_id, content)
        VALUES
          ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Looks amazing! Great work!'),
          ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'The design is fantastic. Would love to hear more about the tech stack you used.'),
          ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Love the colors! Very modern and sleek.'),
          ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'So jealous! That view is incredible!'),
          ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'How long did the hike take? I''ve been wanting to try that trail.')
      `);

      // Insert sample likes
      await query(`
        INSERT INTO likes (id, user_id, post_id)
        VALUES
          ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
          ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
          ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
          ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'),
          ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003')
      `);

      // Insert sample followers
      await query(`
        INSERT INTO followers (id, follower_id, following_id)
        VALUES
          ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
          ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
          ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
          ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001')
      `);
    }

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Generate a UUID v4
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
