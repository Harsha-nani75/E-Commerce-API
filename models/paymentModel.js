// models/paymentModel.js
const pool = require('../config/db');

const Payment = {
  create: async ({ orderId, stripePaymentId, amount, status = 'pending' }) => {
    const [result] = await pool.execute(
      'INSERT INTO payments (order_id, stripe_payment_id, amount, status) VALUES (?, ?, ?, ?)',
      [orderId, stripePaymentId, amount, status]
    );
    return { id: result.insertId };
  },

  updateStatus: async (paymentId, status) => {
    await pool.execute('UPDATE payments SET status = ? WHERE id = ?', [status, paymentId]);
  },

  findByStripePaymentId: async (stripePaymentId) => {
    const [rows] = await pool.execute('SELECT * FROM payments WHERE stripe_payment_id = ?', [stripePaymentId]);
    return rows[0];
  }
};

module.exports = Payment;
