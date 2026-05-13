const { sendSuccess, sendError } = require('../../shared/utils/response.util');
const ordersService = require('./orders.service');
const quotesService = require('../quotes/quotes.service');

async function createOrder(req, res, next) {
  try {
    const { quoteId } = req.body;
    const quote = await quotesService.getById(quoteId);
    if (!quote) return sendError(res, 404, 'Cotización no encontrada');
    if (quote.userId !== req.user.uid) return sendError(res, 403, 'Sin acceso a esta cotización');
    if (quote.status !== 'confirmed') return sendError(res, 400, 'La cotización debe estar confirmada antes de crear la orden');

    const order = await ordersService.createFromQuote(req.user.uid, quoteId, quote);
    sendSuccess(res, order, 'Orden de ensamblaje creada', 201);
  } catch (err) { next(err); }
}

async function listOrders(req, res, next) {
  try {
    const orders = await ordersService.getByUser(req.user.uid);
    sendSuccess(res, orders);
  } catch (err) { next(err); }
}

async function getOrder(req, res, next) {
  try {
    const order = await ordersService.getById(req.params.id);
    if (!order) return sendError(res, 404, 'Orden no encontrada');
    if (order.userId !== req.user.uid && !req.user.admin) {
      return sendError(res, 403, 'Sin acceso a esta orden');
    }
    sendSuccess(res, order);
  } catch (err) { next(err); }
}

module.exports = { createOrder, listOrders, getOrder };
