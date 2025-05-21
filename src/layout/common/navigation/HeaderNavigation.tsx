import React from "react";
import Link from "next/link";
import { EcommerceService } from "@/core/api/ecommerce/ecommerce.service";

const HeaderNavigation: React.FC = () => {
  const [storeActive, setStoreActive] = React.useState(true);

  React.useEffect(() => {
    EcommerceService.getStore()
      .then(store => {
        if (store && store.status === 'active') {
          setStoreActive(true);
        } else {
          setStoreActive(false);
        }
      })
      .catch(() => {
        setStoreActive(true);
      });
  }, []);

  return (
    <nav className="flex items-center gap-6 ml-6">
      <Link
        href="/browse"
        className="text-gray-100 hover:text-[#ff3c00] transition font-semibold px-3 py-2 rounded-md"
      >
        Browse
      </Link>
      <Link
        href="/pricing"
        className="text-gray-100 hover:text-[#ff3c00] transition font-semibold px-3 py-2 rounded-md"
      >
        Pricing
      </Link>
      {storeActive && (
        <Link
          href="/shop"
          className="font-semibold text-base px-3 py-2 rounded-md transition text-gray-100 hover:text-[#ff3c00]"
        >
          Shop
        </Link>
      )}
    </nav>
  );
};

export default HeaderNavigation;
