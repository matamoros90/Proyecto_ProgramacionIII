const { sendSuccess, sendError } = require('../../shared/utils/response.util');
const service = require('./builds.service');

async function saveBuild(req, res, next) {
  try {
    const build = await service.save(req.user.uid, req.body);
    sendSuccess(res, build, 'Build guardado', 201);
  } catch (err) { next(err); }
}

async function listBuilds(req, res, next) {
  try {
    const builds = await service.getByUser(req.user.uid);
    sendSuccess(res, builds);
  } catch (err) { next(err); }
}

async function getBuild(req, res, next) {
  try {
    const build = await service.getById(req.params.id);
    if (!build) return sendError(res, 404, 'Build no encontrado');
    if (build.userId !== req.user.uid && !req.user.admin) {
      return sendError(res, 403, 'Sin acceso a este build');
    }
    sendSuccess(res, build);
  } catch (err) { next(err); }
}

async function updateBuild(req, res, next) {
  try {
    const build = await service.update(req.params.id, req.user.uid, req.body);
    if (!build) return sendError(res, 404, 'Build no encontrado o sin permisos');
    sendSuccess(res, build, 'Build actualizado');
  } catch (err) { next(err); }
}

async function deleteBuild(req, res, next) {
  try {
    const deleted = await service.remove(req.params.id, req.user.uid);
    if (!deleted) return sendError(res, 404, 'Build no encontrado o sin permisos');
    sendSuccess(res, {}, 'Build eliminado');
  } catch (err) { next(err); }
}

module.exports = { saveBuild, listBuilds, getBuild, updateBuild, deleteBuild };
