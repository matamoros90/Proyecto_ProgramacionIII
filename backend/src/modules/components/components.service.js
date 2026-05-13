const { getDb } = require('../../config/firebase');
const { COMPONENT_TYPES } = require('../../shared/constants/component-types');

const COLLECTION = 'components';

async function getAll({ type, brand, minPrice, maxPrice, inStock, limit = 50 } = {}) {
  let query = getDb().collection(COLLECTION);

  if (type) query = query.where('type', '==', type);
  if (brand) query = query.where('brand', '==', brand);
  if (inStock !== undefined) query = query.where('inStock', '==', inStock);

  const snapshot = await query.limit(Number(limit)).get();
  let items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  if (minPrice) items = items.filter(c => c.price >= Number(minPrice));
  if (maxPrice) items = items.filter(c => c.price <= Number(maxPrice));

  return items;
}

async function getById(id) {
  const doc = await getDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function create(data) {
  const ref = getDb().collection(COLLECTION).doc();
  const component = {
    ...data,
    id: ref.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inStock: data.inStock ?? true,
    stock: data.stock ?? 0,
  };
  await ref.set(component);
  return component;
}

async function update(id, data) {
  const ref = getDb().collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;

  const updated = { ...data, updatedAt: new Date().toISOString() };
  await ref.update(updated);
  return { id, ...doc.data(), ...updated };
}

async function remove(id) {
  const ref = getDb().collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.delete();
  return true;
}

async function getByTypeAndBudget(type, maxBudget) {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where('type', '==', type)
    .where('inStock', '==', true)
    .get();

  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(c => c.price <= maxBudget)
    .sort((a, b) => b.performanceScore - a.performanceScore);
}

module.exports = { getAll, getById, create, update, remove, getByTypeAndBudget };
