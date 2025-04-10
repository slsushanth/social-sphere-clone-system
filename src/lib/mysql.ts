
// Determine if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Mock database for browser environment
const mockDatabase = {
  users: [],
  posts: [],
  comments: [],
  likes: [],
  followers: []
};

// Import MySQL only on the server side
let mysql: any;
if (!isBrowser) {
  try {
    // Dynamic import to avoid browser compatibility issues
    mysql = require('mysql2/promise');
  } catch (error) {
    console.error('MySQL module could not be loaded:', error);
  }
}

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',  // Default MySQL user
  password: '',  // Default empty password
  database: 'social_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Database connection pool (only created server-side)
let pool: any;
if (!isBrowser && mysql) {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('MySQL connection pool created');
  } catch (error) {
    console.error('Error creating MySQL connection pool:', error);
  }
}

// Helper function to execute queries (mock in browser, real in Node.js)
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  if (isBrowser) {
    console.log('Mock query executed:', sql, params);
    // Mock implementation for the browser
    // This would need to be expanded for a real application
    return [] as unknown as T;
  } else {
    try {
      // Server-side implementation using real MySQL connection
      if (!pool) {
        throw new Error('MySQL connection pool is not initialized');
      }
      const [rows] = await pool.execute(sql, params);
      return rows as T;
    } catch (error) {
      console.error('MySQL query error:', error);
      throw new Error(`Database query failed: ${(error as Error).message}`);
    }
  }
}

// Mock initialize database function
export async function initializeDatabase() {
  if (isBrowser) {
    console.log('Initializing mock database');
    
    // Create sample users
    mockDatabase.users = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        avatar: 'https://i.pravatar.cc/150?img=1',
        bio: 'Software engineer passionate about web development',
        password_hash: 'password_hash_1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Jane Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        avatar: 'https://i.pravatar.cc/150?img=2',
        bio: 'UX/UI Designer | Creating beautiful interfaces',
        password_hash: 'password_hash_2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Alex Johnson',
        username: 'alexj',
        email: 'alex@example.com',
        avatar: 'https://i.pravatar.cc/150?img=3',
        bio: 'Tech enthusiast and photographer',
        password_hash: 'password_hash_3',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Create sample posts
    mockDatabase.posts = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        user_id: '00000000-0000-0000-0000-000000000001',
        content: 'Just launched my new website! Check it out and let me know what you think. #webdev #coding',
        image: 'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=500&auto=format&fit=crop',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        user_id: '00000000-0000-0000-0000-000000000002',
        content: 'Here\'s my latest UI design for a fitness app. What do you think of the color scheme? #design #UI',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        user_id: '00000000-0000-0000-0000-000000000003',
        content: 'Just hiked Mount Rainier! The views were absolutely breathtaking. #hiking #nature #adventure',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Add sample likes, comments, and followers
    mockDatabase.likes = [
      { id: '1', user_id: '00000000-0000-0000-0000-000000000001', post_id: '00000000-0000-0000-0000-000000000002', created_at: new Date().toISOString() },
      { id: '2', user_id: '00000000-0000-0000-0000-000000000002', post_id: '00000000-0000-0000-0000-000000000001', created_at: new Date().toISOString() },
      { id: '3', user_id: '00000000-0000-0000-0000-000000000003', post_id: '00000000-0000-0000-0000-000000000001', created_at: new Date().toISOString() }
    ];
    
    mockDatabase.comments = [
      { 
        id: '1', 
        post_id: '00000000-0000-0000-0000-000000000001', 
        user_id: '00000000-0000-0000-0000-000000000002', 
        content: 'Looks amazing! Great work!',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '2', 
        post_id: '00000000-0000-0000-0000-000000000002', 
        user_id: '00000000-0000-0000-0000-000000000001', 
        content: 'Love the colors! Very modern and sleek.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    mockDatabase.followers = [
      { id: '1', follower_id: '00000000-0000-0000-0000-000000000001', following_id: '00000000-0000-0000-0000-000000000002', created_at: new Date().toISOString() },
      { id: '2', follower_id: '00000000-0000-0000-0000-000000000002', following_id: '00000000-0000-0000-0000-000000000001', created_at: new Date().toISOString() }
    ];
    
    console.log('Mock database initialized successfully');
    return true;
  } else {
    try {
      // Initialize real database connection
      if (!pool) {
        throw new Error('MySQL connection pool is not initialized');
      }
      
      console.log('Checking MySQL connection...');
      await pool.execute('SELECT 1');
      console.log('MySQL connection successful');
      return true;
    } catch (error) {
      console.error('Error initializing MySQL database:', error);
      return false;
    }
  }
}

// Close database connection (only relevant for server-side)
export async function closeDatabase() {
  if (!isBrowser && pool) {
    try {
      await pool.end();
      console.log('MySQL connection pool closed');
    } catch (error) {
      console.error('Error closing MySQL connection pool:', error);
    }
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

// Export the mock database for use in other modules
export { mockDatabase };
