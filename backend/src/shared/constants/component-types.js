const COMPONENT_TYPES = {
  CPU: 'cpu',
  GPU: 'gpu',
  RAM: 'ram',
  MOTHERBOARD: 'motherboard',
  PSU: 'psu',
  STORAGE: 'storage',
  CASE: 'case',
  COOLING: 'cooling',
  PERIPHERAL: 'peripheral',
};

const PC_CATEGORIES = {
  GAMING: 'gaming',
  PROGRAMMING: 'programming',
  GRAPHIC_DESIGN: 'graphic_design',
  VIDEO_EDITING: 'video_editing',
  OFFICE: 'office',
  STREAMING: 'streaming',
  STUDENT: 'student',
};

// Perfiles de uso: qué componentes priorizar por categoría
const CATEGORY_PRIORITIES = {
  [PC_CATEGORIES.GAMING]: {
    primary: [COMPONENT_TYPES.GPU, COMPONENT_TYPES.CPU, COMPONENT_TYPES.RAM],
    budgetWeights: { gpu: 0.40, cpu: 0.25, ram: 0.10, motherboard: 0.10, psu: 0.07, storage: 0.05, case: 0.03 },
  },
  [PC_CATEGORIES.PROGRAMMING]: {
    primary: [COMPONENT_TYPES.CPU, COMPONENT_TYPES.RAM, COMPONENT_TYPES.STORAGE],
    budgetWeights: { cpu: 0.30, ram: 0.25, storage: 0.15, motherboard: 0.12, gpu: 0.08, psu: 0.06, case: 0.04 },
  },
  [PC_CATEGORIES.GRAPHIC_DESIGN]: {
    primary: [COMPONENT_TYPES.GPU, COMPONENT_TYPES.CPU, COMPONENT_TYPES.RAM],
    budgetWeights: { gpu: 0.35, cpu: 0.25, ram: 0.15, storage: 0.10, motherboard: 0.08, psu: 0.05, case: 0.02 },
  },
  [PC_CATEGORIES.VIDEO_EDITING]: {
    primary: [COMPONENT_TYPES.CPU, COMPONENT_TYPES.RAM, COMPONENT_TYPES.STORAGE, COMPONENT_TYPES.GPU],
    budgetWeights: { cpu: 0.30, ram: 0.20, storage: 0.18, gpu: 0.15, motherboard: 0.09, psu: 0.06, case: 0.02 },
  },
  [PC_CATEGORIES.OFFICE]: {
    primary: [COMPONENT_TYPES.CPU, COMPONENT_TYPES.RAM, COMPONENT_TYPES.STORAGE],
    budgetWeights: { cpu: 0.30, ram: 0.20, storage: 0.18, motherboard: 0.15, psu: 0.10, case: 0.05, gpu: 0.02 },
  },
  [PC_CATEGORIES.STREAMING]: {
    primary: [COMPONENT_TYPES.CPU, COMPONENT_TYPES.GPU, COMPONENT_TYPES.RAM],
    budgetWeights: { cpu: 0.30, gpu: 0.25, ram: 0.20, storage: 0.10, motherboard: 0.08, psu: 0.05, case: 0.02 },
  },
  [PC_CATEGORIES.STUDENT]: {
    primary: [COMPONENT_TYPES.CPU, COMPONENT_TYPES.RAM],
    budgetWeights: { cpu: 0.30, ram: 0.22, storage: 0.18, motherboard: 0.15, psu: 0.10, case: 0.05, gpu: 0.00 },
  },
};

const SOCKET_TYPES = ['AM4', 'AM5', 'LGA1700', 'LGA1200', 'LGA1151'];
const RAM_TYPES = ['DDR4', 'DDR5'];
const FORM_FACTORS = ['ATX', 'mATX', 'ITX', 'E-ATX'];

module.exports = {
  COMPONENT_TYPES,
  PC_CATEGORIES,
  CATEGORY_PRIORITIES,
  SOCKET_TYPES,
  RAM_TYPES,
  FORM_FACTORS,
};
