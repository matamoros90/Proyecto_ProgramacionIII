export function formatPrice(amount: number, currency = 'GTQ'): string {
  return `${currency} ${amount.toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatRelativeDate(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} días`;
}

export const ORDER_STATE_LABELS: Record<string, string> = {
  pending: 'Pedido Recibido',
  components_ready: 'Componentes Listos',
  assembling: 'En Ensamblaje',
  software_install: 'Instalando Software',
  testing: 'Pruebas Finales',
  ready: 'Listo para Entrega',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const CATEGORY_LABELS: Record<string, string> = {
  gaming: 'Gaming',
  programming: 'Programación',
  graphic_design: 'Diseño Gráfico',
  video_editing: 'Edición de Video',
  office: 'Oficina',
  streaming: 'Streaming',
  student: 'Estudiantil',
};

export const COMPONENT_LABELS: Record<string, string> = {
  cpu: 'Procesador',
  gpu: 'Tarjeta Gráfica',
  ram: 'Memoria RAM',
  motherboard: 'Tarjeta Madre',
  psu: 'Fuente de Poder',
  storage: 'Almacenamiento',
  case: 'Gabinete',
  cooling: 'Refrigeración',
  peripheral: 'Periféricos',
};

export const COMPONENT_ICONS: Record<string, string> = {
  cpu: 'cpu-64-bit',
  gpu: 'video-input-component',
  ram: 'memory',
  motherboard: 'developer-board',
  psu: 'lightning-bolt',
  storage: 'harddisk',
  case: 'desktop-tower',
  cooling: 'fan',
  peripheral: 'keyboard',
};
