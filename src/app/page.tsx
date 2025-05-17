import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-100 px-4">
      <div className="max-w-4xl w-full flex flex-col items-center gap-8 p-8 bg-white/10 rounded-2xl shadow-2xl border border-white/20 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#ff3c00] text-center drop-shadow-sm">So You&apos;ve deployed? Now what?</h1>
        <p className="text-lg text-gray-200 text-center">Login and continue to setup Beamify in the <span className="font-semibold text-[#ff3c00]">Administration Dashboard</span>.</p>
        <Link href="/login" className="mt-4 px-6 py-3 rounded-lg bg-[#ff3c00] text-white font-bold text-lg shadow hover:bg-[#ff5722] transition">Login</Link>
      </div>
    </div>
  );
}
