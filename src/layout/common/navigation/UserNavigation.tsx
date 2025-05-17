"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AuthService } from "@/core/auth/auth.service";
import { User } from "@/core/api/admin/types/admin.interface";
import { UserService } from "@/core/api/user/user.service";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const UserNavigation: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUser(null);
      return;
    }
    UserService.getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center justify-center focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
      >
        {!user ? (
          <img src="/images/logo/icon_w.svg" alt="Beamify Logo" className="h-8 w-8" />
        ) : user.profile?.avatar ? (
          <img src={user.profile.avatar} alt="User Avatar" className="h-8 w-8 rounded-full object-cover border-2 border-[#ff3c00]" />
        ) : (
          <span className="h-8 w-8 rounded-full bg-[#ff3c00] flex items-center justify-center text-white font-bold text-lg border-2 border-[#ff3c00]">
            {getInitials(user.profile?.displayName || user.username || "U")}
          </span>
        )}
        {user && (
          <span className="ml-2 font-semibold text-gray-100 hidden sm:inline">{user.profile?.displayName || user.username}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
          {/* Dropdown header */}
          {!user ? (
            <>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Logged out</div>
              <div className="border-b border-gray-800 my-1" />
              <Link href="/login" className="block px-4 py-2 text-gray-100 hover:bg-[#ff3c00] hover:text-white transition">Login</Link>
              <Link href="/register" className="block px-4 py-2 text-gray-100 hover:bg-[#ff3c00] hover:text-white transition">Register</Link>
              <Link href="/forgot" className="block px-4 py-2 text-gray-100 hover:bg-[#ff3c00] hover:text-white transition">Forgot Password</Link>
            </>
          ) : (
            <>
              <div className="px-4 pt-2 pb-1">
                <div className="font-bold text-gray-100 text-base leading-tight">{user.profile?.displayName || user.username}</div>
                <div className="text-xs text-gray-400 break-all">{user.email}</div>
              </div>
              <div className="border-b border-gray-800 my-2" />
              <Link href={`/${user.username}/profile`} className="block px-4 py-2 text-gray-100 hover:bg-[#ff3c00] hover:text-white transition">Profile</Link>
              <button
                onClick={async () => {
                  await AuthService.logout();
                  window.location.href = "/login";
                }}
                className="block w-full text-left px-4 py-2 text-gray-100 hover:bg-[#ff3c00] hover:text-white transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
};

export default UserNavigation;
