// routes/cartRoutes.js
const express = require('express');
const { addToCart, removeFromCart, viewCart, updateQuantity } = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', viewCart);
router.post('/add', addToCart);
router.delete('/remove/:productId', removeFromCart);
router.put('/update/:productId', updateQuantity);

module.exports = router;
