// controllers/cartController.js
const Cart = require('../models/cartModel');

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required' });
    await Cart.addItem(userId, productId, Number(quantity));
    const cart = await Cart.getCartWithDetails(userId);
    res.json({ message: 'Added to cart', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Add to cart failed' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    await Cart.removeItem(userId, productId);
    const cart = await Cart.getCartWithDetails(userId);
    res.json({ message: 'Removed from cart', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Remove failed' });
  }
};

const viewCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.getCartWithDetails(userId);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch cart' });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;
    await Cart.updateQuantity(userId, productId, Number(quantity));
    const cart = await Cart.getCartWithDetails(userId);
    res.json({ message: 'Updated', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update quantity failed' });
  }
};

module.exports = { addToCart, removeFromCart, viewCart, updateQuantity };
