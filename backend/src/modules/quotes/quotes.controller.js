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

module.exports = { create, list, getOne, confirm };
