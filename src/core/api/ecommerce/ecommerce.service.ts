import { ecommerceEndpoints } from "./ecommerceEndpoints";

export class EcommerceService {
  static async getStore() {
    const res = await fetch(ecommerceEndpoints.getStore);
    if (!res.ok) throw new Error("Failed to fetch store");
    return res.json();
  }

  static async getProducts() {
    const res = await fetch(ecommerceEndpoints.getProducts);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  }

  static async getProductById(id: string) {
    const res = await fetch(ecommerceEndpoints.getProductById(id));
    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
  }

  static async getCategories() {
    const res = await fetch(ecommerceEndpoints.getCategories);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  }

  static async getCategoryById(id: string) {
    const res = await fetch(ecommerceEndpoints.getCategoryById(id));
    if (!res.ok) throw new Error("Failed to fetch category");
    return res.json();
  }

  static async getTags() {
    const res = await fetch(ecommerceEndpoints.getTags);
    if (!res.ok) throw new Error("Failed to fetch tags");
    return res.json();
  }

  static async getTagById(id: string) {
    const res = await fetch(ecommerceEndpoints.getTagById(id));
    if (!res.ok) throw new Error("Failed to fetch tag");
    return res.json();
  }

  static async getVendors() {
    const res = await fetch(ecommerceEndpoints.getVendors);
    if (!res.ok) throw new Error("Failed to fetch vendors");
    return res.json();
  }

  static async getVendorById(id: string) {
    const res = await fetch(ecommerceEndpoints.getVendorById(id));
    if (!res.ok) throw new Error("Failed to fetch vendor");
    return res.json();
  }

  static async getAsset(filename: string) {
    const res = await fetch(ecommerceEndpoints.getAsset(filename));
    if (!res.ok) throw new Error("Failed to fetch asset");
    return res.blob();
  }

  static async getProductBySku(sku: string) {
    const res = await fetch(ecommerceEndpoints.getProductBySku(sku));
    if (!res.ok) throw new Error("Failed to fetch product by SKU");
    return res.json();
  }
}
