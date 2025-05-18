"use client";
import React, { useState, useEffect } from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import Tabs, { Tab } from "@/theme/ui/tabs";
import { UserService } from "@/core/api/user/user.service";
import { useAuth } from "@/core/auth/AuthProvider";
import { Alert } from "@/theme/ui/alerts";
import { User } from "@/core/api/user/types/user.interface";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("account");
  const tabs: Tab[] = [
    { label: "Account", value: "account" },
  ];

  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof authUser === "undefined") return;
    if (!authUser) {
      setError("You must be logged in to access settings.");
      setLoading(false);
      return;
    }
    UserService.getCurrentUser()
      .then((data) => {
        setUser(data);
        setForm({
          displayName: data.profile?.displayName || "",
          bio: data.profile?.bio || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [authUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const updated = await UserService.updateUser(user._id, {
        profile: {
          displayName: form.displayName,
          bio: form.bio,
        },
      });
      setUser(updated);
      setSuccess("Settings updated successfully.");
    } catch (err) {
      setError((err as Error).message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-gray-950">
      <header className="w-full bg-gradient-to-r from-[#ff3c00] via-[#ff6a00] to-[#ff3c00] py-10 px-4 flex flex-col items-center justify-center shadow-lg">
        <div className="flex items-center gap-4 justify-center">
          <Cog6ToothIcon className="h-10 w-10 text-white drop-shadow-lg" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight text-center drop-shadow-lg">Settings</h1>
        </div>
        <p className="mt-4 text-lg sm:text-xl text-white/90 font-medium text-center max-w-2xl">
          Manage your account details, privacy, and preferences.
        </p>
      </header>
      <div className="w-full mt-8 px-4">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <div className="mt-8 w-full">
          <div className="w-full p-8 rounded-2xl">
            {loading ? (
              <div className="text-gray-400 text-center py-12">Loading...</div>
            ) : error ? (
              <Alert type="error" message={error} />
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleSave}>
                {success && <Alert type="success" message={success} />}
                <div className="mt-4" />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={form.displayName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg px-4 py-2 bg-gray-900 text-gray-100 border border-gray-700 focus:border-[#ff3c00] focus:outline-none"
                    maxLength={32}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleInputChange}
                    className="w-full rounded-lg px-4 py-2 bg-gray-900 text-gray-100 border border-gray-700 focus:border-[#ff3c00] focus:outline-none"
                    rows={3}
                    maxLength={256}
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 bg-[#ff3c00] hover:bg-[#ff3c00]/90 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
