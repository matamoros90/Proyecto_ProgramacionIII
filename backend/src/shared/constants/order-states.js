const ORDER_STATES = {
  PENDING: 'pending',
  COMPONENTS_READY: 'components_ready',
  ASSEMBLING: 'assembling',
  SOFTWARE_INSTALL: 'software_install',
  TESTING: 'testing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const ORDER_STATE_LABELS = {
  [ORDER_STATES.PENDING]: 'Pedido Recibido',
  [ORDER_STATES.COMPONENTS_READY]: 'Componentes Listos',
  [ORDER_STATES.ASSEMBLING]: 'En Ensamblaje',
  [ORDER_STATES.SOFTWARE_INSTALL]: 'Instalando Software',
  [ORDER_STATES.TESTING]: 'Pruebas Finales',
  [ORDER_STATES.READY]: 'Listo para Entrega',
  [ORDER_STATES.DELIVERED]: 'Entregado',
  [ORDER_STATES.CANCELLED]: 'Cancelado',
};

const ORDER_STATE_FLOW = [
  ORDER_STATES.PENDING,
  ORDER_STATES.COMPONENTS_READY,
  ORDER_STATES.ASSEMBLING,
  ORDER_STATES.SOFTWARE_INSTALL,
  ORDER_STATES.TESTING,
  ORDER_STATES.READY,
  ORDER_STATES.DELIVERED,
];

const FCM_MESSAGES = {
  [ORDER_STATES.COMPONENTS_READY]: {
    title: '🔧 Componentes Listos',
    body: 'Los componentes de tu PC ya están en el taller. ¡El ensamblaje comenzará pronto!',
  },
  [ORDER_STATES.ASSEMBLING]: {
    title: '⚙️ Ensamblando tu PC',
    body: 'Nuestros técnicos están ensamblando tu computadora con cuidado.',
  },
  [ORDER_STATES.SOFTWARE_INSTALL]: {
    title: '💿 Instalando Software',
    body: 'Sistema operativo y drivers siendo instalados en tu nueva PC.',
  },
  [ORDER_STATES.TESTING]: {
    title: '🧪 Pruebas Finales',
    body: 'Tu PC está pasando las pruebas de calidad finales.',
  },
  [ORDER_STATES.READY]: {
    title: '✅ ¡Tu PC está lista!',
    body: 'Tu computadora superó todas las pruebas. ¡Ya puedes pasar a recogerla!',
  },
  [ORDER_STATES.DELIVERED]: {
    title: '📦 ¡Orden Entregada!',
    body: '¡Gracias por elegir ZonaPc! Disfruta tu nueva computadora.',
  },
};

module.exports = { ORDER_STATES, ORDER_STATE_LABELS, ORDER_STATE_FLOW, FCM_MESSAGES };
