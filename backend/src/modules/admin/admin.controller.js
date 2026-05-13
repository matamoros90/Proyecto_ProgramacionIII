const { sendSuccess, sendError } = require('../../shared/utils/response.util');
const ordersService = require('../orders/orders.service');
const quotesService = require('../quotes/quotes.service');
const componentsService = require('../components/components.service');
const { ORDER_STATES } = require('../../shared/constants/order-states');

async function getDashboard(req, res, next) {
  try {
    const [allOrders, allQuotes] = await Promise.all([
      ordersService.getAll(),
      quotesService.getAll(),
    ]);

    const statsByState = Object.values(ORDER_STATES).reduce((acc, state) => {
      acc[state] = allOrders.filter(o => o.state === state).length;
      return acc;
    }, {});

    const totalRevenue = allOrders
      .filter(o => o.state === ORDER_STATES.DELIVERED)
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    sendSuccess(res, {
      orders: { total: allOrders.length, byState: statsByState },
      quotes: { total: allQuotes.length },
      revenue: { total: totalRevenue },
    });
  } catch (err) { next(err); }
}

async function listOrders(req, res, next) {
  try {
    const orders = await ordersService.getAll(req.query);
    sendSuccess(res, orders);
  } catch (err) { next(err); }
}

async function updateOrderState(req, res, next) {
  try {
    const { state, note } = req.body;
    if (!state) return sendError(res, 400, 'Estado requerido');

    const order = await ordersService.updateState(req.params.id, state, note);
    if (!order) return sendError(res, 404, 'Orden no encontrada');
    sendSuccess(res, order, `Estado actualizado a: ${state}`);
  } catch (err) {
    if (err.message.includes('retroceder')) return sendError(res, 400, err.message);
    next(err);
  }
}

async function assignTechnician(req, res, next) {
  try {
    const { technicianId } = req.body;
    const order = await ordersService.assignTechnician(req.params.id, technicianId);
    if (!order) return sendError(res, 404, 'Orden no encontrada');
    sendSuccess(res, order, 'Técnico asignado');
  } catch (err) { next(err); }
}

async function listQuotes(req, res, next) {
  try {
    const quotes = await quotesService.getAll();
    sendSuccess(res, quotes);
  } catch (err) { next(err); }
}

async function getInventory(req, res, next) {
  try {
    const components = await componentsService.getAll({ inStock: true });
    const lowStock = components.filter(c => c.stock <= 3);
    sendSuccess(res, { components, lowStock });
  } catch (err) { next(err); }
}

module.exports = { getDashboard, listOrders, updateOrderState, assignTechnician, listQuotes, getInventory };
