"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EcommerceService } from "@/core/api/ecommerce/ecommerce.service";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';

export default function ProductDetailPage() {
  const { product } = useParams<{ product: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [productData, setProductData] = useState<any>(null); // Replace any with Product type if available
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!product) return;
    EcommerceService.getProductBySku(product)
      .then((data) => {
        setProductData(data);
        setSelectedImage(data?.image || null);
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [product]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">{error}</div>;
  if (!productData) return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">Product not found.</div>;

  return (
    <div className="min-h-full w-full bg-gray-950 flex flex-col items-center justify-center py-12 px-2">
      <div className="w-full max-w-6xl bg-gray-900 rounded-2xl shadow-2xl p-0 border border-gray-800 flex flex-col md:flex-row overflow-hidden">
        {/* Product Image */}
        <div className="flex-shrink-0 w-full md:w-1/2 flex flex-col items-center bg-gray-800 p-8">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={productData.name}
              className="w-full h-96 object-contain rounded-xl border border-gray-800 bg-gray-900 transition-all duration-200"
            />
          ) : (
            <div className="w-full h-96 bg-gray-700 rounded-xl flex items-center justify-center">
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          )}
          {/* Gallery Card */}
          {productData.images && productData.images.length > 1 && (
            <div className="w-full mt-6 bg-gray-900 rounded-xl border border-gray-800 p-4">
              <h2 className="text-md font-semibold text-white mb-3">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                {[productData.image, ...(productData.images as string[]).filter((img: string) => img !== productData.image)].map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className={`w-14 h-14 object-cover rounded-lg border border-gray-700 bg-gray-900 cursor-pointer transition-all`}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-8">
          <div>
            <Link href="/shop" className="text-[#ff3c00] hover:underline mb-4 inline-block">&larr; Back to Shop</Link>
            <h1 className="text-3xl font-extrabold text-white mb-6 break-words">{productData.name}</h1>
            <div className="text-base text-gray-300 markdown-body w-full max-w-prose mb-6">
              <ReactMarkdown>{productData.description}</ReactMarkdown>
            </div>
            {productData.attributes && productData.attributes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Attributes</h3>
                <ul className="space-y-2">
                  {productData.attributes.map((attr: { name: string; values: string[] }, idx: number) => (
                    <li key={idx} className="flex items-center flex-wrap gap-2">
                      <span className="font-bold text-white mr-2 min-w-[60px]">{attr.name}:</span>
                      {Array.isArray(attr.values) ? attr.values.map((val, vIdx) => (
                        <span key={vIdx} className="inline-block bg-gray-800 text-gray-100 px-3 py-1 rounded-full text-sm font-medium border border-gray-700">{val}</span>
                      )) : (
                        <span className="inline-block bg-gray-800 text-gray-100 px-3 py-1 rounded-full text-sm font-medium border border-gray-700">{attr.values}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-2xl font-extrabold text-[#ff3c00] mb-4">£{productData.price?.toFixed(2)}</div>
            <div className="flex flex-row gap-4 w-full mb-6">
              <button className="w-1/2 py-3 px-6 rounded-lg bg-[#ff3c00] text-white font-bold text-lg shadow hover:bg-orange-600 transition">Add to Basket</button>
              <button className="w-1/2 py-3 px-6 rounded-lg bg-gray-700 text-white font-bold text-lg shadow hover:bg-gray-600 transition">Add to Vendor</button>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          font-weight: bold;
          color: #fff;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .markdown-body ul, .markdown-body ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        .markdown-body li {
          list-style: disc;
          margin-bottom: 0.25em;
        }
        .markdown-body strong {
          font-weight: bold;
          color: #fff;
        }
        .markdown-body p {
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
}
