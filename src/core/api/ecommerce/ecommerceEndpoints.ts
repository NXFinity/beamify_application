const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3021';
const API_BASE_VER = process.env.NEXT_PUBLIC_API_BASE_VERSION || 'v1';

export const ecommerceEndpoints = {
  getStore: `${API_BASE_URL}/${API_BASE_VER}/store`,
  getProducts: `${API_BASE_URL}/${API_BASE_VER}/products`,
  getProductById: (id: string) => `${API_BASE_URL}/${API_BASE_VER}/products/${id}`,
  getCategories: `${API_BASE_URL}/${API_BASE_VER}/categories`,
  getCategoryById: (id: string) => `${API_BASE_URL}/${API_BASE_VER}/categories/${id}`,
  getTags: `${API_BASE_URL}/${API_BASE_VER}/tags`,
  getTagById: (id: string) => `${API_BASE_URL}/${API_BASE_VER}/tags/${id}`,
  getVendors: `${API_BASE_URL}/${API_BASE_VER}/vendor`,
  getVendorById: (id: string) => `${API_BASE_URL}/${API_BASE_VER}/vendor/${id}`,
  getAsset: (filename: string) => `${API_BASE_URL}/${API_BASE_VER}/assets/${filename}`,
  getProductBySku: (sku: string) => `${API_BASE_URL}/${API_BASE_VER}/products/sku/${sku}`,
  // Add other public endpoints as needed
};
