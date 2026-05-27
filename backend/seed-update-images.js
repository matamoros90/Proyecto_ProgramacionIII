/**
 * seed-update-images.js
 * Actualiza las imágenes de todos los componentes en Firestore con fotos
 * específicas por modelo (variadas, no la misma para todos del mismo tipo).
 *
 * Ejecutar: node seed-update-images.js
 */
require('dotenv').config();
const { initFirebase, getDb } = require('./src/config/firebase');

initFirebase();
const db = getDb();

/**
 * Mapa: ID del documento en Firestore → URL de imagen actualizada.
 * Los IDs siguen el patrón slug: `{type}-{nombre-slug}`
 */
const IMAGE_MAP = {

  // ── CPUs ───────────────────────────────────────────────────────────────────
  // IDs generados por seed-components.js (ID aleatorio de Firestore → no podemos mapear por ID)
  // Usaremos un query por nombre para actualizar. Ver lógica abajo.

  // ── Nuevos CPUs (seed-more-components.js — IDs slug) ───────────────────────
  'cpu-amd-ryzen-3-3200g':
    'https://cdn.mos.cms.futurecdn.net/8PYtgHkNjWHsWLjxuFHHBc-1200-80.jpg',
  'cpu-intel-core-i3-13100':
    'https://www.intel.com/content/dam/www/central-libraries/us/en/images/2022-11/npu-13th-gen-core-i3-13100.jpg.rendition.intel.web.480.270.jpg',
  'cpu-amd-ryzen-5-5600x':
    'https://cdn.mos.cms.futurecdn.net/HmBEMG7XGmhFwC5DCMW3BJ-1200-80.jpg',
  'cpu-intel-core-i9-13900k':
    'https://www.intel.com/content/dam/www/central-libraries/us/en/images/2022-11/npu-13th-gen-core-i9-13900k.jpg.rendition.intel.web.480.270.jpg',

  // ── Nuevas GPUs ────────────────────────────────────────────────────────────
  'gpu-nvidia-gt-1030':
    'https://images.nvidia.com/content/geforce/geforcegt1030/images/gt1030-pny-product-600-ud@2x.png',
  'gpu-nvidia-gtx-1650':
    'https://images.nvidia.com/content/geforce/geforcegt1650/images/gtx-1650-front-600px.png',
  'gpu-nvidia-rtx-3060':
    'https://images.nvidia.com/aem-dam/Solutions/geforce/ampere/rtx-3060/geforce-rtx-3060-product-600-ud@2x.png',
  'gpu-amd-rx-6600-xt':
    'https://www.amd.com/system/files/styles/992px/private/2021-10/627960-amd-radeon-rx-6600-xt-reference-design-open-card-top-down-1260x709.jpg',
  'gpu-nvidia-rtx-4080':
    'https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4080/geforce-rtx-4080-product-600-ud@2x.png',

  // ── Nuevas RAMs ────────────────────────────────────────────────────────────
  'ram-kingston-valueram-8gb-ddr4':
    'https://media.kingston.com/kingston/product/ktc-product-flash-kvr26n19s88-1-lg.jpg',
  'ram-corsair-vengeance-lpx-16gb-ddr4':
    'https://www.corsair.com/medias/sys_master/images/images/hec/h04/9003668660254/CMK16GX4M2B3200C16-Gallery-Vengeance-LPX-Black-16GB-1.png',
  'ram-corsair-dominator-64gb-ddr5':
    'https://www.corsair.com/medias/sys_master/images/images/h3d/h95/9168393330718/CMT64GX5M2B5600C36-Gallery-Dominator-Platinum-RGB-DDR5-White-64GB-1.png',

  // ── Nuevas Motherboards ────────────────────────────────────────────────────
  'motherboard-msi-a320m-a-pro':
    'https://asset.msi.com/resize/image/global/product/product_4_20190110163501_5c37312562e2e.png62405b38c58fe0f07fcef2367d8a9ba1/1024.png',
  'motherboard-msi-b550-mag-tomahawk':
    'https://asset.msi.com/resize/image/global/product/product_4_20200610124751_5ee0b59785f71.png62405b38c58fe0f07fcef2367d8a9ba1/1024.png',
  'motherboard-asus-rog-maximus-z790-hero':
    'https://dlcdnwebimgs.asus.com/gain/2C5D5A4D-97D1-4D7A-A73F-5E7D10B2E0F0/w800/h600',

  // ── Nuevas PSUs ────────────────────────────────────────────────────────────
  'psu-thermaltake-smart-400w':
    'https://www.thermaltakeusa.com/pub/media/catalog/product/cache/fde08cf0dd8e22e7fe20b86a53e7b3da/s/p/sp-500anawsus_1.jpg',
  'psu-thermaltake-smart-500w':
    'https://www.thermaltakeusa.com/pub/media/catalog/product/cache/fde08cf0dd8e22e7fe20b86a53e7b3da/s/p/sp-500anawsus_1.jpg',
  'psu-evga-supernova-750w-g6':
    'https://www.evga.com/products/images/product/large/220-G6-0750-X1_LG_1.png',

  // ── Nuevo Storage ──────────────────────────────────────────────────────────
  'storage-kingston-a400-120gb-ssd':
    'https://media.kingston.com/kingston/product/ktc-product-ssd-sa400-1-lg.jpg',
  'storage-crucial-mx500-1tb-ssd':
    'https://www.crucial.com/content/dam/crucial/ssd-products/mx500/images/in-use/CT1000MX500SSD1-in-use.png',
  'storage-wd-black-sn850x-2tb-nvme':
    'https://shop.westerndigital.com/content/dam/store/en-us/assets/products/internal-ssd/wd-black-sn850x-nvme-ssd/gallery/wd-black-sn850x-nvme-ssd-main.png.thumb.1280.1280.png',
  'storage-seagate-barracuda-4tb-hdd':
    'https://www.seagate.com/content/dam/seagate/migrated-assets/www-content/product-content/barracuda-fam/desktop-hdd/barracuda/en-us/images/barracuda-35-hdd-front-angle-1200x1200.png',

  // ── Nuevos Cases ──────────────────────────────────────────────────────────
  'case-segotep-k2-basic':
    'https://cdn11.bigcommerce.com/s-0pzm5k/images/stencil/1280x1280/products/7023/38474/SEG-K2-ATX-main__35695.1593463994.jpg',
  'case-corsair-carbide-spec-01':
    'https://www.corsair.com/medias/sys_master/images/images/h7f/h22/8938126336030/CC-9011052-WW-Gallery-CarbideSpec01-01.png',
  'case-phanteks-eclipse-p300a':
    'https://cdn.phanteks.com/files/products/eclipse-p300a/Eclipse_P300A_Black_Front.jpg',
  'case-nzxt-h9-flow':
    'https://nzxt.com/assets/cms/34299/1682099909-H9-Flow-Black-Front.png',

  // ── Nuevo Cooling ─────────────────────────────────────────────────────────
  'cooling-deepcool-gammaxx-400':
    'https://de.deepcool.com/upload/productImages/2020/08/5eCPU_Cooler_GAMMAXX-400_DP-MCH4-GMX400-1.jpg',
  'cooling-noctua-nh-d15':
    'https://noctua.at/pub/media/wysiwyg/products/nh-d15/nh-d15-product-shot-top-1300x975-small.jpg',
  'cooling-arctic-liquid-freezer-ii-360':
    'https://cdn.arctic.de/medias/ACFRE00098A-f-front-angle-1000.jpg',

  // ── Nuevos Periféricos ────────────────────────────────────────────────────
  'peripheral-mouse-gaming-logitech-g502-hero':
    'https://resource.logitech.com/content/dam/gaming/en/products/g502-hero/g502-hero-gallery-1.png',
  'peripheral-teclado-mec-nico-redragon-k552':
    'https://m.media-amazon.com/images/I/81dEQf8cPJL._AC_SX679_.jpg',
  'peripheral-monitor-asus-27-2k-165hz':
    'https://dlcdnwebimgs.asus.com/gain/2D7D90C9-FFFA-4CE3-B6D5-0A58E5D3D65E/w800/h600',
};

