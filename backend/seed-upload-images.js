/**
 * seed-upload-images.js
 * Sube las imágenes de la carpeta local a Firebase Storage
 * y actualiza el campo `image` en cada documento de Firestore.
 *
 * Ejecutar: node seed-upload-images.js
 */
require('dotenv').config();
const { initFirebase, getDb } = require('./src/config/firebase');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

initFirebase();
const db   = getDb();
const bucket = admin.storage().bucket('zonapc-builder.firebasestorage.app');

const BASE = '/Users/Otto/Desktop/IMAGENES ZONA PC';

// Mapa exacto: ruta relativa dentro de la carpeta → ID de Firestore
const FILE_MAP = [
  // ── CPUs ──────────────────────────────────────────────────────────────────
  ['CPUs (9)/1.AMD Ryzen 3 3200G.jpg',            'cpu-amd-ryzen-3-3200g'],
  ['CPUs (9)/2. AMD Ryzen 5 5600.jpg',             'cpu-amd-ryzen-5-5600'],
  ['CPUs (9)/3. AMD Ryzen 5 5600X.jpg',            'cpu-amd-ryzen-5-5600x'],
  ['CPUs (9)/4. AMD Ryzen 7 5800X.jpg',            'cpu-amd-ryzen-7-5800x'],
  ['CPUs (9)/5. AMD Ryzen 9 7900X.jpg',            'cpu-amd-ryzen-9-7900x'],
  ['CPUs (9)/6. Intel Core i3-13100.jpg',          'cpu-intel-core-i3-13100'],
  ['CPUs (9)/7. Intel Core i5-12400F.jpg',         'cpu-intel-core-i5-12400f'],
  ['CPUs (9)/8. Intel Core i7-12700K.jpg',         'cpu-intel-core-i7-12700k'],
  ['CPUs (9)/9. Intel Core i9-13900K.jpg',         'cpu-intel-core-i9-13900k'],

  // ── GPUs ──────────────────────────────────────────────────────────────────
  ['GPUs (10)/1. NVIDIA GT 1030.jpg',              'gpu-nvidia-gt-1030'],
  ['GPUs (10)/2.NVIDIA GTX 1650.jpg',              'gpu-nvidia-gtx-1650'],
  ['GPUs (10)/3. NVIDIA RTX 3060.jpg',             'gpu-nvidia-rtx-3060'],
  ['GPUs (10)/4. NVIDIA RTX 4080.jpg',             'gpu-nvidia-rtx-4080'],
  ['GPUs (10)/5. AMD RX 6600 XT.jpg',              'gpu-amd-rx-6600-xt'],
  ['GPUs (10)/6. ASUS RTX 3050 Dual.jpg',          'gpu-asus-rtx-3050-dual'],
  ['GPUs (10)/7. ASUS RTX 4070 Dual OC.jpg',       'gpu-asus-rtx-4070-dual-oc'],
  ['GPUs (10)/8. MSI RTX 4060 Ventus 2X.jpg',      'gpu-msi-rtx-4060-ventus-2x'],
  ['GPUs (10)/9. Sapphire RX 7600 Pulse.jpg',      'gpu-sapphire-rx-7600-pulse'],
  ['GPUs (10)/10. XFX RX 7800 XT.jpg',             'gpu-xfx-rx-7800-xt'],

  // ── RAMs ──────────────────────────────────────────────────────────────────
  ['RAMs (7)/1. Kingston ValueRAM 8GB DDR4.jpg',   'ram-kingston-valueram-8gb-ddr4'],
  ['RAMs (7)/2. Corsair Vengeance LPX DDR4 16GB.jpg','ram-corsair-vengeance-lpx-ddr4-16gb'],
  ['RAMs (7)/3. Corsair Vengeance DDR5 32GB.jpg',  'ram-corsair-vengeance-ddr5-32gb'],
  ['RAMs (7)/4. Corsair Dominator 64GB DDR5.jpg',  'ram-corsair-dominator-64gb-ddr5'],
  ['RAMs (7)/5. G.Skill Trident Z RGB DDR5 32GB.png','ram-g-skill-trident-z-rgb-ddr5-32gb'],
  ['RAMs (7)/6. Kingston Fury Beast DDR4 16GB.jpg','ram-kingston-fury-beast-ddr4-16gb'],
  ['RAMs (7)/7. Kingston Fury Beast DDR5 64GB.jpg','ram-kingston-fury-beast-ddr5-64gb'],

  // ── Motherboards ──────────────────────────────────────────────────────────
  ['Motherboards (8)/1. MSI A320M-A Pro.jpg',               'motherboard-msi-a320m-a-pro'],
  ['Motherboards (8)/2. MSI B550 MAG Tomahawk.jpg',         'motherboard-msi-b550-mag-tomahawk'],
  ['Motherboards (8)/3. MSI MAG B550 Tomahawk.jpg',         'motherboard-msi-mag-b550-tomahawk'],
  ['Motherboards (8)/4. ASUS TUF Gaming B550-PLUS.png',     'motherboard-asus-tuf-gaming-b550-plus'],
  ['Motherboards (8)/5. ASUS PRIME B650M-A.jpg',            'motherboard-asus-prime-b650m-a'],
  ['Motherboards (8)/6. ASUS ROG Strix Z790-E.jpg',         'motherboard-asus-rog-strix-z790-e'],
  ['Motherboards (8)/7. ASUS ROG Maximus Z790 Hero.jpg',    'motherboard-asus-rog-maximus-z790-hero'],
  ['Motherboards (8)/8. Gigabyte B760M DS3H DDR4.jpg',      'motherboard-gigabyte-b760m-ds3h-ddr4'],

  // ── PSUs ──────────────────────────────────────────────────────────────────
  ['PSUs (8)/1. Thermaltake Smart 400W.jpg',       'psu-thermaltake-smart-400w'],
  ['PSUs (8)/2. Thermaltake Smart 500W.jpg',       'psu-thermaltake-smart-500w'],
  ['PSUs (8)/3 . EVGA 650 BR.jpg',                 'psu-evga-650-br'],
  ['PSUs (8)/4. EVGA SuperNOVA 750W G6.jpg',       'psu-evga-supernova-750w-g6'],
  ['PSUs (8)/5. Cooler Master MWE 550.jpg',        'psu-cooler-master-mwe-550'],
  ['PSUs (8)/6. Corsair RM750e.jpg',               'psu-corsair-rm750e'],
  ['PSUs (8)/7.  MSI MAG A850GL.jpg',              'psu-msi-mag-a850gl'],
  ['PSUs (8)/8. ASUS ROG Thor 1000W.jpg',          'psu-asus-rog-thor-1000w'],

  // ── Storage ───────────────────────────────────────────────────────────────
  ['Storage (9)/1. Kingston A400 120GB SSD.jpg',   'storage-kingston-a400-120gb-ssd'],
  ['Storage (9)/2. Kingston NV2 1TB.jpg',          'storage-kingston-nv2-1tb'],
  ['Storage (9)/3. Crucial MX500 1TB SSD.jpg',     'storage-crucial-mx500-1tb-ssd'],
  ['Storage (9)/4. Crucial MX500 1TB.jpg',         'storage-crucial-mx500-1tb'],
  ['Storage (9)/5. Samsung 970 EVO Plus 1TB.jpg',  'storage-samsung-970-evo-plus-1tb'],
  ['Storage (9)/6. WD Blue SN580 1TB.jpg',         'storage-wd-blue-sn580-1tb'],
  ['Storage (9)/7. WD Black SN850X 2TB NVMe.jpg',  'storage-wd-black-sn850x-2tb-nvme'],
  ['Storage (9)/8. Seagate Barracuda 2TB.jpg',     'storage-seagate-barracuda-2tb'],
  ['Storage (9)/9. Seagate Barracuda 4TB HDD.jpg', 'storage-seagate-barracuda-4tb-hdd'],

  // ── Cases ─────────────────────────────────────────────────────────────────
  ['Cases (9)/1.Segotep K2 Basic.png',             'case-segotep-k2-basic'],
  ['Cases (9)/2. Cooler Master Q300L.jpg',         'case-cooler-master-q300l'],
  ['Cases (9)/3. Corsair Carbide SPEC-01.jpg',     'case-corsair-carbide-spec-01'],
  ['Cases (9)/4. DeepCool CC560 RGB.jpg',          'case-deepcool-cc560-rgb'],
  ['Cases (9)/5. Phanteks Eclipse P300A.jpg',      'case-phanteks-eclipse-p300a'],
  ['Cases (9)/6. Corsair 4000D Airflow.jpg',       'case-corsair-4000d-airflow'],
  ['Cases (9)/7. NZXT H5 Flow RGB.jpg',            'case-nzxt-h5-flow-rgb'],
  ['Cases (9)/8. NZXT H9 Flow.jpg',               'case-nzxt-h9-flow'],
  ['Cases (9)/9. Lian Li O11 Dynamic.jpg',         'case-lian-li-o11-dynamic'],

  // ── Cooling ───────────────────────────────────────────────────────────────
  ['Cooling (8)/1. Deepcool GAMMAXX 400.jpg',           'cooling-deepcool-gammaxx-400'],
  ['Cooling (8)/2. Cooler Master Hyper 212 RGB.jpg',    'cooling-cooler-master-hyper-212-rgb'],
  ['Cooling (8)/3. DeepCool AK400 Digital.jpg',         'cooling-deepcool-ak400-digital'],
  ['Cooling (8)/4. Noctua NH-D15.jpg',                  'cooling-noctua-nh-d15'],
  ['Cooling (8)/5. Corsair H100 RGB.png',               'cooling-corsair-h100-rgb'],
  ['Cooling (8)/6. NZXT Kraken 240 RGB.jpg',            'cooling-nzxt-kraken-240-rgb'],
  ['Cooling (8)/7. DeepCool LS720 SE.jpg',              'cooling-deepcool-ls720-se'],
  ['Cooling (8)/8. ARCTIC Liquid Freezer II 360.jpg',   'cooling-arctic-liquid-freezer-ii-360'],

  // ── Periféricos ───────────────────────────────────────────────────────────
  ['PERIFÉRICOS/1. Logitech G502 Hero.jpg',                  'peripheral-logitech-g502-hero'],
  ['PERIFÉRICOS/2.Mouse Gaming Logitech G502 Hero.jpg',      'peripheral-mouse-gaming-logitech-g502-hero'],
  ['PERIFÉRICOS/3. Redragon K552 Kumara.jpg',                'peripheral-redragon-k552-kumara'],
  ['PERIFÉRICOS/4. Teclado Mecánico Redragon K552.jpg',      'peripheral-teclado-mec-nico-redragon-k552'],
  ['PERIFÉRICOS/5. Razer BlackWidow V3.jpg',                 'peripheral-razer-blackwidow-v3'],
  ['PERIFÉRICOS/6. Monitor ASUS 27 2K 165Hz.jpg',            'peripheral-monitor-asus-27-2k-165hz'],
  ['PERIFÉRICOS/7. HyperX Cloud Stinger.jpg',                'peripheral-hyperx-cloud-stinger'],
  ['PERIFÉRICOS/8. Logitech C920 HD Pro.jpg',                'peripheral-logitech-c920-hd-pro'],
];

async function uploadAll() {
  console.log(`\n🚀 Subiendo ${FILE_MAP.length} imágenes a Firebase Storage...\n`);
  let ok = 0, errors = 0;

  for (const [relPath, docId] of FILE_MAP) {
    const localPath = path.join(BASE, relPath);
    const ext       = path.extname(relPath).toLowerCase(); // .jpg o .png
    const storagePath = `components/${docId}${ext}`;
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

    try {
      // 1. Subir archivo
      await bucket.upload(localPath, {
        destination: storagePath,
        metadata: { contentType },
      });

      // 2. Hacer pública la imagen
      const file = bucket.file(storagePath);
      await file.makePublic();

      // 3. URL pública directa (no expira)
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

      // 4. Actualizar Firestore
      await db.collection('components').doc(docId).update({
        image: publicUrl,
        updatedAt: new Date().toISOString(),
      });

      console.log(`  ✅ ${docId}`);
      ok++;
    } catch (err) {
      console.error(`  ❌ ${docId}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n🎉 Resultado: ${ok} subidas, ${errors} errores.\n`);
  process.exit(0);
}

uploadAll().catch(err => { console.error(err); process.exit(1); });
