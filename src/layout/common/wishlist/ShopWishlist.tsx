import React, { useState } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";

const mockWishlist = [
  { id: 1, name: "Product 1" },
  { id: 2, name: "Product 2" },
];

export default function ShopWishlist() {
  const [open, setOpen] = useState(false);
  const itemCount = mockWishlist.length;

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        onClick={() => setOpen((v) => !v)}
        aria-label="View wishlist"
      >
        <HeartIcon className="w-7 h-7 text-gray-700 dark:text-gray-200" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
            {itemCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-100">Wishlist</div>
          <ul className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {mockWishlist.length === 0 ? (
              <li className="p-4 text-gray-500 text-sm">Your wishlist is empty.</li>
            ) : (
              mockWishlist.map((item) => (
                <li key={item.id} className="flex justify-between items-center p-4">
                  <span className="text-gray-700 dark:text-gray-200">{item.name}</span>
                  <button className="text-xs text-pink-500 hover:text-pink-700">Remove</button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
