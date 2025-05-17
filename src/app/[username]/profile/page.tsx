"use client";
import React, { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Alert } from "@/theme/ui/alerts";
import { User } from "@/core/api/admin/types/admin.interface";
import { UserService } from "@/core/api/user/user.service";
import { CameraIcon } from "@heroicons/react/24/solid";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";

const ProfilePage = () => {
  const checked = useAuthGuard();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!checked) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    UserService.getCurrentUser()
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [checked]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    setAvatarUploading(true);
    setUploadError(null);
    try {
      const { avatar } = await UserService.uploadAvatar(user._id, e.target.files[0]);
      setUser({ ...user, profile: { ...user.profile, avatar } });
    } catch (err) {
      setUploadError((err as Error).message || "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    setCoverUploading(true);
    setUploadError(null);
    try {
      const { cover } = await UserService.uploadCover(user._id, e.target.files[0]);
      setUser({ ...user, profile: { ...user.profile, cover } });
    } catch (err) {
      setUploadError((err as Error).message || "Failed to upload cover");
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  };

  if (!checked || loading) return null;
  if (!user) return <Alert type="error" message="User not found or not logged in.">User not found or not logged in.</Alert>;

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100">
      {/* Cover Image */}
      <div className="relative w-full h-56 sm:h-64 md:h-72 lg:h-80 bg-gray-800 group">
        <img
          src={user?.profile?.cover || DEFAULT_COVER}
          alt="Cover"
          className="w-full h-full object-cover object-center"
        />
        {/* Cover Upload Button */}
        <label className="absolute right-4 bottom-4 z-50 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full cursor-pointer transition flex items-center justify-center" title="Change Cover">
          <span className="sr-only">Change Cover</span>
          {coverUploading ? (
            <CameraIcon className="h-6 w-6 animate-spin" />
          ) : (
            <CameraIcon className="h-6 w-6" />
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
            disabled={coverUploading}
          />
        </label>
        {/* Avatar - overlaps cover */}
        <div className="absolute left-1/2 -bottom-16 transform -translate-x-1/2 z-40 group/avatar">
          <div className="rounded-full border-4 border-white/30 shadow-xl bg-white/10 backdrop-blur-md relative">
            {user?.profile?.avatar ? (
              <img
                src={user.profile.avatar}
                alt="User Avatar"
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <span className="h-32 w-32 rounded-full bg-[#ff3c00] flex items-center justify-center text-white font-bold text-5xl">
                {user?.profile?.displayName?.[0] || user?.username?.[0] || "U"}
              </span>
            )}
            {/* Avatar Upload Button */}
            <label className="absolute right-0 bottom-0 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full cursor-pointer transition flex items-center justify-center" title="Change Avatar">
              <span className="sr-only">Change Avatar</span>
              {avatarUploading ? (
                <CameraIcon className="h-5 w-5 animate-spin" />
              ) : (
                <CameraIcon className="h-5 w-5" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={avatarUploading}
              />
            </label>
          </div>
        </div>
      </div>
      {/* User Info Card */}
      <div className="flex flex-col items-center mt-24 px-4">
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl flex flex-col gap-4 animate-fade-in">
        {error ? (
          <Alert type="error" message={error} className="mt-6" />
        ) : user ? (
            <>
              <div className="flex flex-col items-center gap-2 mb-4">
                <span className="text-2xl font-extrabold text-[#ff3c00] drop-shadow-sm tracking-tight">
                  {user.profile?.displayName || user.username}
                </span>
                <span className="text-base text-gray-300">@{user.username}</span>
                <span className="text-sm text-gray-400">{user.email}</span>
                {user.roles && (
                  <span className="text-xs text-gray-400 mt-1">
                    {user.roles.join(", ")}
                  </span>
                )}
            </div>
              {user.profile?.bio && (
                <div className="text-center text-gray-200 text-base mb-2">
                  {user.profile.bio}
            </div>
              )}
              {uploadError && <Alert type="error" message={uploadError} className="mt-2" />}
            </>
          ) : null}
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

export default ProfilePage;
