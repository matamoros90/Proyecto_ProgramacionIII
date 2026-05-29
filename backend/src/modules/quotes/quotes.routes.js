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
router.delete('/:id/mine', ctrl.deleteQuoteByClient);

// Vendedor / Admin
router.post('/:id/followup', requireVendorOrAdmin, ctrl.vendorFollowup);
router.patch('/:id/ready', requireVendorOrAdmin, ctrl.vendorMarkReady);
router.post('/:id/stage', requireVendorOrAdmin, ctrl.vendorStageNotification);
router.patch('/:id/verify-payment', requireVendorOrAdmin, ctrl.verifyPayment);

// Vendedor: tomar cotización disponible
router.patch('/:id/claim', requireVendorOrAdmin, ctrl.claimQuote);

// Vendedor: archivar cotización completada / eliminar cotización sin procesar
router.patch('/:id/archive', requireVendorOrAdmin, ctrl.archiveQuote);
router.delete('/:id', requireVendorOrAdmin, ctrl.deleteQuoteByVendor);

// Solo admin
router.patch('/:id/assign', requireAdmin, ctrl.assignVendor);

module.exports = router;
