// controllers/orderController.js
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Payment = require('../models/paymentModel');
const stripe = require('../config/stripe');

const createCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.getCartWithDetails(userId);
    if (!cart.items.length) return res.status(400).json({ error: 'Cart is empty' });

    // Calculate total in smallest currency unit (cents)
    const total = cart.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const amountInCents = Math.round(total * 100);

    // Create a pending order in DB
    const { id: orderId } = await Order.create({ userId, totalAmount: total, status: 'pending' });
    await Order.addItems(orderId, cart.items.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price })));

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd', // adapt as needed
      metadata: { order_id: orderId.toString(), user_id: userId.toString() }
    });

    // Create a payment record
    await Payment.create({ orderId, stripePaymentId: paymentIntent.id, amount: total, status: paymentIntent.status });

    // Return client_secret to client for completing payment
    res.json({ clientSecret: paymentIntent.client_secret, orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Checkout failed' });
  }
};

const confirmPayment = async (req, res) => {
  // A simple endpoint to confirm payment by checking Stripe PaymentIntent status.
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId required' });

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!pi) return res.status(404).json({ error: 'Payment intent not found' });

    // Find our payment record
    const paymentRecord = await Payment.findByStripePaymentId(pi.id);
    if (!paymentRecord) return res.status(404).json({ error: 'Payment record not found' });

    if (pi.status === 'succeeded') {
      // mark order as paid
      await Payment.updateStatus(paymentRecord.id, 'succeeded');
      await Order.updateStatus(paymentRecord.order_id, 'paid');

      // Clear user's cart
      // (we recorded user id in order metadata earlier but keep it simple: fetch order)
      const { order } = await Order.getById(paymentRecord.order_id);
      await Cart.clearCart(order.user_id);

      return res.json({ message: 'Payment successful and order updated' });
    }

    // update payment status in DB
    await Payment.updateStatus(paymentRecord.id, pi.status);
    res.json({ message: 'Payment status updated', status: pi.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Confirm payment failed' });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.listByUser(userId);
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch orders' });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const data = await Order.getById(orderId);
    if (!data) return res.status(404).json({ error: 'Order not found' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch order' });
  }
};

module.exports = { createCheckout, confirmPayment, getOrders, getOrderDetail };
