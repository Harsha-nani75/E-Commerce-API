// models/orderModel.js
const pool = require('../config/db');

const Order = {
  create: async ({ userId, totalAmount, status = 'pending', shipping = null }) => {
    const [result] = await pool.execute(
      'INSERT INTO orders (user_id, total_amount, status, shipping) VALUES (?, ?, ?, ?)',
      [userId, totalAmount, status, shipping]
    );
    return { id: result.insertId };
  },

  addItems: async (orderId, items = []) => {
    const promises = items.map(item => {
      return pool.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    });
    await Promise.all(promises);
  },

  getById: async (orderId) => {
    const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!orders.length) return null;
    const [items] = await pool.execute(
      `SELECT oi.product_id, oi.quantity, oi.price, p.title
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    return { order: orders[0], items };
  },

  updateStatus: async (orderId, status) => {
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  },

  listByUser: async (userId) => {
    const [rows] = await pool.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows;
  }
};

module.exports = Order;
