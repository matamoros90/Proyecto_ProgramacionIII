# ZonaPc Builder

Plataforma inteligente para cotización, personalización y ensamblaje de computadoras.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Mobile | React Native + Expo (TypeScript) |
| Backend | Node.js + Express |
| Base de datos | Firebase Firestore |
| Autenticación | Firebase Auth |
| Notificaciones | Firebase Cloud Messaging |

## Estructura del Proyecto

```
ZonaPcBuilder/
├── backend/          # API REST Node.js + Express
│   ├── firestore.rules   # Reglas de seguridad de Firestore
│   └── src/
└── mobile/           # App React Native + Expo
```

## Inicio Rápido

### Backend
```bash
cd backend
npm ci
cp .env.example .env   # Configurar variables de entorno
npm run dev
```

### Mobile
```bash
cd mobile
npm ci
npx expo start
```

---

## Auditoría de Seguridad — 13 de Mayo 2026

> Esta sección documenta el análisis de seguridad realizado el 13/05/2026
> y las correcciones aplicadas en el commit `e0202bc`.

### Contexto: Incidentes de Supply Chain activos

En las semanas previas a esta auditoría ocurrieron dos ataques de cadena de
suministro en el ecosistema npm que afectaban directamente las dependencias
del proyecto:

**Axios — 31 de Marzo 2026 (atribuido a Corea del Norte / Sapphire Sleet)**
Las versiones `axios@1.14.1` y `axios@0.30.4` fueron comprometidas. Al
instalarse, inyectaban el paquete falso `plain-crypto-js` que descargaba un
RAT (Remote Access Trojan) multiplataforma desde un servidor C2 norcoreano.
Alerta oficial publicada por CISA el 20/04/2026.

**TanStack — 11 de Mayo 2026 (atribuido a TeamPCP)**
84 versiones de 42 paquetes `@tanstack/*` fueron publicadas con código
malicioso. El atacante usó envenenamiento de caché en GitHub Actions para
robar un token OIDC del pipeline de release de TanStack y publicar versiones
comprometidas desde la identidad legítima del proyecto. Detectado en 20
minutos por un investigador externo.

### Vulnerabilidades encontradas y correcciones aplicadas

| # | Severidad | Problema | Archivo | Solución |
|---|-----------|---------|---------|---------|
| 1 | CRÍTICO | `axios ^1.6.2` — el operador `^` permitía auto-actualizar a `1.14.1` (versión con RAT) | `mobile/package.json` | Fijado a `axios@1.14.0` sin `^` |
| 2 | CRÍTICO | Sin `package-lock.json` — cada `npm install` resolvía la versión más reciente compatible | raíz del proyecto | Añadido `.npmrc` con `package-lock=true` |
| 3 | CRÍTICO | `@tanstack/react-query` propuesto como dependencia — comprometido 2 días antes | — | No instalado; esperar cierre oficial del incidente |
| 4 | ALTA | Sin rate limiting — endpoints expuestos a fuerza bruta | `backend/src/config/app.js` | `express-rate-limit`: 100 req/15min global, 10 req/15min en `/api/auth` |
| 5 | ALTA | `cors()` sin configuración — aceptaba peticiones de cualquier origen | `backend/src/config/app.js` | Lista blanca vía variable de entorno `ALLOWED_ORIGINS` |
| 6 | ALTA | Sin límite de tamaño en el body JSON — vulnerable a DoS con payloads enormes | `backend/src/config/app.js` | `express.json({ limit: '100kb' })` |
| 7 | ALTA | Inputs de registro sin sanitizar — displayName y email llegaban sin validar | `backend/src/modules/auth/auth.controller.js` | Trim, límite de longitud y validación con regex |
| 8 | ALTA | `morgan('dev')` activo en producción — registraba IPs y rutas sensibles en logs | `backend/src/config/app.js` | `'combined'` en producción, `'dev'` solo en desarrollo |
| 9 | MEDIA | Sin Firestore Security Rules — cualquier usuario autenticado podía leer/escribir toda la base de datos | — | Añadido `backend/firestore.rules` con permisos por colección |
| 10 | MEDIA | FCM tokens acumulados infinitamente por usuario en Firestore | `backend/src/modules/auth/auth.service.js` | Máximo 5 tokens por usuario con rotación FIFO |
| 11 | MEDIA | Firebase client config hardcodeada — requiere Firebase App Check en producción | `mobile/services/firebase.config.ts` | Pendiente al configurar el proyecto real en Firebase Console |