/**
 * Para los componentes del seed-components.js original los IDs son random (UUID de Firestore).
 * Los mapeamos por nombre exacto.
 */
const IMAGE_BY_NAME = {
  // CPUs originales
  'AMD Ryzen 5 7600X':
    'https://cdn.mos.cms.futurecdn.net/8bNHFnE8QBtpxHJMdLFSPQ-1200-80.jpg',
  'AMD Ryzen 7 7700X':
    'https://cdn.mos.cms.futurecdn.net/VdXfFvB2p6xXCN2WyMLEkU-1200-80.jpg',
  'Intel Core i5-13600K':
    'https://www.bhphotovideo.com/cdn-cgi/image/format=auto,fit=scale-down,width=500,quality=95/https://www.bhphotovideo.com/images/images500x500/intel_bx8071513600k_core_i5_13600k_2_40ghz_1662745015_1736462.jpg',
  'Intel Core i7-13700K':
    'https://www.bhphotovideo.com/cdn-cgi/image/format=auto,fit=scale-down,width=500,quality=95/https://www.bhphotovideo.com/images/images500x500/intel_bx8071513700k_core_i7_13700k_3_40ghz_1662745016_1736468.jpg',
  'AMD Ryzen 3 5300G':
    'https://www.bhphotovideo.com/cdn-cgi/image/format=auto,fit=scale-down,width=500,quality=95/https://www.bhphotovideo.com/images/images500x500/amd_100_100000745box_ryzen_3_5300g_3_6_ghz_1634316073_1703979.jpg',

  // GPUs originales
  'NVIDIA RTX 4060':
    'https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4060/geforce-rtx-4060-product-600-ud@2x.png',
  'NVIDIA RTX 4070':
    'https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4070/geforce-rtx-4070-product-600-ud@2x.png',
  'AMD RX 7600':
    'https://www.amd.com/system/files/styles/992px/private/2023-05/1511447-amd-radeon-rx-7600-pib-1260x709-V2.jpg',
  'AMD RX 6700 XT':
    'https://www.amd.com/system/files/styles/992px/private/2021-03/624657-amd-radeon-rx-6700-xt-1260x709.jpg',
  'NVIDIA RTX 4090':
    'https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4090/geforce-ada-4090-product-600-ud@2x.png',

  // RAMs originales
  'Kingston Fury 16GB DDR5':
    'https://media.kingston.com/kingston/product/ktc-product-flash-kf548c38bba-16-1-lg.jpg',
  'Corsair Vengeance 32GB DDR5':
    'https://www.corsair.com/medias/sys_master/images/images/hb3/h0e/9168395526174/CMK32GX5M2B5600C36-Gallery-Vengeance-DDR5-Black-32GB-1.png',
  'G.Skill Ripjaws 16GB DDR4':
    'https://www.gskill.com/img/product/F4-3600C16D-16GVKC-R1.jpg',
  'G.Skill Ripjaws 32GB DDR4':
    'https://www.gskill.com/img/product/F4-3600C18D-32GVK-r1.jpg',
  'Kingston 8GB DDR4 SODIMM':
    'https://media.kingston.com/kingston/product/ktc-product-flash-kvr26s19s68-1-lg.jpg',

  // Motherboards originales
  'ASUS ROG Strix B650-A':
    'https://dlcdnwebimgs.asus.com/gain/F0C78B62-A81E-4F80-B86B-7E5A1E5E6066/w800/h600',
  'MSI Pro Z790-A':
    'https://asset.msi.com/resize/image/global/product/product_4_20220908114252_631a199448e3f.png62405b38c58fe0f07fcef2367d8a9ba1/1024.png',
  'Gigabyte B450M DS3H':
    'https://www.gigabyte.com/FileUpload/Global/KeyFeature/1027/images/b450m-ds3h.png',
  'ASUS Prime H610M-E':
    'https://dlcdnwebimgs.asus.com/gain/25C1DB1E-92FA-44C1-AECD-1F8BFBDB5A56/w800/h600',

  // PSUs originales
  'Corsair RM750x':
    'https://www.corsair.com/medias/sys_master/images/images/h2e/h8f/8938129055774/CP-9020199-NA-Gallery-RM750x-Black-01.png',
  'EVGA 600W B1':
    'https://www.evga.com/products/images/product/large/100-B1-0600-K1_LG_1.png',
  'Seasonic Focus GX-850':
    'https://seasonic.com/pub/media/catalog/product/cache/de000f4264d547d4a63bf1af47b52fb1/f/o/focus-gx-850-atx-3-0.jpg',
  'Cooler Master MWE 450W':
    'https://www.coolermaster.com/uploads/2020/04/MWE_BRONZE_V2_new_04_m.jpg',
  'Corsair RM1000x':
    'https://www.corsair.com/medias/sys_master/images/images/heb/h9e/9168395329566/CP-9020201-NA-Gallery-RM1000x-Black-01.png',

  // Storage original
  'Samsung 970 EVO 1TB NVMe':
    'https://images.samsung.com/is/image/samsung/p6pim/levant/mz-v7e1t0bw/gallery/levant-970-evo-plus-nvme-m2-ssd-mz-v7e1t0bw-533834047?$650_519_PNG$',
  'WD Blue SN570 500GB NVMe':
    'https://shop.westerndigital.com/content/dam/store/en-us/assets/products/internal-ssd/wd-blue-sn570-nvme-ssd/gallery/wd-blue-sn570-nvme-ssd-main.png.thumb.1280.1280.png',
  'Seagate Barracuda 2TB HDD':
    'https://www.seagate.com/content/dam/seagate/migrated-assets/www-content/product-content/barracuda-fam/desktop-hdd/barracuda/en-us/images/barracuda-35-hdd-front-angle-1200x1200.png',
  'Kingston A400 480GB SSD':
    'https://media.kingston.com/kingston/product/ktc-product-ssd-sa400-sa400s37480g-1-lg.jpg',
  'Samsung 990 Pro 2TB NVMe':
    'https://images.samsung.com/is/image/samsung/p6pim/global/mz-v9p2t0bw/gallery/global-990-pro-nvme-m2-ssd-mz-v9p2t0bw-536842152?$650_519_PNG$',

  // Cases originales
  'NZXT H510':
    'https://nzxt.com/assets/cms/34299/1616530463-h510-white-front-cropped.png',
  'Corsair 4000D Airflow':
    'https://www.corsair.com/medias/sys_master/images/images/h51/h96/8938108657694/CC-9011200-WW-Gallery-4000D-Airflow-Black-Front.png',
  'Fractal Design Pop Mini':
    'https://www.fractal-design.com/app/uploads/2022/04/FD-C-POM1A-01_Front.jpg',
  'Cooler Master MasterBox Q300L':
    'https://www.coolermaster.com/uploads/2018/04/MCB-Q300L-KANN-S00_WEB_01.jpg',
  'Lian Li O11 Dynamic':
    'https://www.lian-li.com/wp-content/uploads/2022/09/pc-o11dex-800.jpg',

  // Cooling original
  'Cooler Master Hyper 212':
    'https://www.coolermaster.com/uploads/2019/10/RR-212S-20PK-R1-04.jpg',
  'NZXT Kraken 240 AIO':
    'https://nzxt.com/assets/cms/34299/1618518126-kraken-240-front-cropped.png',
  'be quiet! Dark Rock 4':
    'https://www.bequiet.com/productImages/be_quiet!_Dark_Rock_4_BK021_foto_01_1280x960px.jpg',
  'Corsair iCUE H150i Elite 360':
    'https://www.corsair.com/medias/sys_master/images/images/hfd/hf5/9168396967966/CW-9060070-WW-Gallery-iCUE-H150i-Elite-LCD-Black-01.png',
  'AMD Wraith Stealth (Stock)':
    'https://www.amd.com/system/files/styles/992px/private/2020-03/AMD-Wraith-Stealth-Cooler.png',

  // Periféricos originales
  'Kit Teclado + Mouse Logitech MK270':
    'https://resource.logitech.com/content/dam/gaming/en/products/mk270r/mk270r-main-image.png',
  'Monitor LG 27" Full HD 144Hz':
    'https://www.lg.com/us/images/monitors/md06003040/gallery/DZ-01.jpg',
  'Monitor Samsung 24" Full HD':
    'https://images.samsung.com/is/image/samsung/p6pim/latin/ls24f350fhlxzl/gallery/latin-sf350-ls24f350fhlxzl-frontblack-118551671?$650_519_PNG$',
  'Headset HyperX Cloud II':
    'https://hyperx.com/cdn/shop/files/KHX-HSCP-GM_1_image1.png',
};

