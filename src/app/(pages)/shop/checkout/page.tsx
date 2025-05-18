import React, { useState } from 'react';
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

export default function CheckoutPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacingOrder(true);
    // Placeholder: simulate order placement
    setTimeout(() => {
      setOrderPlaced(true);
      setPlacingOrder(false);
    }, 1200);
  };

  return (
    <div className="w-full bg-gray-950 text-gray-100 flex flex-col items-center py-16 px-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 text-[#ff3c00] drop-shadow-lg">Checkout</h1>
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
        {orderPlaced ? (
          <div className="text-center text-green-400 text-xl font-bold py-12">
            Thank you for your order!<br />
            <Link href="/shop/basket" className="underline text-[#ff3c00]">Back to Shop</Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-200 mb-2">Order Summary</div>
              <ul className="divide-y divide-gray-800 mb-4">
                {basketItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-semibold text-base text-white">{item.name}</div>
                      <div className="text-gray-400 text-xs">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold text-lg text-[#ff3c00]">£{(item.price * item.quantity).toFixed(2)}</div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-semibold text-gray-200">Subtotal</span>
                <span className="text-xl font-extrabold text-[#ff3c00]">£{subtotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-lg font-bold text-center bg-[#ff3c00] text-white hover:bg-[#ff6a00] transition shadow-lg shadow-[#ff3c00]/20 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] disabled:opacity-50"
              disabled={placingOrder}
            >
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
