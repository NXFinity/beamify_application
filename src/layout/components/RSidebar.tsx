import React from "react";

const RSidebar: React.FC = () => (
    <aside className="MainRSidebar hidden lg:flex flex-col max-h-full bg-gray-900 border-r p-4">
    <div className="mb-6">
      <span className="font-semibold text-lg text-primary">What&apos;s New</span>
    </div>
    <div className="flex flex-col gap-4">
      <div className="bg-gray-800 rounded-lg p-3 shadow-sm">
        <span className="font-medium text-gray-200">No notifications yet.</span>
      </div>
      <div className="bg-gray-800 rounded-lg p-3 shadow-sm">
        <span className="font-medium text-gray-200">Trending: Coming soon!</span>
      </div>
    </div>
  </aside>
);

export default RSidebar;
