# Diseño de Base de Datos — Firebase Firestore

## Colecciones

### `users/{uid}`
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "role": "client | admin | technician",
  "fcmTokens": ["string"],
  "createdAt": "ISO8601"
}
```

### `components/{id}`
```json
{
  "id": "string",
  "type": "cpu | gpu | ram | motherboard | psu | storage | case | cooling | peripheral",
  "name": "string",
  "brand": "string",
  "model": "string",
  "price": 1500.00,
  "image": "url",
  "inStock": true,
  "stock": 10,
  "performanceScore": 85.5,
  "tdp": 125,
  "socket": "AM5",         // CPU, Motherboard
  "ramType": "DDR5",       // RAM, Motherboard
  "formFactor": "ATX",     // Motherboard, Case
  "wattage": 750,          // PSU
  "vramGB": 8,             // GPU
  "capacity": 32,          // RAM (GB)
  "speedMHz": 6000,        // RAM
  "storageType": "NVMe",   // Storage
  "capacityGB": 1000,      // Storage
  "maxRam": 128,           // Motherboard
  "caseType": "Mid Tower", // Case
  "maxTdp": 280,           // Cooling
  "cores": 8,              // CPU
  "boostClockGHz": 5.7     // CPU
}
```

### `builds/{id}`
```json
{
  "id": "string",
  "userId": "string",
  "name": "Mi PC Gaming",
  "category": "gaming",
  "build": {
    "cpu": { /* Component */ },
    "gpu": { /* Component */ },
    "ram": { /* Component */ }
  },
  "totalPrice": 8500.00,
  "notes": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### `quotes/{id}`
```json
{
  "id": "string",
  "userId": "string",
  "build": { /* Build object */ },
  "totalPrice": 8500.00,
  "category": "gaming",
  "notes": "string",
  "status": "draft | confirmed",
  "createdAt": "ISO8601",
  "expiresAt": "ISO8601",
  "confirmedAt": "ISO8601"
}
```

### `orders/{id}`
```json
{
  "id": "string",
  "userId": "string",
  "quoteId": "string",
  "build": { /* Build object */ },
  "totalPrice": 8500.00,
  "category": "gaming",
  "state": "pending | components_ready | assembling | software_install | testing | ready | delivered | cancelled",
  "stateHistory": [
    { "state": "pending", "timestamp": "ISO8601", "note": "Orden creada" }
  ],
  "notes": "string",
  "technicianId": "string | null",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### `tutorials/{id}`
```json
{
  "id": "string",
  "title": "¿Qué es un procesador?",
  "description": "string",
  "content": "markdown string",
  "videoUrl": "url",
  "thumbnailUrl": "url",
  "category": "cpu | gpu | ram | general",
  "level": "beginner | intermediate | advanced",
  "durationMinutes": 10,
  "order": 1,
  "published": true,
  "createdAt": "ISO8601"
}
```

### `notifications/{id}`
```json
{
  "userId": "string",
  "title": "string",
  "body": "string",
  "type": "order_update | promo | system",
  "orderId": "string | null",
  "read": false,
  "createdAt": "ISO8601"
}
```

## Índices necesarios en Firestore

```
components: type ASC, inStock ASC
components: type ASC, price ASC
builds: userId ASC, createdAt DESC
quotes: userId ASC, createdAt DESC
orders: userId ASC, createdAt DESC
orders: state ASC, createdAt DESC
tutorials: published ASC, category ASC, order ASC
notifications: userId ASC, createdAt DESC
```
