import React from "react";
import Link from "next/link";

const HeaderNavigation: React.FC = () => {
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
    </nav>
  );
};

export default HeaderNavigation;
