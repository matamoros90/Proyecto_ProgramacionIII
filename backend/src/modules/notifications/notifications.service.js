const { getMessaging, getDb } = require('../../config/firebase');

async function sendToUser(userId, { title, body, data = {} }) {
  const userDoc = await getDb().collection('users').doc(userId).get();
  if (!userDoc.exists) return;

  const tokens = userDoc.data().fcmTokens || [];
  if (tokens.length === 0) return;

  // data: FCM exige strings — serializamos cualquier valor no-string
  const stringData = Object.fromEntries(
    Object.entries({ ...data, timestamp: new Date().toISOString() })
      .map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]),
  );

  const message = {
    notification: { title, body },
    data: stringData,

    // ── Android: heads-up notification (WhatsApp/Telegram style) ─────────
    android: {
      priority: 'high', // entrega inmediata, despierta el dispositivo
      notification: {
        channelId: 'default',           // canal con IMPORTANCE_MAX en el cliente
        notificationPriority: 'PRIORITY_MAX',
        sound: 'default',               // requerido para heads-up en Android 8+
        defaultVibrateTimings: true,
        defaultLightSettings: true,
        visibility: 'public',           // mostrar en pantalla bloqueada
        sticky: false,
      },
    },

    // ── iOS: prioridad inmediata + sonido por defecto ────────────────────
    apns: {
      headers: { 'apns-priority': '10' },
      payload: {
        aps: {
          sound: 'default',
          'mutable-content': 1,
          'content-available': 1,
        },
      },
    },

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

// ─── Consultas del usuario ──────────────────────────────────────────────────

async function listByUser(userId) {
  // orderBy('createdAt', 'desc') requeriría índice compuesto en Firestore.
  // Ordenamos en memoria para evitar configuración extra.
  const snapshot = await getDb()
    .collection('notifications')
    .where('userId', '==', userId)
    .limit(100)
    .get();
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

async function countUnread(userId) {
  const snapshot = await getDb()
    .collection('notifications')
    .where('userId', '==', userId)
    .where('read', '==', false)
    .get();
  return snapshot.size;
}

async function markRead(notifId, userId) {
  const ref = getDb().collection('notifications').doc(notifId);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== userId) return false;
  await ref.update({ read: true, readAt: new Date().toISOString() });
  return true;
}

async function markAllRead(userId) {
  const snapshot = await getDb()
    .collection('notifications')
    .where('userId', '==', userId)
    .where('read', '==', false)
    .get();
  if (snapshot.empty) return 0;
  const batch = getDb().batch();
  const now = new Date().toISOString();
  snapshot.docs.forEach(d => batch.update(d.ref, { read: true, readAt: now }));
  await batch.commit();
  return snapshot.size;
}

async function remove(notifId, userId) {
  const ref = getDb().collection('notifications').doc(notifId);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== userId) return false;
  await ref.delete();
  return true;
}

module.exports = {
  sendToUser, saveNotification, sendToAllVendors,
  listByUser, countUnread, markRead, markAllRead, remove,
};
