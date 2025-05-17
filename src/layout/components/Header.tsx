import React from "react";
import Link from "next/link";
import UserNavigation from "@/layout/common/navigation/UserNavigation";
import HeaderNavigation from "@/layout/common/navigation/HeaderNavigation";
import { useAuth } from "@/core/auth/AuthProvider";

const Header: React.FC = () => {
  const { disconnected } = useAuth();
  return (
    <header className="MainHeader sticky top-0 w-full bg-gray-900 shadow-sm z-50">
      {disconnected && (
        <div className="w-full bg-red-700 text-white text-center py-2 font-bold animate-pulse z-50">
          Disconnected from server. Some features may not work. Trying to reconnect...
        </div>
      )}
      <div className="flex items-center h-16 px-6 justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/images/logo/icon_w.svg" alt="Beamify Logo" className="h-8 w-8 drop-shadow-xl" />
            <span className="font-bold text-xl text-[#ff3c00] group-hover:text-white transition">Beamify</span>
          </Link>
          <HeaderNavigation />
        </div>
        <div className="flex items-center ml-auto">
          <UserNavigation />
        </div>
      </div>
    </header>
  );
};

export default Header;
