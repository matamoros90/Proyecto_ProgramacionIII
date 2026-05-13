const { getAuth } = require('../config/firebase');
const { sendError } = require('../shared/utils/response.util');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return sendError(res, 401, 'Token de autenticación requerido');
  }

  const token = header.split(' ')[1];
  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    return sendError(res, 401, 'Token inválido o expirado');
  }
}

async function requireAdmin(req, res, next) {
  if (!req.user) return sendError(res, 401, 'No autenticado');
  if (!req.user.admin) return sendError(res, 403, 'Acceso solo para administradores');
  next();
}

module.exports = { authenticate, requireAdmin };
