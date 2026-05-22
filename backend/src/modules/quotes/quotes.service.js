const { getDb } = require('../../config/firebase');
const { sendToUser, saveNotification } = require('../notifications/notifications.service');

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
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  await ref.set(quote);
  return quote;
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
  const snapshot = await getDb().collection(COLLECTION).get();
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Admin asigna vendedor → notifica al cliente
async function assignVendor(quoteId, vendorId) {
  const ref = getDb().collection(COLLECTION).doc(quoteId);
  const doc = await ref.get();
  if (!doc.exists) return null;
  const quote = doc.data();

  await ref.update({ vendorId, status: 'in_review', assignedAt: new Date().toISOString() });

  await sendToUser(quote.userId, {
    title: '📋 Cotización en revisión',
    body: 'Recibimos tu cotización. Pronto tendrás una respuesta de nuestro equipo.',
    data: { quoteId, type: 'quote_in_review' },
  });
  await saveNotification(quote.userId, {
    title: '📋 Cotización en revisión',
    body: 'Recibimos tu cotización. Pronto tendrás una respuesta.',
    type: 'quote_update',
    orderId: quoteId,
  });
  return { id: quoteId, ...quote, vendorId, status: 'in_review' };
}

// Vendedor envía seguimiento → notifica al cliente
async function sendFollowup(quoteId, vendorId) {
  const doc = await getDb().collection(COLLECTION).doc(quoteId).get();
  if (!doc.exists) return null;
  const quote = doc.data();
  if (quote.vendorId !== vendorId) return null;

  await sendToUser(quote.userId, {
    title: '🔔 Seguimiento de tu cotización',
    body: 'Tu cotización está siendo revisada. Te avisaremos cuando esté lista.',
    data: { quoteId, type: 'quote_followup' },
  });
  await saveNotification(quote.userId, {
    title: '🔔 Seguimiento de tu cotización',
    body: 'Tu cotización está siendo revisada.',
    type: 'quote_update',
    orderId: quoteId,
  });
  return { success: true };
}

// Vendedor marca cotización como lista → notifica al cliente
async function markReady(quoteId, vendorId) {
  const ref = getDb().collection(COLLECTION).doc(quoteId);
  const doc = await ref.get();
  if (!doc.exists) return null;
  const quote = doc.data();
  if (quote.vendorId !== vendorId) return null;

  await ref.update({ status: 'ready', readyAt: new Date().toISOString() });

  await sendToUser(quote.userId, {
    title: '✅ ¡Tu cotización está lista!',
    body: 'Hemos revisado tu cotización. Entra a la app para verla y aceptarla.',
    data: { quoteId, type: 'quote_ready' },
  });
  await saveNotification(quote.userId, {
    title: '✅ ¡Tu cotización está lista!',
    body: 'Entra a la app para ver tu cotización y aceptarla.',
    type: 'quote_ready',
    orderId: quoteId,
  });
  return { id: quoteId, ...quote, status: 'ready' };
}

// Cliente acepta cotización + registra dirección de entrega
async function acceptQuote(quoteId, userId, { deliveryAddress, deliveryDepartment }) {
  const ref = getDb().collection(COLLECTION).doc(quoteId);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== userId) return null;
  if (doc.data().status !== 'ready') return null;

  await ref.update({
    status: 'accepted',
    deliveryAddress,
    deliveryDepartment,
    acceptedAt: new Date().toISOString(),
  });
  return { id: quoteId, ...doc.data(), status: 'accepted', deliveryAddress, deliveryDepartment };
}

// Cliente envía pago → notifica al vendedor
async function submitPayment(quoteId, userId, { method, cardLast4, bankRef }) {
  const ref = getDb().collection(COLLECTION).doc(quoteId);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== userId) return null;
  if (doc.data().status !== 'accepted') return null;
  const quote = doc.data();

  await ref.update({
    status: 'payment_submitted',
    paymentMethod: method,
    paymentData: method === 'card' ? { last4: cardLast4 } : { bankRef },
    paymentSubmittedAt: new Date().toISOString(),
  });

  if (quote.vendorId) {
    await sendToUser(quote.vendorId, {
      title: '💳 Pago recibido',
      body: `Cliente realizó el pago de cotización #${quoteId.slice(-6).toUpperCase()}. Verifica el comprobante.`,
      data: { quoteId, type: 'payment_submitted' },
    });
  }
  return { id: quoteId, ...quote, status: 'payment_submitted' };
}

// Vendedor verifica pago → notifica al cliente → crea orden en ensamblaje
async function verifyPayment(quoteId, vendorId) {
  const ref = getDb().collection(COLLECTION).doc(quoteId);
  const doc = await ref.get();
  if (!doc.exists) return null;
  const quote = doc.data();
  if (quote.vendorId !== vendorId) return null;

  await ref.update({ status: 'payment_verified', paymentVerifiedAt: new Date().toISOString() });

  await sendToUser(quote.userId, {
    title: '🎉 ¡Pago verificado!',
    body: 'Tu pago fue aprobado. Tu PC ha comenzado el proceso de ensamblaje.',
    data: { quoteId, type: 'payment_verified' },
  });
  await saveNotification(quote.userId, {
    title: '🎉 ¡Pago verificado!',
    body: 'Tu PC ha comenzado el proceso de ensamblaje.',
    type: 'payment_verified',
    orderId: quoteId,
  });

  const ordersService = require('../orders/orders.service');
  const order = await ordersService.createFromQuote(quote.userId, quoteId, quote, 'assembling');
  return { id: quoteId, ...quote, status: 'payment_verified', orderId: order.id };
}

// Vendedor obtiene sus cotizaciones asignadas
async function getByVendor(vendorId) {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where('vendorId', '==', vendorId)
    .get();
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = {
  create, getByUser, getById, confirm, getAll,
  assignVendor, sendFollowup, markReady,
  acceptQuote, submitPayment, verifyPayment, getByVendor,
};
