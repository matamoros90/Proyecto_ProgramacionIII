require('dotenv').config();
const { initFirebase, getDb } = require('./src/config/firebase');

initFirebase();
const db = getDb();

const components = [
  // ── CPUs ──────────────────────────────────────────────────────────────────
  {
    type: 'cpu', name: 'AMD Ryzen 5 7600X', brand: 'AMD', model: 'Ryzen 5 7600X',
    price: 1850, inStock: true, stock: 8, performanceScore: 78,
    socket: 'AM5', cores: 6, threads: 12, baseClockGHz: 4.7, boostClockGHz: 5.3, tdp: 105,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },
  {
    type: 'cpu', name: 'AMD Ryzen 7 7700X', brand: 'AMD', model: 'Ryzen 7 7700X',
    price: 2600, inStock: true, stock: 5, performanceScore: 87,
    socket: 'AM5', cores: 8, threads: 16, baseClockGHz: 4.5, boostClockGHz: 5.4, tdp: 105,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },
  {
    type: 'cpu', name: 'Intel Core i5-13600K', brand: 'Intel', model: 'Core i5-13600K',
    price: 2100, inStock: true, stock: 6, performanceScore: 82,
    socket: 'LGA1700', cores: 14, threads: 20, baseClockGHz: 3.5, boostClockGHz: 5.1, tdp: 125,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },
  {
    type: 'cpu', name: 'Intel Core i7-13700K', brand: 'Intel', model: 'Core i7-13700K',
    price: 3200, inStock: true, stock: 4, performanceScore: 91,
    socket: 'LGA1700', cores: 16, threads: 24, baseClockGHz: 3.4, boostClockGHz: 5.4, tdp: 125,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },
  {
    type: 'cpu', name: 'AMD Ryzen 3 5300G', brand: 'AMD', model: 'Ryzen 3 5300G',
    price: 900, inStock: true, stock: 10, performanceScore: 55,
    socket: 'AM4', cores: 4, threads: 8, baseClockGHz: 4.0, boostClockGHz: 4.2, tdp: 65,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },

  // ── GPUs ──────────────────────────────────────────────────────────────────
  {
    type: 'gpu', name: 'NVIDIA RTX 4060', brand: 'NVIDIA', model: 'GeForce RTX 4060',
    price: 2800, inStock: true, stock: 6, performanceScore: 75, vramGB: 8, tdp: 115,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  },
  {
    type: 'gpu', name: 'NVIDIA RTX 4070', brand: 'NVIDIA', model: 'GeForce RTX 4070',
    price: 4200, inStock: true, stock: 3, performanceScore: 88, vramGB: 12, tdp: 200,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  },
  {
    type: 'gpu', name: 'AMD RX 7600', brand: 'AMD', model: 'Radeon RX 7600',
    price: 2200, inStock: true, stock: 7, performanceScore: 70, vramGB: 8, tdp: 165,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  },
  {
    type: 'gpu', name: 'AMD RX 6700 XT', brand: 'AMD', model: 'Radeon RX 6700 XT',
    price: 3100, inStock: true, stock: 4, performanceScore: 80, vramGB: 12, tdp: 230,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  },
  {
    type: 'gpu', name: 'NVIDIA RTX 4090', brand: 'NVIDIA', model: 'GeForce RTX 4090',
    price: 11000, inStock: false, stock: 1, performanceScore: 99, vramGB: 24, tdp: 450,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  },

  // ── RAMs ──────────────────────────────────────────────────────────────────
  {
    type: 'ram', name: 'Kingston Fury 16GB DDR5', brand: 'Kingston', model: 'Fury Beast DDR5',
    price: 650, inStock: true, stock: 15, performanceScore: 72,
    ramType: 'DDR5', capacity: 16, speedMHz: 5200,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400',
  },
  {
    type: 'ram', name: 'Corsair Vengeance 32GB DDR5', brand: 'Corsair', model: 'Vengeance DDR5',
    price: 1200, inStock: true, stock: 8, performanceScore: 85,
    ramType: 'DDR5', capacity: 32, speedMHz: 6000,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400',
  },
  {
    type: 'ram', name: 'G.Skill Ripjaws 16GB DDR4', brand: 'G.Skill', model: 'Ripjaws V DDR4',
    price: 380, inStock: true, stock: 20, performanceScore: 60,
    ramType: 'DDR4', capacity: 16, speedMHz: 3600,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400',
  },
  {
    type: 'ram', name: 'G.Skill Ripjaws 32GB DDR4', brand: 'G.Skill', model: 'Ripjaws V DDR4 32GB',
    price: 700, inStock: true, stock: 12, performanceScore: 68,
    ramType: 'DDR4', capacity: 32, speedMHz: 3600,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400',
  },
  {
    type: 'ram', name: 'Kingston 8GB DDR4 SODIMM', brand: 'Kingston', model: 'ValueRAM DDR4 8GB',
    price: 200, inStock: true, stock: 25, performanceScore: 40,
    ramType: 'DDR4', capacity: 8, speedMHz: 2666,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400',
  },

  // ── Motherboards ──────────────────────────────────────────────────────────
  {
    type: 'motherboard', name: 'ASUS ROG Strix B650-A', brand: 'ASUS', model: 'ROG Strix B650-A',
    price: 1800, inStock: true, stock: 5, performanceScore: 82,
    socket: 'AM5', ramType: 'DDR5', formFactor: 'ATX', maxRam: 128,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  },
  {
    type: 'motherboard', name: 'MSI Pro Z790-A', brand: 'MSI', model: 'Pro Z790-A WiFi',
    price: 2100, inStock: true, stock: 4, performanceScore: 87,
    socket: 'LGA1700', ramType: 'DDR5', formFactor: 'ATX', maxRam: 192,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  },
  {
    type: 'motherboard', name: 'Gigabyte B450M DS3H', brand: 'Gigabyte', model: 'B450M DS3H',
    price: 700, inStock: true, stock: 10, performanceScore: 58,
    socket: 'AM4', ramType: 'DDR4', formFactor: 'mATX', maxRam: 64,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  },
  {
    type: 'motherboard', name: 'ASUS Prime H610M-E', brand: 'ASUS', model: 'Prime H610M-E',
    price: 850, inStock: true, stock: 8, performanceScore: 62,
    socket: 'LGA1700', ramType: 'DDR4', formFactor: 'mATX', maxRam: 64,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  },

  // ── PSUs ──────────────────────────────────────────────────────────────────
  {
    type: 'psu', name: 'Corsair RM750x', brand: 'Corsair', model: 'RM750x',
    price: 1100, inStock: true, stock: 9, performanceScore: 88,
    wattage: 750, efficiency: '80+ Gold',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },
  {
    type: 'psu', name: 'EVGA 600W B1', brand: 'EVGA', model: '600 B1',
    price: 550, inStock: true, stock: 14, performanceScore: 60,
    wattage: 600, efficiency: '80+ Bronze',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },
  {
    type: 'psu', name: 'Seasonic Focus GX-850', brand: 'Seasonic', model: 'Focus GX-850',
    price: 1400, inStock: true, stock: 5, performanceScore: 93,
    wattage: 850, efficiency: '80+ Gold',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },
  {
    type: 'psu', name: 'Cooler Master MWE 450W', brand: 'Cooler Master', model: 'MWE Bronze 450',
    price: 380, inStock: true, stock: 18, performanceScore: 50,
    wattage: 450, efficiency: '80+ Bronze',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },
  {
    type: 'psu', name: 'Corsair RM1000x', brand: 'Corsair', model: 'RM1000x',
    price: 1900, inStock: true, stock: 3, performanceScore: 95,
    wattage: 1000, efficiency: '80+ Gold',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },

  // ── Storage ───────────────────────────────────────────────────────────────
  {
    type: 'storage', name: 'Samsung 970 EVO 1TB NVMe', brand: 'Samsung', model: '970 EVO Plus',
    price: 800, inStock: true, stock: 12, performanceScore: 88,
    storageType: 'NVMe', capacityGB: 1000, readMBps: 3500,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
  {
    type: 'storage', name: 'WD Blue SN570 500GB NVMe', brand: 'Western Digital', model: 'Blue SN570',
    price: 420, inStock: true, stock: 15, performanceScore: 72,
    storageType: 'NVMe', capacityGB: 500, readMBps: 3500,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
  {
    type: 'storage', name: 'Seagate Barracuda 2TB HDD', brand: 'Seagate', model: 'Barracuda 2TB',
    price: 500, inStock: true, stock: 10, performanceScore: 40,
    storageType: 'HDD', capacityGB: 2000, readMBps: 190,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
  {
    type: 'storage', name: 'Kingston A400 480GB SSD', brand: 'Kingston', model: 'A400 SSD',
    price: 320, inStock: true, stock: 20, performanceScore: 55,
    storageType: 'SATA', capacityGB: 480, readMBps: 500,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
  {
    type: 'storage', name: 'Samsung 990 Pro 2TB NVMe', brand: 'Samsung', model: '990 Pro',
    price: 1800, inStock: true, stock: 5, performanceScore: 96,
    storageType: 'NVMe', capacityGB: 2000, readMBps: 7450,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },

  // ── Cases ─────────────────────────────────────────────────────────────────
  {
    type: 'case', name: 'NZXT H510', brand: 'NZXT', model: 'H510',
    price: 950, inStock: true, stock: 7, performanceScore: 75,
    caseType: 'Mid Tower', formFactor: 'ATX',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
  },
  {
    type: 'case', name: 'Corsair 4000D Airflow', brand: 'Corsair', model: '4000D Airflow',
    price: 1250, inStock: true, stock: 5, performanceScore: 85,
    caseType: 'Mid Tower', formFactor: 'ATX',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
  },
  {
    type: 'case', name: 'Fractal Design Pop Mini', brand: 'Fractal Design', model: 'Pop Mini',
    price: 800, inStock: true, stock: 6, performanceScore: 70,
    caseType: 'Mini Tower', formFactor: 'mATX',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
  },
  {
    type: 'case', name: 'Cooler Master MasterBox Q300L', brand: 'Cooler Master', model: 'MasterBox Q300L',
    price: 600, inStock: true, stock: 9, performanceScore: 62,
    caseType: 'Mini Tower', formFactor: 'mATX',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
  },
  {
    type: 'case', name: 'Lian Li O11 Dynamic', brand: 'Lian Li', model: 'O11 Dynamic EVO',
    price: 1900, inStock: true, stock: 3, performanceScore: 92,
    caseType: 'Full Tower', formFactor: 'ATX',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
  },

  // ── Cooling ───────────────────────────────────────────────────────────────
  {
    type: 'cooling', name: 'Cooler Master Hyper 212', brand: 'Cooler Master', model: 'Hyper 212 Black',
    price: 380, inStock: true, stock: 14, performanceScore: 65,
    coolingType: 'Aire', maxTdp: 150,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },
  {
    type: 'cooling', name: 'NZXT Kraken 240 AIO', brand: 'NZXT', model: 'Kraken 240',
    price: 1500, inStock: true, stock: 5, performanceScore: 88,
    coolingType: 'Liquido', maxTdp: 300,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },
  {
    type: 'cooling', name: 'be quiet! Dark Rock 4', brand: 'be quiet!', model: 'Dark Rock 4',
    price: 850, inStock: true, stock: 7, performanceScore: 80,
    coolingType: 'Aire', maxTdp: 200,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },
  {
    type: 'cooling', name: 'Corsair iCUE H150i Elite 360', brand: 'Corsair', model: 'iCUE H150i Elite',
    price: 2400, inStock: true, stock: 3, performanceScore: 95,
    coolingType: 'Liquido', maxTdp: 400,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },
  {
    type: 'cooling', name: 'AMD Wraith Stealth (Stock)', brand: 'AMD', model: 'Wraith Stealth',
    price: 0, inStock: true, stock: 30, performanceScore: 35,
    coolingType: 'Aire', maxTdp: 65,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  },

  // ── Peripherals ───────────────────────────────────────────────────────────
  {
    type: 'peripheral', name: 'Kit Teclado + Mouse Logitech MK270', brand: 'Logitech', model: 'MK270',
    price: 350, inStock: true, stock: 20, performanceScore: 55,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  },
  {
    type: 'peripheral', name: 'Monitor LG 27" Full HD 144Hz', brand: 'LG', model: '27GN750-B',
    price: 2800, inStock: true, stock: 6, performanceScore: 82,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a573d5e6e4?w=400',
  },
  {
    type: 'peripheral', name: 'Monitor Samsung 24" Full HD', brand: 'Samsung', model: 'S24F350',
    price: 1400, inStock: true, stock: 8, performanceScore: 65,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a573d5e6e4?w=400',
  },
  {
    type: 'peripheral', name: 'Headset HyperX Cloud II', brand: 'HyperX', model: 'Cloud II',
    price: 900, inStock: true, stock: 10, performanceScore: 78,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
  },
];

async function seed() {
  console.log(`\n🌱 Cargando ${components.length} componentes en Firestore...\n`);
  let ok = 0;

  for (const comp of components) {
    try {
      const ref = db.collection('components').doc();
      await ref.set({
        ...comp,
        id: ref.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`  ✅ [${comp.type.toUpperCase()}] ${comp.name}`);
      ok++;
    } catch (err) {
      console.error(`  ❌ ${comp.name}: ${err.message}`);
    }
  }

  console.log(`\n🎉 Listo: ${ok}/${components.length} componentes cargados.\n`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
