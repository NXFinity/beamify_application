"use client";
import React, { useEffect, useState } from "react";
import ProfileCard from "@/theme/components/ProfileCard";
import { UserService } from "@/core/api/user/user.service";
import { User } from "@/core/api/user/types/user.interface";

const BrowsePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    UserService.getAllUsers()
      .then((data: User[]) => {
        // Map profile fields to top-level for ProfileCard compatibility
        const users = data.map((user) => ({
          ...user,
          avatar: user.profile?.avatar,
          displayName: user.profile?.displayName,
        }));
        setUsers(users);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error)?.message || "Failed to load users");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center bg-gray-950 text-gray-100">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center bg-gray-950 text-red-500 font-bold text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-950 text-gray-100 px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-8 text-[#ff3c00] drop-shadow-sm tracking-tight text-center">Browse Users</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {users.map((user) => (
          <ProfileCard key={user.username} user={user} href={`/${user.username}`} />
        ))}
      </div>
    </div>
  );
};

export default BrowsePage;
