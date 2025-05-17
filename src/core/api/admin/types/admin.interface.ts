export interface UserProfile {
  avatar?: string;
  displayName?: string;
  bio?: string;
  cover?: string;
}

export type BanType =
  | "SITEBAN"
  | "TIMEBAN"
  | "CHANNELBAN"
  | "CHATBAN"
  | "USERBAN";

export type BanIssuerType = "ADMIN" | "USER";

export interface UserBan {
  type: BanType;
  issuerType: BanIssuerType;
  issuerId: string;
  targetId?: string;
  reason?: string;
  expiresAt?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface User {
  _id: string;
  username: string;
  email?: string;
  roles?: string[];
  profile?: UserProfile;
  bans?: UserBan[];
}

export interface Gamify {
  _id: string;
  user: string; // user id
  points: number;
  level: number;
  exp: number;
  crystals: number;
  achievements: string[];
  quests: string[];
  badges: string[];
}

export interface Activity {
  _id: string;
  user: string;
  type: string;
  description?: string;
  createdAt: string;
}

export interface Badge {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Reward {
  _id: string;
  name: string;
  description?: string;
  value: number;
}

export interface Payment {
  _id: string;
  user?: string;
  amount: number;
  currency: string;
  status: string;
  paymentIntentId: string;
  customerId?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface StripeCustomer {
  id: string;
  email?: string;
  name?: string;
  metadata?: Record<string, unknown>;
  created?: number;
}

export interface Subscription {
  id: string;
  customer: string;
  status: string;
  items?: unknown[];
  current_period_end?: number;
  current_period_start?: number;
  cancel_at_period_end?: boolean;
  canceled_at?: number;
  [key: string]: unknown;
}

export interface ConfirmTestPaymentResult {
  paymentIntent?: Record<string, unknown>;
  error?: { message: string };
}

export interface TestPaymentIntentResponse {
  clientSecret: string;
  intent: Record<string, unknown>; // Stripe PaymentIntent object
  confirmResult?: ConfirmTestPaymentResult;
} 