const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3021';
const API_BASE_VER = process.env.NEXT_PUBLIC_API_BASE_VERSION || 'v1';

export const adminEndpoints = {
  // User Management
  getAllUsers: `${API_BASE_URL}/${API_BASE_VER}/admin/users`,
  getUserById: `${API_BASE_URL}/${API_BASE_VER}/admin/users/{id}`,
  getUserByUsername: `${API_BASE_URL}/${API_BASE_VER}/admin/users/username/{username}`,
  updateUser: `${API_BASE_URL}/${API_BASE_VER}/admin/users/{id}`,
  deleteUser: `${API_BASE_URL}/${API_BASE_VER}/admin/users/{id}`,
  getCurrentUser: `${API_BASE_URL}/${API_BASE_VER}/admin/users/me`,
  banUser: `${API_BASE_URL}/${API_BASE_VER}/admin/users/{id}/ban`,
  unbanUser: `${API_BASE_URL}/${API_BASE_VER}/admin/users/{id}/ban`,

  // Gamification Management
  getAllGamify: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify`,
  getGamifyById: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify/{id}`,
  updateGamify: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify/{id}`,
  deleteGamify: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify/{id}`,

  // Activities
  getActivitiesByUsername: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify/activities/user/{username}`,
  getActivityById: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify/activities/{id}`,
  getMyActivities: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify/activities/me`,

  // Badges
  getBadgesByUsername: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify/badges/user/{username}`,
  getBadgeById: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify/badges/{id}`,
  getMyBadges: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify/badges/me`,
  getAllBadges: `${API_BASE_URL}/${API_BASE_VER}/admin/badges`,

  // Rewards
  getRewardsByUsername: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify/rewards/user/{username}`,
  getRewardById: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify/rewards/{id}`,
  getMyRewards: `${API_BASE_URL}/${API_BASE_VER}/admin/gamify/rewards/me`,
  getAllRewards: `${API_BASE_URL}/${API_BASE_VER}/admin/rewards`,

  // User Count
  getUserCount: `${API_BASE_URL}/${API_BASE_VER}/admin/users/count`,
  getVerifiedUserCount: `${API_BASE_URL}/${API_BASE_VER}/admin/users/count-verified`,
  getBannedUserCount: `${API_BASE_URL}/${API_BASE_VER}/admin/users/count-banned`,
  getTimedOutUserCount: `${API_BASE_URL}/${API_BASE_VER}/admin/users/count-timedout`,

  // Admin Payment Management
  listPayments: `${API_BASE_URL}/${API_BASE_VER}/admin/payments`,
  getPaymentById: `${API_BASE_URL}/${API_BASE_VER}/admin/payments/{id}`,
  refundPayment: `${API_BASE_URL}/${API_BASE_VER}/admin/payments/{id}/refund`,
  listCustomers: `${API_BASE_URL}/${API_BASE_VER}/admin/customers`,
  getCustomerById: `${API_BASE_URL}/${API_BASE_VER}/admin/customers/{id}`,
  listSubscriptions: `${API_BASE_URL}/${API_BASE_VER}/admin/subscriptions`,
  getSubscriptionById: `${API_BASE_URL}/${API_BASE_VER}/admin/subscriptions/{id}`,
  cancelSubscription: `${API_BASE_URL}/${API_BASE_VER}/admin/subscriptions/{id}/cancel`,
  testPaymentIntent: `${API_BASE_URL}/${API_BASE_VER}/admin/payment/test-intent`,

  // Role Management
  getAllRoles: `${API_BASE_URL}/${API_BASE_VER}/admin/roles`,
  getRoleById: `${API_BASE_URL}/${API_BASE_VER}/admin/roles/{id}`,
  createRole: `${API_BASE_URL}/${API_BASE_VER}/admin/roles`,
  updateRole: `${API_BASE_URL}/${API_BASE_VER}/admin/roles/{id}`,
  deleteRole: `${API_BASE_URL}/${API_BASE_VER}/admin/roles/{id}`,

  // Permission Management
  getAllPermissions: `${API_BASE_URL}/${API_BASE_VER}/admin/permissions`,
  getPermissionById: `${API_BASE_URL}/${API_BASE_VER}/admin/permissions/{id}`,
  createPermission: `${API_BASE_URL}/${API_BASE_VER}/admin/permissions`,
  updatePermission: `${API_BASE_URL}/${API_BASE_VER}/admin/permissions/{id}`,
  deletePermission: `${API_BASE_URL}/${API_BASE_VER}/admin/permissions/{id}`,

  // Store Management
  getStore: `${API_BASE_URL}/${API_BASE_VER}/admin/store`,
  createStore: `${API_BASE_URL}/${API_BASE_VER}/admin/store`,
  updateStore: `${API_BASE_URL}/${API_BASE_VER}/admin/store`,
  deleteStore: `${API_BASE_URL}/${API_BASE_VER}/admin/store`,

  // Category Management
  getAllCategories: `${API_BASE_URL}/${API_BASE_VER}/admin/categories`,
  getCategoryById: `${API_BASE_URL}/${API_BASE_VER}/admin/categories/{id}`,
  createCategory: `${API_BASE_URL}/${API_BASE_VER}/admin/categories`,
  updateCategory: `${API_BASE_URL}/${API_BASE_VER}/admin/categories/{id}`,
  deleteCategory: `${API_BASE_URL}/${API_BASE_VER}/admin/categories/{id}`,

  // Tag Management
  getAllTags: `${API_BASE_URL}/${API_BASE_VER}/admin/tags`,
  getTagById: `${API_BASE_URL}/${API_BASE_VER}/admin/tags/{id}`,
  createTag: `${API_BASE_URL}/${API_BASE_VER}/admin/tags`,
  updateTag: `${API_BASE_URL}/${API_BASE_VER}/admin/tags/{id}`,
  deleteTag: `${API_BASE_URL}/${API_BASE_VER}/admin/tags/{id}`,

  // Product Management
  getAllProducts: `${API_BASE_URL}/${API_BASE_VER}/admin/products`,
  getProductById: `${API_BASE_URL}/${API_BASE_VER}/admin/products/{id}`,
  createProduct: `${API_BASE_URL}/${API_BASE_VER}/admin/products`,
  updateProduct: `${API_BASE_URL}/${API_BASE_VER}/admin/products/{id}`,
  deleteProduct: `${API_BASE_URL}/${API_BASE_VER}/admin/products/{id}`,

  // Asset Upload
  uploadAsset: `${API_BASE_URL}/${API_BASE_VER}/admin/assets/upload`,

  // Shipping Class Management
  getAllShippingClasses: `${API_BASE_URL}/${API_BASE_VER}/admin/shipping-classes`,
  getShippingClassById: `${API_BASE_URL}/${API_BASE_VER}/admin/shipping-classes/{id}`,
  createShippingClass: `${API_BASE_URL}/${API_BASE_VER}/admin/shipping-classes`,
  updateShippingClass: `${API_BASE_URL}/${API_BASE_VER}/admin/shipping-classes/{id}`,
  deleteShippingClass: `${API_BASE_URL}/${API_BASE_VER}/admin/shipping-classes/{id}`,
};
