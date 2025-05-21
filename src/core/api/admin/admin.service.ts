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
  Role,
  Permission,
  Store,
  Category,
  Tag,
  Product,
  ShippingClass,
  ShippingClassInput,
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

  static async createGamify(payload: {
    userId: string;
    points: number;
    level: number;
    exp: number;
    crystals: number;
  }): Promise<Gamify> {
    const res = await fetch(adminEndpoints.getAllGamify, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        user: payload.userId,
        points: payload.points,
        level: payload.level,
        exp: payload.exp,
        crystals: payload.crystals,
      }),
    });
    if (!res.ok) throw new Error("Failed to create gamify profile");
    return res.json();
  }

  static async addPointsToGamify(id: string, amount: number): Promise<Gamify> {
    const url = adminEndpoints.getAllGamify + `/${id}/add-points`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to add/remove points');
    return res.json();
  }

  static async addLevelToGamify(id: string, amount: number): Promise<Gamify> {
    const url = adminEndpoints.getAllGamify + `/${id}/add-level`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to add/remove level');
    return res.json();
  }

  static async addExpToGamify(id: string, amount: number): Promise<Gamify> {
    const url = adminEndpoints.getAllGamify + `/${id}/add-exp`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to add/remove experience');
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

  // Admin Badge Management
  static async getAllBadges(): Promise<Badge[]> {
    const res = await fetch(adminEndpoints.getAllBadges, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch badges');
    return res.json();
  }

  static async createBadge(payload: Partial<Badge>): Promise<Badge> {
    const res = await fetch(adminEndpoints.getAllBadges, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create badge');
    return res.json();
  }

  static async updateBadge(id: string, payload: Partial<Badge>): Promise<Badge> {
    const url = adminEndpoints.getAllBadges + `/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update badge');
    return res.json();
  }

  static async deleteBadge(id: string): Promise<{ message: string }> {
    const url = adminEndpoints.getAllBadges + `/${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete badge');
    return res.json();
  }

  // Admin Reward Management
  static async getAllRewards(): Promise<Reward[]> {
    const res = await fetch(adminEndpoints.getAllRewards, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch rewards');
    return res.json();
  }

  static async createReward(payload: Partial<Reward>): Promise<Reward> {
    const res = await fetch(adminEndpoints.getAllRewards, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create reward');
    return res.json();
  }

  static async updateReward(id: string, payload: Partial<Reward>): Promise<Reward> {
    const url = adminEndpoints.getAllRewards + `/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update reward');
    return res.json();
  }

  static async deleteReward(id: string): Promise<{ message: string }> {
    const url = adminEndpoints.getAllRewards + `/${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete reward');
    return res.json();
  }

  // Role Management
  static async getAllRoles(): Promise<Role[]> {
    const res = await fetch(adminEndpoints.getAllRoles, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch roles");
    return res.json();
  }

  // Permission Management
  static async getAllPermissions(): Promise<Permission[]> {
    const res = await fetch(adminEndpoints.getAllPermissions, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch permissions");
    return res.json();
  }

  // Store Management
  static async getStore(): Promise<Store> {
    const url = adminEndpoints.getStore;
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch store");
    return res.json();
  }

  static async createStore(payload: Partial<Store>): Promise<Store> {
    const url = adminEndpoints.createStore;
    const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create store");
    return res.json();
  }

  static async updateStore(payload: Partial<Store>): Promise<Store> {
    const url = adminEndpoints.updateStore;
    const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update store");
    return res.json();
  }

  static async deleteStore(): Promise<{ message: string }> {
    const url = adminEndpoints.deleteStore;
    const headers = getAuthHeaders();
    const res = await fetch(url, { method: "DELETE", headers });
    if (!res.ok) throw new Error("Failed to delete store");
    return res.json();
  }

  // Category Management
  static async getAllCategories(): Promise<Category[]> {
    const url = adminEndpoints.getAllCategories;
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  }

  static async getCategoryById(id: string): Promise<Category> {
    const url = adminEndpoints.getCategoryById.replace("{id}", id);
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch category");
    return res.json();
  }

  static async createCategory(payload: Partial<Category>): Promise<Category> {
    const url = adminEndpoints.createCategory;
    const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return res.json();
  }

  static async updateCategory(id: string, payload: Partial<Category>): Promise<Category> {
    const url = adminEndpoints.updateCategory.replace("{id}", id);
    const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update category");
    return res.json();
  }

  static async deleteCategory(id: string): Promise<{ message: string }> {
    const url = adminEndpoints.deleteCategory.replace("{id}", id);
    const headers = getAuthHeaders();
    const res = await fetch(url, { method: "DELETE", headers });
    if (!res.ok) throw new Error("Failed to delete category");
    return res.json();
  }

  // Tag Management
  static async getAllTags(): Promise<Tag[]> {
    const url = adminEndpoints.getAllTags;
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch tags");
    return res.json();
  }

  static async getTagById(id: string): Promise<Tag> {
    const url = adminEndpoints.getTagById.replace("{id}", id);
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch tag");
    return res.json();
  }

  static async createTag(payload: Partial<Tag>): Promise<Tag> {
    const url = adminEndpoints.createTag;
    const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create tag");
    return res.json();
  }

  static async updateTag(id: string, payload: Partial<Tag>): Promise<Tag> {
    const url = adminEndpoints.updateTag.replace("{id}", id);
    const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update tag");
    return res.json();
  }

  static async deleteTag(id: string): Promise<{ message: string }> {
    const url = adminEndpoints.deleteTag.replace("{id}", id);
    const headers = getAuthHeaders();
    const res = await fetch(url, { method: "DELETE", headers });
    if (!res.ok) throw new Error("Failed to delete tag");
    return res.json();
  }

  // Product Management
  static async getAllProducts(): Promise<Product[]> {
    const url = adminEndpoints.getAllProducts;
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  }

  static async getProductById(id: string): Promise<Product> {
    const url = adminEndpoints.getProductById.replace("{id}", id);
    const headers = getAuthHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
  }

  static async createProduct(payload: Partial<Product>): Promise<Product> {
    const url = adminEndpoints.createProduct;
    const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  }

  static async updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
    const url = adminEndpoints.updateProduct.replace("{id}", id);
    const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  }

  static async deleteProduct(id: string): Promise<{ message: string }> {
    const url = adminEndpoints.deleteProduct.replace("{id}", id);
    const headers = getAuthHeaders();
    const res = await fetch(url, { method: "DELETE", headers });
    if (!res.ok) throw new Error("Failed to delete product");
    return res.json();
  }

  // Asset Upload
  static async uploadAsset({ file, storeId, vendorId, assetType }: { file: File; storeId?: string; vendorId?: string; assetType: string }): Promise<{ url: string }> {
    const url = adminEndpoints.uploadAsset;
    const authHeaders = getAuthHeaders();
    const headers: Record<string, string> = {};
    if (authHeaders['Authorization']) headers['Authorization'] = authHeaders['Authorization'];
    const formData = new FormData();
    formData.append('file', file);
    if (storeId) formData.append('storeId', storeId);
    if (vendorId) formData.append('vendorId', vendorId);
    formData.append('assetType', assetType);
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      let msg = 'Failed to upload asset';
      try { msg = (await res.json()).message || msg; } catch {}
      throw new Error(msg);
    }
    return res.json();
  }

  static async getAllShippingClasses(): Promise<ShippingClass[]> {
    const res = await fetch(adminEndpoints.getAllShippingClasses, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch shipping classes");
    return res.json();
  }

  static async getShippingClassById(id: string): Promise<ShippingClass> {
    const url = adminEndpoints.getShippingClassById.replace("{id}", id);
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch shipping class");
    return res.json();
  }

  static async createShippingClass(payload: ShippingClassInput): Promise<ShippingClass> {
    const res = await fetch(adminEndpoints.createShippingClass, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create shipping class");
    return res.json();
  }

  static async updateShippingClass(id: string, payload: ShippingClassInput): Promise<ShippingClass> {
    const url = adminEndpoints.updateShippingClass.replace("{id}", id);
    const res = await fetch(url, {
      method: "PUT",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update shipping class");
    return res.json();
  }

  static async deleteShippingClass(id: string): Promise<{ message: string }> {
    const url = adminEndpoints.deleteShippingClass.replace("{id}", id);
    const res = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete shipping class");
    return res.json();
  }
}
