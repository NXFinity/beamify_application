import React from "react";
import Link from "next/link";

const Footer: React.FC = () => (
  <footer className="MainFooter w-full bg-gray-900 py-4 mt-auto">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-2">
      <span className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Beamify. All rights reserved.</span>
      <nav className="flex gap-4 text-sm">
        <Link href="/about" className="hover:text-primary text-gray-200 transition">About</Link>
        <Link href="/privacy" className="hover:text-primary text-gray-200 transition">Privacy</Link>
        <Link href="/terms" className="hover:text-primary text-gray-200 transition">Terms</Link>
      </nav>
    </div>
  </footer>
);

export default Footer;
