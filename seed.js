const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce',
  port: process.env.DB_PORT || 3306
};

async function seedDatabase() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Clearing existing data...');
    // Clear existing data in reverse order of dependencies
    await connection.execute('DELETE FROM payments');
    await connection.execute('DELETE FROM order_items');
    await connection.execute('DELETE FROM orders');
    await connection.execute('DELETE FROM cart_items');
    await connection.execute('DELETE FROM carts');
    await connection.execute('DELETE FROM products');
    await connection.execute('DELETE FROM users');
    
    console.log('Seeding users...');
    // Hash passwords
    const userPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    // Insert users
    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)',
      ['Harsha', 'harsha@gmail.com', userPassword, 0]
    );
    
    const [adminResult] = await connection.execute(
      'INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)',
      ['Admin', 'admin@example.com', adminPassword, 1]
    );
    
    console.log('Seeding products...');
    // Insert sample products
    const products = [
      {
        title: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 99.99,
        inventory: 50
      },
      {
        title: 'Smartphone Case',
        description: 'Protective case for latest smartphones',
        price: 24.99,
        inventory: 100
      },
      {
        title: 'Laptop Stand',
        description: 'Adjustable aluminum laptop stand for ergonomic work',
        price: 79.99,
        inventory: 25
      },
      {
        title: 'USB-C Cable',
        description: 'Fast charging USB-C cable, 6 feet long',
        price: 19.99,
        inventory: 200
      },
      {
        title: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking',
        price: 39.99,
        inventory: 75
      },
      {
        title: 'Mechanical Keyboard',
        description: 'RGB backlit mechanical keyboard with blue switches',
        price: 129.99,
        inventory: 30
      },
      {
        title: 'Monitor Mount',
        description: 'Dual monitor mount with adjustable arms',
        price: 89.99,
        inventory: 15
      },
      {
        title: 'Webcam HD',
        description: '1080p HD webcam with built-in microphone',
        price: 69.99,
        inventory: 40
      }
    ];
    
    for (const product of products) {
      await connection.execute(
        'INSERT INTO products (title, description, price, inventory) VALUES (?, ?, ?, ?)',
        [product.title, product.description, product.price, product.inventory]
      );
    }
    
    console.log('Seeding completed successfully!');
    console.log('\nTest Users Created:');
    console.log('Regular User: harsha@gmail.com / password123');
    console.log('Admin User: admin@example.com / admin123');
    console.log('\nSample products created for testing API endpoints.');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the seed function
seedDatabase();
