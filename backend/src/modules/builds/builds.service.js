const { getDb } = require('../../config/firebase');

const COLLECTION = 'builds';

async function save(userId, buildData) {
  const ref = getDb().collection(COLLECTION).doc();
  const build = {
    id: ref.id,
    userId,
    ...buildData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await ref.set(build);
  return build;
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

async function update(id, userId, data) {
  const ref = getDb().collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;
  if (doc.data().userId !== userId) return null;

  const updated = { ...data, updatedAt: new Date().toISOString() };
  await ref.update(updated);
  return { id, ...doc.data(), ...updated };
}

async function remove(id, userId) {
  const ref = getDb().collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== userId) return false;
  await ref.delete();
  return true;
}

module.exports = { save, getByUser, getById, update, remove };
