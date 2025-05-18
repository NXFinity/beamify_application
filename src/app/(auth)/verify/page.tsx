"use client";
import React, { useState, useEffect } from "react";
import { AuthService } from "@/core/auth/auth.service";
import { Alert } from "@/theme/ui/alerts";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const VerifyPage = () => {
  useEffect(() => {
    document.body.classList.add("hide-layout");
    return () => {
      document.body.classList.remove("hide-layout");
    };
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({ email: "", token: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
    // Pre-fill email from query param if present
    const emailParam = searchParams?.get("email");
    if (emailParam) setForm((prev) => ({ ...prev, email: emailParam }));
  }, []);

  useEffect(() => {
    if (status === "success") {
      const timeout = setTimeout(() => {
        router.replace("/login");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus("idle");
    try {
      await AuthService.verify({ email: form.email, token: form.token });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError((err as Error)?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError(null);
    setResendStatus("idle");
    try {
      await AuthService.resend({ email: resendEmail });
      setResendStatus("sent");
    } catch (err) {
      setResendStatus("error");
      setResendError((err as Error)?.message || "Failed to resend verification email");
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
          <h1 className="text-3xl font-extrabold mb-2 text-[#ff3c00] drop-shadow-sm tracking-tight">Verify Your Email</h1>
          <p className="text-base text-gray-300 text-center max-w-xs font-medium">Enter your email and the verification token you received.</p>
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
          <label className="flex flex-col gap-1">
            <span className="text-base font-semibold text-gray-200">Verification Token</span>
            <input
              type="text"
              name="token"
              value={form.token}
              onChange={handleChange}
              className="p-3 rounded-xl bg-gray-900/80 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] placeholder-gray-500 font-medium text-base transition"
              placeholder="Paste your verification token"
              required
            />
          </label>
          {status === "error" && (
            <Alert type="error" message={error || "Verification failed."} className="animate-fade-in" />
          )}
          {status === "success" && (
            <Alert type="success" message="Your email has been verified! You can now log in." className="animate-fade-in" />
          )}
          <button
            type="submit"
            className="bg-gradient-to-r from-[#ff3c00] to-red-600 hover:from-red-600 hover:to-[#ff3c00] transition text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 mt-2 shadow-lg shadow-[#ff3c00]/20 text-lg tracking-wide border border-[#ff3c00]/40 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]/60"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
        {status === "success" && (
          null
        )}
        <div className="mt-10 w-full">
          <form onSubmit={handleResend} className="flex flex-col gap-3 bg-white/5 border border-white/10 rounded-xl p-6">
            <span className="text-base font-semibold text-gray-200 mb-1">Resend Verification Email</span>
            <input
              type="email"
              value={resendEmail}
              onChange={e => setResendEmail(e.target.value)}
              className="p-3 rounded-xl bg-gray-900/80 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] placeholder-gray-500 font-medium text-base transition"
              placeholder="Enter your email"
              required
            />
            {resendStatus === "sent" && (
              <Alert type="success" message="Verification email resent. Please check your inbox." className="animate-fade-in" />
            )}
            {resendStatus === "error" && (
              <Alert type="error" message={resendError || "Failed to resend verification email."} className="animate-fade-in" />
            )}
            <button type="submit" className="px-4 py-2 rounded-lg bg-[#ff3c00] text-white font-bold shadow hover:bg-[#ff5722] transition">Resend Email</button>
          </form>
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

export default VerifyPage;
