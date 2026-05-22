const { sendSuccess, sendError } = require('../../shared/utils/response.util');
const service = require('./quotes.service');

async function create(req, res, next) {
  try {
    const quote = await service.create(req.user.uid, req.body);
    sendSuccess(res, quote, 'Cotización creada', 201);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const quotes = await service.getByUser(req.user.uid);
    sendSuccess(res, quotes);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const quote = await service.getById(req.params.id);
    if (!quote) return sendError(res, 404, 'Cotización no encontrada');
    sendSuccess(res, quote);
  } catch (err) { next(err); }
}

async function confirm(req, res, next) {
  try {
    const quote = await service.confirm(req.params.id, req.user.uid);
    if (!quote) return sendError(res, 404, 'Cotización no encontrada o sin permisos');
    sendSuccess(res, quote, 'Cotización confirmada');
  } catch (err) { next(err); }
}

// Admin: asignar vendedor
async function assignVendor(req, res, next) {
  try {
    const { vendorId } = req.body;
    if (!vendorId) return sendError(res, 400, 'vendorId requerido');
    const quote = await service.assignVendor(req.params.id, vendorId);
    if (!quote) return sendError(res, 404, 'Cotización no encontrada');
    sendSuccess(res, quote, 'Vendedor asignado');
  } catch (err) { next(err); }
}

// Vendedor: enviar seguimiento push al cliente
async function vendorFollowup(req, res, next) {
  try {
    const result = await service.sendFollowup(req.params.id, req.user.uid);
    if (!result) return sendError(res, 403, 'Sin permisos o cotización no encontrada');
    sendSuccess(res, result, 'Seguimiento enviado al cliente');
  } catch (err) { next(err); }
}

// Vendedor: marcar cotización como lista
async function vendorMarkReady(req, res, next) {
  try {
    const quote = await service.markReady(req.params.id, req.user.uid);
    if (!quote) return sendError(res, 403, 'Sin permisos o cotización no encontrada');
    sendSuccess(res, quote, 'Cotización marcada como lista');
  } catch (err) { next(err); }
}

// Cliente: aceptar cotización + dirección de entrega
async function clientAccept(req, res, next) {
  try {
    const { deliveryAddress, deliveryDepartment } = req.body;
    if (!deliveryAddress || !deliveryDepartment) {
      return sendError(res, 400, 'Dirección y departamento son requeridos');
    }
    const quote = await service.acceptQuote(req.params.id, req.user.uid, { deliveryAddress, deliveryDepartment });
    if (!quote) return sendError(res, 400, 'Cotización no encontrada o no está lista para aceptar');
    sendSuccess(res, quote, 'Cotización aceptada');
  } catch (err) { next(err); }
}

// Cliente: enviar comprobante de pago
async function clientPayment(req, res, next) {
  try {
    const { method, cardNumber, bankRef } = req.body;
    if (!method || !['card', 'bank_transfer'].includes(method)) {
      return sendError(res, 400, 'Método de pago inválido');
    }
    const cardLast4 = cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : null;
    const result = await service.submitPayment(req.params.id, req.user.uid, { method, cardLast4, bankRef });
    if (!result) return sendError(res, 400, 'Cotización no encontrada o no está en estado aceptado');
    sendSuccess(res, result, 'Pago enviado, pendiente de verificación');
  } catch (err) { next(err); }
}

// Vendedor: verificar pago y crear orden
async function verifyPayment(req, res, next) {
  try {
    const result = await service.verifyPayment(req.params.id, req.user.uid);
    if (!result) return sendError(res, 404, 'Cotización no encontrada');
    sendSuccess(res, result, 'Pago verificado — orden creada en ensamblaje');
  } catch (err) { next(err); }
}

// Vendedor: mis cotizaciones asignadas
async function vendorQuotes(req, res, next) {
  try {
    const quotes = await service.getByVendor(req.user.uid);
    sendSuccess(res, quotes);
  } catch (err) { next(err); }
}

module.exports = {
  create, list, getOne, confirm,
  assignVendor, vendorFollowup, vendorMarkReady,
  clientAccept, clientPayment, verifyPayment, vendorQuotes,
};
