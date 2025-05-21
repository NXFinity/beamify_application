import React, { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const mockBasket = [
  { id: 1, name: "Product 1", qty: 2, price: 19.99 },
  { id: 2, name: "Product 2", qty: 1, price: 9.99 },
];

export default function ShopBasket() {
  const [open, setOpen] = useState(false);
  const itemCount = mockBasket.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        onClick={() => setOpen((v) => !v)}
        aria-label="View basket"
      >
        <ShoppingCartIcon className="w-7 h-7 text-gray-700 dark:text-gray-200" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#ff3c00] text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
            {itemCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-100">Basket</div>
          <ul className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {mockBasket.length === 0 ? (
              <li className="p-4 text-gray-500 text-sm">Your basket is empty.</li>
            ) : (
              mockBasket.map((item) => (
                <li key={item.id} className="flex justify-between items-center p-4">
                  <span className="text-gray-700 dark:text-gray-200">{item.name} x{item.qty}</span>
                  <span className="text-gray-500 dark:text-gray-400">£{(item.price * item.qty).toFixed(2)}</span>
                </li>
              ))
            )}
          </ul>
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span className="font-bold text-gray-800 dark:text-gray-100">Total</span>
            <span className="font-bold text-[#ff3c00]">£{mockBasket.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}</span>
          </div>
          <div className="p-4">
            <button className="w-full bg-[#ff3c00] hover:bg-[#ff6a00] text-white font-semibold py-2 px-4 rounded transition">Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}
