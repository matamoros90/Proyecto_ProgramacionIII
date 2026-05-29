import { useCallback } from 'react';
import { useBuilderStore } from '../stores/builderStore';
import { generateRecommendation, checkCompatibility } from '../services/builds.service';
import type { PcCategory, ComponentType, Component } from '../types';

export function useBuilder() {
  const store = useBuilderStore();

  const generateBuild = useCallback(async () => {
    if (!store.category) return null;
    store.setLoadingRecommendation(true);
    try {
      const result = await generateRecommendation(store.budget, store.category);
      store.applyRecommendation(result);
      return result;
    } catch (err) {
      // Propaga el error para que la pantalla pueda mostrarlo al usuario
      throw err;
    } finally {
      store.setLoadingRecommendation(false);
    }
  }, [store.budget, store.category]);

  const replaceComponent = useCallback(
    async (type: ComponentType, component: Component | undefined) => {
      store.setComponent(type, component);
      // Re-validar compatibilidad en tiempo real
      const updatedBuild = { ...store.build, [type]: component };
      try {
        const result = await checkCompatibility(updatedBuild);
        store.setCompatibility(result);
      } catch {
        // validación offline fallback — no bloquea la UI
      }
    },
    [store.build]
  );

  return {
    budget: store.budget,
    category: store.category,
    build: store.build,
    recommendation: store.recommendation,
    isLoading: store.isLoadingRecommendation,
    compatibility: store.compatibility,
    totalPrice: store.getTotalPrice(),
    setBudget: store.setBudget,
    setCategory: store.setCategory,
    generateBuild,
    replaceComponent,
    resetBuild: store.resetBuild,
  };
}
