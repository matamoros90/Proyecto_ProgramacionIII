const { Router } = require('express');
const { authenticate, requireAdmin } = require('../../middleware/auth.middleware');
const ctrl = require('./admin.controller');

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', ctrl.getDashboard);
router.get('/orders', ctrl.listOrders);
router.patch('/orders/:id/state', ctrl.updateOrderState);
router.patch('/orders/:id/assign', ctrl.assignTechnician);
router.get('/quotes', ctrl.listQuotes);
router.get('/inventory', ctrl.getInventory);
router.get('/vendors', ctrl.listVendors);
router.post('/vendors', ctrl.createVendor);
router.delete('/vendors/:uid', ctrl.deleteVendor);

module.exports = router;
