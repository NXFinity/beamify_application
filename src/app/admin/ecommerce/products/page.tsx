"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Cog6ToothIcon, CubeIcon, TruckIcon, LinkIcon, TagIcon, WrenchScrewdriverIcon, PlusCircleIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AdminService } from "@/core/api/admin/admin.service";
import type { Category, Tag } from "@/core/api/admin/types/admin.interface";

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function CreateProductPage() {
  const [description, setDescription] = useState<string>("");
  const [descExpanded, setDescExpanded] = useState(true);
  const [productType, setProductType] = useState('Simple product');
  const [isVirtual, setIsVirtual] = useState(false);
  const [isDownloadable, setIsDownloadable] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [productDataExpanded, setProductDataExpanded] = useState(true);
  const [productGalleryExpanded, setProductGalleryExpanded] = useState(true);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [publishExpanded, setPublishExpanded] = useState(true);
  const [productImageExpanded, setProductImageExpanded] = useState(true);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryLoading, setNewCategoryLoading] = useState(false);
  const [newCategoryError, setNewCategoryError] = useState("");
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagLoading, setNewTagLoading] = useState(false);
  const [newTagError, setNewTagError] = useState("");
  const [sku, setSku] = useState("");
  const [manageStock, setManageStock] = useState(false);
  const [stockQuantity, setStockQuantity] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [savingSku, setSavingSku] = useState(false);
  const [skuError, setSkuError] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [galleryUploadLoading, setGalleryUploadLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<{ name: string; values: string[] }[]>([]);
  const [attrName, setAttrName] = useState("");
  const [attrValue, setAttrValue] = useState("");
  const [attrValues, setAttrValues] = useState<string[]>([]);
  const [attrError, setAttrError] = useState("");

  const productTabs = [
    { name: 'General', icon: CubeIcon },
    { name: 'Inventory', icon: TagIcon },
    { name: 'Shipping', icon: TruckIcon },
    { name: 'Linked Products', icon: LinkIcon },
    { name: 'Attributes', icon: WrenchScrewdriverIcon },
    { name: 'Advanced', icon: Cog6ToothIcon },
    { name: 'Get more options', icon: PlusCircleIcon },
  ];

  useEffect(() => {
    AdminService.getAllCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    AdminService.getAllTags()
      .then(setTags)
      .catch(() => setTags([]));
  }, []);

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && productId && sku) {
      setGalleryUploadLoading(true);
      setGalleryUploadError(null);
      try {
        const files = Array.from(e.target.files);
        const urls: string[] = [];
        for (const file of files) {
          const res = await AdminService.uploadAsset({ file, storeId: sku, assetType: 'gallery' });
          urls.push(res.url);
        }
        setGalleryImageUrls(prev => [...prev, ...urls]);
        setGalleryImages(prev => [...prev, ...files]);
      } catch (err) {
        setGalleryUploadError(err instanceof Error ? err.message : 'Failed to upload gallery images');
      } finally {
        setGalleryUploadLoading(false);
      }
    }
  };

  const removeGalleryImage = (idx: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProductImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && productId && sku) {
      setImageUploadLoading(true);
      setImageUploadError(null);
      try {
        const file = e.target.files[0];
        const res = await AdminService.uploadAsset({ file, storeId: sku, assetType: 'main' });
        setMainImageUrl(res.url);
        setProductImage(file);
      } catch (err) {
        setImageUploadError(err instanceof Error ? err.message : 'Failed to upload image');
      } finally {
        setImageUploadLoading(false);
      }
    }
  };

  const removeProductImage = () => setProductImage(null);

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setNewCategoryLoading(true);
    setNewCategoryError("");
    try {
      const created = await AdminService.createCategory({ name: newCategoryName });
      setCategories((prev) => [...prev, created]);
      setNewCategoryName("");
      setShowAddCategory(false);
    } catch {
      setNewCategoryError("Failed to create category");
    } finally {
      setNewCategoryLoading(false);
    }
  };

  const handleTagToggle = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
    );
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setNewTagLoading(true);
    setNewTagError("");
    try {
      const created = await AdminService.createTag({ name: newTagName });
      setTags((prev) => [...prev, created]);
      setNewTagName("");
      setShowAddTag(false);
    } catch {
      setNewTagError("Failed to create tag");
    } finally {
      setNewTagLoading(false);
    }
  };

  const handleSaveSku = async () => {
    if (!sku) return;
    setSavingSku(true);
    setSkuError(null);
    try {
      const product = await AdminService.createProduct({ sku });
      setProductId(product._id);
    } catch (err) {
      setSkuError(err instanceof Error ? err.message : 'Failed to save SKU');
    } finally {
      setSavingSku(false);
    }
  };

  const resetForm = () => {
    setProductName("");
    setDescription("");
    setRegularPrice("");
    setSalePrice("");
    setSku("");
    setProductId(null);
    setManageStock(false);
    setStockQuantity("");
    setSelectedCategories([]);
    setSelectedTags([]);
    setProductImage(null);
    setMainImageUrl(null);
    setGalleryImages([]);
    setGalleryImageUrls([]);
    setAttributes([]);
  };

  const handleAddAttrValue = () => {
    if (attrValue.trim() && !attrValues.includes(attrValue.trim())) {
      setAttrValues([...attrValues, attrValue.trim()]);
      setAttrValue("");
    }
  };

  const handleRemoveAttrValue = (val: string) => {
    setAttrValues(attrValues.filter(v => v !== val));
  };

  const handleAddAttribute = () => {
    if (!attrName.trim()) {
      setAttrError("Attribute name required");
      return;
    }
    if (attrValues.length === 0) {
      setAttrError("At least one value required");
      return;
    }
    setAttributes([...attributes, { name: attrName.trim(), values: attrValues }]);
    setAttrName("");
    setAttrValues([]);
    setAttrError("");
  };

  const handleRemoveAttribute = (idx: number) => {
    setAttributes(attributes.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = async () => {
    if (!productId || !mainImageUrl) return;
    if (attributes.length === 0) {
      setSaveError('At least one attribute is required.');
      return;
    }
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      // Gather all fields
      const payload: Record<string, unknown> = {
        name: productName,
        description,
        price: regularPrice ? Number(regularPrice) : undefined,
        salePrice: salePrice ? Number(salePrice) : undefined,
        sku,
        manageStock,
        stock: manageStock ? Number(stockQuantity) : undefined,
        category: selectedCategories[0],
        tags: selectedTags,
        status: 'published',
        image: mainImageUrl,
        images: galleryImageUrls,
        attributes,
      };
      // Remove undefined fields
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      await AdminService.updateProduct(productId, payload);
      setSaveSuccess(true);
      resetForm();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-2xl mx-auto mt-8 mb-6 px-4">
        <div className="bg-blue-900/80 border border-blue-700 text-blue-100 rounded-lg px-6 py-4 text-base font-medium shadow flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
          <span>
            You must add the SKU first, to save a <span className="font-bold text-blue-200">Draft</span> of the product to be able to upload product images.
          </span>
        </div>
      </div>
      <div className="flex w-full gap-8 pt-8 px-8">
        {/* Left column (large) */}
        <div className="flex-1 p-8">
          {/* Product Name Card */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-md">
            <label htmlFor="product-name" className="block text-sm font-medium text-gray-200 mb-2">
              Product Name
            </label>
            <input
              id="product-name"
              type="text"
              className="w-full px-4 py-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] focus:ring-opacity-50"
              placeholder="Enter product name"
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
          </div>
          {/* Product Description Card (Expandable) */}
          <div className="bg-gray-800 rounded-lg mb-8 shadow-md">
            <div className="flex items-center justify-between p-6 cursor-pointer select-none" onClick={() => setDescExpanded((v) => !v)}>
              <label htmlFor="product-description" className="block text-sm font-medium text-gray-200">
                Product Description
              </label>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${descExpanded ? 'rotate-90' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {descExpanded && (
              <div className="px-6 pb-6" data-color-mode="dark">
                <MDEditor
                  value={description}
                  onChange={(val) => setDescription(val || "")}
                  height={250}
                  textareaProps={{
                    id: "product-description",
                    placeholder: "Enter product description in markdown...",
                  }}
                />
              </div>
            )}
          </div>
          {/* Product Data Card (Expandable) */}
          <div className="bg-gray-800 rounded-lg mb-8 shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 cursor-pointer select-none" onClick={() => setProductDataExpanded(v => !v)}>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-200">Product data</span>
                <select
                  className="bg-gray-900 text-gray-200 border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none"
                  value={productType}
                  onClick={e => e.stopPropagation()}
                  onChange={e => setProductType(e.target.value)}
                >
                  <option>Simple product</option>
                  <option>Variable product</option>
                  <option>Grouped product</option>
                  <option>External/Affiliate product</option>
                </select>
                <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" className="accent-[#ff3c00]" checked={isVirtual} onChange={e => setIsVirtual(e.target.checked)} />
                  Virtual
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" className="accent-[#ff3c00]" checked={isDownloadable} onChange={e => setIsDownloadable(e.target.checked)} />
                  Downloadable
                </label>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${productDataExpanded ? 'rotate-90' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {productDataExpanded && (
              <div className="flex">
                {/* Tabs */}
                <div className="w-56 border-r border-gray-700 bg-gray-900 rounded-bl-lg flex flex-col py-4">
                  {productTabs.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      className={`flex items-center gap-3 px-6 py-2 text-sm font-medium transition-colors duration-150 rounded-none border-l-4 ${activeTab === name ? 'bg-gray-800 text-[#ff3c00] border-[#ff3c00]' : 'text-gray-300 hover:bg-gray-800 hover:text-white border-transparent'}`}
                      onClick={() => setActiveTab(name)}
                      type="button"
                    >
                      <Icon className="w-5 h-5" />
                      {name}
                    </button>
                  ))}
                </div>
                {/* Tab Content */}
                <div className="flex-1 p-8">
                  {activeTab === 'General' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-gray-200 mb-1">Regular price (£)</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] focus:ring-opacity-50"
                          value={regularPrice}
                          onChange={e => setRegularPrice(e.target.value)}
                          placeholder="Enter regular price in GBP"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-200 mb-1">Sale price (£)</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] focus:ring-opacity-50"
                          value={salePrice}
                          onChange={e => setSalePrice(e.target.value)}
                          placeholder="Enter sale price in GBP"
                        />
                        <a href="#" className="text-xs text-[#ff3c00] hover:underline mt-1 inline-block">Schedule</a>
                      </div>
                    </div>
                  )}
                  {activeTab === 'Inventory' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-gray-200 mb-1">SKU</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            className="w-64 px-4 py-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] focus:ring-opacity-50"
                            value={sku}
                            onChange={e => {
                              setSku(e.target.value);
                              setProductId(null); // Reset productId if SKU changes
                            }}
                            placeholder="Enter SKU (Stock Keeping Unit)"
                            disabled={!!productId || savingSku}
                          />
                          <button
                            type="button"
                            className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition disabled:opacity-50"
                            onClick={handleSaveSku}
                            disabled={!!productId || savingSku || !sku}
                          >
                            Save SKU
                          </button>
                        </div>
                        {savingSku && <div className="text-xs text-gray-400 mt-1">Saving SKU...</div>}
                        {skuError && <div className="text-xs text-red-400 mt-1">{skuError}</div>}
                        {productId && <div className="text-xs text-green-400 mt-1">Product draft saved.</div>}
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm text-gray-200 mb-1">
                          <input
                            type="checkbox"
                            className="accent-[#ff3c00]"
                            checked={manageStock}
                            onChange={e => setManageStock(e.target.checked)}
                            disabled={!productId}
                          />
                          Manage stock?
                        </label>
                        {manageStock && (
                          <div className="mt-2">
                            <label className="block text-xs text-gray-400 mb-1">Stock quantity</label>
                            <input
                              type="number"
                              min="0"
                              className="w-full px-4 py-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] focus:ring-opacity-50"
                              value={stockQuantity}
                              onChange={e => setStockQuantity(e.target.value)}
                              placeholder="Enter stock quantity"
                              disabled={!productId}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === 'Attributes' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-white mb-2">Product Attributes</h3>
                      <div className="flex flex-col md:flex-row gap-4 mb-2">
                        <input
                          type="text"
                          className="w-full md:w-1/3 px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none"
                          placeholder="Attribute name (e.g. Size)"
                          value={attrName}
                          onChange={e => setAttrName(e.target.value)}
                        />
                        <input
                          type="text"
                          className="w-full md:w-1/2 px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none"
                          placeholder="Value (e.g. M)"
                          value={attrValue}
                          onChange={e => setAttrValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAttrValue(); } }}
                        />
                        <button
                          type="button"
                          className="bg-[#ff3c00] text-white px-4 py-2 rounded font-semibold hover:bg-[#ff6a00] transition"
                          onClick={handleAddAttrValue}
                        >Add Value</button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {attrValues.map((val, idx) => (
                          <span key={idx} className="bg-gray-700 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                            {val}
                            <button type="button" className="ml-1 text-red-400 hover:text-red-600" onClick={() => handleRemoveAttrValue(val)}>&times;</button>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="bg-[#ff3c00] text-white px-4 py-2 rounded font-semibold hover:bg-[#ff6a00] transition mb-2"
                        onClick={handleAddAttribute}
                      >Add Attribute</button>
                      {attrError && <div className="text-xs text-red-400 mt-1">{attrError}</div>}
                      <div className="mt-4">
                        <h4 className="text-md font-semibold text-white mb-2">Added Attributes</h4>
                        {attributes.length === 0 && <div className="text-xs text-gray-400">No attributes added yet.</div>}
                        <ul className="space-y-2">
                          {attributes.map((attr, idx) => (
                            <li key={idx} className="bg-gray-900 border border-gray-700 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                              <div>
                                <span className="font-bold text-white mr-2">{attr.name}:</span>
                                <span className="text-gray-200">{attr.values.join(", ")}</span>
                              </div>
                              <button type="button" className="text-xs text-red-400 hover:text-red-600 mt-2 md:mt-0" onClick={() => handleRemoveAttribute(idx)}>Remove</button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Product Gallery Card (Expandable) */}
          <div className="bg-gray-800 rounded-lg mb-8 shadow-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 cursor-pointer select-none" onClick={() => setProductGalleryExpanded(v => !v)}>
              <span className="text-sm font-medium text-gray-200">Product Gallery</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${productGalleryExpanded ? 'rotate-90' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {productGalleryExpanded && (
              <div className="p-6">
                <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {galleryImages.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-700"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-gray-900 bg-opacity-70 rounded-full p-1 text-gray-300 hover:text-[#ff6a00]"
                        onClick={() => removeGalleryImage(idx)}
                        title="Remove image"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-[#ff3c00] transition mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryChange}
                    disabled={!productId}
                  />
                  <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-400">Add Images</span>
                </label>
                {galleryUploadLoading && <div className="text-xs text-gray-400 mt-1">Uploading gallery images...</div>}
                {galleryUploadError && <div className="text-xs text-red-400 mt-1">{galleryUploadError}</div>}
              </div>
            )}
          </div>
          {/* Left column content goes here */}
        </div>
        {/* Right column (even wider) */}
        <div className="w-[420px] p-6">
          {/* Publish Card (Expandable) */}
          <div className="bg-gray-900 rounded-lg mb-8 shadow-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 cursor-pointer select-none" onClick={() => setPublishExpanded(v => !v)}>
              <span className="text-sm font-medium text-gray-200">Publish</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${publishExpanded ? 'rotate-90' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {publishExpanded && (
              <div className="p-6 flex flex-col gap-4">
                <button
                  type="button"
                  className="w-full bg-[#ff3c00] hover:bg-[#ff6a00] text-white font-semibold py-2 px-4 rounded-md shadow transition disabled:opacity-50"
                  onClick={handleSaveProduct}
                  disabled={!productId || saveLoading || !mainImageUrl}
                >
                  {saveLoading ? 'Saving...' : 'Save'}
                </button>
                {saveError && <div className="text-xs text-red-400 mt-2">{saveError}</div>}
                {saveSuccess && <div className="text-xs text-green-400 mt-2">Product saved and published!</div>}
              </div>
            )}
          </div>
          {/* Product Image Card (Expandable) */}
          <div className="bg-gray-900 rounded-lg mb-8 shadow-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 cursor-pointer select-none" onClick={() => setProductImageExpanded(v => !v)}>
              <span className="text-sm font-medium text-gray-200">Product Image</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${productImageExpanded ? 'rotate-90' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {productImageExpanded && (
              <div className="p-6 flex flex-col items-center gap-4">
                {productImage ? (
                  <div className="relative w-full flex flex-col items-center">
                    <img
                      src={URL.createObjectURL(productImage)}
                      alt="Product"
                      className="max-w-full max-h-64 object-contain rounded-lg border border-gray-700 bg-gray-800"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 rounded-full p-1 text-gray-300 hover:text-[#ff6a00]"
                      onClick={removeProductImage}
                      title="Remove image"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-[#ff3c00] transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProductImageChange}
                      disabled={!productId}
                    />
                    <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-400">Add Image</span>
                  </label>
                )}
                {imageUploadLoading && <div className="text-xs text-gray-400 mt-1">Uploading image...</div>}
                {imageUploadError && <div className="text-xs text-red-400 mt-1">{imageUploadError}</div>}
              </div>
            )}
          </div>
          {/* Product Categories Card (Expandable) */}
          <div className="bg-gray-900 rounded-lg mb-8 shadow-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 cursor-pointer select-none" onClick={() => setCategoriesExpanded(v => !v)}>
              <span className="text-sm font-medium text-gray-200">Product Categories</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${categoriesExpanded ? 'rotate-90' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {categoriesExpanded && (
              <div className="p-6">
                <div className="mb-4 flex flex-col gap-2">
                  {categories.length === 0 && <span className="text-xs text-gray-400">No categories found.</span>}
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat._id)}
                        onChange={() => handleCategoryToggle(cat._id)}
                        className="accent-[#ff3c00]"
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
                {showAddCategory ? (
                  <form onSubmit={handleAddCategory} className="flex gap-2 items-center mt-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      className="px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] focus:ring-opacity-50 text-sm"
                      placeholder="New category name"
                      required
                      disabled={newCategoryLoading}
                    />
                    <button
                      type="submit"
                      className="bg-[#ff3c00] hover:bg-[#ff6a00] text-white px-3 py-2 rounded text-sm font-semibold transition"
                      disabled={newCategoryLoading}
                    >
                      {newCategoryLoading ? "Adding..." : "Add"}
                    </button>
                    <button
                      type="button"
                      className="text-xs text-gray-400 hover:text-gray-200 ml-1"
                      onClick={() => { setShowAddCategory(false); setNewCategoryName(""); }}
                      disabled={newCategoryLoading}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="mt-2 text-xs text-[#ff3c00] hover:underline"
                    onClick={() => setShowAddCategory(true)}
                  >
                    + Add Category
                  </button>
                )}
                {newCategoryError && <div className="text-xs text-red-400 mt-2">{newCategoryError}</div>}
              </div>
            )}
          </div>
          {/* Product Tags Card (Expandable) */}
          <div className="bg-gray-900 rounded-lg mb-8 shadow-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 cursor-pointer select-none" onClick={() => setTagsExpanded(v => !v)}>
              <span className="text-sm font-medium text-gray-200">Product Tags</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${tagsExpanded ? 'rotate-90' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {tagsExpanded && (
              <div className="p-6">
                <div className="mb-4 flex flex-col gap-2">
                  {tags.length === 0 && <span className="text-xs text-gray-400">No tags found.</span>}
                  {tags.map((tag) => (
                    <label key={tag._id} className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag._id)}
                        onChange={() => handleTagToggle(tag._id)}
                        className="accent-[#ff3c00]"
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
                {showAddTag ? (
                  <form onSubmit={handleAddTag} className="flex gap-2 items-center mt-2">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={e => setNewTagName(e.target.value)}
                      className="px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] focus:ring-opacity-50 text-sm"
                      placeholder="New tag name"
                      required
                      disabled={newTagLoading}
                    />
                    <button
                      type="submit"
                      className="bg-[#ff3c00] hover:bg-[#ff6a00] text-white px-3 py-2 rounded text-sm font-semibold transition"
                      disabled={newTagLoading}
                    >
                      {newTagLoading ? "Adding..." : "Add"}
                    </button>
                    <button
                      type="button"
                      className="text-xs text-gray-400 hover:text-gray-200 ml-1"
                      onClick={() => { setShowAddTag(false); setNewTagName(""); }}
                      disabled={newTagLoading}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="mt-2 text-xs text-[#ff3c00] hover:underline"
                    onClick={() => setShowAddTag(true)}
                  >
                    + Add Tag
                  </button>
                )}
                {newTagError && <div className="text-xs text-red-400 mt-2">{newTagError}</div>}
              </div>
            )}
          </div>
          {/* Right column content goes here */}
        </div>
      </div>
    </div>
  );
}
