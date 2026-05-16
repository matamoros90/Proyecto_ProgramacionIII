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

## Documentación

- [Arquitectura del Backend](backend/README.md)
- [Guía de la App Móvil](mobile/README.md)
- [Modelos de Base de Datos](docs/database.md)
- [Flujo de Navegación](docs/navigation.md)
