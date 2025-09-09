// models/cartModel.js
const pool = require('../config/db');

const Cart = {
  ensureCartExists: async (userId) => {
    const [rows] = await pool.execute('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (rows.length) return rows[0].id;
    const [result] = await pool.execute('INSERT INTO carts (user_id) VALUES (?)', [userId]);
    return result.insertId;
  },

  addItem: async (userId, productId, quantity = 1) => {
    const cartId = await Cart.ensureCartExists(userId);
    // If item exists, update quantity
    const [rows] = await pool.execute('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);
    if (rows.length) {
      const newQty = rows[0].quantity + Number(quantity);
      await pool.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, rows[0].id]);
    } else {
      await pool.execute('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cartId, productId, quantity]);
    }
    return cartId;
  },

  removeItem: async (userId, productId) => {
    const cartId = await Cart.ensureCartExists(userId);
    await pool.execute('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);
  },

  updateQuantity: async (userId, productId, quantity) => {
    const cartId = await Cart.ensureCartExists(userId);
    if (quantity <= 0) {
      await pool.execute('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);
    } else {
      await pool.execute('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?', [quantity, cartId, productId]);
    }
  },

  getCartWithDetails: async (userId) => {
    const cartId = await Cart.ensureCartExists(userId);
    const [items] = await pool.execute(
      `SELECT ci.product_id, ci.quantity, p.title, p.description, p.price, p.inventory
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );
    return { cartId, items };
  },

  clearCart: async (userId) => {
    const cartId = await Cart.ensureCartExists(userId);
    await pool.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  }
};

module.exports = Cart;
