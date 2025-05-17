import React from "react";

export interface Tab {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange, className = "" }) => {
  return (
    <nav
      className={`relative flex w-full items-center bg-gray-900 dark:bg-gray-800 shadow-sm px-2 py-1 ${className}`}
      role="tablist"
      aria-label="Tabs"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            className={`relative px-5 py-2 mx-1 font-medium text-base focus:outline-none transition-colors duration-200 text-white
              ${isActive
                ? "text-[#ff3c00] font-bold"
                : "hover:text-[#ff3c00]"}
            `}
            onClick={() => onChange(tab.value)}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            {tab.icon && <span className="h-5 w-5 mr-1">{tab.icon}</span>}
            {tab.label}
            {/* Animated underline */}
            <span
              className={`absolute left-1/2 -bottom-1.5 w-2/3 h-[3px] rounded-full transition-all duration-300 transform -translate-x-1/2
                ${isActive ? "bg-[#ff3c00] scale-x-100 opacity-100" : "bg-[#ff3c00]/40 scale-x-0 opacity-0"}
              `}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </nav>
  );
};

export default Tabs;
