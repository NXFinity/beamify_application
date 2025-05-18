import React from 'react';
import Link from 'next/link';

// Placeholder basket items
const basketItems = [
  {
    id: '1',
    name: 'Premium Membership',
    price: 9.99,
    quantity: 1,
  },
  {
    id: '2',
    name: 'VIP Event Ticket',
    price: 29.99,
    quantity: 2,
  },
];

const subtotal = basketItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default function BasketPage() {
  return (
    <div className="w-full bg-gray-950 text-gray-100 flex flex-col items-center py-16 px-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 text-[#ff3c00] drop-shadow-lg">Your Basket</h1>
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
        {basketItems.length === 0 ? (
          <div className="text-center text-gray-400">Your basket is empty.</div>
        ) : (
          <>
            <ul className="divide-y divide-gray-800 mb-8">
              {basketItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-semibold text-lg text-white">{item.name}</div>
                    <div className="text-gray-400 text-sm">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-xl text-[#ff3c00]">£{(item.price * item.quantity).toFixed(2)}</div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold text-gray-200">Subtotal</span>
              <span className="text-2xl font-extrabold text-[#ff3c00]">£{subtotal.toFixed(2)}</span>
            </div>
            <Link
              href="/shop/checkout"
              className="w-full py-3 rounded-xl text-lg font-bold text-center bg-[#ff3c00] text-white hover:bg-[#ff6a00] transition shadow-lg shadow-[#ff3c00]/20 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
            >
              Proceed to Checkout
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
