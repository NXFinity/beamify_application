"use client";
import React, { useState, useEffect } from "react";
import { AuthService } from "@/core/auth/auth.service";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Alert } from "@/theme/ui/alerts";
import Link from "next/link";
import Image from "next/image";

const LoginPage = () => {
  useEffect(() => {
    document.body.classList.add("hide-layout");
    return () => {
      document.body.classList.remove("hide-layout");
    };
  }, []);

  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await AuthService.login(form);
      // Assume data contains user info with username
      const username = data?.user?.username || data?.username;
      if (username) {
        window.location.href = `/${username}/profile`;
      } else {
        setError("Login succeeded but user info is missing.");
      }
    } catch (err) {
      setError((err as Error)?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-950 text-gray-100 px-4">
      <header className="mt-12 mb-8 flex flex-col items-center w-full">
        <div className="rounded-full bg-white/10 backdrop-blur-md shadow-lg p-3 border border-white/20">
          <Image src="/images/logo/icon_w.svg" alt="Beamify Logo" width={64} height={64} className="h-16 w-16 drop-shadow-xl" priority />
        </div>
      </header>
      <div className={`w-full max-w-md transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} flex flex-col items-center`}>
        <div className="mb-7 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold mb-2 text-[#ff3c00] drop-shadow-sm tracking-tight">Sign in to Beamify</h1>
          <p className="text-base text-gray-300 text-center max-w-xs font-medium">Welcome back! Please log in to your account.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-2xl shadow-2xl w-full flex flex-col gap-6 animate-fade-in">
          <label className="flex flex-col gap-1">
            <span className="text-base font-semibold text-gray-200">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="p-3 rounded-xl bg-gray-900/80 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] placeholder-gray-500 font-medium text-base transition"
              placeholder="you@email.com"
              required
            />
          </label>
          <label className="flex flex-col gap-1 relative">
            <span className="text-base font-semibold text-gray-200">Password</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="p-3 rounded-xl bg-gray-900/80 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] placeholder-gray-500 font-medium text-base pr-12 transition"
              placeholder="Your password"
              required
              minLength={8}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-9 text-gray-400 hover:text-[#ff3c00] focus:outline-none"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </label>
          <div className="w-full flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 select-none m-0">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
                className="form-checkbox h-4 w-4 text-[#ff3c00] rounded focus:ring-2 focus:ring-[#ff3c00] border-gray-700 bg-gray-900"
              />
              <span className="text-sm text-gray-300">Remember me</span>
            </label>
            <Link href="/forgot" className="text-sm text-[#ff3c00] hover:underline hover:text-white transition">Forgot password?</Link>
          </div>
          {error && (
            <Alert type="error" message={error} className="animate-fade-in" />
          )}
          <button
            type="submit"
            className="bg-gradient-to-r from-[#ff3c00] to-red-600 hover:from-red-600 hover:to-[#ff3c00] transition text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 mt-2 shadow-lg shadow-[#ff3c00]/20 text-lg tracking-wide border border-[#ff3c00]/40 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]/60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-400">Don&apos;t have an account? </span>
          <Link href="/register" className="font-semibold text-[#ff3c00] hover:underline hover:text-white transition">Register</Link>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
