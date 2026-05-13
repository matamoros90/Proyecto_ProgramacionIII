const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { createOrder, listOrders, getOrder } = require('./orders.controller');

const router = Router();

router.use(authenticate);
router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:id', getOrder);

module.exports = router;
