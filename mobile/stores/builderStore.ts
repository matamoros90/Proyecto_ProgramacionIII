import { create } from 'zustand';
import type {
  Build, Component, ComponentType, PcCategory,
  CompatibilityResult, RecommendationResult,
} from '../types';

interface BuilderState {
  // Configuración actual
  budget: number;
  category: PcCategory | null;
  build: Build;

  // Recomendación generada
  recommendation: RecommendationResult | null;
  isLoadingRecommendation: boolean;

  // Validación en tiempo real
  compatibility: CompatibilityResult | null;

  // Acciones
  setBudget: (budget: number) => void;
  setCategory: (category: PcCategory) => void;
  setComponent: (type: ComponentType, component: Component | undefined) => void;
  setRecommendation: (rec: RecommendationResult | null) => void;
  setLoadingRecommendation: (v: boolean) => void;
  setCompatibility: (result: CompatibilityResult | null) => void;
  applyRecommendation: (rec: RecommendationResult) => void;
  resetBuild: () => void;
  getTotalPrice: () => number;
}

const emptyBuild: Build = {};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  budget: 3000,
  category: null,
  build: emptyBuild,
  recommendation: null,
  isLoadingRecommendation: false,
  compatibility: null,

  setBudget: (budget) => set({ budget }),
  setCategory: (category) => set({ category }),

  setComponent: (type, component) =>
    set((state) => ({
      build: { ...state.build, [type]: component },
    })),

  setRecommendation: (recommendation) => set({ recommendation }),
  setLoadingRecommendation: (isLoadingRecommendation) => set({ isLoadingRecommendation }),
  setCompatibility: (compatibility) => set({ compatibility }),

  applyRecommendation: (rec) =>
    set({
      build: rec.build,
      compatibility: rec.validation,
      recommendation: rec,
    }),

  resetBuild: () =>
    set({
      build: emptyBuild,
      recommendation: null,
      compatibility: null,
    }),

  getTotalPrice: () => {
    const { build } = get();
    return Object.values(build).reduce((sum, c) => sum + (c?.price || 0), 0);
  },
}));
