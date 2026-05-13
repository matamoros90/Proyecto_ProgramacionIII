const { sendSuccess, sendError } = require('../../shared/utils/response.util');
const { generateBuild, swapComponent } = require('./recommendations.service');

async function recommend(req, res, next) {
  try {
    const { budget, category } = req.body;
    if (!budget || !category) {
      return sendError(res, 400, 'Se requieren "budget" y "category"');
    }
    if (budget < 500) {
      return sendError(res, 400, 'El presupuesto mínimo es Q500');
    }

    const result = await generateBuild(Number(budget), category);
    sendSuccess(res, result, 'Configuración recomendada generada');
  } catch (err) {
    if (err.message.includes('no reconocida')) return sendError(res, 400, err.message);
    next(err);
  }
}

async function swap(req, res, next) {
  try {
    const { build, type, componentId } = req.body;
    if (!build || !type || !componentId) {
      return sendError(res, 400, 'Se requieren "build", "type" y "componentId"');
    }
    const result = await swapComponent(build, type, componentId);
    sendSuccess(res, result, 'Componente intercambiado');
  } catch (err) {
    if (err.message === 'Componente no encontrado') return sendError(res, 404, err.message);
    next(err);
  }
}

module.exports = { recommend, swap };
