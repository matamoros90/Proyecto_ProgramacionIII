const { sendSuccess, sendError } = require('../../shared/utils/response.util');
const { validateBuild } = require('./compatibility.service');

async function check(req, res, next) {
  try {
    const { build } = req.body;
    if (!build || typeof build !== 'object') {
      return sendError(res, 400, 'Se requiere el objeto "build" con los componentes seleccionados');
    }
    const result = validateBuild(build);
    sendSuccess(res, result, result.compatible ? 'Build compatible' : 'Se encontraron incompatibilidades');
  } catch (err) {
    next(err);
  }
}

module.exports = { check };
