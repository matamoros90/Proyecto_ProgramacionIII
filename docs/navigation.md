# Flujo de Navegación — ZonaPc Builder

## Diagrama de Pantallas

```
App
├── (auth)/ [si no autenticado]
│   ├── login.tsx            ← Pantalla principal de acceso
│   ├── register.tsx         ← Crear cuenta nueva
│   └── forgot-password.tsx  ← Recuperar contraseña
│
└── (tabs)/ [si autenticado]
    ├── index.tsx            ← Home (Dashboard del usuario)
    ├── builder.tsx          ← Menú del builder
    ├── quotes.tsx           ← Mis cotizaciones
    ├── orders.tsx           ← Mis órdenes de ensamblaje
    └── learn.tsx            ← Centro de aprendizaje
    
    /builder/
    ├── budget.tsx           ← Builder por presupuesto + categoría
    ├── custom.tsx           ← Builder manual + resumen del build
    └── [category].tsx       ← Builder pre-configurado por categoría
    
    /order/
    └── [id].tsx             ← Detalle y seguimiento de orden
    
    /admin/
    ├── dashboard.tsx        ← Panel admin con métricas
    ├── orders.tsx           ← Gestión completa de órdenes
    ├── inventory.tsx        ← Gestión de inventario
    └── quotes.tsx           ← Ver todas las cotizaciones
```

## Flujo Principal de Usuario

```
1. LOGIN
   └── Home (tabs)
       ├── "Armar PC por Presupuesto" → /builder/budget
       │   ├── Ingresa presupuesto
       │   ├── Selecciona categoría (gaming, programación, etc.)
       │   └── "Generar" → API /recommendations/generate
       │       └── /builder/custom (con build pre-llenado)
       │           ├── Ver componentes recomendados
       │           ├── Intercambiar componentes → API /recommendations/swap
       │           ├── Ver alertas de compatibilidad en tiempo real
       │           └── "Cotizar" → API /quotes (POST)
       │               └── /quotes tab
       │                   └── "Ordenar Ensamblaje" → API /orders (POST)
       │                       └── /order/[id] (seguimiento)
       │
       ├── "Tipo de Uso" → /builder/[category]
       │   └── (mismo flujo con presupuesto sugerido)
       │
       └── (tabs)
           ├── quotes → Lista cotizaciones → Confirmar → Crear Orden
           ├── orders → Lista órdenes → Ver detalle con progreso
           └── learn  → Tutoriales por nivel/categoría
```

## Flujo Admin

```
1. HOME → (ícono settings)
   └── /admin/dashboard
       ├── Métricas: órdenes, ingresos, cotizaciones
       ├── Lista órdenes recientes con botón "Avanzar estado"
       │   └── Automáticamente envía notificación FCM al cliente
       ├── /admin/inventory → Ver stock de componentes
       ├── /admin/orders    → Gestión completa
       └── /admin/quotes    → Ver todas las cotizaciones
```

## API Endpoints Completos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/components | Listar componentes (con filtros) |
| POST | /api/compatibility/check | Validar compatibilidad de build |
| POST | /api/recommendations/generate | Generar build por presupuesto |
| POST | /api/recommendations/swap | Intercambiar un componente |
| POST | /api/builds | Guardar build del usuario |
| GET | /api/builds | Mis builds guardados |
| POST | /api/quotes | Crear cotización |
| PATCH | /api/quotes/:id/confirm | Confirmar cotización |
| POST | /api/orders | Crear orden desde cotización |
| GET | /api/orders | Mis órdenes |
| GET | /api/orders/:id | Detalle de orden |
| PATCH | /api/admin/orders/:id/state | Actualizar estado (admin) |
| GET | /api/admin/dashboard | Métricas del negocio (admin) |
| GET | /api/tutorials | Listar tutoriales |
