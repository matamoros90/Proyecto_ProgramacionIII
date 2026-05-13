const { getDb } = require('../../config/firebase');

const COLLECTION = 'quotes';

async function create(userId, { build, totalPrice, category, notes }) {
  const ref = getDb().collection(COLLECTION).doc();
  const quote = {
    id: ref.id,
    userId,
    build,
    totalPrice,
    category,
    notes: notes || '',
    status: 'draft',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
  };
  await ref.set(quote);
  return quote;
}

async function getByUser(userId) {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getById(id) {
  const doc = await getDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function confirm(id, userId) {
  const ref = getDb().collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== userId) return null;

  await ref.update({ status: 'confirmed', confirmedAt: new Date().toISOString() });
  return { id, ...doc.data(), status: 'confirmed' };
}

async function getAll() {
  const snapshot = await getDb().collection(COLLECTION).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

module.exports = { create, getByUser, getById, confirm, getAll };
