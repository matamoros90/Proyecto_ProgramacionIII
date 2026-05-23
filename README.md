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

## Actualización — 22 de Mayo 2026

### Correcciones de autenticación, roles y estabilidad

Esta sesión corrigió una serie de bugs críticos relacionados con la gestión de roles (admin/vendedor/cliente), almacenamiento de datos de perfil, y errores en cascada que ocurrían al iniciar y cerrar sesión.

---

### Bugs corregidos

#### 1. Admin y vendedor llegaban a la vista de cliente al iniciar sesión

**Causa:** El hook `useAuth.ts` tenía un `useEffect` que llamaba a `GET /api/auth/profile` desde cada componente que lo usara. Con varias pantallas montadas simultáneamente, se disparaban múltiples llamadas al API en paralelo, agotando el rate limit (`429 Too Many Requests`) y creando condiciones de carrera.

**Corrección:**
- Se eliminó el `useEffect` de `mobile/hooks/useAuth.ts`. Ahora es un lector puro del store de Zustand.
- La carga del perfil se centralizó en `mobile/app/_layout.tsx` (una sola llamada por cambio de sesión).

| Archivo | Cambio |
|---------|--------|
| `mobile/hooks/useAuth.ts` | Eliminado `useEffect` con llamada a `/auth/profile` |
| `mobile/app/_layout.tsx` | Añadido `useEffect` que carga el perfil una sola vez al cambiar `firebaseUser.uid` |

---

#### 2. Perfil del admin se creaba con rol `client`

**Causa:** Al no existir documento en Firestore para el usuario admin, `GET /api/auth/profile` retornaba 404. El frontend no podía leer el rol, por lo que `isAdmin` era `false`.

**Corrección:** El controlador `getProfile` ahora auto-crea el documento de perfil cuando no existe, leyendo los custom claims de Firebase Auth (`req.user.admin`, `req.user.vendor`) para asignar el rol correcto.

| Archivo | Cambio |
|---------|--------|
| `backend/src/modules/auth/auth.controller.js` | Auto-creación del perfil con rol derivado de custom claims |

---

#### 3. Guardar datos personales y tarjeta fallaba con "Error interno del servidor"

**Causa A — Firestore `update` falla si el documento no existe:** El servicio usaba `.update()` sobre documentos que podían no existir aún.

**Corrección:** Cambiado a `.set(data, { merge: true })` en `backend/src/modules/auth/auth.service.js`, que funciona tanto si el documento existe como si no.

**Causa B — Campo `savedCard` ignorado en el controlador:** `updateProfile` solo leía `{ displayName, address }` del body; `savedCard` llegaba pero nunca se pasaba al servicio.

**Corrección:** Se añadió `savedCard` al destructuring y al `hasChanges` guard en `auth.controller.js`.

| Archivo | Cambio |
|---------|--------|
| `backend/src/modules/auth/auth.service.js` | `.update()` → `.set({}, { merge: true })` |
| `backend/src/modules/auth/auth.controller.js` | Añadido `savedCard` al `updateProfile` |

---

#### 4. Datos de tarjeta de crédito — implementación segura (PCI-DSS básico)

Se implementó un flujo de tarjeta de crédito en `mobile/app/profile.tsx` siguiendo las buenas prácticas de la industria:

- Validación con **algoritmo de Luhn** en el cliente antes de enviar.
- Detección automática de **Visa / Mastercard** por el primer dígito.
- El CVV **nunca se almacena** — solo se usa para validación visual en el cliente.
- El backend **solo recibe y guarda** `{ brand, last4, cardHolder, expiryMonth, expiryYear }`.
- Se valida que la fecha de expiración sea futura.

| Archivo | Cambio |
|---------|--------|
| `mobile/app/profile.tsx` | Sección completa de tarjeta con Luhn, detección de marca y validación de fecha |
| `mobile/types/index.ts` | Nuevo tipo `SavedCard`; campo `savedCard?: SavedCard` en `User` |

---

#### 5. Botón de atrás del admin crasheaba al cerrar sesión

**Causa:** El `useEffect` del dashboard admin se disparaba cuando `isAdmin` cambiaba a `false` durante el logout (el perfil se limpiaba), mostraba la alerta "Sin acceso" y llamaba `router.back()` con la pila de navegación vacía.

