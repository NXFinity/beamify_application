"use client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import Tabs, { Tab } from "@/theme/ui/tabs";
import React, { useState, useEffect } from "react";
import UserManagementPage from "./user/page";
import LedgerManagementPage from "./payment/page";
import GamificationManagementPage from "./gamify/page";
import AccessManagementPage from "./access/page";
import EcommerceManagementPage from "./ecommerce/page";

export default function AdminPage() {
  const checked = useAuthGuard();
  const [activeTab, setActiveTab] = useState("user-management");
  const tabs: Tab[] = [
    { label: "User Management", value: "user-management" },
    { label: "Ledger Management", value: "ledger-management" },
    { label: "Gamification Management", value: "gamification-management" },
    { label: "Access Management", value: "access-management" },
    { label: "Ecommerce Management", value: "ecommerce-management" },
  ];
  useEffect(() => {
    if (activeTab === "ecommerce-management") {
      document.body.classList.add("ecommerce-active");
      window.dispatchEvent(new CustomEvent("ecommerce-tab-visibility", { detail: { visible: true } }));
    } else {
      document.body.classList.remove("ecommerce-active");
      window.dispatchEvent(new CustomEvent("ecommerce-tab-visibility", { detail: { visible: false } }));
    }
    return () => {
      document.body.classList.remove("ecommerce-active");
      window.dispatchEvent(new CustomEvent("ecommerce-tab-visibility", { detail: { visible: false } }));
    };
  }, [activeTab]);
  if (!checked) return null;
  return (
    <>
      <header className="w-full bg-gradient-to-r from-[#ff3c00] via-[#ff6a00] to-[#ff3c00] py-10 px-4 flex flex-col items-center justify-center shadow-lg">
        <div className="flex items-center gap-4 justify-center">
          <ShieldCheckIcon className="h-10 w-10 text-white drop-shadow-lg" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight text-center drop-shadow-lg">Admin Dashboard</h1>
          </div>
        <p className="mt-4 text-lg sm:text-xl text-white/90 font-medium text-center max-w-2xl">
          Powerful tools and insights to manage your platform with confidence.
        </p>
      </header>
      <div className="w-full mt-8 px-4">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <div className="mt-8 w-full">
          {/* Tab content */}
          {activeTab === "user-management" && <UserManagementPage />}
          {activeTab === "ledger-management" && <LedgerManagementPage />}
          {activeTab === "gamification-management" && <GamificationManagementPage />}
          {activeTab === "access-management" && <AccessManagementPage />}
          {activeTab === "ecommerce-management" && <EcommerceManagementPage />}
        </div>
      </div>
    </>
  );
}
