# ZonaPc Builder

Plataforma inteligente para cotización, personalización y ensamblaje de computadoras.

---

> ## AVISO IMPORTANTE — Antes de modificar el proyecto
>
> Este proyecto es un trabajo académico colaborativo en producción para entrega final.
> Para **no arruinar el código que ya funciona**, sigue estas reglas estrictamente:
>
> 1. **NUNCA** trabajes directamente sobre `main`. Crea tu propia rama:
>    ```bash
>    git pull origin main
>    git checkout -b feat/mi-mejora
>    ```
> 2. **Antes de cada sesión** ejecuta `git pull origin main` para tener los cambios más recientes.
> 3. **Antes de hacer push** levanta el proyecto y verifica que TODO siga funcionando (login, crear cotización, panel admin/vendor, etc.).
> 4. **NO elimines** archivos, carpetas o configuraciones sin consultar con el equipo.
> 5. **NO commitees**: `.env`, `node_modules/`, `mobile/android/`, `mobile/ios/`, `mobile/.env`, `google-services.json` del root.
> 6. **NO uses** `git push --force` en `main` bajo ninguna circunstancia.
> 7. **NO modifiques** lógica de negocio crítica (compatibilidad, recomendaciones, flujo de cotización/pago) sin discutirlo primero.
> 8. **NO toques** los archivos de configuración nativos: `app.json`, `eas.json`, `google-services.json` — alteran builds de EAS y autenticación Firebase.
> 9. Si algo se rompe, **no borres tu trabajo** — pide ayuda antes. Siempre se puede revertir con `git`.
> 10. Si vas a instalar paquetes nuevos usa `npm ci` (no `npm install`) para respetar el `package-lock.json`.
>
> Lee la sección **[Guía de inicio para compañeros del equipo](#guía-de-inicio-para-compañeros-del-equipo)** al final del README antes de empezar.

---

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

## Actualización — 23 de Mayo 2026

### Nuevas funcionalidades: gestión de empleados y cotizaciones del vendedor

#### Panel del vendedor — Archivar y eliminar cotizaciones

Se añadieron dos acciones sobre cotizaciones en `mobile/app/vendor/dashboard.tsx`:

| Acción | Cuándo | Qué hace |
|--------|--------|----------|
| **Archivar** | Estado `payment_verified` | Oculta la cotización del panel del vendedor. Los datos **se conservan** en Firestore (la cotización generó ingresos). |
| **Eliminar** | Estados `in_review`, `ready`, `accepted` | Borra el documento de Firestore por completo. La cotización **desaparece también de la vista del cliente** (nunca generó ingresos). No se permite si el cliente ya envió pago. |

Nuevas rutas del backend:

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| `PATCH` | `/api/quotes/:id/archive` | Vendedor/Admin | Marca la cotización como archivada (`archived: true`) |
| `DELETE` | `/api/quotes/:id` | Vendedor/Admin | Elimina el documento de cotización de Firestore |

Archivos modificados:

| Archivo | Cambio |
|---------|--------|
| `mobile/app/vendor/dashboard.tsx` | Handlers `handleArchive` y `handleDelete`; botones en cada tarjeta de cotización |
| `mobile/services/orders.service.ts` | Nuevas funciones `archiveVendorQuote` y `deleteVendorQuote` |
| `backend/src/modules/quotes/quotes.routes.js` | Rutas `PATCH /:id/archive` y `DELETE /:id` |
| `backend/src/modules/quotes/quotes.controller.js` | Funciones `archiveQuote` y `deleteQuoteByVendor` |
| `backend/src/modules/quotes/quotes.service.js` | Lógica `archiveQuote` y `deleteQuote`; `getByVendor` filtra archivadas |

---

#### Panel de administración — Gestionar Empleados

Se renombró la sección "Gestionar Vendedores" a **"Gestionar Empleados"** en toda la interfaz y se agregó el botón de eliminar empleado.

| Cambio | Archivo |
|--------|---------|
| Título, formulario y lista renombrados ("Empleados") | `mobile/app/admin/vendors.tsx` |
| Nav item renombrado ("Gestionar Empleados") | `mobile/app/admin/dashboard.tsx` |
| Botón eliminar (ícono papelera) con confirmación en cada fila | `mobile/app/admin/vendors.tsx` |
| Nueva función `handleDeleteVendor(uid, name)` | `mobile/app/admin/vendors.tsx` |
| Nueva ruta `DELETE /api/admin/vendors/:uid` | `backend/src/modules/admin/admin.routes.js` |
| Nuevo handler `deleteVendor` | `backend/src/modules/admin/admin.controller.js` |
| Nueva función `deleteVendorUser(uid)` | `backend/src/modules/auth/auth.service.js` |

Al eliminar un empleado:
1. Se borra su cuenta de Firebase Auth.
2. Se borra su perfil de Firestore.
3. Sus cotizaciones activas (`in_review`, `ready`, `accepted`) se liberan automáticamente al grupo de disponibles (estado → `confirmed`, `vendorId` → `null`) mediante un batch write atómico.

---

### Auditoría de seguridad — 23 de Mayo 2026

Se realizó un análisis de seguridad enfocado en el manejo de datos bancarios y datos personales de clientes.

#### Hallazgos y correcciones

| # | Severidad | Problema | Archivo | Corrección |
|---|-----------|---------|---------|------------|
| 1 | **CRÍTICO** | El número completo de tarjeta (16 dígitos) se enviaba al backend en el flujo de pago de cotización | `mobile/app/quote/payment.tsx` | El cliente extrae solo los últimos 4 dígitos antes de llamar al API. El número completo **nunca sale del dispositivo**. |
| 2 | **MEDIO** | Campo `bankRef` sin validación de longitud máxima en el backend | `backend/src/modules/quotes/quotes.controller.js` | Validación explícita: máximo 100 caracteres. Error 400 si se excede. |
| 3 | **MEDIO** | Backend aceptaba cualquier string como `cardNumber` y lo recortaba él mismo | `backend/src/modules/quotes/quotes.controller.js` | El backend ahora recibe `cardLast4` (ya recortado) y valida que sea exactamente 4 dígitos numéricos. |
| 4 | **BAJO** | `maxLength` del campo de referencia bancaria no estaba limitado en el formulario | `mobile/app/quote/payment.tsx` | Añadido `maxLength={100}` al `TextInput`. |

#### Lo que ya estaba correcto (confirmado)

| Área | Estado |
|------|--------|
| CVV nunca viaja al backend | ✓ Solo se valida en cliente, nunca se serializa |
| Perfil — tarjeta guardada | ✓ `profile.tsx` ya enviaba solo `last4`, `brand`, `cardHolder`, `expiryMonth`, `expiryYear` |
| Firebase private key | ✓ `backend/.env` está en `.gitignore`; nunca se sube a git |
| Firestore Security Rules | ✓ Reglas por colección: clientes solo leen sus datos, órdenes son immutables por cliente, notificaciones solo las escribe el servidor |
| CORS | ✓ Lista blanca de orígenes via `ALLOWED_ORIGINS` en `.env` |
| Rate limiting | ✓ 100 req/15 min global; 20 req/15 min en `/api/auth` |
| Tamaño del body | ✓ Límite de 100 kb (`express.json({ limit: '100kb' })`) |
| Contraseñas | ✓ Firebase Auth las hashea; el backend nunca las almacena |
| Inyección NoSQL | ✓ Firestore SDK usa queries tipadas, no strings concatenados |
| Elevación de roles | ✓ Firestore rules bloquean cambios a `role` y `uid` desde el cliente |

#### Pendientes de producción (sin cambio en código, requieren acción en consolas)

1. **Desplegar Firestore Security Rules** tras cada cambio:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. **Activar Firebase App Check** en la consola de Firebase para proteger las API keys del cliente.
3. **HTTPS obligatorio en producción** — Railway proporciona HTTPS automático; nunca exponer el backend en HTTP puro desde un dominio público.
4. **Reemplazar el flujo de tarjeta por un procesador de pagos real** (Stripe, PayPal, Mercado Pago) antes de procesar pagos reales. El flujo actual es una simulación: solo almacena los últimos 4 dígitos y no realiza cargos reales.

---

#### Corrección de disponibilidad — Backend no reflejaba cambios tras reinicio

**Causa:** El proceso `node src/server.js` iniciado antes de que se guardaran los cambios de la sesión seguía corriendo con el código antiguo (las rutas `DELETE` no estaban registradas en memoria), lo que generaba errores 404 al intentar eliminar cotizaciones o empleados.

**Corrección inmediata:** Matar el proceso viejo y reiniciar con el código actualizado.

**Recomendación:** Usar `npm run dev` (nodemon) durante desarrollo — reinicia automáticamente al guardar cualquier archivo del backend.

---

## Actualización — 23 de Mayo 2026 (Otto)

### Compatibilidad en tiempo real, imágenes reales y nuevo logotipo

---

### 1. Sistema de compatibilidad en tiempo real (`mobile/app/builder/[type].tsx`)

Se reescribió completamente la pantalla de selección de componentes para bloquear automáticamente las piezas incompatibles con el build actual.

**Reglas implementadas:**

| Combinación | Validación |
|-------------|-----------|
| CPU ↔ Motherboard | El socket del componente debe coincidir con el de la placa base ya seleccionada |
| RAM ↔ Motherboard | El tipo DDR (DDR4 / DDR5) debe coincidir con lo que soporta la placa |
| Cooling ↔ CPU | `cooling.maxTdp` debe ser mayor o igual al `cpu.tdp` |
| Case ↔ Motherboard | ATX soporta todos; mATX soporta mATX e ITX; ITX solo soporta ITX |

**Comportamiento visual:**
- Componentes **incompatibles**: opacidad 35%, deshabilitados, badge rojo "Incompatible", ícono candado, razón en rojo.
- Componentes **compatibles**: comportamiento normal sin cambios.
- Subtítulo muestra: *"X compatibles de Y opciones"*.

| Archivo | Cambio |
|---------|--------|
| `mobile/app/builder/[type].tsx` | Función `getIncompatibleReason()` con 4 reglas; UI diferenciada por estado |

---

### 2. Imagen real del componente en el build (`mobile/app/builder/custom.tsx`)

La pantalla de resumen del build ahora muestra la imagen real del componente (campo `image` de Firestore) en lugar del ícono genérico.

- Si el componente tiene imagen → miniatura 56×56 con `resizeMode="contain"`.
- Si no tiene imagen → el ícono de categoría anterior (sin cambio de comportamiento).

| Archivo | Cambio |
|---------|--------|
| `mobile/app/builder/custom.tsx` | Añadida imagen real por componente; estilo `componentThumb` |

---

### 3. Nuevo logotipo en la pantalla de login (`mobile/app/(auth)/login.tsx`)

Se reemplazó el ícono genérico de hardware por el logotipo oficial de ZonaPc Builder.

- Asset: `mobile/assets/images/logo.png` (pin ZPC — logo oficial del proyecto)
- Dimensión en pantalla: 150×150 con fondo transparente.

| Archivo | Cambio |
|---------|--------|
| `mobile/assets/images/logo.png` | Nuevo archivo — logotipo oficial ZPC |
| `mobile/app/(auth)/login.tsx` | `<Image>` en lugar de `<Ionicons>`; estilo `logoImage` |

---

### 4. Compatibilidad con Expo Go (`mobile/app.json`)

Se eliminaron configuraciones propias de EAS Build que rompían la carga en Expo Go:

| Propiedad eliminada | Motivo |
|---------------------|--------|
| `owner` | Forzaba autenticación de cuenta Expo en modo interactivo |
| `runtimeVersion` | Generaba versión `"1.0.0"` en lugar de `exposdk:54.0.0`, bloqueando Expo Go SDK 54 |
| `updates.url` | Activaba el módulo nativo `expo-updates` que intentaba descargar una OTA inexistente |
| `extra.eas.projectId` | Mismo efecto que `updates.url` — activa descarga remota automáticamente |
| `googleServicesFile` (android/ios) | No requerido para Expo Go; solo para builds nativos con EAS |

Se añadió `"updates": { "enabled": false }` para deshabilitar explícitamente OTA en desarrollo.

---

### 5. Conectividad del backend via Cloudflare Tunnel

Cuando el teléfono está en LTE (sin acceso a la red local), la app usa un túnel de Cloudflare para alcanzar el backend.

**`mobile/services/api.ts` — lógica de selección de URL:**
- Red local (LAN, IP detectada via `Constants.expoConfig.hostUri`) → `http://<IP>:3000/api`
- Modo tunnel / LTE → URL de Cloudflare (línea 11 del archivo)

> **Importante:** La URL de Cloudflare cambia cada vez que se reinicia el túnel. Al iniciar una nueva sesión de desarrollo con LTE, actualizar la constante `RAILWAY_URL` en `mobile/services/api.ts` línea 11 con la nueva URL generada por `cloudflared tunnel`.

**Comando para levantar el backend con túnel:**
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Túnel Cloudflare (expone puerto 3000)
cloudflared tunnel --url http://localhost:3000

# Terminal 3 — Expo
cd mobile && npx expo start --tunnel
```

---

### Resumen de archivos modificados

| Archivo | Cambio |
|---------|--------|
| `mobile/app.json` | Eliminadas propiedades de EAS; `updates.enabled: false` |
| `mobile/services/api.ts` | URL de Cloudflare; detección automática LAN vs tunnel |
| `mobile/app/builder/[type].tsx` | Compatibilidad en tiempo real (socket, DDR, TDP, form factor) |
| `mobile/app/builder/custom.tsx` | Imagen real del componente seleccionado |
| `mobile/app/(auth)/login.tsx` | Nuevo logotipo oficial |
| `mobile/assets/images/logo.png` | Logotipo oficial ZPC (nuevo archivo) |
| `backend/src/config/app.js` | CORS abierto en modo development para túneles y Expo Go |

---

## Actualización — 23 de Mayo 2026 (tarde)

### Flujo libre de cotizaciones — cualquier vendedor puede tomarlas

#### Problema resuelto

Las cotizaciones que creaba el cliente quedaban en estado `draft` de forma permanente porque no existía botón "confirmar" en la app. El admin las veía (su vista muestra todos los estados), pero los vendedores nunca podían verlas porque solo tienen acceso a cotizaciones en estado `confirmed`.

#### Cambios aplicados

**Backend — `backend/src/modules/quotes/quotes.service.js`**

| Función | Cambio |
|---------|--------|
| `create()` | Estado inicial cambiado de `draft` → `confirmed`. Llama a `sendToAllVendors()` inmediatamente para notificar a todos los empleados de ventas. |
| `claimQuote()` | Después de la transacción atómica, busca el `displayName` del vendedor en Firestore y lo guarda como `vendorName` en el documento de la cotización. |
| `assignVendor()` | Igual que `claimQuote`: guarda `vendorName` cuando el admin asigna manualmente. |

**Flujo actualizado:**

```
Cliente crea cotización → confirmed (todos los vendedores la ven y reciben notificación)
Cualquier vendedor toca "Tomar cotización" → in_review (solo él la gestiona desde ese momento)
```

> La asignación manual por parte del admin sigue funcionando como antes para casos donde el admin prefiere asignar directamente.

**Mobile — nombre del empleado visible en todas las vistas**

| Archivo | Cambio |
|---------|--------|
| `mobile/types/index.ts` | Campo `vendorName?: string` añadido al tipo `Quote` |
| `mobile/app/admin/quotes.tsx` | Tag del empleado muestra el nombre completo (ej: `"Juan García"`) en lugar del ID recortado (`"VND-A4B2"`) |
| `mobile/app/quote/[id].tsx` | Estado `in_review` en la vista del cliente muestra: `"Juan García está revisando tu cotización."` |

---

## Actualización — 26 de Mayo 2026

### Cesta de Compra, Preset Builder Interactivo y Flujo de Compra Directa

Se integraron de forma completa mejoras en la experiencia de usuario (UX) del menú principal, la personalización avanzada de ensambles y el bypass de aprobaciones de vendedor para compras directas.

#### Resumen de Cambios Aplicados

| Cambio | Archivos Modificados | Detalle |
|--------|----------------------|---------|
| **Menú Principal Simplificado** | `mobile/app/(tabs)/index.tsx` | Se removió el desglose de componentes inline al expandir una categoría. En su lugar, ahora se muestra únicamente la explicación y el botón premium **"Armar Computadora"** con el color temático correspondiente. |
| **Corrección de Márgenes y Escala** | `mobile/app/(tabs)/index.tsx` | Modificamos las interpolaciones de escala del scroll vertical para que las tarjetas de categorías se mantengan al 100% de su tamaño durante las transiciones, aprovechando el 100% de los márgenes laterales futuristas de la pantalla. |
| **Nueva Pantalla Preset Builder Interactivo** | `mobile/app/builder/preset.tsx`, `mobile/app/_layout.tsx` | Pantalla dedicada de ensamble que inicializa `builderStore` con las piezas predefinidas del preset seleccionado. Permite a los usuarios tocar cualquier componente para abrir el selector oficial y **cambiarlo por cualquier pieza compatible y con stock en el inventario real**, actualizando precios y totalizadores en tiempo real. |
| **Bypass de Compra Directa sin Esperas** | `backend/src/modules/quotes/quotes.service.js` | Modificamos `acceptQuote` en el backend para permitir compras inmediatas. El cliente ahora puede aceptar e ingresar dirección de entrega/pago para cotizaciones tanto en estado `'ready'` como `'confirmed'` (creadas directamente desde la cesta o el builder). |
| **Asignación y Reclamación de Pedidos Pagados** | `backend/src/modules/quotes/quotes.service.js` | Se ajustó la transacción de `claimQuote` en el backend para permitir a los empleados reclamar cotizaciones que ya se encuentran en estado de pago enviado (`'payment_submitted'`) sin resetear su estado, facilitando que el vendedor verifique los comprobantes de pago de forma inmediata. |
| **Rediseño Premium del Panel del Administrador** | `mobile/app/admin/dashboard.tsx` | Se integró scroll animado nativo (`Animated.ScrollView`) con interpolaciones fluidas y transiciones sutiles de escala y desvanecimiento en el dashboard administrativo. |
| **Imágenes Temáticas y Gestión de Personal** | `mobile/app/admin/dashboard.tsx`, `mobile/app/admin/vendors.tsx` | Se aplicaron imágenes de fondo de Unsplash a todos los cuadros métricos y banners de gestión con capas de degradado translúcidas. Se renombró la sección de empleados a **"Gestión de Personal"** de forma coherente en todo el flujo. |

---

## Actualización — 27 de Mayo 2026 (Otto)

### Rediseño visual premium — sistema de temas dual, corrección de contraste y mejoras al builder

---

### 1. Sistema de temas dual Oscuro / Claro (`mobile/constants/colors.ts`, `mobile/contexts/ThemeContext.tsx`)

Se implementó un sistema de temas completo con persistencia entre sesiones.

**Nuevos archivos:**

| Archivo | Descripción |
|---------|-------------|
| `mobile/contexts/ThemeContext.tsx` | `ThemeProvider` + hook `useTheme()` — expone `colors`, `isDark` y `toggleTheme()` |

**`mobile/constants/colors.ts` reescrito:**

| Paleta | `DarkTheme` | `LightTheme` |
|--------|-------------|--------------|
| Fondo | `#0B0F17` | `#F4F6F8` |
| Superficie | `#151A23` | `#FFFFFF` |
| Primario | `#3B82F6` | `#2563EB` |
| Secundario | `#8B5CF6` | `#7C3AED` |
| Acento | `#F59E0B` | `#D97706` |
| Texto principal | `#F1F5F9` | `#0F172A` |

- El tema oscuro es el predeterminado (`Colors = DarkTheme`).
- Persiste entre sesiones usando `AsyncStorage` con la clave `@zonapc_theme`.
- `mobile/app/_layout.tsx` envuelve toda la app en `<ThemeProvider>` y adapta el `StatusBar` automáticamente.
- `mobile/app/(tabs)/_layout.tsx` consume `useTheme()` para los colores de la barra de navegación inferior.

**Helpers añadidos en `mobile/constants/theme.ts`:**
```typescript
glowShadow(color, radius?, opacity?)  // sombra de neón reutilizable
cardShadow(isDark)                     // sombra de tarjeta adaptativa
```

---

### 2. Corrección global de contraste — headers oscuros en toda la app

**Problema:** 20+ pantallas tenían el header con gradiente azul claro `['#DBEAFE', '#EFF6FF']` mientras que `Colors.textPrimary` apuntaba a `#F1F5F9` (blanco del `DarkTheme`). Resultado: texto invisible.

**Solución:** El gradiente de header en **todas las pantallas** fue cambiado a `['#060B14', '#0D1528']` (azul noche profundo), que coincide con el fondo oscuro del login y da contraste óptimo para texto blanco.

**Pantallas corregidas (28 en total):**

| Grupo | Pantallas |
|-------|-----------|
| Builder | `custom.tsx`, `budget.tsx`, `[type].tsx`, `preset.tsx` |
| Tabs | `quotes.tsx`, `orders.tsx`, `learn.tsx`, `builder.tsx` |
| Cotizaciones | `quote/[id].tsx`, `quote/payment.tsx` |
| Órdenes | `order/[id].tsx` |
| Perfil | `profile.tsx` |
| Admin | `dashboard.tsx`, `deliveries.tsx`, `inventory.tsx`, `orders.tsx`, `quotes.tsx`, `revenue.tsx`, `vendors.tsx` |
| Vendedor | `vendor/dashboard.tsx` |
| Auth | `register.tsx` (fondo completo → oscuro, coherente con login) |

---

### 3. Pantalla de inicio — rediseño completo (`mobile/app/(tabs)/index.tsx`)

| Cambio | Detalle |
|--------|---------|
| **Tarjetas de categoría con imagen** | `BuilderCard` con imagen de fondo, degradado overlay y animación de escala al presionar |
| **Navegación directa al preset** | Al tocar una tarjeta de categoría se va directo a `/builder/preset` sin botón intermedio "Armar Computadora" |
| **Toggle "Ver todo" / "Ver menos"** | Sección de acciones rápidas colapsa/expande las categorías |
| **Avatar → perfil** | El avatar del header ahora es `TouchableOpacity` que navega a `/profile` |
| **Barra de búsqueda eliminada** | Diseño más limpio; búsqueda disponible dentro de cada selector de componentes |
| **Dashboard de estadísticas eliminado** | Se removió el widget de "PCs armadas hoy / disponibilidad / estado del sistema" |
| **Exportaciones públicas** | `CATEGORIES`, `CategoryItem`, `ComponentDetails` exportadas para uso en `builder/preset.tsx` |

---

### 4. Pantalla de login — rediseño completo (`mobile/app/(auth)/login.tsx`)

| Elemento | Descripción |
|----------|-------------|
| Fondo | Gradiente oscuro `['#060B14', '#0D1528', '#130B2B', '#0A0F1E']` |
| Orbes decorativos | 3 esferas de luz translúcidas (azul, violeta, pequeña) posicionadas absolutamente |
| Logo | `assets/images/logo.png` preservado (150×150) |
| Card glassmorphism | `rgba(255,255,255,0.05)` con borde sutil y sombra profunda |
| Botón de ingreso | Gradiente `['#3B82F6', '#6D28D9']` con ícono de flecha |
| Checkbox "Recordarme" | Animado con Ionicons, estado persistido en la UI |
| Social buttons | Google / Facebook / Apple con Alert "Próximamente" |

---

### 5. Preset Builder — imágenes reales de componentes (`mobile/app/builder/preset.tsx`)

El selector de ensambles predefinidos ahora muestra imágenes reales en lugar de íconos genéricos.

**Flujo de enriquecimiento:**

```
Preset abre
    │
    ├─ useEffect #1 → carga specs/precios estáticos en builderStore
    │
    └─ useEffect #2 → para cada componente, fetch al backend en paralelo (Promise.all)
              │
              ├─ busca coincidencia exacta de modelo: "Ryzen 7 7700X"
              ├─ si no, coincidencia parcial por nombre
              └─ si hay match con imagen → actualiza builderStore con URL de Firebase Storage
```

**Cadena de fallbacks:**
1. `activeComp.image` — imagen real de Firebase Storage (backend match)
2. `COMP_IMGS[type]` — foto Unsplash del tipo de componente (CPU, GPU, MB, etc.)
3. Ícono `Ionicons` — si ambas URLs fallan

**Nuevo sub-componente `ComponentImage`** — maneja la carga con `onError` para pasar al siguiente fallback sin romper la UI.

---

### 6. Custom Builder — barra de errores interactiva (`mobile/app/builder/custom.tsx`)

La barra de alertas de compatibilidad ahora es tappable y muestra el detalle completo de cada error o advertencia en un `Alert.alert` con lista numerada.

| Estado | Comportamiento |
|--------|---------------|
| Errores | Barra roja tappable → lista de errores con `• mensaje` |
| Advertencias | Barra ámbar tappable → lista de advertencias |
| Sin problemas | Barra verde estática "Build 100% compatible" |

---

### 7. Motor de compatibilidad y recomendaciones — mejoras al backend

#### `backend/src/modules/compatibility/compatibility.service.js`

| Regla | Descripción |
|-------|-------------|
| CPU ↔ Motherboard | Socket debe coincidir (AM4, AM5, LGA1700) |
| RAM ↔ Motherboard | Tipo DDR (DDR4 / DDR5) debe coincidir |
| Case ↔ Motherboard | ATX soporta todo; mATX soporta mATX e ITX; Mini-ITX solo ITX |
| PSU | Potencia debe cubrir el consumo total estimado del build |

#### `backend/src/modules/recommendations/recommendations.service.js`

| Mejora | Detalle |
|--------|---------|
| **Paso 1.5 — pre-validación** | Antes de asignar un candidato, verifica que no aumente errores de compatibilidad |
| **Bucle de reparación iterativo** | Hasta 4 rondas; cada ronda corrige un error y vuelve a validar desde el inicio |
| **Cobertura de reparación** | CPU↔MB socket, RAM↔MB DDR, Case↔MB formFactor, PSU wattage insuficiente |

---

### Resumen de archivos modificados — 27 de Mayo 2026

| Archivo | Tipo de cambio |
|---------|---------------|
| `mobile/contexts/ThemeContext.tsx` | **NUEVO** — ThemeProvider con AsyncStorage |
| `mobile/constants/colors.ts` | Reescrito — sistema dual DarkTheme / LightTheme |
| `mobile/constants/theme.ts` | Añadidos helpers `glowShadow` y `cardShadow` |
| `mobile/app/_layout.tsx` | ThemeProvider wrapper; StatusBar adaptativo |
| `mobile/app/(tabs)/_layout.tsx` | useTheme() para tab bar |
| `mobile/app/(tabs)/index.tsx` | Rediseño completo; exporta CATEGORIES |
| `mobile/app/(auth)/login.tsx` | Rediseño completo oscuro con orbes |
| `mobile/app/(auth)/register.tsx` | Fondo oscuro coherente con login |
| `mobile/app/builder/preset.tsx` | Imágenes reales; ComponentImage; enriquecimiento desde backend |
| `mobile/app/builder/custom.tsx` | Header oscuro; barra de errores tappable |
| `mobile/app/builder/budget.tsx` | Header oscuro |
| `mobile/app/builder/[type].tsx` | Header oscuro |
| `mobile/app/profile.tsx` | Header oscuro |
| `mobile/app/(tabs)/quotes.tsx` | Header oscuro |
| `mobile/app/(tabs)/orders.tsx` | Header oscuro |
| `mobile/app/(tabs)/learn.tsx` | Headers oscuros (×2) |
| `mobile/app/(tabs)/builder.tsx` | Header oscuro |
| `mobile/app/quote/[id].tsx` | Header oscuro |
| `mobile/app/quote/payment.tsx` | Header oscuro |
| `mobile/app/order/[id].tsx` | Header oscuro |
| `mobile/app/admin/dashboard.tsx` | Header oscuro |
| `mobile/app/admin/deliveries.tsx` | Header oscuro |
| `mobile/app/admin/inventory.tsx` | Header oscuro |
| `mobile/app/admin/orders.tsx` | Header oscuro |
| `mobile/app/admin/quotes.tsx` | Header oscuro |
| `mobile/app/admin/revenue.tsx` | Header oscuro |
| `mobile/app/admin/vendors.tsx` | Header oscuro |
| `mobile/app/vendor/dashboard.tsx` | Header oscuro |
| `backend/src/modules/compatibility/compatibility.service.js` | Reglas case/MB; validación PSU |
| `backend/src/modules/recommendations/recommendations.service.js` | Paso 1.5 y bucle iterativo de reparación |

---

## Actualización — 29 de Mayo 2026

### Eliminar cotizaciones del cliente, login mejorado y efecto Dock estilo macOS

#### Resumen de cambios

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Cliente puede eliminar sus cotizaciones** | `backend/src/modules/quotes/quotes.service.js`, `quotes.controller.js`, `quotes.routes.js`, `mobile/services/orders.service.ts`, `mobile/app/(tabs)/quotes.tsx` | Nueva ruta `DELETE /quotes/:id/mine`. El cliente puede eliminar mientras la cotización NO esté en `accepted`, `payment_submitted` o `payment_verified`. UI con diálogo de confirmación y eliminación optimista (revierte si falla). |
| **Login: teclado cubría el botón Ingresar** | `mobile/app/(auth)/login.tsx` | Restaurado `KeyboardAvoidingView` con `behavior="padding"` (iOS) / `"height"` (Android). El formulario ahora se eleva al aparecer el teclado. |
| **Login: autocompletado de credenciales** | `mobile/app/(auth)/login.tsx` | Agregados `autoComplete="email"` / `"current-password"`, `textContentType` y `importantForAutofill="yes"`. Android/iOS detectan el formulario y ofrecen credenciales guardadas. La tecla "Ingresar" del teclado envía el formulario. |
| **Acciones Rápidas — Efecto Dock macOS** | `mobile/app/(tabs)/index.tsx` | El scroll horizontal aplica efecto lupa: el item al centro crece (1.22×), sube ligeramente (-12 px) y los adyacentes se reducen y difuminan progresivamente (0.92× → 0.78×, opacidad 70% → 45%). Snap-to-interval para anclar al centro. Animación nativa 60 fps con `useNativeDriver: true`. |
| **Script `start-dev.sh` con tunnel automático** | `start-dev.sh`, `.gitignore` | Levanta backend + tunnel Cloudflare + Expo en un solo comando. La URL del backend se inyecta automáticamente en `mobile/.env`. No requiere estar en la misma red WiFi ni cuenta en ningún servicio. |
| **Variable `EXPO_PUBLIC_BACKEND_URL`** | `mobile/services/api.ts` | Nueva prioridad: variable de entorno > LAN auto-detectada > Railway producción. El script `start-dev.sh` setea la variable automáticamente. |
| **URL de Railway corregida** | `mobile/services/api.ts` | Reemplazada URL temporal de Cloudflare (expirada) por la URL real de Railway: `zonapc-backend-production.up.railway.app`. |
| **Bug: validación incorrecta en Preset Builder** | `mobile/app/builder/preset.tsx` | El botón "Agregar a la cesta" exigía **CPU + GPU + Placa Madre** como obligatorios — bloqueaba las **estaciones de Oficina y Estudiantil**, que usan los gráficos integrados del procesador (Ryzen 3 3200G, Core i5-12400, etc.) y no requieren GPU dedicada. Ahora solo CPU + Placa Madre son obligatorios; GPU es opcional. |

> ### Recordatorio importante
>
> Si vas a tocar `mobile/app/builder/preset.tsx`, `(tabs)/index.tsx`, `(auth)/login.tsx` o cualquier archivo del backend de `quotes/`, **lee primero el aviso al inicio de este README**. Estos archivos tienen lógica de negocio crítica que afecta al flujo completo de cotización, autenticación y experiencia del cliente — un cambio descuidado puede romper varias pantallas a la vez. **Trabaja siempre en una rama propia (`git checkout -b feat/...`) y prueba en Expo Go antes de hacer push.**

#### Nuevo flujo de desarrollo recomendado

Antes había que abrir múltiples terminales y configurar IPs manualmente. Ahora:

```bash
./start-dev.sh
```

Lo que hace el script:
1. Mata procesos previos en puertos 3000 y 8081
2. Inicia el backend (`localhost:3000`)
3. Crea un tunnel público vía `cloudflared` (sin cuenta, sin registro)
4. Escribe la URL del backend en `mobile/.env` como `EXPO_PUBLIC_BACKEND_URL`
5. Inicia Expo con tunnel — escanea el QR y listo

> **Pre-requisito:** instalar `cloudflared` una sola vez:
> ```bash
> brew install cloudflare/cloudflare/cloudflared
> ```

Beneficios:
- Funciona desde **cualquier red WiFi** (no requiere estar en la misma red que la Mac)
- Sin cuenta, sin tokens, sin pagos
- URL fresca cada vez que se reinicia (no se queda colgada como Railway)

---

## Actualización — 30 de Mayo 2026

### APK funcional: 6 problemas resueltos + tema reactivo + ícono ZPC

| # | Problema | Solución |
|---|---|---|
| 0/2/3/6 | APK sin backend (componentes vacíos, "Generar PC" no hacía nada, perfil no guardaba) | **EAS no lee `.env` del filesystem** — la URL se agregó a `eas.json > build.preview.env.EXPO_PUBLIC_BACKEND_URL`. Plus: botón **"Configurar servidor"** visible en login + Alerts claros en `budget.tsx` y `[type].tsx` cuando falla la conexión. |
| 1 | Roles no separados | Consecuencia de #0 — sin backend no se carga el perfil. Se resuelve junto con #0. |
| 4 | Ícono APK incorrecto (Z azul antigua) | `icon.png` y `adaptive-icon.png` reemplazados con `logo.png` (pin rojo ZPC). |
| 5 | Tema oscuro/claro solo en Inicio | `Colors` ahora es mutable + función `applyTheme()` en `constants/colors.ts`. ThemeContext la llama al toggle, y `Stack` tiene `key={isDark}` en `_layout.tsx` para forzar re-mount. Todas las pantallas que importan `Colors` ahora cambian de tema sin necesidad de refactorizar cada una. |

> **Regla nueva:** las URLs del tunnel cloudflared cambian en cada reinicio. Si el APK pierde conexión, abre el login → toca **"Configurar servidor"** → pega la nueva URL → **Probar** → **Guardar**. Sin recompilar.

---

## Actualización — 29 de Mayo 2026 (Otto, sesión tarde)

### Centro educativo "Aprende Hardware", notificaciones por etapa, heads-up push notifications, lista de notificaciones y rediseño de tab bar/dialog

Esta actualización agrega un **mini-centro educativo** dentro de la app, completa el flujo de notificaciones del cliente (en banda y push real estilo WhatsApp), introduce **etapas de ensamblaje** que el vendedor notifica manualmente, y rediseña dos componentes clave del UI: la barra de navegación inferior y los diálogos modales.

---

### 1. Sección "Aprende Hardware" (`mobile/app/(tabs)/aprende.tsx` + `mobile/app/aprende/`)

Nuevo tab `Aprende` (entre "Mis Órdenes" y "Cesta") que abre un mini centro educativo para usuarios principiantes.

**Hub principal** — tarjetas premium con gradientes neón únicos por categoría, animaciones spring de entrada escalonadas:

| Categoría | Contenido | Estilo |
|-----------|-----------|--------|
| Conceptos Básicos | 10 lecciones expandibles (CPU, RAM, GPU, SSD, HDD vs SSD, DDR, MB, PSU, Socket, Bottleneck) | Gradiente azul → violeta |
| PCs según el uso | 6 perfiles (Gaming, Programación, Diseño, Streaming, Oficina, Estudiantil) con specs, presupuesto, software ideal | Gradiente ámbar → rojo |
| Comparativas | 6 versus cara a cara con barras de rendimiento, pros/cons, veredicto | Gradiente cian → azul |
| Errores comunes | 8 tips clasificados (Crítico / Importante / Recomendado) con problema + fix | Gradiente rojo → naranja |
| Compatibilidad interactiva | 6 casos reales con visual de conexión, explicación y solución | Gradiente verde → cian |

**Diseño:**
- Cards con glassmorphism (`rgba(255,255,255,0.04)` + border sutil)
- Emojis grandes (estilo Discord/Steam)
- `LayoutAnimation` para expandir/colapsar lecciones suavemente
- Barras de rendimiento animadas en comparativas
- Visual de conexión rota/exitosa entre componentes

| Archivo nuevo | Descripción |
|---------------|-------------|
| `mobile/app/(tabs)/aprende.tsx` | Hub con grid de 5 categorías animadas |
| `mobile/app/aprende/basicos.tsx` | 10 lecciones expandibles |
| `mobile/app/aprende/usos.tsx` | 6 perfiles de uso con specs detallados |
| `mobile/app/aprende/comparativas.tsx` | 6 versus con barras de performance |
| `mobile/app/aprende/errores.tsx` | 8 errores con niveles de severidad |
| `mobile/app/aprende/compatibilidad.tsx` | 6 casos interactivos con visual de conexión |

---

### 2. Notificaciones de etapa de ensamblaje (vendedor → cliente)

El vendedor ahora puede notificar al cliente el progreso del ensamblaje de su PC desde el dashboard, **sin cambiar el estado de la cotización**.

**Renombre semántico:**
- Botón "Cotización lista" → **"Cotización aceptada"**
- Mensaje al cliente: "✅ ¡Tu cotización fue aceptada!" / "Tu cotización fue aceptada. Entra a la app para revisarla y proceder al pago."

**4 nuevas etapas** (aparecen en `quote.status === 'payment_verified'`, antes del botón "Archivar"):

| Botón | Icono | Color | Notificación enviada |
|-------|-------|-------|----------------------|
| 📦 Componentes listos | `cube-outline` | Cian (#06B6D4) | "Recibimos y verificamos todos los componentes de tu PC. Comenzaremos el ensamblaje." |
| 🔧 Ensamblado | `construct-outline` | Violeta (#8B5CF6) | "Terminamos de armar físicamente tu computadora. Sigue la instalación del software." |
| 💿 Software instalado | `albums-outline` | Ámbar (#F59E0B) | "Tu PC ya tiene el sistema operativo y los drivers configurados." |
| 🚚 Listo para entrega | `rocket-outline` | Verde (#10B981) | "Tu PC está empacada y lista. Pronto coordinaremos la entrega contigo." |

**Backend:**
- Nueva ruta: `POST /api/quotes/:id/stage` (vendor/admin only) con body `{ stage: '...' }`
- Diccionario `ASSEMBLY_STAGES` exportado en `quotes.service.js`
- Validación: vendor debe ser el dueño de la cotización; stage debe ser válido

**Mobile:**
- `sendStageNotification(quoteId, stage)` en `services/orders.service.ts`
- Sub-componente `<StageButton>` reutilizable en `vendor/dashboard.tsx`

---

### 3. Heads-up push notifications estilo WhatsApp/Telegram

Las notificaciones ahora aparecen **flotando en la parte superior** del teléfono (heads-up) con sonido y vibración, no solo en la bandeja.

**Backend** (`backend/src/modules/notifications/notifications.service.js`) — payload FCM ampliado:
```js
android: {
  priority: 'high',                      // entrega inmediata
  notification: {
    channelId: 'default',
    notificationPriority: 'PRIORITY_MAX',
    sound: 'default',                    // obligatorio para heads-up
    defaultVibrateTimings: true,
    defaultLightSettings: true,
    visibility: 'public',                // visible en lock screen
  },
},
apns: {
  headers: { 'apns-priority': '10' },
  payload: { aps: { sound: 'default', 'mutable-content': 1 } },
},
```
Plus serialización forzada de `data` a strings (requisito de FCM).

**Mobile** (`app/_layout.tsx`):
- `setNotificationHandler` → heads-up también cuando la app está abierta
- Canal `default` ampliado con `sound: 'default'`, `enableLights`, `lightColor`, `lockscreenVisibility: PUBLIC`, `showBadge`
- `requestPermissionsAsync` adaptado a Android 13+ (POST_NOTIFICATIONS)

**`mobile/app.json`:**
- Permisos Android declarados: `POST_NOTIFICATIONS`, `VIBRATE`, `WAKE_LOCK`, `RECEIVE_BOOT_COMPLETED`
- Plugin `expo-notifications`: `defaultChannel: "default"` + `androidCollapsedTitle: "ZonaPc Builder"`

> **Nota:** Esto solo funciona en **APK nativo (EAS Build)**. Expo Go no soporta FCM push remoto desde SDK 53+.

---

### 4. Pantalla de notificaciones del cliente + bell icon funcional

La campana del header de Inicio (que antes no hacía nada) ahora abre una **lista completa de notificaciones** que el usuario ha recibido.

**Backend nuevo** — módulo independiente registrado en `/api/notifications`:

| Endpoint | Acción |
|----------|--------|
| `GET /api/notifications` | Lista las del usuario (últimas 100, ordenadas por fecha desc.) |
| `GET /api/notifications/unread` | Cuenta de no leídas |
| `PATCH /api/notifications/:id/read` | Marcar una leída |
| `PATCH /api/notifications/read-all` | Marcar todas leídas (batch atómico) |
| `DELETE /api/notifications/:id` | Eliminar una |

| Archivo nuevo | Descripción |
|---------------|-------------|
| `backend/src/modules/notifications/notifications.controller.js` | Handlers de 5 endpoints |
| `backend/src/modules/notifications/notifications.routes.js` | Router con `authenticate` middleware |

Service ampliado con `listByUser`, `countUnread`, `markRead`, `markAllRead`, `remove`.

**Mobile nuevo:**
- `services/notifications.service.ts` — cliente API con tipo `AppNotification`
- `app/notifications.tsx` — pantalla premium con:
  - Header con contador de no leídas y botón "Leer todas"
  - Cards con ícono+color por tipo (10 tipos mapeados: `quote_accepted`, `order_components_ready`, `order_assembled`, etc.)
  - Punto luminoso + glow shadow en las no leídas
  - **Tap** = abre cotización/orden + marca leída
  - **Long press** = eliminar con confirmación
  - Pull-to-refresh
  - Empty state ilustrado

**Inicio (`(tabs)/index.tsx`):**
- Campana ahora navega a `/notifications`
- Estado `unreadNotifs` con polling cada 30s al endpoint `/notifications/unread`
- El punto rojo del badge solo aparece si hay no leídas (antes era estático)

---

### 5. Cambios menores de copy

| Pantalla | Antes | Ahora |
|----------|-------|-------|
| `(tabs)/quotes.tsx` | 👁 Ver y aceptar cotización | 🚀 Tu próxima PC te está esperando |
| `quote/[id].tsx` | 👍 Aceptar cotización | 💳 Proceder al pago |

---

### 6. Barra de navegación inferior rediseñada (`mobile/components/CustomTabBar.tsx`)

Se reemplazó el `Tabs.tabBar` por defecto por un componente custom estilo **pill**, sin elementos flotantes problemáticos.

**Diseño:**
- Barra pill (stadium-shape) de 64px de altura
- Tab activo: ícono en color primario + label visible al lado + punto indicador pequeño + leve escala (1.05x) con spring
- Tabs inactivos: solo ícono en blanco al 55% (o gris al 55% en light)
- Adaptativo al tema:

| Tema | Wrapper bg | Pill bg | Íconos inactivos | Sombra |
|------|------------|---------|------------------|--------|
| Dark | `colors.background` (`#0B0F17`) | `#0D1320` | blanco 55% | negra 40% |
| Light | `colors.background` (`#F4F6F8`) | `#FFFFFF` | gris oscuro 55% | gris suave 12% |

**Filtro doble** para excluir rutas internas como `builder`:
```tsx
const HIDDEN_ROUTES = new Set(['builder']);
// + descriptor.options.href !== null como respaldo
```

**Animaciones:**
- `Animated.spring` para escala del activo
- `Animated.timing` para fade-in del indicador

---

### 7. Sistema de diálogos premium (`mobile/components/AppDialog.tsx`)

Componente nuevo que reemplaza visualmente el blanco-genérico de `Alert.alert` con un modal centrado de estilo premium.

**API imperativa** (similar a `Alert.alert` para minimizar cambios en call-sites):
```tsx
showAppDialog({
  title: 'Pago enviado',
  body: 'Tu comprobante fue recibido...',
  variant: 'success',  // info | success | error | warning
  buttons: [{ text: 'Entendido', onPress: () => router.replace(...) }],
});
```

**Diseño:**
- Backdrop oscuro al 65% con tap-to-dismiss
- Card central `#151A23`, border-radius 24, shadow profunda
- **Burbuja ícono flotante** en esquina superior derecha con gradiente único por variant + glow shadow (entra con spring desde arriba)
- Flecha decorativa apuntando a la burbuja
- Botón primario con gradiente full-width; botones secundarios con glassmorphism
- Animación de entrada: scale + fade + sweep

**4 variants** con paletas distintas: `info`, `success`, `error`, `warning`.

**Montaje:** `<DialogHost />` en `app/_layout.tsx` — siempre disponible vía `showAppDialog(...)` sin prop drilling.

**Primer reemplazo aplicado:** el Alert nativo blanco de "Pago enviado" en `quote/payment.tsx` ahora usa el nuevo dialog con variant `success`.

---

### 8. Mejora visual de las cards "Armar PC" del Inicio

Las tarjetas "PC por Presupuesto" y "Armado Personalizado" tenían imágenes de fondo casi imperceptibles (overlay al 80%+ las cubría). Se redujo la opacidad del overlay para que las fotos respiren:

| Zona | Antes | Ahora |
|------|-------|-------|
| Arriba (badge) | 80% opaco | **33%** ← imagen muy visible |
| Centro | 100% sólido | **47%** ← imagen visible |
| Abajo (título) | 100% sólido | **69%** ← contraste suficiente para texto |

Los badges y el icono+título mantienen sus propios contenedores con border, así que la legibilidad no se compromete.

---

### Resumen de archivos modificados / creados — 29 de Mayo 2026

**Nuevos:**

| Archivo | Tipo |
|---------|------|
| `mobile/app/(tabs)/aprende.tsx` | Hub educativo |
| `mobile/app/aprende/basicos.tsx` | Lecciones |
| `mobile/app/aprende/usos.tsx` | Perfiles |
| `mobile/app/aprende/comparativas.tsx` | Versus |
| `mobile/app/aprende/errores.tsx` | Tips |
| `mobile/app/aprende/compatibilidad.tsx` | Casos |
| `mobile/app/notifications.tsx` | Lista de notificaciones del cliente |
| `mobile/components/CustomTabBar.tsx` | Tab bar pill adaptativo |
| `mobile/components/AppDialog.tsx` | Modal premium + `showAppDialog()` |
| `mobile/services/notifications.service.ts` | Cliente API de notifications |
| `backend/src/modules/notifications/notifications.controller.js` | Handlers REST |
| `backend/src/modules/notifications/notifications.routes.js` | Router |

**Modificados:**

| Archivo | Cambio |
|---------|--------|
| `backend/src/config/app.js` | Registro de `/api/notifications` |
| `backend/src/modules/notifications/notifications.service.js` | Heads-up payload + 5 funciones de consulta |
| `backend/src/modules/quotes/quotes.controller.js` | `vendorStageNotification` handler |
| `backend/src/modules/quotes/quotes.routes.js` | Ruta `POST /:id/stage` |
| `backend/src/modules/quotes/quotes.service.js` | `ASSEMBLY_STAGES` + `sendStageNotification` + renombre `markReady` |
| `mobile/app.json` | Permisos Android + plugin notifications mejorado + `extra` limpio para Expo Go |
| `mobile/eas.json` | Backend URL actualizada en perfil preview |
| `mobile/app/(tabs)/_layout.tsx` | Uso de `CustomTabBar` + tab `aprende` |
| `mobile/app/(tabs)/index.tsx` | Bell funcional + contador `unreadNotifs` + opacity de cards |
| `mobile/app/(tabs)/quotes.tsx` | Botón "Tu próxima PC te está esperando" |
| `mobile/app/_layout.tsx` | `DialogHost` + `setNotificationHandler` + canal heads-up + rutas |
| `mobile/app/quote/[id].tsx` | Botón "Proceder al pago" |
| `mobile/app/quote/payment.tsx` | `showAppDialog` para confirmación de pago |
| `mobile/app/vendor/dashboard.tsx` | 4 botones de etapa + renombre "Cotización aceptada" |
| `mobile/services/orders.service.ts` | `sendStageNotification` + type `AssemblyStage` |

---

## Guía de inicio para compañeros del equipo

> Requisito previo: tener Node.js 18+ y la app **Expo Go** instalada en el teléfono.

### 1. Clonar y preparar

```bash
git clone https://github.com/matamoros90/Proyecto_ProgramacionIII.git
cd Proyecto_ProgramacionIII
```

### 2. Backend

```bash
cd backend
npm ci
```

Pedir al responsable del backend el archivo `.env` con las credenciales de Firebase (nunca se sube a git). Luego:

```bash
npm run dev          # Corre en http://0.0.0.0:3000
```

> Si cambias de red WiFi obtén tu nueva IP con `ipconfig getifaddr en0` y actualízala en `ALLOWED_ORIGINS` del `.env`.

### 3. App móvil

```bash
cd mobile
npm ci
npx expo start       # Modo LAN — requiere estar en la misma red que el backend
```

Escanea el QR con Expo Go. La app detecta la IP del backend automáticamente cuando están en la misma red.

### 3-bis. Flujo recomendado (un solo comando) — desde 29/05/2026

Si tu red bloquea conexiones entre dispositivos (AP isolation) o no estás en la misma WiFi, usa el script unificado:

```bash
brew install cloudflare/cloudflare/cloudflared   # solo la primera vez
./start-dev.sh                                    # desde la raíz del repo
```

Levanta backend + tunnel público + Expo automáticamente. Funciona desde cualquier red.

### 4. Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@zonapc.gt` | `Admin1234` |
| Vendedor demo | `vendedor@zonapc.gt` | `Vendedor2026` |
| Cliente | Registrarse en la app | — |

> Para crear empleados vendedor adicionales, usa la sección **Gestionar Empleados** del panel de administración.

### 5. Poblar la base de datos (solo primera vez)

```bash
cd backend
node seed-components.js   # 43 componentes de hardware
node seed-admin.js        # Usuario administrador
node seed-vendor.js       # Vendedor de prueba
```

### 6. Reglas de trabajo en equipo

| Regla | Motivo |
|-------|--------|
| Crear tu propia rama (`git checkout -b feat/mi-feature`) antes de modificar | Evita conflictos en `main` |
| Nunca commitear `.env` | Contiene la llave privada de Firebase |
| Usar `npm ci` en lugar de `npm install` | Respeta el `package-lock.json` y evita instalar versiones comprometidas |
| Reiniciar el backend tras cambios en archivos `.js` del backend | Node carga el código en memoria; sin reinicio los cambios no tienen efecto |
| Al cambiar de red WiFi actualizar `ALLOWED_ORIGINS` en `backend/.env` | El CORS rechaza orígenes no listados en producción |

---

## Documentación

- [Arquitectura del Backend](backend/README.md)
- [Guía de la App Móvil](mobile/README.md)
- [Modelos de Base de Datos](docs/database.md)
- [Flujo de Navegación](docs/navigation.md)
