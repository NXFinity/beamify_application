// Payment endpoints for the new order+payment flow
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3021';
const API_BASE_VER = process.env.NEXT_PUBLIC_API_BASE_VERSION || 'v1';

export const paymentEndpoints = {
  createPaymentIntent: `${API_BASE_URL}/${API_BASE_VER}/payment/intent`,
  // Add more endpoints as needed
};
