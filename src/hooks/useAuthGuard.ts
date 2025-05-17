import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/AuthProvider";

export function useAuthGuard() {
  const router = useRouter();
  const { checked } = useAuth();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (checked && (!token || !username || !userId)) {
      router.replace("/login");
    }
  }, [checked, router]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  return checked && !!token && !!username && !!userId;
} 