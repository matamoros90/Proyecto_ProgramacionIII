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
    const { method, cardLast4, bankRef } = req.body;
    if (!method || !['card', 'bank_transfer'].includes(method)) {
      return sendError(res, 400, 'Método de pago inválido');
    }
    if (method === 'card' && (!cardLast4 || !/^\d{4}$/.test(String(cardLast4)))) {
      return sendError(res, 400, 'Últimos 4 dígitos de tarjeta inválidos');
    }
    if (bankRef && String(bankRef).length > 100) {
      return sendError(res, 400, 'Referencia bancaria demasiado larga');
    }
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

// Vendedor: tomar una cotización disponible (carrera — primer en llegar gana)
async function claimQuote(req, res, next) {
  try {
    const quote = await service.claimQuote(req.params.id, req.user.uid);
    sendSuccess(res, quote, 'Cotización tomada exitosamente');
  } catch (err) {
    if (err.message.includes('ya fue tomada') || err.message.includes('no está disponible') || err.message.includes('no encontrada')) {
      return sendError(res, 409, err.message);
    }
    next(err);
  }
}

// Vendedor: mis cotizaciones asignadas + disponibles
async function vendorQuotes(req, res, next) {
  try {
    const quotes = await service.getByVendor(req.user.uid);
    sendSuccess(res, quotes);
  } catch (err) { next(err); }
}

// Vendedor: archivar cotización completada (ocultar de su vista, datos se conservan)
async function archiveQuote(req, res, next) {
  try {
    const result = await service.archiveQuote(req.params.id, req.user.uid);
    sendSuccess(res, result, 'Cotización archivada');
  } catch (err) {
    const userErrors = ['Sin permisos', 'Solo se pueden archivar', 'no encontrada'];
    if (userErrors.some(e => err.message.includes(e))) return sendError(res, 400, err.message);
    next(err);
  }
}

// Vendedor: eliminar cotización sin procesar (elimina de BD, desaparece del cliente también)
async function deleteQuoteByVendor(req, res, next) {
  try {
    const result = await service.deleteQuote(req.params.id, req.user.uid);
    sendSuccess(res, result, 'Cotización eliminada');
  } catch (err) {
    const userErrors = ['Sin permisos', 'No se puede eliminar', 'ya envió pago', 'no encontrada'];
    if (userErrors.some(e => err.message.includes(e))) return sendError(res, 400, err.message);
    next(err);
  }
}

// Cliente: eliminar su propia cotización (mientras no la haya aceptado/pagado)
async function deleteQuoteByClient(req, res, next) {
  try {
    const result = await service.deleteByClient(req.params.id, req.user.uid);
    sendSuccess(res, result, 'Cotización eliminada');
  } catch (err) {
    const userErrors = ['Sin permisos', 'No puedes eliminar', 'no encontrada'];
    if (userErrors.some(e => err.message.includes(e))) return sendError(res, 400, err.message);
    next(err);
  }
}

module.exports = {
  create, list, getOne, confirm,
  assignVendor, vendorFollowup, vendorMarkReady,
  clientAccept, clientPayment, verifyPayment, vendorQuotes, claimQuote,
  archiveQuote, deleteQuoteByVendor, deleteQuoteByClient,
};
