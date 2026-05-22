const { Router } = require('express');
const { authenticate, requireAdmin, requireVendorOrAdmin } = require('../../middleware/auth.middleware');
const ctrl = require('./quotes.controller');

const router = Router();

router.use(authenticate);

// Cliente
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/vendor/assigned', requireVendorOrAdmin, ctrl.vendorQuotes);
router.get('/:id', ctrl.getOne);
router.patch('/:id/confirm', ctrl.confirm);
router.patch('/:id/accept', ctrl.clientAccept);
router.post('/:id/payment', ctrl.clientPayment);

// Vendedor / Admin
router.post('/:id/followup', requireVendorOrAdmin, ctrl.vendorFollowup);
router.patch('/:id/ready', requireVendorOrAdmin, ctrl.vendorMarkReady);
router.patch('/:id/verify-payment', requireVendorOrAdmin, ctrl.verifyPayment);

// Solo admin
router.patch('/:id/assign', requireAdmin, ctrl.assignVendor);

module.exports = router;
