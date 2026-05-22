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

async function setVendorRole(uid) {
  await getAuth().setCustomUserClaims(uid, { vendor: true });
  await getDb().collection('users').doc(uid).update({ role: 'vendor' });
}

async function listVendors() {
  const snapshot = await getDb().collection('users').where('role', '==', 'vendor').get();
  return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
}

async function updateUserProfile(uid, updates) {
  const allowed = {};
  if (updates.displayName) allowed.displayName = String(updates.displayName).trim().slice(0, 100);
  if (updates.address !== undefined) allowed.address = String(updates.address ?? '').trim().slice(0, 200);
  if (Object.keys(allowed).length === 0) return;
  await getDb().collection('users').doc(uid).update(allowed);
}

module.exports = { getUserProfile, createUserProfile, updateFcmToken, setAdminRole, setVendorRole, listVendors, updateUserProfile };
