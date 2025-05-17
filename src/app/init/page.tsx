"use client";
import React, { useEffect, useState } from "react";
import { AuthService } from "@/core/auth/auth.service";
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

const InitPage = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    document.body.classList.add("hide-layout");
    return () => {
      document.body.classList.remove("hide-layout");
    };
  }, []);

  useEffect(() => {
    if (success) {
      const interval = setInterval(async () => {
        const exists = await AuthService.checkAdminExists();
        if (exists) {
          clearInterval(interval);
          window.location.href = "/login";
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [success]);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await AuthService.initAdmin(form);
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100 px-4">
      <div className={`w-full max-w-md transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} flex flex-col items-center`}>
        <div className="mb-7 flex flex-col items-center">
          <div className="rounded-full bg-white/10 backdrop-blur-md shadow-lg p-3 mb-3 border border-white/20">
            <img src="/images/logo/icon_w.svg" alt="Beamify Logo" className="h-14 w-14 drop-shadow-xl" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2 text-[#ff3c00] drop-shadow-sm tracking-tight">Beamify Setup</h1>
          <p className="text-base text-gray-300 text-center max-w-xs font-medium">The application is locked until a SYSTEM_ADMINISTRATOR account is created. Please register your admin account below.</p>
        </div>
        {success ? (
          <div className="flex flex-col items-center bg-green-900/80 text-green-200 px-6 py-6 rounded-2xl shadow-xl gap-2 w-full border border-green-700/40 animate-fade-in">
            <CheckCircleIcon className="h-8 w-8 text-green-300 mb-1" />
            <span className="font-semibold text-lg">System Administrator account created!</span>
            <span className="text-green-100 text-sm">You can now log in.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-2xl shadow-2xl w-full flex flex-col gap-6 animate-fade-in">
            <label className="flex flex-col gap-1">
              <span className="text-base font-semibold text-gray-200">Username</span>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="p-3 rounded-xl bg-gray-900/80 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] placeholder-gray-500 font-medium text-base transition"
                placeholder="Your username"
                required
              />
            </label>
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
                placeholder="Create a strong password"
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
              <span className="text-xs text-gray-400 mt-1 font-medium">Password must be at least 8 characters.</span>
            </label>
            {error && (
              <div className="flex items-center gap-2 text-red-300 bg-red-900/60 rounded-lg px-3 py-2 text-sm border border-red-700/40 animate-fade-in">
                <ExclamationCircleIcon className="h-5 w-5" />
                {error}
              </div>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-[#ff3c00] to-red-600 hover:from-red-600 hover:to-[#ff3c00] transition text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 mt-2 shadow-lg shadow-[#ff3c00]/20 text-lg tracking-wide border border-[#ff3c00]/40 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]/60"
              disabled={loading}
            >
              {loading ? "Registering..." : "Create System Administrator"}
            </button>
          </form>
        )}
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

export default InitPage;
