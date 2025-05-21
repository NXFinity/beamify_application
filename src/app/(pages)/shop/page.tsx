"use client";
import React, { useEffect, useState } from "react";
import { EcommerceService } from "@/core/api/ecommerce/ecommerce.service";
import { Store } from "@/core/api/admin/types/admin.interface";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';

export default function PublicStorePage() {
  const [store, setStore] = useState<Store | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      EcommerceService.getStore(),
      EcommerceService.getProducts()
    ])
      .then(([storeData, productsData]) => {
        setStore(storeData);
        setProducts(productsData);
      })
      .catch(() => setError("Failed to load store or products"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">{error}</div>;
  if (!store) return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">Store not found.</div>;
  if (store.status !== "active") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-200">
        <div className="text-4xl font-extrabold text-[#ff3c00] mb-4">Store Maintenance</div>
        <div className="text-lg text-gray-400">Our store is currently undergoing maintenance. Please check back soon!</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100">
      {/* Banner */}
      <div className="w-full h-56 sm:h-72 md:h-80 bg-gradient-to-r from-[#232526] to-[#414345] relative">
        {store.cover && (
          <img src={store.cover} alt="cover" className="w-full h-full object-cover object-center absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      {/* Hero Section */}
      <section className="relative z-10 -mt-24 flex flex-col items-center justify-center px-4">
        {store.logo && (
          <img src={store.logo} alt="logo" className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl bg-gray-900 object-cover mb-4" />
        )}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 text-center drop-shadow-lg">{store.name}</h1>
        <div className="text-lg sm:text-xl text-gray-200 mb-4 text-center max-w-2xl">{store.description}</div>
        <span className="inline-block px-5 py-1 rounded-full text-base font-bold bg-green-700 text-white mb-8">Open</span>
      </section>
      {/* Products Section */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 mt-8 text-center">Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">No products available.</div>
          ) : (
            products.map((product) => (
              <Link
                key={product._id}
                href={`/shop/${product.sku}`}
                className="rounded-xl bg-gray-900 border border-gray-800 shadow-lg p-6 flex flex-col items-center justify-center min-h-[220px] hover:border-[#ff3c00] transition"
              >
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-24 h-24 object-contain rounded-lg mb-4 bg-gray-800" />
                ) : (
                  <div className="w-24 h-24 bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                )}
                <div className="text-lg font-bold text-white mb-2 text-center">{product.name}</div>
                <div className="text-gray-300 text-sm mb-2 text-center line-clamp-3">
                  <ReactMarkdown>{product.description}</ReactMarkdown>
                </div>
                <div className="text-xl font-extrabold text-[#ff3c00]">£{product.price?.toFixed(2)}</div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
