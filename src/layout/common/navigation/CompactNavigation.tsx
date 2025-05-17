import React from "react";
import Link from "next/link";
import { HomeIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/core/auth/AuthProvider";

const CompactNavigation: React.FC = () => {
  const { isAdmin } = useAuth();
  return (
    <nav className="flex flex-col items-center gap-6 py-4 w-full">
      <Link
        href="/"
        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-[#ff3c00]/10 transition group"
        aria-label="Home"
      >
        <HomeIcon className="h-7 w-7 text-gray-100 group-hover:text-[#ff3c00] transition" />
        <span className="mt-1 text-xs text-gray-400 group-hover:text-[#ff3c00] font-semibold">Home</span>
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-[#ff3c00]/10 transition group"
          aria-label="Admin"
        >
          <ShieldCheckIcon className="h-7 w-7 text-gray-100 group-hover:text-[#ff3c00] transition" />
          <span className="mt-1 text-xs text-gray-400 group-hover:text-[#ff3c00] font-semibold">Admin</span>
        </Link>
      )}
    </nav>
  );
};

export default CompactNavigation;
