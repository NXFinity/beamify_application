"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserService } from "@/core/api/user/user.service";
import Link from "next/link";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";

interface PublicUserBan {
  type: string;
  status: string;
  expiresAt?: string;
  createdAt?: string;
}

interface PublicUser {
  username: string;
  profile?: {
    avatar?: string;
    cover?: string;
    displayName?: string;
    bio?: string;
  };
  status?: {
    isBanned?: boolean;
  };
  bans?: PublicUserBan[];
}

const PublicUserPage: React.FC = () => {
  const params = useParams();
  const username = typeof params.username === "string" ? params.username : Array.isArray(params.username) ? params.username[0] : "";
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    UserService.getUserByUsername(username)
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setNotFound(true);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gray-950 text-gray-100">
        Loading user profile...
      </div>
    );
  }

  // If user exists and is banned, show banned message
  if (user && user.status?.isBanned) {
    const bans = user.bans || [];
    const activeBan = bans.find((b) => b.status === 'active');
    const isTimedBan = activeBan?.type === 'TIMEBAN';
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-gray-950 text-gray-100 px-4">
        <div className="text-[6rem] sm:text-[8rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#ff3c00] to-[#00e0ff] drop-shadow-[0_8px_40px_rgba(255,60,0,0.5)] mb-6 select-none">
          BANNED
        </div>
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#ff3c00]">
            @{user.username} is banned from the site.
          </h2>
          {isTimedBan && activeBan?.expiresAt && (
            <p className="mb-4 text-lg text-gray-300">
              Ban expires: {new Date(activeBan.expiresAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  // If user truly does not exist, show 404
  if (notFound || !user) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-gray-950 text-gray-100 px-4">
        <div className="text-[12rem] sm:text-[16rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#ff3c00] to-[#00e0ff] drop-shadow-[0_8px_40px_rgba(255,60,0,0.5)] mb-6 select-none">
          404
        </div>
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#ff3c00]">This user doesn&apos;t exist.</h2>
          <p className="mb-4 text-lg text-gray-300">
            Is this you?{' '}
            <Link href="/register" className="text-[#ff3c00] hover:text-white transition font-semibold">Register</Link>
            ?
          </p>
        </div>
        <style jsx global>{`
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100">
      {/* Cover Image */}
      <div className="sticky top-0 z-50 w-full h-56 sm:h-64 md:h-72 lg:h-80 bg-gray-800">
        <img
          src={user.profile?.cover || DEFAULT_COVER}
          alt="Cover"
          className="w-full h-full object-cover object-center"
        />
        {/* Avatar - overlaps cover */}
        <div className="absolute left-1/2 -bottom-16 transform -translate-x-1/2 z-40">
          <div className="rounded-full border-4 border-gray-950 shadow-xl bg-white/10 backdrop-blur-md">
            {user.profile?.avatar ? (
              <img
                src={user.profile.avatar}
                alt="User Avatar"
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <span className="h-32 w-32 rounded-full bg-[#ff3c00] flex items-center justify-center text-white font-bold text-5xl">
                {user.profile?.displayName?.[0] || user.username?.[0] || "U"}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* User Info */}
      <div className="flex flex-col items-center mt-24 px-4">
        <div className="w-full max-w-2xl flex flex-col items-center gap-2">
          <span className="text-2xl font-extrabold text-[#ff3c00] drop-shadow-sm tracking-tight">
            {user.profile?.displayName || user.username}
          </span>
          <span className="text-base text-gray-300 font-mono">@{user.username}</span>
        </div>
        {user.profile?.bio && (
          <div className="mt-4 max-w-2xl text-center text-gray-200 text-base mb-2 px-4">
            {user.profile.bio}
          </div>
        )}
        {/* Placeholder for future: location, website, join date, etc. */}
        {/* Tabs (Tweets, Media, Likes, etc.) */}
        <div className="w-full max-w-2xl mt-8 border-b border-white/10 flex gap-8 text-lg font-semibold text-gray-400">
          <button className="py-3 px-2 border-b-4 border-transparent hover:border-[#ff3c00] hover:text-[#ff3c00] transition">Posts</button>
          <button className="py-3 px-2 border-b-4 border-transparent hover:border-[#ff3c00] hover:text-[#ff3c00] transition">Media</button>
          <button className="py-3 px-2 border-b-4 border-transparent hover:border-[#ff3c00] hover:text-[#ff3c00] transition">Likes</button>
        </div>
        {/* Placeholder for posts/feed */}
        <div className="w-full max-w-2xl min-h-[200px] flex items-center justify-center text-gray-500 py-12">
          <span>This user hasn&apos;t posted anything yet.</span>
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

export default PublicUserPage;
