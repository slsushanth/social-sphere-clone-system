
// Determine if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

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

// Helper function to execute queries
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  if (isBrowser) {
    console.warn('MySQL operations cannot be performed in browser environment');
    throw new Error('MySQL operations are not supported in browser environment');
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

// Initialize database function
export async function initializeDatabase() {
  if (isBrowser) {
    console.warn('MySQL operations cannot be performed in browser environment');
    return false;
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

// Close database connection
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
