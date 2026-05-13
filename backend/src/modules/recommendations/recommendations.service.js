const { getByTypeAndBudget } = require('../components/components.service');
const { validateBuild } = require('../compatibility/compatibility.service');
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

  // Paso 2: validar compatibilidad y reparar socket si hay conflicto
  const validation = validateBuild(build);
  const repairLog = [];

  if (!validation.compatible) {
    for (const error of validation.errors) {
      if (error.component === 'cpu-motherboard' && build.cpu && build.motherboard) {
        const fixedBoards = await getByTypeAndBudget(
          COMPONENT_TYPES.MOTHERBOARD,
          Math.floor(budget * weights.motherboard)
        );
        const compatible = fixedBoards.find(b => b.socket === build.cpu.socket);
        if (compatible) {
          build.motherboard = compatible;
          repairLog.push(`Placa madre ajustada automáticamente a socket ${build.cpu.socket}`);
        }
      }

      if (error.component === 'psu' && build.psu) {
        const totalWatts = validation.summary.recommendedPsu;
        const betterPsu = await getByTypeAndBudget(COMPONENT_TYPES.PSU, budget * 0.15);
        const suitable = betterPsu.find(p => p.wattage >= totalWatts);
        if (suitable) {
          build.psu = suitable;
          repairLog.push(`Fuente de poder ajustada a ${suitable.wattage}W para mayor estabilidad`);
        }
      }
    }
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
