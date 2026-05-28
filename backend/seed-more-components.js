/**
 * seed-more-components.js
 * Añade 30 componentes nuevos a Firestore (con IDs basados en slug → idempotente).
 * Ejecutar UNA VEZ: node seed-more-components.js
 */
require('dotenv').config();
const { initFirebase, getDb } = require('./src/config/firebase');

initFirebase();
const db = getDb();

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const components = [

  // ── CPUs ADICIONALES ──────────────────────────────────────────────────────
  {
    type: 'cpu', name: 'AMD Ryzen 3 3200G', brand: 'AMD', model: 'Ryzen 3 3200G',
    price: 600, inStock: true, stock: 15, performanceScore: 44,
    socket: 'AM4', cores: 4, threads: 4, baseClockGHz: 3.6, boostClockGHz: 4.0, tdp: 65,
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400',
  },
  {
    type: 'cpu', name: 'Intel Core i3-13100', brand: 'Intel', model: 'Core i3-13100',
    price: 1100, inStock: true, stock: 10, performanceScore: 60,
    socket: 'LGA1700', cores: 4, threads: 8, baseClockGHz: 3.4, boostClockGHz: 4.5, tdp: 60,
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400',
  },
  {
    type: 'cpu', name: 'AMD Ryzen 5 5600X', brand: 'AMD', model: 'Ryzen 5 5600X',
    price: 1600, inStock: true, stock: 8, performanceScore: 76,
    socket: 'AM4', cores: 6, threads: 12, baseClockGHz: 3.7, boostClockGHz: 4.6, tdp: 65,
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400',
  },
  {
    type: 'cpu', name: 'Intel Core i9-13900K', brand: 'Intel', model: 'Core i9-13900K',
    price: 5500, inStock: true, stock: 2, performanceScore: 97,
    socket: 'LGA1700', cores: 24, threads: 32, baseClockGHz: 3.0, boostClockGHz: 5.8, tdp: 253,
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400',
  },

  // ── GPUs ADICIONALES ──────────────────────────────────────────────────────
  {
    type: 'gpu', name: 'NVIDIA GT 1030', brand: 'NVIDIA', model: 'GeForce GT 1030',
    price: 700, inStock: true, stock: 10, performanceScore: 35, vramGB: 2, tdp: 30,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
  },
  {
    type: 'gpu', name: 'NVIDIA GTX 1650', brand: 'NVIDIA', model: 'GeForce GTX 1650',
    price: 1400, inStock: true, stock: 8, performanceScore: 52, vramGB: 4, tdp: 75,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
  },
  {
    type: 'gpu', name: 'NVIDIA RTX 3060', brand: 'NVIDIA', model: 'GeForce RTX 3060',
    price: 2400, inStock: true, stock: 5, performanceScore: 68, vramGB: 12, tdp: 170,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
  },
  {
    type: 'gpu', name: 'AMD RX 6600 XT', brand: 'AMD', model: 'Radeon RX 6600 XT',
    price: 1900, inStock: true, stock: 6, performanceScore: 64, vramGB: 8, tdp: 160,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
  },
  {
    type: 'gpu', name: 'NVIDIA RTX 4080', brand: 'NVIDIA', model: 'GeForce RTX 4080',
    price: 8500, inStock: true, stock: 2, performanceScore: 95, vramGB: 16, tdp: 320,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
  },

  // ── RAMs ADICIONALES ──────────────────────────────────────────────────────
  {
    type: 'ram', name: 'Kingston ValueRAM 8GB DDR4', brand: 'Kingston', model: 'KVR26N19S8/8',
    price: 180, inStock: true, stock: 30, performanceScore: 33,
    ramType: 'DDR4', capacity: 8, speedMHz: 2666,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400',
  },
  {
    type: 'ram', name: 'Corsair Vengeance LPX 16GB DDR4', brand: 'Corsair', model: 'Vengeance LPX DDR4',
    price: 450, inStock: true, stock: 18, performanceScore: 58,
    ramType: 'DDR4', capacity: 16, speedMHz: 3200,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400',
  },
  {
    type: 'ram', name: 'Corsair Dominator 64GB DDR5', brand: 'Corsair', model: 'Dominator Platinum DDR5',
    price: 2200, inStock: true, stock: 3, performanceScore: 93,
    ramType: 'DDR5', capacity: 64, speedMHz: 6400,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400',
  },

  // ── MOTHERBOARDS ADICIONALES ──────────────────────────────────────────────
  {
    type: 'motherboard', name: 'MSI A320M-A Pro', brand: 'MSI', model: 'A320M-A Pro',
    price: 400, inStock: true, stock: 14, performanceScore: 44,
    socket: 'AM4', ramType: 'DDR4', formFactor: 'mATX', maxRam: 32,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  },
  {
    type: 'motherboard', name: 'MSI B550 MAG Tomahawk', brand: 'MSI', model: 'MAG B550 Tomahawk',
    price: 1100, inStock: true, stock: 7, performanceScore: 78,
    socket: 'AM4', ramType: 'DDR4', formFactor: 'ATX', maxRam: 128,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  },
  {
    type: 'motherboard', name: 'ASUS ROG Maximus Z790 Hero', brand: 'ASUS', model: 'ROG Maximus Z790 Hero',
    price: 3500, inStock: true, stock: 2, performanceScore: 96,
    socket: 'LGA1700', ramType: 'DDR5', formFactor: 'ATX', maxRam: 192,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  },

  // ── PSUs ADICIONALES ──────────────────────────────────────────────────────
  {
    type: 'psu', name: 'Thermaltake Smart 400W', brand: 'Thermaltake', model: 'Smart 400W',
    price: 230, inStock: true, stock: 25, performanceScore: 34,
    wattage: 400, efficiency: '80+ White',
    image: 'https://images.unsplash.com/photo-1555617981-dac3772c8f1e?w=400',
  },
  {
    type: 'psu', name: 'Thermaltake Smart 500W', brand: 'Thermaltake', model: 'Smart 500W',
    price: 280, inStock: true, stock: 20, performanceScore: 40,
    wattage: 500, efficiency: '80+ White',
    image: 'https://images.unsplash.com/photo-1555617981-dac3772c8f1e?w=400',
  },
  {
    type: 'psu', name: 'EVGA SuperNOVA 750W G6', brand: 'EVGA', model: 'SuperNOVA 750 G6',
    price: 1200, inStock: true, stock: 6, performanceScore: 91,
    wattage: 750, efficiency: '80+ Gold',
    image: 'https://images.unsplash.com/photo-1555617981-dac3772c8f1e?w=400',
  },

  // ── STORAGE ADICIONAL ─────────────────────────────────────────────────────
  {
    type: 'storage', name: 'Kingston A400 120GB SSD', brand: 'Kingston', model: 'A400 120GB',
    price: 180, inStock: true, stock: 30, performanceScore: 40,
    storageType: 'SATA', capacityGB: 120, readMBps: 500,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400',
  },
  {
    type: 'storage', name: 'Crucial MX500 1TB SSD', brand: 'Crucial', model: 'MX500 1TB',
    price: 580, inStock: true, stock: 10, performanceScore: 70,
    storageType: 'SATA', capacityGB: 1000, readMBps: 560,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400',
  },
  {
    type: 'storage', name: 'WD Black SN850X 2TB NVMe', brand: 'Western Digital', model: 'Black SN850X 2TB',
    price: 2200, inStock: true, stock: 4, performanceScore: 97,
    storageType: 'NVMe', capacityGB: 2000, readMBps: 7300,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400',
  },
  {
    type: 'storage', name: 'Seagate Barracuda 4TB HDD', brand: 'Seagate', model: 'Barracuda 4TB',
    price: 850, inStock: true, stock: 8, performanceScore: 41,
    storageType: 'HDD', capacityGB: 4000, readMBps: 190,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },

  // ── CASES ADICIONALES ─────────────────────────────────────────────────────
  {
    type: 'case', name: 'Segotep K2 Basic', brand: 'Segotep', model: 'K2',
    price: 250, inStock: true, stock: 20, performanceScore: 33,
    caseType: 'Mini Tower', formFactor: 'mATX',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
  },
  {
    type: 'case', name: 'Corsair Carbide SPEC-01', brand: 'Corsair', model: 'Carbide SPEC-01',
    price: 480, inStock: true, stock: 10, performanceScore: 54,
    caseType: 'Mid Tower', formFactor: 'ATX',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
  },
  {
    type: 'case', name: 'Phanteks Eclipse P300A', brand: 'Phanteks', model: 'Eclipse P300A',
    price: 1100, inStock: true, stock: 5, performanceScore: 79,
    caseType: 'Mid Tower', formFactor: 'ATX',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
  },
  {
    type: 'case', name: 'NZXT H9 Flow', brand: 'NZXT', model: 'H9 Flow',
    price: 2400, inStock: true, stock: 3, performanceScore: 93,
    caseType: 'Full Tower', formFactor: 'ATX',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
  },

  // ── COOLING ADICIONAL ─────────────────────────────────────────────────────
  {
    type: 'cooling', name: 'Deepcool GAMMAXX 400', brand: 'Deepcool', model: 'GAMMAXX 400',
    price: 280, inStock: true, stock: 20, performanceScore: 54,
    coolingType: 'Aire', maxTdp: 130,
    image: 'https://images.unsplash.com/photo-1587208165985-2f4c2dda42a3?w=400',
  },
  {
    type: 'cooling', name: 'Noctua NH-D15', brand: 'Noctua', model: 'NH-D15',
    price: 1500, inStock: true, stock: 4, performanceScore: 93,
    coolingType: 'Aire', maxTdp: 250,
    image: 'https://images.unsplash.com/photo-1587208165985-2f4c2dda42a3?w=400',
  },
  {
    type: 'cooling', name: 'ARCTIC Liquid Freezer II 360', brand: 'ARCTIC', model: 'Liquid Freezer II 360',
    price: 2000, inStock: true, stock: 3, performanceScore: 96,
    coolingType: 'Liquido', maxTdp: 400,
    image: 'https://images.unsplash.com/photo-1587208165985-2f4c2dda42a3?w=400',
  },

  // ── PERIFÉRICOS ADICIONALES ───────────────────────────────────────────────
  {
    type: 'peripheral', name: 'Mouse Gaming Logitech G502 Hero', brand: 'Logitech', model: 'G502 Hero',
    price: 480, inStock: true, stock: 12, performanceScore: 82,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  },
  {
    type: 'peripheral', name: 'Teclado Mecánico Redragon K552', brand: 'Redragon', model: 'K552 Kumara',
    price: 380, inStock: true, stock: 15, performanceScore: 68,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  },
  {
    type: 'peripheral', name: 'Monitor ASUS 27" 2K 165Hz', brand: 'ASUS', model: 'VG27AQ',
    price: 3500, inStock: true, stock: 4, performanceScore: 90,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a573d5e6e4?w=400',
  },
];

async function seed() {
  console.log(`\n🌱 Cargando ${components.length} componentes en Firestore...\n`);
  let created = 0, updated = 0, errors = 0;

  for (const comp of components) {
    const id = `${comp.type}-${slug(comp.name)}`;
    try {
      const ref  = db.collection('components').doc(id);
      const snap = await ref.get();
      if (snap.exists) {
        await ref.update({ price: comp.price, stock: comp.stock, updatedAt: new Date().toISOString() });
        console.log(`  ♻️  [${comp.type.toUpperCase().padEnd(12)}] ${comp.name} — actualizado`);
        updated++;
      } else {
        await ref.set({ ...comp, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        console.log(`  ✅  [${comp.type.toUpperCase().padEnd(12)}] ${comp.name}`);
        created++;
      }
    } catch (err) {
      console.error(`  ❌  ${comp.name}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n🎉 Resultado: ${created} creados, ${updated} actualizados, ${errors} errores.\n`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
