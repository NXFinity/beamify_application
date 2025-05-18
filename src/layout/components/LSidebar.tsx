import React from "react";
import CompactNavigation from "@/layout/common/navigation/CompactNavigation";

const LSidebar: React.FC = () => (
  <aside className="MainLSidebar hidden lg:flex flex-col items-center bg-gray-900 border-r border-gray-800 py-4 w-16 min-h-screen fixed top-0 left-0 h-screen z-40 pt-[64px]">
    <CompactNavigation />
  </aside>
);

export default LSidebar;
