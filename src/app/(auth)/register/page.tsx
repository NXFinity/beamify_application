"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/core/auth/auth.service";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Alert } from "@/theme/ui/alerts";
import Link from "next/link";
import Image from "next/image";

const RegisterPage = () => {
  useEffect(() => {
    document.body.classList.add("hide-layout");
    return () => {
      document.body.classList.remove("hide-layout");
    };
  }, []);

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [animate, setAnimate] = useState(false);
  const router = useRouter();

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
    try {
      await AuthService.register(form);
      router.replace(`/auth/verify?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError((err as Error)?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 text-gray-100 px-4">
      <div className={`w-full max-w-md transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} flex flex-col items-center`}>
        <div className="mb-7 flex flex-col items-center">
          <div className="rounded-full bg-white/10 backdrop-blur-md shadow-lg p-3 mb-3 border border-white/20">
            <Image src="/images/logo/icon_w.svg" alt="Beamify Logo" width={56} height={56} className="h-14 w-14 drop-shadow-xl" priority />
          </div>
          <h1 className="text-3xl font-extrabold mb-2 text-[#ff3c00] drop-shadow-sm tracking-tight">Register for Beamify</h1>
          <p className="text-base text-gray-300 text-center max-w-xs font-medium">Create your account to get started.</p>
        </div>
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
                <Alert type="error" message={error} className="animate-fade-in" />
              )}
              <button
                type="submit"
                className="bg-gradient-to-r from-[#ff3c00] to-red-600 hover:from-red-600 hover:to-[#ff3c00] transition text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 mt-2 shadow-lg shadow-[#ff3c00]/20 text-lg tracking-wide border border-[#ff3c00]/40 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]/60"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
            <div className="mt-6 text-center text-xs text-gray-400">
              By registering, you agree to our{' '}
              <Link href="/terms" className="text-[#ff3c00] hover:underline hover:text-white transition">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-[#ff3c00] hover:underline hover:text-white transition">Privacy Policy</Link>.
            </div>
            <div className="mt-4 text-center">
              <span className="text-gray-400">Already have an account? </span>
              <Link href="/login" className="font-semibold text-[#ff3c00] hover:underline hover:text-white transition">Login</Link>
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

export default RegisterPage;