### Pendientes para el equipo antes de ir a producción

1. **Desplegar Firestore Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Activar Firebase App Check** en la consola de Firebase para proteger
   las API keys del cliente mobile contra abuso.

3. **Monitorear TanStack** — no instalar ningún paquete `@tanstack/*` hasta
   que el equipo de TanStack publique el cierre oficial del incidente en
   https://tanstack.com/blog

4. **Configurar `ALLOWED_ORIGINS`** en el `.env` de producción con el
   dominio real de la app (no dejar el valor de ejemplo).

5. **Limpiar caché npm** en todas las máquinas de desarrollo que hayan
   ejecutado `npm install` entre el 31/03/2026 y el 13/05/2026:
   ```bash
   npm cache clean --force
   ```

---

## Actualización — 16 de Mayo 2026

### Correcciones de estabilidad y configuración

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Firebase Auth corregido para React Native** | `mobile/services/firebase.config.ts`, `mobile/metro.config.js` | Metro no resolvía la exportación `react-native` de `@firebase/auth`, causando que `getReactNativePersistence` fuera `undefined`. Se agregó `metro.config.js` con `unstable_conditionNames` para forzar la resolución correcta |
| **react-navigation actualizado a v7** | `mobile/package.json` | `@react-navigation/native` estaba fijado en `^6.1.9` pero `expo-router@6` requiere v7. La incompatibilidad causaba crash por `PreventRemoveContext` inexistente |
| **Arquitectura de auth centralizada** | `mobile/app/_layout.tsx`, `mobile/app/(auth)/_layout.tsx`, `mobile/app/(tabs)/_layout.tsx`, `mobile/hooks/useAuth.ts` | El listener de `onAuthStateChanged` se movió al root layout. Los sub-layouts ya no duplican lógica de auth ni declaran rutas inexistentes (`forgot-password`) |
| **API conecta al backend desde dispositivo** | `mobile/services/api.ts` | Se reemplazó `localhost:3000` por detección automática de IP del host via `expo-constants`, con fallback a IP local para modo tunnel |
| **Backend escucha en todas las interfaces** | `backend/src/server.js` | Cambiado de `listen(PORT)` a `listen(PORT, '0.0.0.0')` para aceptar conexiones desde dispositivos en la red local |
| **Tunnel habilitado para testing remoto** | `mobile/package.json` | Agregado `@expo/ngrok` como dependencia para `npx expo start --tunnel` |

### Levantar el proyecto para desarrollo

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env       # Configurar credenciales Firebase Admin SDK
npm ci
npm run dev                # Corre en http://0.0.0.0:3000

