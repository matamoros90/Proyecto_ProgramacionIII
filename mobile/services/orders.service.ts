import api from './api';
import type { Quote, Order, Build, PcCategory } from '../types';

export async function createQuote(
  build: Build,
  totalPrice: number,
  category: PcCategory,
  notes?: string
): Promise<Quote> {
  const res = await api.post('/quotes', { build, totalPrice, category, notes });
  return (res as any).data;
}

export async function getMyQuotes(): Promise<Quote[]> {
  const res = await api.get('/quotes');
  return (res as any).data;
}

export async function getQuoteById(quoteId: string): Promise<Quote> {
  const res = await api.get(`/quotes/${quoteId}`);
  return (res as any).data;
}

export async function confirmQuote(quoteId: string): Promise<Quote> {
  const res = await api.patch(`/quotes/${quoteId}/confirm`);
  return (res as any).data;
}

export async function acceptQuote(
  quoteId: string,
  deliveryAddress: string,
  deliveryDepartment: string
): Promise<Quote> {
  const res = await api.patch(`/quotes/${quoteId}/accept`, { deliveryAddress, deliveryDepartment });
  return (res as any).data;
}

export async function submitPayment(
  quoteId: string,
  payload: { method: 'card' | 'bank_transfer'; cardNumber?: string; bankRef?: string }
): Promise<Quote> {
  const res = await api.post(`/quotes/${quoteId}/payment`, payload);
  return (res as any).data;
}

// ── Funciones de vendedor ──────────────────────────────────────────────────────

export async function getVendorQuotes(): Promise<Quote[]> {
  const res = await api.get('/quotes/vendor/assigned');
  return (res as any).data;
}

export async function sendVendorFollowup(quoteId: string): Promise<void> {
  await api.post(`/quotes/${quoteId}/followup`);
}

export async function markQuoteReady(quoteId: string): Promise<Quote> {
  const res = await api.patch(`/quotes/${quoteId}/ready`);
  return (res as any).data;
}

export async function verifyQuotePayment(quoteId: string): Promise<{ orderId: string }> {
  const res = await api.patch(`/quotes/${quoteId}/verify-payment`);
  return (res as any).data;
}

// ── Órdenes ───────────────────────────────────────────────────────────────────

export async function createOrder(quoteId: string): Promise<Order> {
  const res = await api.post('/orders', { quoteId });
  return (res as any).data;
}

export async function getMyOrders(): Promise<Order[]> {
  const res = await api.get('/orders');
  return (res as any).data;
}

export async function getOrder(id: string): Promise<Order> {
  const res = await api.get(`/orders/${id}`);
  return (res as any).data;
}
