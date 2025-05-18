import { paymentEndpoints } from './paymentEndpoints';

export async function createOrderAndPaymentIntent({ user, items, total, currency, customer, metadata }: {
  user: string;
  items: Array<{ productId: string; priceId?: string; quantity: number; amount: number }>;
  total: number;
  currency: string;
  customer?: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(paymentEndpoints.createPaymentIntent, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, items, total, currency, customer, metadata }),
  });
  if (!res.ok) throw new Error(await res.text() || 'Failed to create order/payment intent');
  return res.json();
}
