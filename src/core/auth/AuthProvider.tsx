"use client";
import React, { useEffect, useState } from "react";
import { User } from "@/core/api/admin/types/admin.interface";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = React.createContext({
  user: null as User | null,
  isAdmin: false,
  checked: false,
  disconnected: false,
});

export function useAuth() {
  return React.useContext(AuthContext);
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3021';
const API_BASE_VER = process.env.NEXT_PUBLIC_API_BASE_VERSION || 'v1';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Auth state: fetch user from /users/me
  useEffect(() => {
    let mounted = true;
    // Only skip /users/me check on /init
    if (pathname === "/init") {
      setChecked(true);
      return;
    }
    let stopFurtherChecks = false;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch(`${API_BASE_URL}/${API_BASE_VER}/users/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(async res => {
        if (res.status === 503) {
          // Treat 503 as admin not initialized
          if (pathname !== "/init") {
            router.replace("/init");
            setChecked(false);
            stopFurtherChecks = true;
            return;
          } else {
            setChecked(true);
            stopFurtherChecks = true;
            return;
          }
        }
        const data = await res.json();
        if (
          data &&
          typeof data.message === "string" &&
          data.message.includes("Admin account not initialized")
        ) {
          if (pathname !== "/init") {
            router.replace("/init");
            setChecked(false); // Block rendering until redirect
            stopFurtherChecks = true;
            return;
          } else {
            setChecked(true); // Allow /init to render
            stopFurtherChecks = true;
            return;
          }
        }
        if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
        if (!res.ok) throw new Error("OtherError");
        return data;
      })
      .then(data => {
        if (mounted && data && !stopFurtherChecks) {
          setUser(data);
          setIsAdmin(Array.isArray(data?.roles) && data.roles.includes("SYSTEM_ADMINISTRATOR"));
          setDisconnected(false);
          setChecked(true);
        }
      })
      .catch((err) => {
        if (mounted && !stopFurtherChecks) {
          if (err.message === "Unauthorized") {
            setUser(null);
            setIsAdmin(false);
            setDisconnected(false);
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
          } else {
            setDisconnected(true);
          }
          setChecked(true);
        }
      });
    return () => { mounted = false; };
  }, [pathname, router]);

  if (!checked) return null;

  return (
    <AuthContext.Provider value={{ user, isAdmin, checked, disconnected }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

