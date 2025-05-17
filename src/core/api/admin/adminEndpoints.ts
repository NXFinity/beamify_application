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
  getAllGamify: `${API_BASE_URL}/${API_BASE_VER}/gamify`,
  getGamifyById: `${API_BASE_URL}/${API_BASE_VER}/gamify/{id}`,
  updateGamify: `${API_BASE_URL}/${API_BASE_VER}/gamify/{id}`,
  deleteGamify: `${API_BASE_URL}/${API_BASE_VER}/gamify/{id}`,

  // Activities
  getActivitiesByUsername: `${API_BASE_URL}/${API_BASE_VER}/gamify/activities/user/{username}`,
  getActivityById: `${API_BASE_URL}/${API_BASE_VER}/gamify/activities/{id}`,
  getMyActivities: `${API_BASE_URL}/${API_BASE_VER}/gamify/activities/me`,

  // Badges
  getBadgesByUsername: `${API_BASE_URL}/${API_BASE_VER}/gamify/badges/user/{username}`,
  getBadgeById: `${API_BASE_URL}/${API_BASE_VER}/gamify/badges/{id}`,
  getMyBadges: `${API_BASE_URL}/${API_BASE_VER}/gamify/badges/me`,

  // Rewards
  getRewardsByUsername: `${API_BASE_URL}/${API_BASE_VER}/gamify/rewards/user/{username}`,
  getRewardById: `${API_BASE_URL}/${API_BASE_VER}/gamify/rewards/{id}`,
  getMyRewards: `${API_BASE_URL}/${API_BASE_VER}/gamify/rewards/me`,

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
};
