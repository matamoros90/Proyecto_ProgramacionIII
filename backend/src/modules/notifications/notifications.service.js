const { getMessaging, getDb } = require('../../config/firebase');

async function sendToUser(userId, { title, body, data = {} }) {
  const userDoc = await getDb().collection('users').doc(userId).get();
  if (!userDoc.exists) return;

  const tokens = userDoc.data().fcmTokens || [];
  if (tokens.length === 0) return;

  const message = {
    notification: { title, body },
    data: { ...data, timestamp: new Date().toISOString() },
    tokens,
  };

  try {
    const response = await getMessaging().sendEachForMulticast(message);
    // Limpiar tokens inválidos
    const invalidTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
        invalidTokens.push(tokens[idx]);
      }
    });
    if (invalidTokens.length > 0) {
      await cleanInvalidTokens(userId, invalidTokens);
    }
  } catch (err) {
    console.error('[FCM] Error enviando notificación:', err.message);
  }
}

async function cleanInvalidTokens(userId, invalidTokens) {
  const userRef = getDb().collection('users').doc(userId);
  const doc = await userRef.get();
  if (!doc.exists) return;
  const currentTokens = doc.data().fcmTokens || [];
  const validTokens = currentTokens.filter(t => !invalidTokens.includes(t));
  await userRef.update({ fcmTokens: validTokens });
}

async function saveNotification(userId, { title, body, type, orderId }) {
  await getDb().collection('notifications').add({
    userId,
    title,
    body,
    type,
    orderId: orderId || null,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

async function sendToAllVendors({ title, body, data = {} }) {
  const snapshot = await getDb().collection('users').where('role', '==', 'vendor').get();
  if (snapshot.empty) return;
  const sends = snapshot.docs.map(doc => sendToUser(doc.id, { title, body, data }));
  await Promise.allSettled(sends);
}

module.exports = { sendToUser, saveNotification, sendToAllVendors };
