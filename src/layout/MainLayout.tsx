"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LSidebar from "./components/LSidebar";
import RSidebar from "./components/RSidebar";

function hasHideLayoutProp(type: unknown): type is { hideLayout: boolean } {
  return typeof type === 'function' && 'hideLayout' in (type as object) && (type as { hideLayout?: boolean }).hideLayout === true;
}

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
  }, [pathname]);

  if (pathname === "/init") {
    return <>{children}</>;
  }
  // Hide layout (Header, Sidebars, Footer) on all /auth/* pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot") || pathname.startsWith("/verify") || pathname.startsWith("/reset") || pathname.startsWith("/change")) {
    return <>{children}</>;
  }
  // Handle children as array (Next.js layouts can pass arrays)
  if (Array.isArray(children)) {
    const childWithHideLayout = children.find(
      (child) => React.isValidElement(child) && hasHideLayoutProp(child.type)
    );
    if (childWithHideLayout) {
      return <>{childWithHideLayout}</>;
    }
  } else if (
    React.isValidElement(children) &&
    hasHideLayoutProp(children.type)
  ) {
    return <>{children}</>;
  }
  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Header />
      <div className="flex flex-1 w-full mx-auto">
        <LSidebar />
        <main className={`flex-1 pb-20 ml-16${isLoggedIn ? ' lg:mr-64' : ''}`}>{children}</main>
        {isLoggedIn && <RSidebar />}
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
