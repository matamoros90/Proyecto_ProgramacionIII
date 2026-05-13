# ZonaPc Builder 🖥️

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
└── mobile/           # App React Native + Expo
```

## Inicio Rápido

### Backend
```bash
cd backend
npm install
cp .env.example .env   # Configurar variables de entorno
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

## Documentación

- [Arquitectura del Backend](backend/README.md)
- [Guía de la App Móvil](mobile/README.md)
- [Modelos de Base de Datos](docs/database.md)
- [Flujo de Navegación](docs/navigation.md)
