// routes/orderRoutes.js
const express = require('express');
const { createCheckout, confirmPayment, getOrders, getOrderDetail } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/checkout', createCheckout); // returns clientSecret + orderId
router.post('/confirm', confirmPayment); // client calls when finished to confirm
router.get('/', getOrders);
router.get('/:id', getOrderDetail);

module.exports = router;