**Corrección:**
- Se reemplazó el botón de atrás con un botón de **cerrar sesión** con diálogo de confirmación.
- El `useEffect` ahora tiene el guard `if (!profileReady || !isAuthenticated) return;` para no ejecutarse durante transiciones de logout.
- La redirección usa `router.replace('/(auth)/login')` en lugar de `router.back()`.

| Archivo | Cambio |
|---------|--------|
| `mobile/app/admin/dashboard.tsx` | Guard en `useEffect`, logout con confirmación, `router.replace` |
| `mobile/app/vendor/dashboard.tsx` | Mismas correcciones que el dashboard admin |

---

#### 6. Segundo inicio de sesión como admin llegaba a vista cliente

**Causa:** Al cerrar sesión, `clearProfile()` llamaba `setProfile(null)` que dejaba `profileReady: true`. En la siguiente apertura de sesión, había una ventana breve donde `profileReady: true` + `isAdmin: false` hacía que la app mostrara el flujo de cliente antes de cargar el perfil real.

**Corrección:** Se añadió la acción `clearProfile()` en `mobile/stores/authStore.ts` que establece `{ profile: null, profileReady: false }`, indicando que el perfil aún no ha sido cargado (a diferencia de `setProfile(null)` que indica "cargado pero nulo").

El componente `mobile/app/(tabs)/index.tsx` muestra un spinner mientras `isAuthenticated && !profileReady` y solo redirige cuando `profileReady === true`.

| Archivo | Cambio |
|---------|--------|
| `mobile/stores/authStore.ts` | Nueva acción `clearProfile()` con `profileReady: false` |
| `mobile/app/(tabs)/index.tsx` | Spinner durante carga; `useEffect` guarded por `profileReady` |

---

#### 7. Error 500 en `GET /api/tutorials`

**Causa:** La consulta Firestore usaba `.where('published', '==', true).orderBy('order', 'asc')`, lo que requiere un índice compuesto que no estaba creado en la consola de Firebase.

**Corrección:** Se eliminó `.orderBy()` de la consulta Firestore. Los resultados ahora se ordenan en memoria con `.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))`.

| Archivo | Cambio |
|---------|--------|
| `backend/src/modules/tutorials/tutorials.service.js` | Ordenamiento en memoria en lugar de `orderBy` de Firestore |

---

#### 8. Rate limit demasiado estricto en `/api/auth`

**Causa:** El `authLimiter` estaba en `max: 10` peticiones por 15 minutos, insuficiente para la carga normal de la app (login + carga de perfil + múltiples pantallas).

**Corrección:** Aumentado a `max: 20` peticiones por 15 minutos.

| Archivo | Cambio |
|---------|--------|
| `backend/src/config/app.js` | `authLimiter.max` de 10 → 20 |

---

### Resumen de archivos modificados

| Archivo | Tipo de cambio |
|---------|---------------|
| `mobile/stores/authStore.ts` | Nueva acción `clearProfile()` con `profileReady: false` |
| `mobile/hooks/useAuth.ts` | Eliminado `useEffect`; ahora es lector puro del store |
| `mobile/app/_layout.tsx` | Carga centralizada del perfil |
| `mobile/app/(tabs)/index.tsx` | Spinner mientras carga; redirección guardada por `profileReady` |
| `mobile/app/(tabs)/_layout.tsx` | Limpieza menor de tabs |
| `mobile/app/admin/dashboard.tsx` | Guard de `useEffect`, botón logout, `router.replace` |
| `mobile/app/vendor/dashboard.tsx` | Guard de `useEffect`, botón logout, `router.replace` |
| `mobile/app/profile.tsx` | Tarjeta de crédito segura, email desde Firebase fallback, logout |
| `mobile/app/(auth)/login.tsx` | Ajuste menor de flujo |
| `mobile/app/(auth)/register.tsx` | Ajuste menor de flujo |
| `mobile/services/api.ts` | Ajuste de interceptores |
| `mobile/types/index.ts` | Nuevo tipo `SavedCard` |
| `backend/src/config/app.js` | `authLimiter` de 10 → 20 |
| `backend/src/modules/auth/auth.controller.js` | Auto-creación de perfil; `savedCard` en `updateProfile` |
| `backend/src/modules/auth/auth.service.js` | `.update()` → `.set({merge:true})`; sanitización de `savedCard` |
| `backend/src/modules/tutorials/tutorials.service.js` | Ordenamiento en memoria; eliminado `orderBy` de Firestore |

