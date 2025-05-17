import React from "react";
import Link from "next/link";

export interface ProfileCardProps {
  user: {
    avatar?: string;
    displayName?: string;
    username: string;
    email?: string;
  };
  className?: string;
  children?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, className = "", children, href, onClick }) => {
  const cardContent = (
    <div
      className={`bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 transition cursor-${href || onClick ? "pointer" : "default"} hover:scale-[1.025] hover:shadow-2xl ${className}`}
      onClick={onClick}
      tabIndex={href || onClick ? 0 : undefined}
      role={href || onClick ? "button" : undefined}
    >
      <div className="rounded-full bg-white/10 shadow-lg p-1 mb-2 border border-white/20">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt="User Avatar"
            className="h-16 w-16 rounded-full object-cover border-2 border-[#ff3c00]"
          />
        ) : (
          <span className="h-16 w-16 rounded-full bg-[#ff3c00] flex items-center justify-center text-white font-bold text-2xl border-2 border-[#ff3c00]">
            {user.displayName?.[0] || user.username?.[0] || "U"}
          </span>
        )}
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-[#ff3c00]">{user.displayName || user.username}</div>
        <div className="text-sm text-gray-200 font-mono">@{user.username}</div>
        {user.email && <div className="text-xs text-gray-400 mt-1">{user.email}</div>}
      </div>
      {children && <div className="mt-2 w-full">{children}</div>}
    </div>
  );

  return href ? (
    <Link href={href} tabIndex={-1} className="block w-full h-full">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
};

export default ProfileCard;
