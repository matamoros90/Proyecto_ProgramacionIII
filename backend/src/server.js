require('dotenv').config();
const { createApp } = require('./config/app');
const { initFirebase } = require('./config/firebase');

const PORT = process.env.PORT || 3000;

initFirebase();

const app = createApp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ZonaPc Builder API corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📋 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
