"use client";
import React, { useState, useEffect } from "react";
import { AuthService } from "@/core/auth/auth.service";
import { Alert } from "@/theme/ui/alerts";
import Link from "next/link";

const ForgotPage = () => {
  useEffect(() => {
    document.body.classList.add("hide-layout");
    return () => {
      document.body.classList.remove("hide-layout");
    };
  }, []);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await AuthService.forgot({ email });
      setSuccess(true);
    } catch (err) {
      setError((err as Error)?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-950 text-gray-100 px-4">
      <div className="mt-12 mb-8 flex flex-col items-center">
        <div className="rounded-full bg-white/10 backdrop-blur-md shadow-lg p-3 border border-white/20">
          <img src="/images/logo/icon_w.svg" alt="Beamify Logo" className="h-16 w-16 drop-shadow-xl" />
        </div>
      </div>
      <div className={`w-full max-w-md transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} flex flex-col items-center`}>
        <div className="mb-7 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold mb-2 text-[#ff3c00] drop-shadow-sm tracking-tight">Forgot Password</h1>
          <p className="text-base text-gray-300 text-center max-w-xs font-medium">Enter your email and we'll send you a link to reset your password.</p>
        </div>
        {success ? (
          <Alert type="success" message="If an account with that email exists, a reset link has been sent." />
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-2xl shadow-2xl w-full flex flex-col gap-6 animate-fade-in">
            <label className="flex flex-col gap-1">
              <span className="text-base font-semibold text-gray-200">Email</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="p-3 rounded-xl bg-gray-900/80 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] placeholder-gray-500 font-medium text-base transition"
                placeholder="you@email.com"
                required
              />
            </label>
            {error && (
              <Alert type="error" message={error} className="animate-fade-in" />
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-[#ff3c00] to-red-600 hover:from-red-600 hover:to-[#ff3c00] transition text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 mt-2 shadow-lg shadow-[#ff3c00]/20 text-lg tracking-wide border border-[#ff3c00]/40 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]/60"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
        <div className="mt-6 text-center">
          <Link href="/login" className="font-semibold text-[#ff3c00] hover:underline hover:text-white transition">Back to Login</Link>
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

export default ForgotPage;
