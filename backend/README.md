# ZonaPc Builder — Backend API

## Configuración

1. **Instalar dependencias**
```bash
npm ci
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales de Firebase
```

3. **Firebase**: Descarga las credenciales desde Firebase Console → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

## Arquitectura

```
src/
├── config/          ← Firebase + Express app setup
├── middleware/       ← Auth (Firebase JWT) + Error handling
├── modules/          ← Módulos por dominio (Clean Architecture)
│   ├── auth/         ← Perfil de usuario + tokens FCM
│   ├── components/   ← CRUD de hardware
│   ├── compatibility/ ← Motor de validación de compatibilidad
│   ├── recommendations/ ← IA de recomendación por presupuesto
│   ├── builds/       ← Builds guardados del usuario
│   ├── quotes/       ← Cotizaciones (7 días de vigencia)
│   ├── orders/       ← Órdenes de ensamblaje
│   ├── notifications/ ← Firebase Cloud Messaging
│   ├── admin/        ← Panel de control
│   └── tutorials/    ← Contenido educativo
└── shared/           ← Constantes y utilidades
```

## Motor de Compatibilidad

El módulo `compatibility` valida automáticamente:
- **Socket CPU-Motherboard**: AM4, AM5, LGA1700, LGA1200, LGA1151
- **Tipo de RAM**: DDR4 vs DDR5 debe coincidir con la placa
- **Consumo PSU**: El wattage debe cubrir el TDP total + 20% de margen
- **Factor de forma**: El gabinete debe soportar el tamaño de la placa (ATX, mATX, ITX)
- **TDP del cooler**: El cooler debe soportar el TDP del procesador

## Motor de Recomendaciones

`recommendations.service.js` implementa:
1. Distribución del presupuesto por categoría (pesos configurables en `component-types.js`)
2. Selección del mejor componente disponible en cada franja de precio
3. Reparación automática de incompatibilidades detectadas
4. Cálculo de `performanceScore` ponderado por importancia del componente

## Agregar un Componente al Inventario

```bash
POST /api/components
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "type": "cpu",
  "name": "AMD Ryzen 7 7700X",
  "brand": "AMD",
  "model": "Ryzen 7 7700X",
  "price": 3200,
  "socket": "AM5",
  "tdp": 105,
  "cores": 8,
  "performanceScore": 88,
  "inStock": true,
  "stock": 5
}
```