---

## Actualización — 22 de Mayo 2026 (tarde)

### Rediseño visual completo — tema claro profesional

Se reemplazó la paleta "gamer/neón" por un tema claro profesional apto para presentaciones.

#### Paleta de colores (`mobile/constants/colors.ts`)

| Elemento | Antes | Ahora |
|----------|-------|-------|
| Fondo | Negro `#0A0A0F` | Crema cálida `#F2F0EA` |
| Superficies | Oscuro `#12121A` | Blanco `#FFFFFF` |
| Color primario | Cyan neón `#00D4FF` | Azul intenso `#2563EB` |
| Color secundario | Magenta neón `#7B2FBE` | Violeta `#6D28D9` |
| Acento | Verde neón `#00FF88` | Ámbar `#D97706` |
| Texto principal | Blanco `#FFFFFF` | Casi negro `#111827` |

#### Pantallas actualizadas

Se actualizaron **20 pantallas** en total:
- Todos los headers: gradiente oscuro `['#12121A', '#0A0A0F']` → azul pálido `['#DBEAFE', '#EFF6FF']`
- Pantallas de auth (login/register): mismo gradiente claro
- `StatusBar`: `style="light"` → `style="dark"` con fondo `#EFF6FF`
- `userInterfaceStyle` en `app.json`: `dark` → `light`
- Tarjetas métricas de dashboards: fondo azul pálido `#EEF4FF` con texto oscuro

---

### Nuevo ícono y splash screen (`mobile/assets/images/`)

Se generaron todos los assets visuales del app desde cero (el placeholder de Expo fue reemplazado):

| Asset | Dimensión | Descripción |
|-------|-----------|-------------|
| `icon.png` | 1024×1024 | "Z" azul `#2563EB` sobre fondo navy `#0A1223`, nodos de circuito en esquinas, efecto glow |
| `adaptive-icon.png` | 1024×1024 | Misma Z sin fondo — Android adaptive icon |
| `splash.png` | 1284×2778 | Ícono centrado sobre fondo crema `#F2F0EA` |
| `notification-icon.png` | 96×96 | Z blanca sobre transparente para notificaciones |
| `favicon.png` | 48×48 | Versión mínima para web |

El splash screen fue **eliminado de la secuencia de inicio** — la app arranca directo a la pantalla de login sin ninguna pantalla intermedia. Cambios:
- `app.json`: `splash.image` eliminado, solo queda `backgroundColor: "#F2F0EA"`
- `_layout.tsx`: `SplashScreen.hideAsync()` llamado inmediatamente al montar el root layout

---

### Preparación para deploy en Railway (`backend/railway.toml`)

Se preparó el backend para despliegue en la nube. Esto elimina la necesidad de que cada compañero configure credenciales de Firebase y corra el backend localmente.

**Archivo creado:** `backend/railway.toml`
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node src/server.js"
healthcheckPath = "/health"
```

**`mobile/services/api.ts` mejorado:**
- Cuando Expo corre en modo `--tunnel` (sin IP local) → usa automáticamente la URL de Railway
- Cuando corre en red local (LAN) → detecta la IP y usa el backend local
- La URL de Railway se configura en la línea 13 del archivo

#### Pasos para hacer el deploy (solo el responsable del backend)

1. Ir a [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Seleccionar el repo → **Root Directory:** `backend`
3. En **Variables** agregar todas las variables del `.env` real
4. Copiar la URL pública generada (ej: `https://zonapc-backend.up.railway.app`)
5. En `mobile/services/api.ts` línea 13, reemplazar `RAILWAY_URL` con esa URL + `/api`

#### Resultado para los compañeros tras el deploy

```bash
git pull origin main
cd mobile
npm ci
npx expo start --tunnel   # ← único comando necesario
```

No necesitan correr el backend, no necesitan credenciales de Firebase, no necesitan estar en la misma WiFi.

---

## Documentación

- [Arquitectura del Backend](backend/README.md)
- [Guía de la App Móvil](mobile/README.md)
- [Modelos de Base de Datos](docs/database.md)
- [Flujo de Navegación](docs/navigation.md)
