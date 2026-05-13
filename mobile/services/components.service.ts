import api from './api';
import type { Component, ComponentType } from '../types';

interface ComponentsFilter {
  type?: ComponentType;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export async function getComponents(filters: ComponentsFilter = {}): Promise<Component[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined) params.append(k, String(v));
  });
  const res = await api.get(`/components?${params.toString()}`);
  return res.data;
}

export async function getComponent(id: string): Promise<Component> {
  const res = await api.get(`/components/${id}`);
  return res.data;
}
