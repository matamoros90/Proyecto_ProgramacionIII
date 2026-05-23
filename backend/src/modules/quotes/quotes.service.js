const { getDb } = require('../../config/firebase');
const { sendToUser, saveNotification, sendToAllVendors } = require('../notifications/notifications.service');

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
  const quote = { id, ...doc.data(), status: 'confirmed' };
  // Notificar a todos los vendedores (sin bloquear la respuesta)
  sendToAllVendors({
    title: '🖥️ Nueva cotización disponible',
    body: `Cotización #${id.slice(-6).toUpperCase()} lista — Q${Number(doc.data().totalPrice || 0).toLocaleString()}`,
    data: { quoteId: id, type: 'new_quote_available' },
  }).catch(err => console.error('[FCM] Error notificando vendedores:', err.message));
  return quote;
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

// Primer vendedor en reclamar una cotización la toma (transacción atómica)
async function claimQuote(quoteId, vendorId) {
  const ref = getDb().collection(COLLECTION).doc(quoteId);
  let claimedQuote;

  await getDb().runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) throw new Error('Cotización no encontrada');
    const data = doc.data();
    if (data.status !== 'confirmed') throw new Error('La cotización ya no está disponible');
    if (data.vendorId) throw new Error('Esta cotización ya fue tomada por otro vendedor');
    tx.update(ref, { vendorId, status: 'in_review', claimedAt: new Date().toISOString() });
    claimedQuote = { id: quoteId, ...data, vendorId, status: 'in_review' };
  });

  // Notificar al cliente (fuera de la transacción)
  sendToUser(claimedQuote.userId, {
    title: '📋 Cotización en revisión',
    body: 'Recibimos tu cotización. Pronto tendrás una respuesta de nuestro equipo.',
    data: { quoteId, type: 'quote_in_review' },
  }).catch(() => {});
  saveNotification(claimedQuote.userId, {
    title: '📋 Cotización en revisión',
    body: 'Recibimos tu cotización. Pronto tendrás una respuesta.',
    type: 'quote_update',
    orderId: quoteId,
  }).catch(() => {});

  return claimedQuote;
}

// Vendedor obtiene sus cotizaciones (excluye archivadas) + disponibles
async function getByVendor(vendorId) {
  const [assignedSnap, availableSnap] = await Promise.all([
    getDb().collection(COLLECTION).where('vendorId', '==', vendorId).get(),
    getDb().collection(COLLECTION).where('status', '==', 'confirmed').get(),
  ]);

  const assigned = assignedSnap.docs
    .filter(d => !d.data().archived)
    .map(d => ({ id: d.id, ...d.data(), _isAvailable: false }));
  const assignedIds = new Set(assignedSnap.docs.map(d => d.id));

  const available = availableSnap.docs
    .filter(d => !d.data().vendorId && !assignedIds.has(d.id))
    .map(d => ({ id: d.id, ...d.data(), _isAvailable: true }));

  return [...assigned, ...available].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Vendedor archiva cotización completada (payment_verified → oculta de su vista, datos se conservan)
async function archiveQuote(quoteId, vendorId) {
  const ref = getDb().collection(COLLECTION).doc(quoteId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Cotización no encontrada');
  const quote = doc.data();
  if (quote.vendorId !== vendorId) throw new Error('Sin permisos sobre esta cotización');
  if (quote.status !== 'payment_verified') throw new Error('Solo se pueden archivar cotizaciones completadas');
  await ref.update({ archived: true, archivedAt: new Date().toISOString() });
  return { success: true };
}

// Vendedor elimina cotización sin procesar (libera espacio en BD, desaparece del cliente también)
async function deleteQuote(quoteId, vendorId) {
  const ref = getDb().collection(COLLECTION).doc(quoteId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Cotización no encontrada');
  const quote = doc.data();
  if (quote.vendorId !== vendorId) throw new Error('Sin permisos sobre esta cotización');
  if (quote.status === 'payment_verified') throw new Error('No se puede eliminar una cotización completada. Usa "Archivar".');
  if (quote.status === 'payment_submitted') throw new Error('El cliente ya envió pago. Verifica o rechaza el pago antes de eliminar.');
  await ref.delete();
  return { success: true };
}

module.exports = {
  create, getByUser, getById, confirm, getAll,
  assignVendor, sendFollowup, markReady,
  acceptQuote, submitPayment, verifyPayment, getByVendor, claimQuote,
  archiveQuote, deleteQuote,
};
