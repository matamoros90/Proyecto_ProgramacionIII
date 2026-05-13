import api from './api';
import type { Quote, Order, Build, PcCategory } from '../types';

export async function createQuote(
  build: Build,
  totalPrice: number,
  category: PcCategory,
  notes?: string
): Promise<Quote> {
  const res = await api.post('/quotes', { build, totalPrice, category, notes });
  return res.data;
}

export async function getMyQuotes(): Promise<Quote[]> {
  const res = await api.get('/quotes');
  return res.data;
}

export async function confirmQuote(quoteId: string): Promise<Quote> {
  const res = await api.patch(`/quotes/${quoteId}/confirm`);
  return res.data;
}

export async function createOrder(quoteId: string): Promise<Order> {
  const res = await api.post('/orders', { quoteId });
  return res.data;
}

export async function getMyOrders(): Promise<Order[]> {
  const res = await api.get('/orders');
  return res.data;
}

export async function getOrder(id: string): Promise<Order> {
  const res = await api.get(`/orders/${id}`);
  return res.data;
}
