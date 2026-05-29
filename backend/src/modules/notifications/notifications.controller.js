const { sendSuccess, sendError } = require('../../shared/utils/response.util');
const service = require('./notifications.service');

async function list(req, res, next) {
  try {
    const items = await service.listByUser(req.user.uid);
    sendSuccess(res, items);
  } catch (err) { next(err); }
}

async function unreadCount(req, res, next) {
  try {
    const count = await service.countUnread(req.user.uid);
    sendSuccess(res, { count });
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    const ok = await service.markRead(req.params.id, req.user.uid);
    if (!ok) return sendError(res, 404, 'Notificación no encontrada');
    sendSuccess(res, { success: true });
  } catch (err) { next(err); }
}

async function markAllRead(req, res, next) {
  try {
    const updated = await service.markAllRead(req.user.uid);
    sendSuccess(res, { updated });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const ok = await service.remove(req.params.id, req.user.uid);
    if (!ok) return sendError(res, 404, 'Notificación no encontrada');
    sendSuccess(res, { success: true });
  } catch (err) { next(err); }
}

module.exports = { list, unreadCount, markRead, markAllRead, remove };
