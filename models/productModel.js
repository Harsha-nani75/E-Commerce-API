// models/productModel.js
const pool = require('../config/db');

const Product = {
  create: async ({ title, description, price, inventory = 0 }) => {
    const [result] = await pool.execute(
      'INSERT INTO products (title, description, price, inventory) VALUES (?, ?, ?, ?)',
      [title, description, price, inventory]
    );
    return { id: result.insertId };
  },

  update: async (id, fields = {}) => {
    const sets = [];
    const values = [];
    for (const key of ['title', 'description', 'price', 'inventory']) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    if (!sets.length) return;
    values.push(id);
    await pool.execute(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  delete: async (id) => {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
  },

  getById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  },

  list: async ({ search = '', limit = 20, offset = 0 }) => {
    const q = `%${search}%`;
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE title LIKE ? OR description LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?',
      [q, q, Number(limit), Number(offset)]
    );
    return rows || [];
  }
};

module.exports = Product;
