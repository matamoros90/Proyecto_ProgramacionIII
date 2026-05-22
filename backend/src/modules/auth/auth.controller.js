const { sendSuccess, sendError } = require('../../shared/utils/response.util');
const authService = require('./auth.service');

async function updateProfile(req, res, next) {
  try {
    const { displayName, address } = req.body;
    if (!displayName && address === undefined) return sendError(res, 400, 'Nada que actualizar');
    await authService.updateUserProfile(req.user.uid, { displayName, address });
    const updated = await authService.getUserProfile(req.user.uid);
    sendSuccess(res, updated, 'Perfil actualizado');
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const profile = await authService.getUserProfile(req.user.uid);
    if (!profile) return sendError(res, 404, 'Perfil no encontrado');
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

async function registerProfile(req, res, next) {
  try {
    const displayName = String(req.body.displayName ?? '').trim().slice(0, 100);
    const email = String(req.body.email ?? '').trim().toLowerCase().slice(0, 254);

    if (!displayName) return sendError(res, 400, 'El nombre es requerido');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendError(res, 400, 'Email inválido');

    const existing = await authService.getUserProfile(req.user.uid);
    if (existing) return sendSuccess(res, existing, 'Perfil ya existe');

    const profile = await authService.createUserProfile(req.user.uid, { displayName, email });
    sendSuccess(res, profile, 'Perfil creado', 201);
  } catch (err) {
    next(err);
  }
}

async function saveFcmToken(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) return sendError(res, 400, 'Token FCM requerido');
    await authService.updateFcmToken(req.user.uid, token);
    sendSuccess(res, {}, 'Token FCM registrado');
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, registerProfile, saveFcmToken, updateProfile };
