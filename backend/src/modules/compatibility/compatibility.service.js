const { FORM_FACTORS } = require('../../shared/constants/component-types');

// Compatibilidades de socket: CPU <-> Motherboard
const SOCKET_COMPAT = {
  AM4: ['AM4'],
  AM5: ['AM5'],
  LGA1700: ['LGA1700'],
  LGA1200: ['LGA1200'],
  LGA1151: ['LGA1151'],
};

// Factores de forma que caben en cada gabinete
const CASE_COMPAT = {
  'Full Tower': ['E-ATX', 'ATX', 'mATX', 'ITX'],
  'Mid Tower': ['ATX', 'mATX', 'ITX'],
  'Mini Tower': ['mATX', 'ITX'],
  'ITX Case': ['ITX'],
};

function checkSocketCompatibility(cpu, motherboard) {
  if (!cpu || !motherboard) return null;
  const compatible = SOCKET_COMPAT[cpu.socket]?.includes(motherboard.socket);
  if (!compatible) {
    return {
      type: 'error',
      component: 'cpu-motherboard',
      message: `El procesador ${cpu.name} (socket ${cpu.socket}) no es compatible con la placa ${motherboard.name} (socket ${motherboard.socket}). Necesitas una placa con socket ${cpu.socket}.`,
    };
  }
  return null;
}

function checkRamCompatibility(ram, motherboard) {
  if (!ram || !motherboard) return null;
  if (ram.ramType !== motherboard.ramType) {
    return {
      type: 'error',
      component: 'ram-motherboard',
      message: `La RAM ${ram.name} es ${ram.ramType} pero la placa ${motherboard.name} soporta ${motherboard.ramType}. Selecciona RAM compatible.`,
    };
  }
  if (ram.capacity > motherboard.maxRam) {
    return {
      type: 'warning',
      component: 'ram-motherboard',
      message: `La placa ${motherboard.name} soporta máximo ${motherboard.maxRam}GB de RAM. Tu selección excede ese límite.`,
    };
  }
  return null;
}

function checkPsuCompatibility(psu, components) {
  const totalWatts = components.reduce((sum, c) => sum + (c.tdp || 0), 0);
  const recommended = Math.ceil(totalWatts * 1.2);

  if (!psu) return null;

  if (psu.wattage < totalWatts) {
    return {
      type: 'error',
      component: 'psu',
      message: `La fuente de ${psu.wattage}W es insuficiente. El sistema consume ${totalWatts}W. Necesitas al menos ${recommended}W.`,
    };
  }
  if (psu.wattage < recommended) {
    return {
      type: 'warning',
      component: 'psu',
      message: `La fuente de ${psu.wattage}W está ajustada. Se recomienda al menos ${recommended}W para mayor margen de seguridad.`,
    };
  }
  return null;
}

function checkCaseCompatibility(pcCase, motherboard) {
  if (!pcCase || !motherboard) return null;
  const supported = CASE_COMPAT[pcCase.caseType] || [];
  if (!supported.includes(motherboard.formFactor)) {
    return {
      type: 'error',
      component: 'case-motherboard',
      message: `El gabinete ${pcCase.name} (${pcCase.caseType}) no soporta placas ${motherboard.formFactor}. Soporta: ${supported.join(', ')}.`,
    };
  }
  return null;
}

function checkCoolingCompatibility(cooling, cpu) {
  if (!cooling || !cpu) return null;
  if (cooling.maxTdp && cooling.maxTdp < cpu.tdp) {
    return {
      type: 'warning',
      component: 'cooling',
      message: `El cooler ${cooling.name} soporta hasta ${cooling.maxTdp}W TDP pero el procesador genera ${cpu.tdp}W. Puede haber throttling térmico.`,
    };
  }
  return null;
}

function validateBuild(build) {
  const issues = [];
  const { cpu, motherboard, ram, psu, case: pcCase, cooling } = build;
  const allComponents = Object.values(build).filter(Boolean);

  const socketIssue = checkSocketCompatibility(cpu, motherboard);
  if (socketIssue) issues.push(socketIssue);

  const ramIssue = checkRamCompatibility(ram, motherboard);
  if (ramIssue) issues.push(ramIssue);

  const psuIssue = checkPsuCompatibility(psu, allComponents);
  if (psuIssue) issues.push(psuIssue);

  const caseIssue = checkCaseCompatibility(pcCase, motherboard);
  if (caseIssue) issues.push(caseIssue);

  const coolingIssue = checkCoolingCompatibility(cooling, cpu);
  if (coolingIssue) issues.push(coolingIssue);

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');

  const totalWatts = allComponents.reduce((sum, c) => sum + (c.tdp || 0), 0);
  const totalPrice = allComponents.reduce((sum, c) => sum + (c.price || 0), 0);

  return {
    compatible: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalWatts,
      recommendedPsu: Math.ceil(totalWatts * 1.2),
      totalPrice,
      componentCount: allComponents.length,
    },
  };
}

module.exports = { validateBuild };
