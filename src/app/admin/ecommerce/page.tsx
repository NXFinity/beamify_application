"use client";
import React, { useEffect, useState } from "react";
import { AdminService } from "@/core/api/admin/admin.service";
import { Store, Category, Tag, Product } from "@/core/api/admin/types/admin.interface";
import Link from "next/link";
import {
  FlipCard,
  FlipCardContent
} from "@/theme/ui/flipcards";
import dynamic from "next/dynamic";
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EcommerceManagementPage() {
  // State
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal/form state
  const [showStoreEdit, setShowStoreEdit] = useState(false);
  const [showStoreLogoStep, setShowStoreLogoStep] = useState(false);
  const [storeForm, setStoreForm] = useState<Partial<Store>>({ status: 'active' });
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showTagForm, setShowTagForm] = useState(false);
  const [tagForm, setTagForm] = useState<Partial<Tag>>({});
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Add state for editing product
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Add state for editing attributes and description
  const [editAttributes, setEditAttributes] = useState<{ name: string; values: string[] }[]>([]);
  const [editAttrName, setEditAttrName] = useState("");
  const [editAttrValue, setEditAttrValue] = useState("");
  const [editAttrValues, setEditAttrValues] = useState<string[]>([]);
  const [editAttrError, setEditAttrError] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Fetch all data
  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      AdminService.getStore().catch(() => null),
      AdminService.getAllCategories().catch(() => []),
      AdminService.getAllTags().catch(() => []),
      AdminService.getAllProducts().catch(() => []),
    ])
      .then(([store, categories, tags, products]) => {
        setStore(store);
        setCategories(categories);
        setTags(tags);
        setProducts(products);
      })
      .catch((e) => setError(e.message || "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  // Store handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStoreForm({ ...storeForm, [e.target.name]: e.target.value });
  };
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Only allow 'active' or 'inactive' for status
    if (e.target.name === 'status') {
      setStoreForm({ ...storeForm, status: e.target.value as 'active' | 'inactive' });
    } else {
      setStoreForm({ ...storeForm, [e.target.name]: e.target.value });
    }
  };
  const handleStoreFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!store) {
        const created = await AdminService.createStore(storeForm);
        setStore(created);
        setShowStoreLogoStep(true);
        setShowStoreEdit(false);
      } else {
        const updated = await AdminService.updateStore({ ...store, ...storeForm });
        setStore(updated);
        setShowStoreEdit(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save store';
      alert(msg);
    }
  };

  // Store logo/cover upload handlers (step 2)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !store?._id) return;
    setLogoUploading(true);
    try {
      const res = await AdminService.uploadAsset({ file, storeId: store._id, assetType: 'logo' });
      setLogoUrl(res.url);
      const updated = await AdminService.updateStore({ ...store, logo: res.url });
      setStore(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload logo';
      alert(msg);
    } finally {
      setLogoUploading(false);
    }
  };
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !store?._id) return;
    setCoverUploading(true);
    try {
      const res = await AdminService.uploadAsset({ file, storeId: store._id, assetType: 'cover' });
      setCoverUrl(res.url);
      const updated = await AdminService.updateStore({ ...store, cover: res.url });
      setStore(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload cover';
      alert(msg);
    } finally {
      setCoverUploading(false);
    }
  };

  // Category handlers
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value });
  };
  const handleCategoryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const updated = await AdminService.updateCategory(editingCategory._id, categoryForm);
        setCategories(categories.map((c) => (c._id === updated._id ? updated : c)));
      } else {
        const created = await AdminService.createCategory(categoryForm);
        setCategories([created, ...categories]);
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryForm({});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save category';
      alert(msg);
    }
  };
  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm(cat);
    setShowCategoryForm(true);
  };
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await AdminService.deleteCategory(id);
      setCategories(categories.filter((c) => c._id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete category';
      alert(msg);
    }
  };

  // Tag handlers
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTagForm({ ...tagForm, [e.target.name]: e.target.value });
  };
  const handleTagFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        const updated = await AdminService.updateTag(editingTag._id, tagForm);
        setTags(tags.map((t) => (t._id === updated._id ? updated : t)));
      } else {
        const created = await AdminService.createTag(tagForm);
        setTags([created, ...tags]);
      }
      setShowTagForm(false);
      setEditingTag(null);
      setTagForm({});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save tag';
      alert(msg);
    }
  };
  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagForm(tag);
    setShowTagForm(true);
  };
  const handleDeleteTag = async (id: string) => {
    if (!window.confirm("Delete this tag?")) return;
    try {
      await AdminService.deleteTag(id);
      setTags(tags.filter((t) => t._id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete tag';
      alert(msg);
    }
  };

  // Product handlers
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await AdminService.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product';
      alert(msg);
    }
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod._id);
    setEditForm({ ...prod });
    setEditAttributes(prod.attributes || []);
    setEditDescription(prod.description || "");
    setEditAttrName("");
    setEditAttrValues([]);
    setEditAttrError("");
    setEditError("");
  };
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "tags") {
      setEditForm({ ...editForm, tags: value.split(",") });
    } else if (name === "category") {
      setEditForm({ ...editForm, category: value });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };
  const handleEditSave = async () => {
    if (!editingProductId) return;
    setEditLoading(true);
    setEditError("");
    try {
      const updated = await AdminService.updateProduct(editingProductId, {
        ...editForm,
        attributes: editAttributes,
        description: editDescription,
      });
      setProducts(products.map((p) => (p._id === updated._id ? updated : p)));
      setEditingProductId(null);
      setEditForm({});
      setEditAttributes([]);
      setEditDescription("");
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setEditLoading(false);
    }
  };
  const handleEditCancel = () => {
    setEditingProductId(null);
    setEditForm({});
    setEditAttributes([]);
    setEditDescription("");
    setEditAttrName("");
    setEditAttrValues([]);
    setEditAttrError("");
    setEditError("");
  };

  // Attribute handlers for edit
  const handleEditAddAttrValue = () => {
    if (editAttrValue.trim() && !editAttrValues.includes(editAttrValue.trim())) {
      setEditAttrValues([...editAttrValues, editAttrValue.trim()]);
      setEditAttrValue("");
    }
  };
  const handleEditRemoveAttrValue = (val: string) => {
    setEditAttrValues(editAttrValues.filter(v => v !== val));
  };
  const handleEditAddAttribute = () => {
    if (!editAttrName.trim()) {
      setEditAttrError("Attribute name required");
      return;
    }
    if (editAttrValues.length === 0) {
      setEditAttrError("At least one value required");
      return;
    }
    setEditAttributes([...editAttributes, { name: editAttrName.trim(), values: editAttrValues }]);
    setEditAttrName("");
    setEditAttrValues([]);
    setEditAttrError("");
  };
  const handleEditRemoveAttribute = (idx: number) => {
    setEditAttributes(editAttributes.filter((_, i) => i !== idx));
  };

  // Render
  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 px-4 py-8">
      {error && <div className="text-red-400 mb-4">{error}</div>}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* If no store, show only create store UI */}
          {!store ? (
            <div className="flex flex-col lg:flex-row gap-8 max-w-4xl mx-auto mb-12">
              {/* Create Your Store Card */}
              <div className="rounded-2xl shadow-2xl border border-gray-800 bg-gray-900 p-10 flex flex-col items-center w-full max-w-lg flex-1">
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-[#ff3c00]/10 rounded-full p-4 mb-4">
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#ff3c00]">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4M4 10v7a2 2 0 002 2h2m8 0h2a2 2 0 002-2v-7M4 10l8 4 8-4M4 10v7a2 2 0 002 2h2m8 0h2a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white mb-2">Create Your Store</h2>
                  <p className="text-gray-300 text-center max-w-xs">Set up your Beamify Store to unlock all ecommerce features. You must create the store before managing categories, tags, or products.</p>
                </div>
                <button className="px-8 py-3 rounded-lg bg-[#ff3c00] text-white font-bold text-lg shadow-lg hover:bg-[#ff6a00] transition mb-2" onClick={() => setShowStoreEdit((v) => !v)}>
                  {showStoreEdit ? 'Hide Form' : 'Create Store'}
                </button>
              </div>
              {/* Create Store Form Panel (Step 1) */}
              {showStoreEdit && !showStoreLogoStep && (
                <div className="rounded-2xl shadow-2xl border border-gray-800 bg-gray-900 p-10 w-full max-w-lg animate-fade-in flex-1 min-w-[320px]">
                  <form onSubmit={handleStoreFormSubmit}>
                    <h3 className="text-2xl font-extrabold mb-8 text-white">Store Details</h3>
                    <div className="mb-6">
                      <label className="block text-gray-300 mb-2 font-semibold">Name</label>
                      <input name="name" value={storeForm.name || ""} onChange={handleInputChange} placeholder="Store Name" className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-[#ff3c00] focus:outline-none" required />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-300 mb-2 font-semibold">Description</label>
                      <textarea name="description" value={storeForm.description || ""} onChange={handleInputChange} placeholder="Description" className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-[#ff3c00] focus:outline-none" />
                    </div>
                    <div className="mb-8">
                      <label className="block text-gray-300 mb-2 font-semibold">Status</label>
                      <select name="status" value={storeForm.status || "active"} onChange={handleSelectChange} className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-[#ff3c00] focus:outline-none">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="flex gap-4 justify-end mt-8">
                      <button type="button" className="px-5 py-2 rounded-lg bg-gray-700 text-gray-200 font-semibold hover:bg-gray-600 transition" onClick={() => setShowStoreEdit(false)}>Cancel</button>
                      <button type="submit" className="px-8 py-2 rounded-lg bg-[#ff3c00] text-white font-bold text-lg shadow-lg hover:bg-[#ff6a00] transition">Create Store</button>
                    </div>
                  </form>
                </div>
              )}
              {/* Step 2: Logo/Cover Upload Panel */}
              {showStoreLogoStep && store && (
                (() => {
                  const s: Store = store;
                  return (
                    <div className="rounded-2xl shadow-2xl border border-gray-800 bg-gray-900 p-10 w-full max-w-lg animate-fade-in flex-1 min-w-[320px]">
                      <h3 className="text-2xl font-extrabold mb-8 text-white">Upload Store Logo & Cover</h3>
                      <div className="mb-6">
                        <label className="block text-gray-300 mb-2 font-semibold">Logo</label>
                        <div className="flex items-center gap-4">
                          <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-gray-600 rounded-full cursor-pointer bg-gray-800 hover:border-[#ff3c00] transition group relative">
                            {logoUrl || s.logo ? (
                              <img src={logoUrl || s.logo} alt="logo preview" className="w-24 h-24 object-cover rounded-full" />
                            ) : (
                              <span className="text-gray-400 group-hover:text-[#ff3c00] flex flex-col items-center">
                                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                <span className="text-xs mt-1">Upload</span>
                              </span>
                            )}
                            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={logoUploading} className="absolute inset-0 opacity-0 cursor-pointer" tabIndex={-1} />
                          </label>
                          <div className="text-xs text-gray-400 ml-2">Recommended: 1:1 ratio, PNG/JPG, ≤ 1MB</div>
                        </div>
                        {logoUploading && <div className="text-xs text-gray-400 mt-2">Uploading...</div>}
                      </div>
                      <div className="mb-6">
                        <label className="block text-gray-300 mb-2 font-semibold">Cover</label>
                        <div className="flex items-center gap-4">
                          <label className="flex flex-col items-center justify-center w-40 h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-800 hover:border-[#ff3c00] transition group relative">
                            {coverUrl || s.cover ? (
                              <img src={coverUrl || s.cover} alt="cover preview" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <span className="text-gray-400 group-hover:text-[#ff3c00] flex flex-col items-center">
                                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                <span className="text-xs mt-1">Upload</span>
                              </span>
                            )}
                            <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={coverUploading} className="absolute inset-0 opacity-0 cursor-pointer" tabIndex={-1} />
                          </label>
                          <div className="text-xs text-gray-400 ml-2">Recommended: 4:1 ratio, PNG/JPG, ≤ 2MB</div>
                        </div>
                        {coverUploading && <div className="text-xs text-gray-400 mt-2">Uploading...</div>}
                      </div>
                      <div className="flex gap-4 justify-end mt-8">
                        <button type="button" className="px-5 py-2 rounded-lg bg-gray-700 text-gray-200 font-semibold hover:bg-gray-600 transition" onClick={() => { setShowStoreLogoStep(false); setStore(null); setLogoUrl(undefined); setCoverUrl(undefined); }}>Cancel</button>
                        <button type="button" className="px-8 py-2 rounded-lg bg-[#ff3c00] text-white font-bold text-lg shadow-lg hover:bg-[#ff6a00] transition" onClick={() => { setShowStoreLogoStep(false); setLogoUrl(undefined); setCoverUrl(undefined); }}>Finish</button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            <>
              {/* Dashboard cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full mb-12">
                <div className="w-full h-48 relative">
                  <FlipCard
                    front={
                      <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-5xl font-extrabold text-white drop-shadow-xl">{loading ? <span className="animate-pulse">...</span> : error ? "-" : (store?.name || "-")}</span>
                        <span className="text-base text-gray-200 mt-2 font-medium">Store</span>
                      </FlipCardContent>
                    }
                    back={
                      <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-[#ff3c00] mb-2">{store?.status || "No store"}</span>
                        <span className="text-gray-200 text-center">Store status or name.</span>
                      </FlipCardContent>
                    }
                  />
                </div>
                <div className="w-full h-48 relative">
                  <FlipCard
                    front={
                      <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-5xl font-extrabold text-white drop-shadow-xl">{loading ? <span className="animate-pulse">...</span> : error ? "-" : categories.length}</span>
                        <span className="text-base text-gray-200 mt-2 font-medium">Categories</span>
                      </FlipCardContent>
                    }
                    back={
                      <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-[#ff3c00] mb-2">{categories.length} categories</span>
                        <span className="text-gray-200 text-center">Total number of categories.</span>
                      </FlipCardContent>
                    }
                  />
                </div>
                <div className="w-full h-48 relative">
                  <FlipCard
                    front={
                      <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-5xl font-extrabold text-white drop-shadow-xl">{loading ? <span className="animate-pulse">...</span> : error ? "-" : tags.length}</span>
                        <span className="text-base text-gray-200 mt-2 font-medium">Tags</span>
                      </FlipCardContent>
                    }
                    back={
                      <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-[#ff3c00] mb-2">{tags.length} tags</span>
                        <span className="text-gray-200 text-center">Total number of tags.</span>
                      </FlipCardContent>
                    }
                  />
                </div>
                <div className="w-full h-48 relative">
                  <FlipCard
                    front={
                      <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-5xl font-extrabold text-white drop-shadow-xl">{loading ? <span className="animate-pulse">...</span> : error ? "-" : products.length}</span>
                        <span className="text-base text-gray-200 mt-2 font-medium">Products</span>
                      </FlipCardContent>
                    }
                    back={
                      <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-[#ff3c00] mb-2">{products.length} products</span>
                        <span className="text-gray-200 text-center">Total number of products.</span>
                      </FlipCardContent>
                    }
                  />
                </div>
              </div>

              {/* Store, Categories & Tags Section */}
              <div className="w-full mb-8 flex flex-col lg:flex-row gap-8">
                {/* Store Details Card */}
                <div className="rounded-2xl shadow-2xl border border-gray-800 bg-gray-900 overflow-hidden p-0 flex-1 min-w-0">
                  {/* Banner */}
                  <div className="relative w-full h-48 bg-gradient-to-r from-[#232526] to-[#414345]">
                    {store?.cover ? (
                      <img src={store.cover} alt="cover" className="w-full h-full object-cover" />
                    ) : null}
                    {store?.logo && (
                      <img src={store.logo} alt="logo" className="absolute left-8 -bottom-12 w-24 h-24 rounded-full border-4 border-gray-900 shadow-xl bg-gray-800 object-cover" />
                    )}
                    <button
                      className="absolute top-4 right-4 px-5 py-2 rounded-lg bg-[#ff3c00] text-white font-bold shadow hover:bg-[#ff6a00] transition text-base z-10"
                      onClick={() => { setShowStoreEdit(true); setStoreForm(store || {}); }}
                      disabled={!store}
                    >
                      Edit Store
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-8 items-start p-8 pt-16">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span className="block text-gray-400 text-sm font-semibold">Store Name</span>
                        <span className="text-2xl font-bold text-white break-words">{store?.name || "-"}</span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-gray-400 text-sm font-semibold">Description</span>
                        <span className="text-gray-200 break-words">{store?.description || "-"}</span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-gray-400 text-sm font-semibold">Status</span>
                        <span className={"inline-block px-3 py-1 rounded-full text-xs font-bold " + (store?.status === 'active' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300')}>{store?.status || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Store Edit Panel (side-by-side, not modal) */}
                {showStoreEdit && (
                  <div className="rounded-2xl shadow-2xl border border-gray-800 bg-gray-900 p-10 w-full max-w-lg animate-fade-in flex-1 min-w-[320px]">
                    <form onSubmit={handleStoreFormSubmit}>
                      <h3 className="text-2xl font-extrabold mb-8 text-white">Edit Store Details</h3>
                      <div className="mb-6">
                        <label className="block text-gray-300 mb-2 font-semibold">Name</label>
                        <input name="name" value={storeForm.name || ""} onChange={handleInputChange} placeholder="Store Name" className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-[#ff3c00] focus:outline-none" required />
                      </div>
                      <div className="mb-6">
                        <label className="block text-gray-300 mb-2 font-semibold">Description</label>
                        <textarea name="description" value={storeForm.description || ""} onChange={handleInputChange} placeholder="Description" className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-[#ff3c00] focus:outline-none" />
                      </div>
                      <div className="mb-6">
                        <label className="block text-gray-300 mb-2 font-semibold">Logo</label>
                        <div className="flex items-center gap-4">
                          <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-gray-600 rounded-full cursor-pointer bg-gray-800 hover:border-[#ff3c00] transition group relative">
                            {logoUrl || storeForm.logo || store?.logo ? (
                              <img src={logoUrl || (storeForm.logo as string) || store?.logo} alt="logo preview" className="w-24 h-24 object-cover rounded-full" />
                            ) : (
                              <span className="text-gray-400 group-hover:text-[#ff3c00] flex flex-col items-center">
                                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                <span className="text-xs mt-1">Upload</span>
                              </span>
                            )}
                            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={logoUploading} className="absolute inset-0 opacity-0 cursor-pointer" tabIndex={-1} />
                          </label>
                          <div className="text-xs text-gray-400 ml-2">Recommended: 1:1 ratio, PNG/JPG, ≤ 1MB</div>
                        </div>
                        {logoUploading && <div className="text-xs text-gray-400 mt-2">Uploading...</div>}
                      </div>
                      <div className="mb-6">
                        <label className="block text-gray-300 mb-2 font-semibold">Cover</label>
                        <div className="flex items-center gap-4">
                          <label className="flex flex-col items-center justify-center w-40 h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-800 hover:border-[#ff3c00] transition group relative">
                            {coverUrl || storeForm.cover || store?.cover ? (
                              <img src={coverUrl || (storeForm.cover as string) || store?.cover} alt="cover preview" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <span className="text-gray-400 group-hover:text-[#ff3c00] flex flex-col items-center">
                                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                <span className="text-xs mt-1">Upload</span>
                              </span>
                            )}
                            <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={coverUploading} className="absolute inset-0 opacity-0 cursor-pointer" tabIndex={-1} />
                          </label>
                          <div className="text-xs text-gray-400 ml-2">Recommended: 4:1 ratio, PNG/JPG, ≤ 2MB</div>
                        </div>
                        {coverUploading && <div className="text-xs text-gray-400 mt-2">Uploading...</div>}
                      </div>
                      <div className="mb-8">
                        <label className="block text-gray-300 mb-2 font-semibold">Status</label>
                        <select name="status" value={storeForm.status || "active"} onChange={handleSelectChange} className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-[#ff3c00] focus:outline-none">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="flex gap-4 justify-end mt-8">
                        <button type="button" className="px-5 py-2 rounded-lg bg-gray-700 text-gray-200 font-semibold hover:bg-gray-600 transition" onClick={() => setShowStoreEdit(false)}>Cancel</button>
                        <button type="submit" className="px-8 py-2 rounded-lg bg-[#ff3c00] text-white font-bold text-lg shadow-lg hover:bg-[#ff6a00] transition">Save</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
              {/* Categories & Tags Row */}
              <div className="w-full mb-12 flex flex-col lg:flex-row gap-8">
                {/* Categories Card */}
                <div className="bg-gray-900 rounded-xl shadow-lg p-6 flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Categories</h2>
                    <button className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition" onClick={() => { setShowCategoryForm(true); setEditingCategory(null); setCategoryForm({}); }}>Create</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                      <thead>
                        <tr className="bg-gray-800 text-gray-300">
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Description</th>
                          <th className="px-4 py-2">Slug</th>
                          <th className="px-4 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.length === 0 ? (
                          <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">No categories found.</td></tr>
                        ) : (
                          categories.map((cat) => (
                            <tr key={cat._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                              <td className="px-4 py-2">{cat.name}</td>
                              <td className="px-4 py-2">{cat.description || "-"}</td>
                              <td className="px-4 py-2">{cat.slug}</td>
                              <td className="px-4 py-2">
                                <button className="px-2 py-1 rounded bg-gray-700 text-gray-200 hover:bg-[#ff3c00] transition mr-2" onClick={() => handleEditCategory(cat)}>Edit</button>
                                <button className="px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition" onClick={() => handleDeleteCategory(cat._id)}>Delete</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Inline Category Form */}
                  {showCategoryForm && (
                    <form className="bg-gray-800 rounded-xl p-6 w-full mt-4" onSubmit={handleCategoryFormSubmit}>
                      <h3 className="text-xl font-bold mb-4">{editingCategory ? "Edit Category" : "Create Category"}</h3>
                      <input name="name" value={categoryForm.name || ""} onChange={handleCategoryInputChange} placeholder="Name" className="w-full mb-2 px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700" required />
                      <textarea name="description" value={categoryForm.description || ""} onChange={handleCategoryInputChange} placeholder="Description" className="w-full mb-2 px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700" />
                      <input name="slug" value={categoryForm.slug || ""} onChange={handleCategoryInputChange} placeholder="Slug" className="w-full mb-4 px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700" required />
                      <div className="flex gap-2 justify-end">
                        <button type="button" className="px-4 py-2 rounded bg-gray-700 text-gray-200" onClick={() => setShowCategoryForm(false)}>Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition">Save</button>
                      </div>
                    </form>
                  )}
                </div>
                {/* Tags Card */}
                <div className="bg-gray-900 rounded-xl shadow-lg p-6 flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Tags</h2>
                    <button className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition" onClick={() => { setShowTagForm(true); setEditingTag(null); setTagForm({}); }}>Create</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                      <thead>
                        <tr className="bg-gray-800 text-gray-300">
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Slug</th>
                          <th className="px-4 py-2">Description</th>
                          <th className="px-4 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tags.length === 0 ? (
                          <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">No tags found.</td></tr>
                        ) : (
                          tags.map((tag) => (
                            <tr key={tag._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                              <td className="px-4 py-2">{tag.name}</td>
                              <td className="px-4 py-2">{tag.slug}</td>
                              <td className="px-4 py-2">{tag.description || "-"}</td>
                              <td className="px-4 py-2">
                                <button className="px-2 py-1 rounded bg-gray-700 text-gray-200 hover:bg-[#ff3c00] transition mr-2" onClick={() => handleEditTag(tag)}>Edit</button>
                                <button className="px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition" onClick={() => handleDeleteTag(tag._id)}>Delete</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Inline Tag Form */}
                  {showTagForm && (
                    <form className="bg-gray-800 rounded-xl p-6 w-full mt-4" onSubmit={handleTagFormSubmit}>
                      <h3 className="text-xl font-bold mb-4">{editingTag ? "Edit Tag" : "Create Tag"}</h3>
                      <input name="name" value={tagForm.name || ""} onChange={handleTagInputChange} placeholder="Name" className="w-full mb-2 px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700" required />
                      <input name="slug" value={tagForm.slug || ""} onChange={handleTagInputChange} placeholder="Slug" className="w-full mb-2 px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700" required />
                      <textarea name="description" value={tagForm.description || ""} onChange={handleTagInputChange} placeholder="Description" className="w-full mb-4 px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700" />
                      <div className="flex gap-2 justify-end">
                        <button type="button" className="px-4 py-2 rounded bg-gray-700 text-gray-200" onClick={() => setShowTagForm(false)}>Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition">Save</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Products Section */}
              <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Products</h2>
                  <Link href="/admin/ecommerce/products" className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition">Create Product</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-800 text-gray-300">
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Slug</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Category</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-500">No products found.</td></tr>
                      ) : (
                        products.flatMap((prod) => [
                          <tr key={prod._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                            <td className="px-4 py-2">{prod.name}</td>
                            <td className="px-4 py-2">{prod.slug}</td>
                            <td className="px-4 py-2">{prod.price}</td>
                            <td className="px-4 py-2">{typeof prod.category === 'string' ? prod.category : prod.category?.name}</td>
                            <td className="px-4 py-2">{prod.status}</td>
                            <td className="px-4 py-2 flex gap-2">
                              <button className="px-2 py-1 rounded bg-gray-700 text-gray-200 hover:bg-[#ff3c00] transition" onClick={() => handleEditProduct(prod)}>Edit</button>
                              <button className="px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition" onClick={() => handleDeleteProduct(prod._id)}>Delete</button>
                            </td>
                          </tr>,
                          editingProductId === prod._id && (
                            <tr key={prod._id + "-edit"} className="bg-gray-800/80">
                              <td colSpan={6} className="px-4 py-4">
                                <form className="bg-gray-900 rounded-xl p-6 flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                                  <div className="flex flex-col md:flex-row gap-4">
                                    <input name="name" value={editForm.name || ""} onChange={handleEditFormChange} placeholder="Name" className="px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700 w-full md:w-48" required />
                                    <input name="slug" value={editForm.slug || ""} onChange={handleEditFormChange} placeholder="Slug" className="px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700 w-full md:w-48" required />
                                    <input name="sku" value={editForm.sku || ""} onChange={handleEditFormChange} placeholder="SKU" className="px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700 w-full md:w-32" required />
                                    <input name="price" type="number" value={editForm.price || ""} onChange={handleEditFormChange} placeholder="Price" className="px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700 w-full md:w-32" required />
                                    <input name="salePrice" type="number" value={editForm.salePrice || ""} onChange={handleEditFormChange} placeholder="Sale Price" className="px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700 w-full md:w-32" />
                                    <select name="status" value={editForm.status || "draft"} onChange={handleEditFormChange} className="px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700 w-full md:w-32">
                                      <option value="draft">Draft</option>
                                      <option value="published">Published</option>
                                      <option value="archived">Archived</option>
                                    </select>
                                    <select name="category" value={typeof editForm.category === 'string' ? editForm.category : editForm.category?._id || ""} onChange={handleEditFormChange} className="px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700 w-full md:w-48">
                                      <option value="">Select Category</option>
                                      {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                      ))}
                                    </select>
                                    <input name="tags" value={Array.isArray(editForm.tags) ? editForm.tags.join(",") : ""} onChange={handleEditFormChange} placeholder="Tags (comma separated)" className="px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700 w-full md:w-48" />
                                    <input name="stock" type="number" value={editForm.stock || ""} onChange={handleEditFormChange} placeholder="Stock" className="px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700 w-full md:w-32" />
                                  </div>
                                  <div>
                                    <label className="block text-gray-300 mb-2 font-semibold">Description (Markdown)</label>
                                    <div data-color-mode="dark">
                                      <MDEditor value={editDescription} onChange={val => setEditDescription(val || "")} height={200} textareaProps={{ placeholder: "Enter product description in markdown..." }} />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-gray-300 mb-2 font-semibold">Attributes</label>
                                    <div className="flex flex-col md:flex-row gap-4 mb-2">
                                      <input type="text" className="w-full md:w-1/3 px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none" placeholder="Attribute name (e.g. Size)" value={editAttrName} onChange={e => setEditAttrName(e.target.value)} />
                                      <input type="text" className="w-full md:w-1/2 px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none" placeholder="Value (e.g. M)" value={editAttrValue} onChange={e => setEditAttrValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleEditAddAttrValue(); } }} />
                                      <button type="button" className="bg-[#ff3c00] text-white px-4 py-2 rounded font-semibold hover:bg-[#ff6a00] transition" onClick={handleEditAddAttrValue}>Add Value</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {editAttrValues.map((val, idx) => (
                                        <span key={idx} className="bg-gray-700 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                                          {val}
                                          <button type="button" className="ml-1 text-red-400 hover:text-red-600" onClick={() => handleEditRemoveAttrValue(val)}>&times;</button>
                                        </span>
                                      ))}
                                    </div>
                                    <button type="button" className="bg-[#ff3c00] text-white px-4 py-2 rounded font-semibold hover:bg-[#ff6a00] transition mb-2" onClick={handleEditAddAttribute}>Add Attribute</button>
                                    {editAttrError && <div className="text-xs text-red-400 mt-1">{editAttrError}</div>}
                                    <div className="mt-4">
                                      <h4 className="text-md font-semibold text-white mb-2">Added Attributes</h4>
                                      {editAttributes.length === 0 && <div className="text-xs text-gray-400">No attributes added yet.</div>}
                                      <ul className="space-y-2">
                                        {editAttributes.map((attr, idx) => (
                                          <li key={idx} className="bg-gray-900 border border-gray-700 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                                            <div>
                                              <span className="font-bold text-white mr-2">{attr.name}:</span>
                                              <span className="text-gray-200">{attr.values.join(", ")}</span>
                                            </div>
                                            <button type="button" className="text-xs text-red-400 hover:text-red-600 mt-2 md:mt-0" onClick={() => handleEditRemoveAttribute(idx)}>Remove</button>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 justify-end mt-4">
                                    <button type="button" className="px-4 py-2 rounded bg-gray-700 text-gray-200" onClick={handleEditCancel} disabled={editLoading}>Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition" disabled={editLoading}>Save</button>
                                  </div>
                                  {editError && <div className="text-xs text-red-400 mt-2">{editError}</div>}
                                </form>
                              </td>
                            </tr>
                          )
                        ])
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assets Section (placeholder) */}
              <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Assets</h2>
                  <button className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition" disabled>Upload Asset (Coming Soon)</button>
                </div>
                <div className="text-gray-400">Asset management coming soon.</div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

