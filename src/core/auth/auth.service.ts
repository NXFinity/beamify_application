import { authEndpoints } from "./authEndpoints";

export class AuthService {
  static async checkAdminExists(): Promise<boolean> {
    try {
      const res = await fetch(authEndpoints.initAdmin, { method: "GET" });
      if (res.status === 404) return true; // 404 means admin exists
      if (!res.ok) return false;
      const data = await res.json();
      return !!data.adminExists;
    } catch {
      return false;
    }
  }

  static async login(payload: { email: string; password: string }) {
    const res = await fetch(authEndpoints.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      // Prefer backend error message if available
      throw new Error(data.message || "Login failed");
    }
    if (typeof window !== "undefined" && data.token && data.user) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("userId", data.user._id);
      window.dispatchEvent(new Event("authChanged"));
    }
    return data;
  }

  static async register(payload: { email: string; password: string; name?: string }) {
    const res = await fetch(authEndpoints.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      // Prefer backend error message if available
      throw new Error(data.message || "Registration failed");
    }
    return data;
  }

  static async verify(payload: { email: string; token: string }) {
    const res = await fetch(authEndpoints.verify, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Verification failed");
    return res.json();
  }

  static async forgot(payload: { email: string }) {
    const res = await fetch(authEndpoints.forgot, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Forgot password failed");
    return res.json();
  }

  static async reset(payload: { token: string; password: string }) {
    const res = await fetch(authEndpoints.reset, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Reset password failed");
    return res.json();
  }

  static async resend(payload: { email: string }) {
    const res = await fetch(authEndpoints.resend, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Resend verification failed");
    return res.json();
  }

  static async logout() {
    const res = await fetch(authEndpoints.logout, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Logout failed");
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      window.dispatchEvent(new Event("authChanged"));
    }
    return res.json();
  }

  static async changePassword(payload: { oldPassword: string; newPassword: string }) {
    const res = await fetch(authEndpoints.changePassword, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Change password failed");
    return res.json();
  }

  static async resetVerification(payload: { email: string }) {
    const res = await fetch(authEndpoints.resetVerification, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Reset verification failed");
    return res.json();
  }

  static async initAdmin(payload: { email: string; password: string; name?: string }) {
    const res = await fetch(authEndpoints.initAdmin, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Init admin failed");
    return res.json();
  }

  static async isLocked(): Promise<boolean> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_BASE_VERSION}/users`);
      const data = await res.json();
      if (data && typeof data.message === "string" && data.message.includes("Admin account not initialized")) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
