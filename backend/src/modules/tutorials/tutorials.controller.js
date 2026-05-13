const { sendSuccess, sendError } = require('../../shared/utils/response.util');
const service = require('./tutorials.service');

async function list(req, res, next) {
  try {
    const items = await service.getAll(req.query);
    sendSuccess(res, items);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const item = await service.getById(req.params.id);
    if (!item) return sendError(res, 404, 'Tutorial no encontrado');
    sendSuccess(res, item);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const item = await service.create(req.body);
    sendSuccess(res, item, 'Tutorial creado', 201);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const item = await service.update(req.params.id, req.body);
    if (!item) return sendError(res, 404, 'Tutorial no encontrado');
    sendSuccess(res, item, 'Tutorial actualizado');
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update };
