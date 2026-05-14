const { getAuth, getDb } = require('../../config/firebase');

async function getUserProfile(uid) {
  const doc = await getDb().collection('users').doc(uid).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function createUserProfile(uid, { displayName, email, role = 'client' }) {
  const userData = {
    uid,
    displayName,
    email,
    role,
    createdAt: new Date().toISOString(),
    fcmTokens: [],
  };
  await getDb().collection('users').doc(uid).set(userData);
  return userData;
}

const MAX_FCM_TOKENS = 5;

async function updateFcmToken(uid, token) {
  const userRef = getDb().collection('users').doc(uid);
  const doc = await userRef.get();
  if (!doc.exists) return;

  const tokens = doc.data().fcmTokens || [];
  if (tokens.includes(token)) return;

  // Mantiene solo los MAX_FCM_TOKENS más recientes para evitar acumulación infinita
  const updated = [...tokens, token].slice(-MAX_FCM_TOKENS);
  await userRef.update({ fcmTokens: updated });
}

async function setAdminRole(uid) {
  await getAuth().setCustomUserClaims(uid, { admin: true });
  await getDb().collection('users').doc(uid).update({ role: 'admin' });
}

module.exports = { getUserProfile, createUserProfile, updateFcmToken, setAdminRole };
