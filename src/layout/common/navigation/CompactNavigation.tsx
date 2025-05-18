import React from "react";
import Link from "next/link";
import { HomeIcon, ShieldCheckIcon, UserCircleIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/core/auth/AuthProvider";
import { usePathname } from "next/navigation";

const CompactNavigation: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();
  return (
    <nav className="flex flex-col items-center gap-1 py-4 w-full">
    <Link
      href="/"
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition group ${pathname === "/" ? "bg-[#ff3c00]/20 text-[#ff3c00]" : "hover:bg-[#ff3c00]/10"}`}
      aria-label="Home"
    >
      <HomeIcon className="h-7 w-7 text-gray-100 group-hover:text-[#ff3c00] transition" />
      <span className="mt-1 text-xs text-gray-400 group-hover:text-[#ff3c00] font-semibold">Home</span>
    </Link>
      {user && (
        <>
          <Link
            href={`/${user.username}/profile`}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition group ${pathname === `/${user.username}/profile` ? "bg-[#ff3c00]/20 text-[#ff3c00]" : "hover:bg-[#ff3c00]/10"}`}
            aria-label="Profile"
          >
            <UserCircleIcon className="h-7 w-7 text-gray-100 group-hover:text-[#ff3c00] transition" />
            <span className="mt-1 text-xs text-gray-400 group-hover:text-[#ff3c00] font-semibold">Profile</span>
          </Link>
          <Link
            href={`/${user.username}/settings`}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition group ${pathname === `/${user.username}/settings` ? "bg-[#ff3c00]/20 text-[#ff3c00]" : "hover:bg-[#ff3c00]/10"}`}
            aria-label="Settings"
          >
            <Cog6ToothIcon className="h-7 w-7 text-gray-100 group-hover:text-[#ff3c00] transition" />
            <span className="mt-1 text-xs text-gray-400 group-hover:text-[#ff3c00] font-semibold">Settings</span>
          </Link>
        </>
      )}
      {isAdmin && (
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition group ${pathname === "/admin" ? "bg-[#ff3c00]/20 text-[#ff3c00]" : "hover:bg-[#ff3c00]/10"}`}
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
