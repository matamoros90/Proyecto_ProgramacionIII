require('dotenv').config();
const { initFirebase, getAuth, getDb } = require('./src/config/firebase');

initFirebase();

const VENDOR_EMAIL    = 'vendedor@zonapc.gt';
const VENDOR_PASSWORD = 'Vendedor2026';
const VENDOR_NAME     = 'Vendedor ZonaPc';

async function seedVendor() {
  const auth = getAuth();
  const db   = getDb();

  let uid;

  try {
    const user = await auth.createUser({
      email:         VENDOR_EMAIL,
      password:      VENDOR_PASSWORD,
      displayName:   VENDOR_NAME,
      emailVerified: true,
    });
    uid = user.uid;
    console.log(`✅ Usuario vendedor creado: ${uid}`);
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      const existing = await auth.getUserByEmail(VENDOR_EMAIL);
      uid = existing.uid;
      console.log(`ℹ️  Vendedor ya existe, usando UID: ${uid}`);
    } else {
      throw err;
    }
  }

  await auth.setCustomUserClaims(uid, { vendor: true });
  console.log('✅ Custom claim { vendor: true } asignado');

  await db.collection('users').doc(uid).set({
    uid,
    email:       VENDOR_EMAIL,
    displayName: VENDOR_NAME,
    role:        'vendor',
    fcmTokens:   [],
    createdAt:   new Date().toISOString(),
  }, { merge: true });
  console.log('✅ Perfil vendedor guardado en Firestore');

  console.log('\n──────────────────────────────────────');
  console.log('  CREDENCIALES DEL VENDEDOR');
  console.log('──────────────────────────────────────');
  console.log(`  Email:      ${VENDOR_EMAIL}`);
  console.log(`  Contraseña: ${VENDOR_PASSWORD}`);
  console.log('──────────────────────────────────────\n');

  process.exit(0);
}

seedVendor().catch(err => { console.error('❌', err.message); process.exit(1); });
