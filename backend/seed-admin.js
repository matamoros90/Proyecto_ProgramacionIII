require('dotenv').config();
const { initFirebase, getAuth, getDb } = require('./src/config/firebase');

initFirebase();

const ADMIN_EMAIL    = 'admin@zonapc.gt';
const ADMIN_PASSWORD = 'ZonaPc2026!';
const ADMIN_NAME     = 'Administrador ZonaPc';

async function seedAdmin() {
  const auth = getAuth();
  const db   = getDb();

  let uid;

  // Crear usuario en Firebase Auth (o reusar si ya existe)
  try {
    const user = await auth.createUser({
      email:         ADMIN_EMAIL,
      password:      ADMIN_PASSWORD,
      displayName:   ADMIN_NAME,
      emailVerified: true,
    });
    uid = user.uid;
    console.log(`✅ Usuario creado en Firebase Auth: ${uid}`);
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      const existing = await auth.getUserByEmail(ADMIN_EMAIL);
      uid = existing.uid;
      console.log(`ℹ️  Usuario ya existe, usando UID: ${uid}`);
    } else {
      throw err;
    }
  }

  // Asignar custom claim admin
  await auth.setCustomUserClaims(uid, { admin: true });
  console.log('✅ Custom claim { admin: true } asignado');

  // Crear/actualizar perfil en Firestore
  await db.collection('users').doc(uid).set({
    uid,
    email:       ADMIN_EMAIL,
    displayName: ADMIN_NAME,
    role:        'admin',
    fcmTokens:   [],
    createdAt:   new Date().toISOString(),
  }, { merge: true });
  console.log('✅ Perfil admin guardado en Firestore');

  console.log('\n──────────────────────────────────────');
  console.log('  CREDENCIALES DEL ADMINISTRADOR');
  console.log('──────────────────────────────────────');
  console.log(`  Email:      ${ADMIN_EMAIL}`);
  console.log(`  Contraseña: ${ADMIN_PASSWORD}`);
  console.log('──────────────────────────────────────\n');

  process.exit(0);
}

seedAdmin().catch(err => { console.error('❌', err.message); process.exit(1); });
