import React from "react";
import Link from "next/link";
import UserNavigation from "@/layout/common/navigation/UserNavigation";
import HeaderNavigation from "@/layout/common/navigation/HeaderNavigation";
import Image from "next/image";
import { useAuth } from "@/core/auth/AuthProvider";

const Header: React.FC = () => {
  const { disconnected } = useAuth();
  return (
    <header className="MainHeader sticky top-0 w-full bg-gray-900 shadow-sm z-50">
      <div className="flex items-center h-16 px-6 justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/images/logo/icon_w.svg" alt="Beamify Logo" width={32} height={32} className="h-8 w-8 drop-shadow-xl" priority />
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