# Terminal 2 — Mobile (con tunnel para compartir)
cd mobile
npm ci
npx expo start --tunnel    # Genera URL compartible para Expo Go
```

> **Nota:** El tunnel permite que cualquier dispositivo cargue la app via
> Expo Go sin estar en la misma red. Sin embargo, las llamadas al API
> backend van directo a la IP local del desarrollador, por lo que los
> testers deben estar en la misma red WiFi o el backend debe estar
> desplegado en un servidor cloud.

### Guía para futuras modificaciones

1. **Agregar nuevas pantallas:** Crear el archivo en `mobile/app/` siguiendo
   la convención de expo-router (file-based routing) y registrarla en
   `mobile/app/_layout.tsx` como `<Stack.Screen name="ruta/archivo" />`

2. **Dependencias npm:** Usar siempre versiones fijadas sin `^` para
   dependencias críticas. Instalar con `npm ci` (no `npm install`).
   Verificar en https://socket.dev antes de agregar paquetes nuevos

3. **Variables de entorno:** Nunca commitear `.env`. Agregar nuevas
   variables a `.env.example` con valores placeholder

4. **Credenciales Firebase:** Los archivos `google-services.json` y
   `*-firebase-adminsdk-*.json` están en `.gitignore`. Cada desarrollador
   debe descargar los suyos desde Firebase Console

5. **Cambios en la IP de desarrollo:** Si cambia la red WiFi, actualizar
   la IP fallback en `mobile/services/api.ts` y `ALLOWED_ORIGINS` en
   `backend/.env`

---

## Actualización — 18 de Mayo 2026

### Nuevas funcionalidades implementadas

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Pantalla de selección de componentes** | `mobile/app/builder/[type].tsx` | Nueva pantalla dinámica que resuelve el error "Unmatched Route" al tocar cualquier slot en el Armado Personalizado. Muestra lista filtrable con imagen, marca, specs y precio de cada componente. Valida compatibilidad en tiempo real al seleccionar |
| **IP del API corregida** | `mobile/services/api.ts` | Fallback de IP local actualizado. Si cambias de red WiFi, editar la línea 14 con tu IP actual (ver sección "Cambio de red" más abajo) |
| **Tipo TypeScript de `auth`** | `mobile/services/firebase.config.ts` | Corregido error de tipo implícito `any` en la variable `auth` usando `ReturnType<typeof getAuth>` |
| **EAS + expo-updates** | `mobile/app.json`, `mobile/package.json` | Configuración de EAS Build y OTA updates añadida al proyecto |

### Scripts de datos iniciales (seed)

El proyecto incluye dos scripts para poblar la base de datos. Solo se deben correr **una vez** al configurar el proyecto por primera vez:

```bash
cd backend

# 1. Cargar los 43 componentes de hardware en Firestore
node seed-components.js

# 2. Crear el usuario administrador en Firebase Auth
node seed-admin.js
```

**Credenciales del administrador:**

| Campo | Valor |
|-------|-------|
| Email | `admin@zonapc.gt` |
| Contraseña | `Admin1234` |

> Los scripts requieren que el archivo `.env` esté configurado con las credenciales del Firebase Admin SDK.

### Componentes cargados en Firestore

| Tipo | Cantidad | Ejemplos |
|------|----------|---------|
| CPU | 5 | Ryzen 5 7600X, i7-13700K, Ryzen 3 5300G |
| GPU | 5 | RTX 4060, RTX 4070, RX 7600, RTX 4090 |
| RAM | 5 | DDR4 8/16/32GB, DDR5 16/32GB |
| Motherboard | 4 | AM4, AM5, LGA1700 (ATX y mATX) |
| Fuente | 5 | 450W a 1000W, Bronze/Gold |
| Almacenamiento | 5 | NVMe, SATA SSD, HDD hasta 2TB |
| Gabinete | 5 | Mini/Mid/Full Tower |
| Enfriamiento | 5 | Aire y líquido (AIO) |
| Periféricos | 4 | Monitor, teclado+mouse, headset |

### Cambio de red WiFi

Si un desarrollador cambia de red WiFi, la IP del backend cambia. Actualizar en dos lugares:

```bash
# 1. Obtener la nueva IP de tu Mac
ipconfig getifaddr en0

# 2. Editar mobile/services/api.ts línea 14
return 'TU_NUEVA_IP'; // IP local fallback

