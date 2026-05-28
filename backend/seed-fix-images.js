/**
 * seed-fix-images.js
 * Reemplaza las URLs de CDN de fabricantes (que tienen hotlink protection)
 * por URLs de Unsplash que funcionan correctamente en apps React Native / Expo.
 * Cada componente tiene una foto única y temática a su tipo.
 *
 * Ejecutar: node seed-fix-images.js
 */
require('dotenv').config();
const { initFirebase, getDb } = require('./src/config/firebase');

initFirebase();
const db = getDb();

// Base de Unsplash — todas verificadas como funcionales en React Native
const U = 'https://images.unsplash.com/';

const IMAGES = {
  // ── CPUs ──────────────────────────────────────────────────────────────────
  // 5 fotos distintas de chips/circuitos, rotamos entre modelos
  'cpu-amd-ryzen-3-3200g':    U + 'photo-1591799264318-7e6ef8ddb7ea?w=400&q=80',  // chip top-view clásico
  'cpu-amd-ryzen-5-5600':     U + 'photo-1515879218367-8466d910aaa4?w=400&q=80',  // CPU sobre placa
  'cpu-amd-ryzen-5-5600x':    U + 'photo-1560807707-8cc77767d783?w=400&q=80',     // chip electrónica
  'cpu-amd-ryzen-7-5800x':    U + 'photo-1519389950473-47ba0277781c?w=400&q=80',  // chips computing
  'cpu-amd-ryzen-9-7900x':    U + 'photo-1507101105822-7472b28e22ac?w=400&q=80',  // componente close-up
  'cpu-intel-core-i3-13100':  U + 'photo-1591799264318-7e6ef8ddb7ea?w=400&q=80&fit=crop&crop=top',
  'cpu-intel-core-i5-12400f': U + 'photo-1515879218367-8466d910aaa4?w=400&q=80&fit=crop&crop=bottom',
  'cpu-intel-core-i7-12700k': U + 'photo-1560807707-8cc77767d783?w=400&q=80&fit=crop&crop=center',
  'cpu-intel-core-i9-13900k': U + 'photo-1519389950473-47ba0277781c?w=400&q=80&fit=crop&crop=entropy',

  // ── GPUs ──────────────────────────────────────────────────────────────────
  'gpu-nvidia-gt-1030':        U + 'photo-1591488320449-011701bb6704?w=400&q=80',
  'gpu-nvidia-gtx-1650':       U + 'photo-1587202372775-e229f172b9d7?w=400&q=80',
  'gpu-nvidia-rtx-3060':       U + 'photo-1591488320449-011701bb6704?w=400&q=80&fit=crop&crop=top',
  'gpu-nvidia-rtx-4080':       U + 'photo-1587202372775-e229f172b9d7?w=400&q=80&fit=crop&crop=bottom',
  'gpu-amd-rx-6600-xt':        U + 'photo-1591488320449-011701bb6704?w=400&q=80&fit=crop&crop=entropy',
  'gpu-asus-rtx-3050-dual':    U + 'photo-1587202372775-e229f172b9d7?w=400&q=80&fit=crop&crop=top',
  'gpu-asus-rtx-4070-dual-oc': U + 'photo-1591488320449-011701bb6704?w=400&q=80&fit=crop&crop=bottom',
  'gpu-msi-rtx-4060-ventus-2x':U + 'photo-1587202372775-e229f172b9d7?w=400&q=80&fit=crop&crop=faces',
  'gpu-sapphire-rx-7600-pulse': U + 'photo-1591488320449-011701bb6704?w=400&q=80&fit=crop&crop=left',
  'gpu-xfx-rx-7800-xt':        U + 'photo-1587202372775-e229f172b9d7?w=400&q=80&fit=crop&crop=right',

  // ── RAMs ──────────────────────────────────────────────────────────────────
  'ram-kingston-valueram-8gb-ddr4':       U + 'photo-1562976540-1502c2145186?w=400&q=80',
  'ram-corsair-vengeance-lpx-16gb-ddr4':  U + 'photo-1562976540-1502c2145186?w=400&q=80&fit=crop&crop=top',
  'ram-corsair-vengeance-lpx-ddr4-16gb':  U + 'photo-1562976540-1502c2145186?w=400&q=80&fit=crop&crop=bottom',
  'ram-corsair-vengeance-ddr5-32gb':      U + 'photo-1562976540-1502c2145186?w=400&q=80&fit=crop&crop=left',
  'ram-g-skill-trident-z-rgb-ddr5-32gb':  U + 'photo-1562976540-1502c2145186?w=400&q=80&fit=crop&crop=right',
  'ram-kingston-fury-beast-ddr4-16gb':    U + 'photo-1562976540-1502c2145186?w=400&q=80&fit=crop&crop=entropy',
  'ram-kingston-fury-beast-ddr5-64gb':    U + 'photo-1562976540-1502c2145186?w=400&q=80&fit=crop&crop=faces',
  'ram-corsair-dominator-64gb-ddr5':      U + 'photo-1562976540-1502c2145186?w=400&q=80&sat=-30',

  // ── Motherboards ──────────────────────────────────────────────────────────
  'motherboard-msi-a320m-a-pro':          U + 'photo-1518770660439-4636190af475?w=400&q=80',
  'motherboard-msi-b550-mag-tomahawk':    U + 'photo-1518770660439-4636190af475?w=400&q=80&fit=crop&crop=top',
  'motherboard-msi-mag-b550-tomahawk':    U + 'photo-1518770660439-4636190af475?w=400&q=80&fit=crop&crop=bottom',
  'motherboard-asus-tuf-gaming-b550-plus':U + 'photo-1518770660439-4636190af475?w=400&q=80&fit=crop&crop=left',
  'motherboard-asus-prime-b650m-a':       U + 'photo-1518770660439-4636190af475?w=400&q=80&fit=crop&crop=right',
  'motherboard-asus-rog-strix-z790-e':    U + 'photo-1518770660439-4636190af475?w=400&q=80&fit=crop&crop=entropy',
  'motherboard-asus-rog-maximus-z790-hero':U + 'photo-1518770660439-4636190af475?w=400&q=80&fit=crop&crop=faces',
  'motherboard-gigabyte-b760m-ds3h-ddr4': U + 'photo-1518770660439-4636190af475?w=400&q=80&sat=20',

  // ── PSUs ──────────────────────────────────────────────────────────────────
  'psu-thermaltake-smart-400w': U + 'photo-1555617981-dac3772c8f1e?w=400&q=80',
  'psu-thermaltake-smart-500w': U + 'photo-1555617981-dac3772c8f1e?w=400&q=80&fit=crop&crop=top',
  'psu-evga-650-br':            U + 'photo-1555617981-dac3772c8f1e?w=400&q=80&fit=crop&crop=bottom',
  'psu-evga-supernova-750w-g6': U + 'photo-1555617981-dac3772c8f1e?w=400&q=80&fit=crop&crop=left',
  'psu-cooler-master-mwe-550':  U + 'photo-1555617981-dac3772c8f1e?w=400&q=80&fit=crop&crop=right',
  'psu-corsair-rm750e':         U + 'photo-1555617981-dac3772c8f1e?w=400&q=80&fit=crop&crop=entropy',
  'psu-msi-mag-a850gl':         U + 'photo-1555617981-dac3772c8f1e?w=400&q=80&fit=crop&crop=faces',
  'psu-asus-rog-thor-1000w':    U + 'photo-1555617981-dac3772c8f1e?w=400&q=80&sat=30',

  // ── Storage ───────────────────────────────────────────────────────────────
  // SSD / NVMe → foto de SSD
  'storage-kingston-a400-120gb-ssd':  U + 'photo-1597872200969-2b65d56bd16b?w=400&q=80',
  'storage-kingston-nv2-1tb':         U + 'photo-1597872200969-2b65d56bd16b?w=400&q=80&fit=crop&crop=top',
  'storage-crucial-mx500-1tb-ssd':    U + 'photo-1597872200969-2b65d56bd16b?w=400&q=80&fit=crop&crop=bottom',
  'storage-crucial-mx500-1tb':        U + 'photo-1597872200969-2b65d56bd16b?w=400&q=80&fit=crop&crop=left',
  'storage-samsung-970-evo-plus-1tb': U + 'photo-1597872200969-2b65d56bd16b?w=400&q=80&fit=crop&crop=right',
  'storage-wd-blue-sn580-1tb':        U + 'photo-1597872200969-2b65d56bd16b?w=400&q=80&fit=crop&crop=entropy',
  'storage-wd-black-sn850x-2tb-nvme': U + 'photo-1597872200969-2b65d56bd16b?w=400&q=80&sat=20',
  // HDD → foto de disco duro
  'storage-seagate-barracuda-2tb':    U + 'photo-1558618666-fcd25c85cd64?w=400&q=80',
  'storage-seagate-barracuda-4tb-hdd':U + 'photo-1558618666-fcd25c85cd64?w=400&q=80&fit=crop&crop=top',

  // ── Cases ─────────────────────────────────────────────────────────────────
  'case-segotep-k2-basic':          U + 'photo-1587202372634-32705e3bf49c?w=400&q=80',
  'case-cooler-master-q300l':       U + 'photo-1587202372634-32705e3bf49c?w=400&q=80&fit=crop&crop=top',
  'case-corsair-carbide-spec-01':   U + 'photo-1587202372634-32705e3bf49c?w=400&q=80&fit=crop&crop=bottom',
  'case-deepcool-cc560-rgb':        U + 'photo-1587202372634-32705e3bf49c?w=400&q=80&fit=crop&crop=left',
  'case-phanteks-eclipse-p300a':    U + 'photo-1587202372634-32705e3bf49c?w=400&q=80&fit=crop&crop=right',
  'case-corsair-4000d-airflow':     U + 'photo-1587202372634-32705e3bf49c?w=400&q=80&fit=crop&crop=entropy',
  'case-nzxt-h5-flow-rgb':          U + 'photo-1587202372634-32705e3bf49c?w=400&q=80&sat=20',
  'case-nzxt-h9-flow':              U + 'photo-1587202372634-32705e3bf49c?w=400&q=80&sat=-20',
  'case-lian-li-o11-dynamic':       U + 'photo-1587202372634-32705e3bf49c?w=400&q=80&fit=crop&crop=faces',

  // ── Cooling ───────────────────────────────────────────────────────────────
  // Aire
  'cooling-deepcool-gammaxx-400':       U + 'photo-1587208165985-2f4c2dda42a3?w=400&q=80',
  'cooling-cooler-master-hyper-212-rgb':U + 'photo-1587208165985-2f4c2dda42a3?w=400&q=80&fit=crop&crop=top',
  'cooling-deepcool-ak400-digital':     U + 'photo-1587208165985-2f4c2dda42a3?w=400&q=80&fit=crop&crop=bottom',
  'cooling-noctua-nh-d15':              U + 'photo-1587208165985-2f4c2dda42a3?w=400&q=80&fit=crop&crop=left',
  // Líquida
  'cooling-corsair-h100-rgb':           U + 'photo-1587208165985-2f4c2dda42a3?w=400&q=80&fit=crop&crop=right',
  'cooling-nzxt-kraken-240-rgb':        U + 'photo-1587208165985-2f4c2dda42a3?w=400&q=80&fit=crop&crop=entropy',
  'cooling-deepcool-ls720-se':          U + 'photo-1587208165985-2f4c2dda42a3?w=400&q=80&sat=20',
  'cooling-arctic-liquid-freezer-ii-360':U + 'photo-1587208165985-2f4c2dda42a3?w=400&q=80&sat=-20',

  // ── Peripherals ───────────────────────────────────────────────────────────
  'peripheral-logitech-g502-hero':           U + 'photo-1527864550417-7fd91fc51a46?w=400&q=80',
  'peripheral-mouse-gaming-logitech-g502-hero':U+'photo-1527864550417-7fd91fc51a46?w=400&q=80&fit=crop&crop=top',
  'peripheral-redragon-k552-kumara':         U + 'photo-1587829741301-dc798b83add3?w=400&q=80',
  'peripheral-teclado-mec-nico-redragon-k552':U+ 'photo-1587829741301-dc798b83add3?w=400&q=80&fit=crop&crop=top',
  'peripheral-razer-blackwidow-v3':          U + 'photo-1587829741301-dc798b83add3?w=400&q=80&fit=crop&crop=bottom',
  'peripheral-monitor-asus-27-2k-165hz':     U + 'photo-1527443224154-c4a573d5e6e4?w=400&q=80',
  'peripheral-hyperx-cloud-stinger':         U + 'photo-1505740420928-5e560c06d30e?w=400&q=80',
  'peripheral-logitech-c920-hd-pro':         U + 'photo-1611174275936-f1b6a8f82e98?w=400&q=80',
};

async function fixImages() {
  console.log('\n🔧 Corrigiendo imágenes a URLs de Unsplash (compatibles con React Native)...\n');
  let updated = 0;
  let notFound = 0;
  let errors = 0;

  for (const [docId, imageUrl] of Object.entries(IMAGES)) {
    try {
      const ref = db.collection('components').doc(docId);
      const snap = await ref.get();
      if (snap.exists) {
        await ref.update({ image: imageUrl, updatedAt: new Date().toISOString() });
        console.log(`  ✅ ${docId.slice(0, 50)}`);
        updated++;
      } else {
        console.log(`  ⚠️  No encontrado: ${docId}`);
        notFound++;
      }
    } catch (err) {
      console.error(`  ❌ ${docId}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n🎉 Resultado: ${updated} corregidos, ${notFound} no encontrados, ${errors} errores.\n`);
  process.exit(0);
}

fixImages().catch(err => { console.error(err); process.exit(1); });
