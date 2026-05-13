const { getDb } = require('../../config/firebase');

const COLLECTION = 'tutorials';

async function getAll({ category, level } = {}) {
  let query = getDb().collection(COLLECTION).where('published', '==', true);
  if (category) query = query.where('category', '==', category);
  if (level) query = query.where('level', '==', level);
  const snapshot = await query.orderBy('order', 'asc').get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getById(id) {
  const doc = await getDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function create(data) {
  const ref = getDb().collection(COLLECTION).doc();
  const tutorial = {
    id: ref.id,
    ...data,
    published: data.published ?? false,
    createdAt: new Date().toISOString(),
  };
  await ref.set(tutorial);
  return tutorial;
}

async function update(id, data) {
  const ref = getDb().collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;
  const updated = { ...data, updatedAt: new Date().toISOString() };
  await ref.update(updated);
  return { id, ...doc.data(), ...updated };
}

module.exports = { getAll, getById, create, update };
