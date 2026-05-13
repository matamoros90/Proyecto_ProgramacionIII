import api from './api';
import type { Build, PcCategory, RecommendationResult, CompatibilityResult, SavedBuild } from '../types';

export async function generateRecommendation(
  budget: number,
  category: PcCategory
): Promise<RecommendationResult> {
  const res = await api.post('/recommendations/generate', { budget, category });
  return res.data;
}

export async function checkCompatibility(build: Build): Promise<CompatibilityResult> {
  const res = await api.post('/compatibility/check', { build });
  return res.data;
}

export async function swapComponent(
  build: Build,
  type: string,
  componentId: string
): Promise<{ build: Build; validation: CompatibilityResult }> {
  const res = await api.post('/recommendations/swap', { build, type, componentId });
  return res.data;
}

export async function saveMyBuild(name: string, category: PcCategory, build: Build, notes?: string): Promise<SavedBuild> {
  const totalPrice = Object.values(build).reduce((sum, c) => sum + (c?.price || 0), 0);
  const res = await api.post('/builds', { name, category, build, totalPrice, notes });
  return res.data;
}

export async function getMyBuilds(): Promise<SavedBuild[]> {
  const res = await api.get('/builds');
  return res.data;
}

export async function deleteBuild(id: string): Promise<void> {
  await api.delete(`/builds/${id}`);
}