# 3. Editar backend/.env
ALLOWED_ORIGINS=http://localhost:8081,http://TU_NUEVA_IP:8081,http://TU_NUEVA_IP:3000
```

---

## Actualización — 21 de Mayo 2026

### Flujo completo de cotización y pago

Se implementó el ciclo de vida completo de una cotización, desde que el cliente la crea hasta que el pago es verificado y se genera una orden de ensamblaje automáticamente.

**Estados de una cotización:**

```
draft → confirmed → in_review → ready → accepted → payment_submitted → payment_verified
```

| Estado | Actor | Acción |
|--------|-------|--------|
| `draft` | Cliente | Crea la cotización con su build |
| `confirmed` | Cliente | Confirma que desea proceder |
| `in_review` | Admin | Asigna un vendedor; se notifica al cliente |
| `ready` | Vendedor | Marca la cotización como revisada y lista |
| `accepted` | Cliente | Acepta e ingresa dirección de entrega |
| `payment_submitted` | Cliente | Envía comprobante de pago (tarjeta o transferencia) |
| `payment_verified` | Vendedor | Verifica el pago → se crea la orden en ensamblaje automáticamente |

### Nuevas rutas del backend

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| `PATCH` | `/api/quotes/:id/accept` | Cliente | Acepta cotización + dirección de entrega |
| `POST` | `/api/quotes/:id/payment` | Cliente | Envía comprobante de pago |
| `POST` | `/api/quotes/:id/followup` | Vendedor | Envía notificación de seguimiento al cliente |
| `PATCH` | `/api/quotes/:id/ready` | Vendedor | Marca cotización como lista |
| `PATCH` | `/api/quotes/:id/verify-payment` | Vendedor | Verifica pago y crea orden |
| `GET` | `/api/quotes/vendor/assigned` | Vendedor | Lista cotizaciones asignadas al vendedor |
| `GET` | `/api/admin/vendors` | Admin | Lista todos los vendedores registrados |

### Nuevas pantallas móviles

| Pantalla | Ruta en la app | Rol |
|----------|---------------|-----|
| Flujo de aceptar cotización | `mobile/app/quote/[id].tsx` | Cliente |
| Flujo de pago | `mobile/app/quote/payment.tsx` | Cliente |
| Dashboard del vendedor | `mobile/app/vendor/dashboard.tsx` | Vendedor |
| Perfil de usuario | `mobile/app/profile.tsx` | Todos |
| Admin — Órdenes | `mobile/app/admin/orders.tsx` | Admin |
| Admin — Cotizaciones | `mobile/app/admin/quotes.tsx` | Admin |
| Admin — Inventario | `mobile/app/admin/inventory.tsx` | Admin |
| Admin — Entregas | `mobile/app/admin/deliveries.tsx` | Admin |
| Admin — Ingresos | `mobile/app/admin/revenue.tsx` | Admin |

### Mejoras al sistema de órdenes

- Las órdenes ahora se crean automáticamente desde una cotización cuando el vendedor verifica el pago (`createFromQuote`).
- Se agregó historial de estados (`stateHistory`) con timestamp y nota en cada transición.
- El estado inicial puede ser `assembling` cuando viene de pago verificado, o `pending` en otros casos.
- El administrador puede asignar técnico a una orden con `PATCH /api/admin/orders/:id/technician`.

### Script de seed para vendedor

Se agregó `backend/seed-vendor.js` para crear el usuario vendedor demo en Firebase Auth. Ejecutar **solo una vez** al configurar el proyecto:

```bash
cd backend
node seed-vendor.js
```

> **Nota de seguridad:** Las credenciales de este script son únicamente para el entorno de desarrollo. En producción, crear usuarios vendedor desde el panel de administración de la app.

| Campo | Valor (desarrollo) |
|-------|-------------------|
| Email | `vendedor@zonapc.gt` |
| Contraseña | `Vendedor2026` |
| Rol | `vendor` |

### Corrección de seguridad incluida en esta actualización

- **`verifyPayment`**: Se agregó la validación de que el vendedor que verifica el pago sea el asignado a esa cotización (`quote.vendorId !== vendorId`), igual que ya lo hacían `markReady` y `sendFollowup`.
- **`.npmrc` eliminado**: Se eliminó el archivo `.npmrc` de la raíz ya que `package-lock.json` está presente y activo en cada sub-proyecto (`backend/` y `mobile/`).

### Nuevas dependencias del sistema de tipos (mobile)

Se amplió `mobile/types/index.ts` con:
- Tipos `Quote`, `Order`, `Build`, `PcCategory` actualizados con todos los estados del flujo.
- Tipo `Vendor` para el panel de administración.

---

## Documentación

- [Arquitectura del Backend](backend/README.md)
- [Guía de la App Móvil](mobile/README.md)
- [Modelos de Base de Datos](docs/database.md)
- [Flujo de Navegación](docs/navigation.md)
