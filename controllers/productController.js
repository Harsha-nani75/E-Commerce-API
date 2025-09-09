// controllers/productController.js
const Product = require('../models/productModel');

const createProduct = async (req, res) => {
  try {
    const { title, description, price, inventory } = req.body;
    if (!title || price === undefined) return res.status(400).json({ error: 'title and price required' });

    const { id } = await Product.create({ title, description, price, inventory: inventory || 0 });
    res.status(201).json({ message: 'Product created', productId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create product failed' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await Product.update(id, req.body);
    res.json({ message: 'Product updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await Product.delete(id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

const getProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const p = await Product.getById(id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fetch product failed' });
  }
};

const listProducts = async (req, res) => {
  try {
    const { q, limit = 20, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const products = await Product.list({ search: q || '', limit: Number(limit), offset });
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'List failed' });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  listProducts
};
