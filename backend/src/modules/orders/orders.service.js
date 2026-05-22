const { getDb } = require('../../config/firebase');
const { sendToUser, saveNotification } = require('../notifications/notifications.service');
const { ORDER_STATES, ORDER_STATE_FLOW, FCM_MESSAGES } = require('../../shared/constants/order-states');

const COLLECTION = 'orders';

async function createFromQuote(userId, quoteId, quoteData, initialState) {
  const startState = initialState || ORDER_STATES.PENDING;
  const ref = getDb().collection(COLLECTION).doc();
  const order = {
    id: ref.id,
    userId,
    quoteId,
    build: quoteData.build,
    totalPrice: quoteData.totalPrice,
    category: quoteData.category,
    state: startState,
    stateHistory: [
      { state: startState, timestamp: new Date().toISOString(), note: initialState ? 'Orden creada — pago verificado' : 'Orden creada' },
    ],
    notes: '',
    technicianId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await ref.set(order);
  return order;
}

async function getById(id) {
  const doc = await getDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getByUser(userId) {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .get();
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getAll(filters = {}) {
  let query = getDb().collection(COLLECTION);
  if (filters.state) query = query.where('state', '==', filters.state);
  const snapshot = await query.get();
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function updateState(id, newState, note = '') {
  const ref = getDb().collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;

  const order = doc.data();
  const currentIndex = ORDER_STATE_FLOW.indexOf(order.state);
  const newIndex = ORDER_STATE_FLOW.indexOf(newState);

  if (newState !== ORDER_STATES.CANCELLED && newIndex <= currentIndex) {
    throw new Error('No se puede retroceder el estado de una orden');
  }

  const stateEntry = { state: newState, timestamp: new Date().toISOString(), note };
  const updated = {
    state: newState,
    stateHistory: [...(order.stateHistory || []), stateEntry],
    updatedAt: new Date().toISOString(),
  };

  await ref.update(updated);

  // Notificación push al cliente
  const fcmMsg = FCM_MESSAGES[newState];
  if (fcmMsg) {
    await sendToUser(order.userId, {
      title: fcmMsg.title,
      body: fcmMsg.body,
      data: { orderId: id, state: newState },
    });
    await saveNotification(order.userId, {
      title: fcmMsg.title,
      body: fcmMsg.body,
      type: 'order_update',
      orderId: id,
    });
  }

  return { id, ...order, ...updated };
}

async function assignTechnician(id, technicianId) {
  const ref = getDb().collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;
  await ref.update({ technicianId, updatedAt: new Date().toISOString() });
  return { id, ...doc.data(), technicianId };
}

module.exports = { createFromQuote, getById, getByUser, getAll, updateState, assignTechnician };