async function updateImages() {
  console.log('\n🖼️  Actualizando imágenes de componentes en Firestore...\n');
  let updatedSlug = 0;
  let updatedName = 0;
  let errors = 0;

  // 1. Actualizar por ID slug (componentes de seed-more-components.js)
  for (const [docId, imageUrl] of Object.entries(IMAGE_MAP)) {
    try {
      const ref = db.collection('components').doc(docId);
      const snap = await ref.get();
      if (snap.exists) {
        await ref.update({ image: imageUrl, updatedAt: new Date().toISOString() });
        console.log(`  ✅ [slug] ${docId}`);
        updatedSlug++;
      } else {
        console.log(`  ⚠️  [slug] No encontrado: ${docId}`);
      }
    } catch (err) {
      console.error(`  ❌ [slug] ${docId}: ${err.message}`);
      errors++;
    }
  }

  // 2. Actualizar por nombre (componentes de seed-components.js con IDs random)
  for (const [name, imageUrl] of Object.entries(IMAGE_BY_NAME)) {
    try {
      const snapshot = await db.collection('components')
        .where('name', '==', name)
        .limit(1)
        .get();

      if (snapshot.empty) {
        console.log(`  ⚠️  [name] No encontrado: ${name}`);
        continue;
      }

      const doc = snapshot.docs[0];
      await doc.ref.update({ image: imageUrl, updatedAt: new Date().toISOString() });
      console.log(`  ✅ [name] ${name}`);
      updatedName++;
    } catch (err) {
      console.error(`  ❌ [name] ${name}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n🎉 Resultado: ${updatedSlug + updatedName} actualizados (${updatedSlug} por slug, ${updatedName} por nombre), ${errors} errores.\n`);
  process.exit(0);
}

updateImages().catch(err => { console.error(err); process.exit(1); });
