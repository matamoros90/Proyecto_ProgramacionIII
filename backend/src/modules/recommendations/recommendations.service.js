const { getByTypeAndBudget } = require('../components/components.service');
const { validateBuild, CASE_COMPAT } = require('../compatibility/compatibility.service');
const {
  COMPONENT_TYPES,
  CATEGORY_PRIORITIES,
} = require('../../shared/constants/component-types');

/**
 * Motor de recomendación por presupuesto y categoría.
 * 1. Distribuye el presupuesto según los pesos de la categoría.
 * 2. Selecciona el mejor componente disponible por franja de precio.
 * 3. Valida compatibilidad y ajusta si hay conflictos.
 * 4. Devuelve build completo + análisis + componentes alternativos.
 */
async function generateBuild(budget, category) {
  const profile = CATEGORY_PRIORITIES[category];
  if (!profile) throw new Error(`Categoría "${category}" no reconocida`);

  const weights = profile.budgetWeights;
  const build = {};
  const alternatives = {};

  // Paso 1: obtener mejor componente por presupuesto asignado
  for (const [type, weight] of Object.entries(weights)) {
    const allocated = Math.floor(budget * weight);
    if (allocated <= 0) continue;

    const candidates = await getByTypeAndBudget(type, allocated);
    if (candidates.length > 0) {
      build[type] = candidates[0]; // mejor relación rendimiento/precio
      alternatives[type] = candidates.slice(1, 4); // hasta 3 alternativas
    }
  }

  // Paso 1.5: Rellenar slots vacíos con el componente más barato COMPATIBLE
  // con lo que ya hay en el build (respeta socket, ramType, caseType, etc.)
  {
    const spentBudget = Object.values(build).reduce((sum, c) => sum + (c?.price || 0), 0);
    let slack = budget - spentBudget;

    const ESSENTIAL_ORDER = ['cpu', 'motherboard', 'ram', 'psu', 'storage', 'case'];
    const OPTIONAL_ORDER  = ['gpu', 'cooling', 'peripheral'];

    const emptyTypes = [
      ...ESSENTIAL_ORDER.filter(t => weights[t] !== undefined && !build[t]),
      ...OPTIONAL_ORDER.filter(t => weights[t] !== undefined && weights[t] > 0 && !build[t]),
    ];

    for (const type of emptyTypes) {
      if (slack <= 0) break;
      const allAvailable = await getByTypeAndBudget(type, 999999);
      if (allAvailable.length === 0) continue;

      // Ordenar de más barato a más caro
      const sorted = [...allAvailable].sort((a, b) => a.price - b.price);

      // Elegir el primero que quepa en el presupuesto Y no introduzca nuevos errores
      const currentErrorCount = validateBuild(build).errors.length;
      let chosen = null;
      for (const candidate of sorted) {
        if (candidate.price > slack) continue;
        const testValidation = validateBuild({ ...build, [type]: candidate });
        if (testValidation.errors.length <= currentErrorCount) {
          chosen = candidate;
          break;
        }
      }

      if (chosen) {
        build[type] = chosen;
        alternatives[type] = sorted
          .filter(c => c.id !== chosen.id)
          .slice(0, 3);
        slack -= chosen.price;
      }
    }
  }

  // Paso 2: Reparar compatibilidad de forma iterativa (hasta 4 rondas)
  // Cada ronda detecta errores frescos del build actual y los corrige;
  // así un arreglo de socket que cambia el formFactor de la placa
  // desencadena automáticamente la corrección del gabinete en la siguiente ronda.
  const repairLog = [];
  const MAX_REPAIR_ROUNDS = 4;

  for (let round = 0; round < MAX_REPAIR_ROUNDS; round++) {
    const check = validateBuild(build);
    if (check.compatible) break;

    let madeRepair = false;

    for (const error of check.errors) {

      // ── Socket CPU ↔ Motherboard ──────────────────────────────────────────
      if (error.component === 'cpu-motherboard' && build.cpu && build.motherboard) {
        const allBoards = await getByTypeAndBudget(COMPONENT_TYPES.MOTHERBOARD, budget);
        // Primero: placa con socket correcto Y formFactor compatible con el gabinete actual
        const currentCaseType = build.case?.caseType;
        const caseSupported = currentCaseType ? (CASE_COMPAT[currentCaseType] || []) : null;
        let newBoard = caseSupported
          ? allBoards.find(b => b.socket === build.cpu.socket && caseSupported.includes(b.formFactor))
          : null;
        // Fallback: solo socket correcto (gabinete se arreglará en ronda siguiente)
        if (!newBoard) newBoard = allBoards.find(b => b.socket === build.cpu.socket);
        if (newBoard) {
          build.motherboard = newBoard;
          repairLog.push(`Placa madre ajustada a socket ${build.cpu.socket}`);
          madeRepair = true;
        } else {
          // Última opción: cambiar CPU al socket de la placa
          const allCpus = await getByTypeAndBudget(COMPONENT_TYPES.CPU, budget);
          const newCpu = allCpus.find(c => c.socket === build.motherboard.socket);
          if (newCpu) {
            build.cpu = newCpu;
            repairLog.push(`Procesador ajustado a socket ${build.motherboard.socket}`);
            madeRepair = true;
          }
        }
        break; // Re-validar desde el principio después de este cambio
      }

      // ── RAM ↔ Motherboard (tipo DDR) ────────────────────────────────────────
      if (error.component === 'ram-motherboard' && build.ram && build.motherboard) {
        const correctType = build.motherboard.ramType;
        const allRam = await getByTypeAndBudget(COMPONENT_TYPES.RAM, budget);
        const newRam = [...allRam]
          .sort((a, b) => a.price - b.price)
          .find(r => r.ramType === correctType);
        if (newRam) {
          build.ram = newRam;
          repairLog.push(`RAM ajustada a ${correctType} compatible con la placa`);
          madeRepair = true;
        }
        break;
      }

      // ── Case ↔ Motherboard (factor de forma) ───────────────────────────────
      if (error.component === 'case-motherboard' && build.case && build.motherboard) {
        const boardFF = build.motherboard.formFactor;
        const allCases = await getByTypeAndBudget(COMPONENT_TYPES.CASE, budget);
        const newCase = [...allCases]
          .sort((a, b) => a.price - b.price)
          .find(c => (CASE_COMPAT[c.caseType] || []).includes(boardFF));
        if (newCase) {
          build.case = newCase;
          repairLog.push(`Gabinete ajustado a ${newCase.name} (soporta placas ${boardFF})`);
          madeRepair = true;
        }
        break;
      }

      // ── PSU insuficiente ────────────────────────────────────────────────────
      if (error.component === 'psu' && build.psu) {
        const needed = check.summary.recommendedPsu;
        const allPsu = await getByTypeAndBudget(COMPONENT_TYPES.PSU, budget);
        const newPsu = [...allPsu]
          .sort((a, b) => a.price - b.price)
          .find(p => p.wattage >= needed);
        if (newPsu) {
          build.psu = newPsu;
          repairLog.push(`Fuente de poder ajustada a ${newPsu.wattage}W`);
          madeRepair = true;
        }
        break;
      }
    }

    if (!madeRepair) break; // Sin progreso posible, salir
  }

  const finalValidation = validateBuild(build);
  const totalPrice = Object.values(build).reduce((sum, c) => sum + (c?.price || 0), 0);

  return {
    category,
    budget,
    build,
    alternatives,
    validation: finalValidation,
    repairLog,
    summary: {
      totalPrice,
      remaining: budget - totalPrice,
      performanceScore: calculateBuildScore(build, category),
      componentCount: Object.keys(build).length,
    },
  };
}

/**
 * Puntaje de rendimiento 0–100 basado en scores de componentes y prioridades de categoría.
 */
function calculateBuildScore(build, category) {
  const profile = CATEGORY_PRIORITIES[category];
  if (!profile) return 0;

  let totalScore = 0;
  let totalWeight = 0;

  for (const [type, weight] of Object.entries(profile.budgetWeights)) {
    const component = build[type];
    if (component?.performanceScore) {
      totalScore += component.performanceScore * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) / 100 : 0;
}

/**
 * Remplaza un componente en un build existente y re-valida.
 */
async function swapComponent(build, type, componentId) {
  const { getById } = require('../components/components.service');
  const newComponent = await getById(componentId);
  if (!newComponent) throw new Error('Componente no encontrado');

  const updatedBuild = { ...build, [type]: newComponent };
  const validation = validateBuild(updatedBuild);

  return { build: updatedBuild, validation };
}

module.exports = { generateBuild, swapComponent };
