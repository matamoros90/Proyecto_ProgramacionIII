require('dotenv').config();
const { createApp } = require('./config/app');
const { initFirebase } = require('./config/firebase');

const PORT = process.env.PORT || 3000;

initFirebase();

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 ZonaPc Builder API corriendo en http://localhost:${PORT}`);
  console.log(`📋 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
