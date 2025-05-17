import { adminEndpoints } from "./adminEndpoints";
import {
  User,
  Gamify,
  Activity,
  Badge,
  Reward,
  BanType,
  BanIssuerType,
  Payment,
  StripeCustomer,
  Subscription,
  TestPaymentIntentResponse,
} from "./types/admin.interface";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class AdminService {
  // User Management
  static async getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  } = {}): Promise<{ users: User[]; total: number; page: number; pageSize: number }> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));
    if (options.search) params.append('search', options.search);
    if (options.role) params.append('role', options.role);
    if (options.status) params.append('status', options.status);
    const url = `${adminEndpoints.getAllUsers}?${params.toString()}`;
    const headers = getAuthHeaders();
    const res = await fetch(url, {
      headers,
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }

  static async getUserById(id: string): Promise<User> {
    const url = adminEndpoints.getUserById.replace("{id}", id);
    const headers = getAuthHeaders();
    const res = await fetch(url, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  }

  static async getUserByUsername(username: string): Promise<User> {
    const url = adminEndpoints.getUserByUsername.replace("{username}", username);
    const headers = getAuthHeaders();
    const res = await fetch(url, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch user by username");
    return res.json();
  }

  static async updateUser(id: string, payload: Partial<User>): Promise<User> {
    const url = adminEndpoints.updateUser.replace("{id}", id);
    const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update user");
    return res.json();
  }

  static async deleteUser(id: string): Promise<{ message: string }> {
    const url = adminEndpoints.deleteUser.replace("{id}", id);
    const headers = getAuthHeaders();
    const res = await fetch(url, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete user");
    return res.json();
  }

  static async getCurrentUser(): Promise<User> {
    const url = adminEndpoints.getCurrentUser;
    const headers = getAuthHeaders();
    const res = await fetch(url, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch current user");
    return res.json();
  }

  // Gamification Management
  static async getAllGamify(): Promise<Gamify[]> {
    const res = await fetch(adminEndpoints.getAllGamify, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch gamify profiles");
    return res.json();
  }

  static async getGamifyById(id: string): Promise<Gamify> {
    const url = adminEndpoints.getGamifyById.replace("{id}", id);
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch gamify profile");
    return res.json();
  }

  static async updateGamify(id: string, payload: Partial<Gamify>): Promise<Gamify> {
    const url = adminEndpoints.updateGamify.replace("{id}", id);
    const res = await fetch(url, {
      method: "PUT",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update gamify profile");
    return res.json();
  }

  static async deleteGamify(id: string): Promise<{ message: string }> {
    const url = adminEndpoints.deleteGamify.replace("{id}", id);
    const res = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete gamify profile");
    return res.json();
  }

  // Activities
  static async getActivitiesByUsername(username: string): Promise<Activity[]> {
    const url = adminEndpoints.getActivitiesByUsername.replace("{username}", username);
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch activities");
    return res.json();
  }

  static async getActivityById(id: string): Promise<Activity> {
    const url = adminEndpoints.getActivityById.replace("{id}", id);
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch activity");
    return res.json();
  }

  static async getMyActivities(): Promise<Activity[]> {
    const res = await fetch(adminEndpoints.getMyActivities, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch my activities");
    return res.json();
  }

  // Badges
  static async getBadgesByUsername(username: string): Promise<Badge[]> {
    const url = adminEndpoints.getBadgesByUsername.replace("{username}", username);
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch badges");
    return res.json();
  }

  static async getBadgeById(id: string): Promise<Badge> {
    const url = adminEndpoints.getBadgeById.replace("{id}", id);
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch badge");
    return res.json();
  }

  static async getMyBadges(): Promise<Badge[]> {
    const res = await fetch(adminEndpoints.getMyBadges, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch my badges");
    return res.json();
  }

  // Rewards
  static async getRewardsByUsername(username: string): Promise<Reward[]> {
    const url = adminEndpoints.getRewardsByUsername.replace("{username}", username);
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch rewards");
    return res.json();
  }

  static async getRewardById(id: string): Promise<Reward> {
    const url = adminEndpoints.getRewardById.replace("{id}", id);
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch reward");
    return res.json();
  }

  static async getMyRewards(): Promise<Reward[]> {
    const res = await fetch(adminEndpoints.getMyRewards, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch my rewards");
    return res.json();
  }

  static async getUserCount(): Promise<number> {
    const url = adminEndpoints.getUserCount;
    const headers = getAuthHeaders();
    const res = await fetch(url, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch user count");
    const data = await res.json();
    return data.count;
  }

  static async getVerifiedUserCount(): Promise<number> {
    const url = adminEndpoints.getVerifiedUserCount;
    const headers = getAuthHeaders();
    const res = await fetch(url, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch verified user count");
    const data = await res.json();
    return data.count;
  }

  static async getBannedUserCount(): Promise<number> {
    const url = adminEndpoints.getBannedUserCount;
    const headers = getAuthHeaders();
    const res = await fetch(url, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch banned user count");
    const data = await res.json();
    return data.count;
  }

  static async getTimedOutUserCount(): Promise<number> {
    const url = adminEndpoints.getTimedOutUserCount;
    const headers = getAuthHeaders();
    const res = await fetch(url, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch timed out user count");
    const data = await res.json();
    return data.count;
  }

  static async banUser(
    id: string,
    ban: {
      type: BanType;
      issuerType: BanIssuerType;
      issuerId?: string;
      targetId?: string;
      reason?: string;
      expiresAt?: string;
      status?: 'active' | 'inactive';
    }
  ): Promise<User> {
    const url = adminEndpoints.banUser.replace("{id}", id);
    const res = await fetch(url, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(ban),
    });
    if (!res.ok) throw new Error("Failed to ban user");
    return res.json();
  }

  static async unbanUser(
    id: string,
    unban: { type: BanType; targetId?: string }
  ): Promise<User> {
    const url = adminEndpoints.unbanUser.replace("{id}", id);
    const res = await fetch(url, {
      method: "DELETE",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(unban),
    });
    if (!res.ok) throw new Error("Failed to unban user");
    return res.json();
  }

  static async createUser(payload: {
    email: string;
    username: string;
    password: string;
    roles?: string[];
    profile?: Record<string, unknown>;
    social?: Record<string, unknown>;
    status?: Record<string, unknown>;
    isVerified?: boolean;
  }): Promise<User> {
    const res = await fetch(adminEndpoints.getAllUsers, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text() || "Failed to create user");
    return res.json();
  }

  // --- Admin Payment Management ---
  static async listPayments(): Promise<Payment[]> {
    const url = adminEndpoints.listPayments;
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch payments");
    return res.json();
  }

  static async getPaymentById(id: string): Promise<Payment> {
    const url = adminEndpoints.getPaymentById.replace("{id}", id);
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch payment");
    return res.json();
  }

  static async refundPayment(id: string, amount?: number): Promise<unknown> {
    const url = adminEndpoints.refundPayment.replace("{id}", id);
    const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(amount ? { amount } : {}),
    });
    if (!res.ok) throw new Error("Failed to refund payment");
    return res.json();
  }

  static async listCustomers(): Promise<StripeCustomer[]> {
    const url = adminEndpoints.listCustomers;
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch customers");
    return res.json();
  }

  static async getCustomerById(id: string): Promise<StripeCustomer> {
    const url = adminEndpoints.getCustomerById.replace("{id}", id);
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch customer");
    return res.json();
  }

  static async listSubscriptions(): Promise<Subscription[]> {
    const url = adminEndpoints.listSubscriptions;
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch subscriptions");
    return res.json();
  }

  static async getSubscriptionById(id: string): Promise<Subscription> {
    const url = adminEndpoints.getSubscriptionById.replace("{id}", id);
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch subscription");
    return res.json();
  }

  static async cancelSubscription(id: string): Promise<unknown> {
    const url = adminEndpoints.cancelSubscription.replace("{id}", id);
    const headers = getAuthHeaders();
    const res = await fetch(url, { method: "POST", headers });
    if (!res.ok) throw new Error("Failed to cancel subscription");
    return res.json();
  }

  static async testPaymentIntent(params?: { amount?: number; currency?: string; customer?: string; metadata?: Record<string, unknown> }): Promise<TestPaymentIntentResponse> {
    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
    const res = await fetch(adminEndpoints.testPaymentIntent, {
      method: 'POST',
      headers,
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) throw new Error('Failed to create test payment intent');
    return res.json();
  }
}
