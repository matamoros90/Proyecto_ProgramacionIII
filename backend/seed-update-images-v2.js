/**
 * seed-update-images-v2.js
 * Actualiza imágenes de los componentes que NO fueron cubiertos por seed-update-images.js.
 * Corre DESPUÉS de seed-update-images.js.
 * Ejecutar: node seed-update-images-v2.js
 */
require('dotenv').config();
const { initFirebase, getDb } = require('./src/config/firebase');

initFirebase();
const db = getDb();

/** Mapa completo: docId → URL de imagen real del fabricante / distribuidor */
const EXTRA_IMAGES = {

  // ── CPUs ──────────────────────────────────────────────────────────────────
  'cpu-amd-ryzen-5-5600':
    'https://cdn.mos.cms.futurecdn.net/9kRqaWAFnGQhFxqc7PNiJN-1200-80.jpg',
  'cpu-amd-ryzen-7-5800x':
    'https://cdn.mos.cms.futurecdn.net/VdXfFvB2p6xXCN2WyMLEkU-1200-80.jpg',
  'cpu-amd-ryzen-9-7900x':
    'https://cdn.mos.cms.futurecdn.net/VfP8a2X9xtGDG5w9bJT5Qk-1200-80.jpg',
  'cpu-intel-core-i5-12400f':
    'https://www.bhphotovideo.com/cdn-cgi/image/format=auto,fit=scale-down,width=500,quality=95/https://www.bhphotovideo.com/images/images500x500/intel_bx8071512400f_core_i5_12400f_2_50ghz_6_core_1635772022_1682869.jpg',
  'cpu-intel-core-i7-12700k':
    'https://www.bhphotovideo.com/cdn-cgi/image/format=auto,fit=scale-down,width=500,quality=95/https://www.bhphotovideo.com/images/images500x500/intel_bx8071512700k_core_i7_12700k_3_60ghz_12_core_1635772020_1682861.jpg',

  // ── GPUs ──────────────────────────────────────────────────────────────────
  'gpu-asus-rtx-3050-dual':
    'https://dlcdnwebimgs.asus.com/gain/4BCA43F0-FAF0-4C8F-BAF7-D70B35E8A6E3/w800/h600',
  'gpu-asus-rtx-4070-dual-oc':
    'https://dlcdnwebimgs.asus.com/gain/4F7A09B6-5E77-4AD6-AF22-03E5FDCDCB67/w800/h600',
  'gpu-msi-rtx-4060-ventus-2x':
    'https://asset.msi.com/resize/image/global/product/product_4_20230411175443_6433f303eabb3.png62405b38c58fe0f07fcef2367d8a9ba1/1024.png',
  'gpu-sapphire-rx-7600-pulse':
    'https://www.sapphiretech.com/productimi/productimage/11324-01-20G_01_s.png',
  'gpu-xfx-rx-7800-xt':
    'https://www.xfxforce.com/cdn/shop/products/AMD-RADEON-RX-7800-XT-3QTR-TOP-1500x1000.png',

  // ── RAMs ──────────────────────────────────────────────────────────────────
  'ram-corsair-vengeance-ddr5-32gb':
    'https://www.corsair.com/medias/sys_master/images/images/hb3/h0e/9168395526174/CMK32GX5M2B5600C36-Gallery-Vengeance-DDR5-Black-32GB-1.png',
  'ram-corsair-vengeance-lpx-ddr4-16gb':
    'https://www.corsair.com/medias/sys_master/images/images/hec/h04/9003668660254/CMK16GX4M2B3200C16-Gallery-Vengeance-LPX-Black-16GB-1.png',
  'ram-g-skill-trident-z-rgb-ddr5-32gb':
    'https://www.gskill.com/img/product/F5-6000J3636F16GX2-TZ5RS-r1.jpg',
  'ram-kingston-fury-beast-ddr4-16gb':
    'https://media.kingston.com/kingston/product/ktc-product-flash-kf432c16bb-16-1-lg.jpg',
  'ram-kingston-fury-beast-ddr5-64gb':
    'https://media.kingston.com/kingston/product/ktc-product-flash-kf548c38bba-64-1-lg.jpg',

  // ── Motherboards ──────────────────────────────────────────────────────────
  'motherboard-asus-prime-b650m-a':
    'https://dlcdnwebimgs.asus.com/gain/6A36E4BB-1D65-490F-9DF3-A56B62F0960F/w800/h600',
  'motherboard-asus-rog-strix-z790-e':
    'https://dlcdnwebimgs.asus.com/gain/34A23B45-0B47-4CE9-A978-5B7C6E01B2A0/w800/h600',
  'motherboard-asus-tuf-gaming-b550-plus':
    'https://dlcdnwebimgs.asus.com/gain/7AB59F62-B9E5-458D-AC1E-B9F40BA2A5AB/w800/h600',
  'motherboard-gigabyte-b760m-ds3h-ddr4':
    'https://www.gigabyte.com/FileUpload/Global/KeyFeature/2920/images/b760m-ds3h.png',
  'motherboard-msi-mag-b550-tomahawk':
    'https://asset.msi.com/resize/image/global/product/product_4_20200610124751_5ee0b59785f71.png62405b38c58fe0f07fcef2367d8a9ba1/1024.png',

  // ── PSUs ──────────────────────────────────────────────────────────────────
  'psu-asus-rog-thor-1000w':
    'https://dlcdnwebimgs.asus.com/gain/A9B3C8F1-2D4E-4F8A-B7C6-1E3D5A7B9F2C/w800/h600',
  'psu-cooler-master-mwe-550':
    'https://www.coolermaster.com/uploads/2021/07/MWE-Bronze-V2-product-image-3.png',
  'psu-corsair-rm750e':
    'https://www.corsair.com/medias/sys_master/images/images/h74/h3e/9303826415646/CP-9020263-NA-Gallery-RM750e-Black-01.png',
  'psu-evga-650-br':
    'https://www.evga.com/products/images/product/large/100-BR-0650-K1_LG_1.png',
  'psu-msi-mag-a850gl':
    'https://asset.msi.com/resize/image/global/product/product_4_20230515153503_6462d117a14f6.png62405b38c58fe0f07fcef2367d8a9ba1/1024.png',

  // ── Storage ───────────────────────────────────────────────────────────────
  'storage-crucial-mx500-1tb':
    'https://www.crucial.com/content/dam/crucial/ssd-products/mx500/images/in-use/CT1000MX500SSD1-in-use.png',
  'storage-kingston-nv2-1tb':
    'https://media.kingston.com/kingston/product/ktc-product-ssd-snv2-1-lg.jpg',
  'storage-samsung-970-evo-plus-1tb':
    'https://images.samsung.com/is/image/samsung/p6pim/levant/mz-v7s1t0bw/gallery/levant-970-evo-plus-nvme-m2-ssd-mz-v7s1t0bw-frontthumbnail.jpg',
  'storage-seagate-barracuda-2tb':
    'https://www.seagate.com/content/dam/seagate/migrated-assets/www-content/product-content/barracuda-fam/desktop-hdd/barracuda/en-us/images/barracuda-35-hdd-front-angle-1200x1200.png',
  'storage-wd-blue-sn580-1tb':
    'https://shop.westerndigital.com/content/dam/store/en-us/assets/products/internal-ssd/wd-blue-sn580-nvme-ssd/gallery/wd-blue-sn580-nvme-ssd-main.png.thumb.1280.1280.png',

  // ── Cases ─────────────────────────────────────────────────────────────────
  'case-cooler-master-q300l':
    'https://www.coolermaster.com/uploads/2018/04/MCB-Q300L-KANN-S00_WEB_01.jpg',
  'case-deepcool-cc560-rgb':
    'https://de.deepcool.com/upload/productImages/2021/11/CC560-1.jpg',
  'case-nzxt-h5-flow-rgb':
    'https://nzxt.com/assets/cms/34299/1648581614-h5-flow-black-front-cropped.png',

  // ── Cooling ───────────────────────────────────────────────────────────────
  'cooling-cooler-master-hyper-212-rgb':
    'https://www.coolermaster.com/uploads/2019/10/RR-212S-20PK-R1-04.jpg',
  'cooling-corsair-h100-rgb':
    'https://www.corsair.com/medias/sys_master/images/images/hf4/h9b/9303826120734/CW-9060115-WW-Gallery-iCUE-H100i-RGB-Elite-01.png',
  'cooling-deepcool-ak400-digital':
    'https://de.deepcool.com/upload/productImages/2022/09/AK400-DIGITAL-1.jpg',
  'cooling-deepcool-ls720-se':
    'https://de.deepcool.com/upload/productImages/2022/09/LS720-SE-1.jpg',
  'cooling-nzxt-kraken-240-rgb':
    'https://nzxt.com/assets/cms/34299/1618518126-kraken-240-front-cropped.png',

  // ── Peripherals ───────────────────────────────────────────────────────────
  'peripheral-hyperx-cloud-stinger':
    'https://hyperx.com/cdn/shop/files/4P4F7AA_1_image1.png',
  'peripheral-logitech-c920-hd-pro':
    'https://resource.logitech.com/content/dam/gaming/en/products/c920-hd-pro-webcam/c920-hd-pro-webcam-gallery-1.png',
  'peripheral-logitech-g502-hero':
    'https://resource.logitech.com/content/dam/gaming/en/products/g502-hero/g502-hero-gallery-1.png',
  'peripheral-razer-blackwidow-v3':
    'https://hybrismediaprod.blob.core.windows.net/sys-master-phoenix-images-container/h90/h1d/9558706855966/razer-blackwidow-v3-500x500.png',
  'peripheral-redragon-k552-kumara':
    'https://m.media-amazon.com/images/I/81dEQf8cPJL._AC_SX679_.jpg',
};

async function updateImages() {
  console.log('\n🖼️  Actualizando imágenes restantes en Firestore...\n');
  let updated = 0;
  let notFound = 0;
  let errors = 0;

  for (const [docId, imageUrl] of Object.entries(EXTRA_IMAGES)) {
    try {
      const ref = db.collection('components').doc(docId);
      const snap = await ref.get();
      if (snap.exists) {
        await ref.update({ image: imageUrl, updatedAt: new Date().toISOString() });
        console.log(`  ✅ ${docId}`);
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

  console.log(`\n🎉 Resultado: ${updated} actualizados, ${notFound} no encontrados, ${errors} errores.\n`);
  process.exit(0);
}

updateImages().catch(err => { console.error(err); process.exit(1); });
