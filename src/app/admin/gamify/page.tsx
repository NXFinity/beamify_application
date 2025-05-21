"use client";
import React, { useEffect, useState } from "react";
import { AdminService } from "@/core/api/admin/admin.service";
import { Gamify, Badge, Reward } from "@/core/api/admin/types/admin.interface";
import Image from "next/image";
import {
  FlipCard,
  FlipCardContent
} from "@/theme/ui/flipcards";

// Helper to safely extract user display name
function getUserDisplay(user: unknown): string {
  if (typeof user === 'object' && user !== null) {
    const u = user as { username?: string; email?: string; _id?: string };
    return u.username || u.email || u._id || '';
  }
  return typeof user === 'string' ? user : '';
}

// Type guard for user profile
function hasProfile(user: unknown): user is { profile: { avatar?: string } } {
  return (
    typeof user === 'object' &&
    user !== null &&
    'profile' in user &&
    typeof (user as { profile?: unknown }).profile === 'object'
  );
}

const defaultCreateForm = { userId: '', points: 0, level: 1, exp: 0, crystals: 0 };

const GamificationManagementPage: React.FC = () => {
  // State for gamify profiles
  const [gamifyProfiles, setGamifyProfiles] = useState<Gamify[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ ...defaultCreateForm });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // Add state for expanded action and form values
  const [expandedAction, setExpandedAction] = useState<{ id: string; type: 'points' | 'level' | 'exp' } | null>(null);
  const [formValue, setFormValue] = useState(0);
  const [formMode, setFormMode] = useState<'add' | 'remove'>('add');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Badges state
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgesError, setBadgesError] = useState<string | null>(null);
  const [showBadgeForm, setShowBadgeForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [badgeForm, setBadgeForm] = useState<Partial<Badge>>({ name: '', description: '', icon: '' });
  const [badgeFormLoading, setBadgeFormLoading] = useState(false);
  const [badgeFormError, setBadgeFormError] = useState<string | null>(null);
  // Rewards state
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [rewardsError, setRewardsError] = useState<string | null>(null);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardForm, setRewardForm] = useState<Partial<Reward>>({ name: '', description: '', icon: '' });
  const [rewardFormLoading, setRewardFormLoading] = useState(false);
  const [rewardFormError, setRewardFormError] = useState<string | null>(null);
  const [rewardSearch, setRewardSearch] = useState("");
  // Pagination state for gamify profiles
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalProfiles = gamifyProfiles.length;
  const totalPages = Math.ceil(totalProfiles / pageSize);
  const paginatedProfiles = gamifyProfiles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    fetchProfiles();
    fetchBadges();
    fetchRewards();
  }, [search]);

  // Reset to first page when profiles or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [gamifyProfiles, search, pageSize]);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await AdminService.getAllGamify();
      setGamifyProfiles(Array.isArray(all)
        ? (search.trim()
            ? all.filter(g => {
                const user = g.user as { username?: string; email?: string } | string;
                const name = typeof user === 'object' && user && 'username' in user && typeof user.username === 'string' ? user.username : getUserDisplay(user);
                const email = typeof user === 'object' && user && 'email' in user && typeof user.email === 'string' ? user.email : '';
                return name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
              })
            : all)
        : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      // You may need to implement AdminService.createGamify
      await AdminService.createGamify(createForm);
      setShowCreate(false);
      setCreateForm({ ...defaultCreateForm });
      fetchProfiles();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setCreateLoading(false);
    }
  };

  // Handler for submitting the add/remove form
  const handleActionSubmit = async (id: string, type: 'points' | 'level' | 'exp') => {
    setFormLoading(true);
    setFormError(null);
    try {
      const amount = formMode === 'add' ? formValue : -formValue;
      if (type === 'points') {
        await AdminService.addPointsToGamify(id, amount);
      } else if (type === 'level') {
        await AdminService.addLevelToGamify(id, amount);
      } else if (type === 'exp') {
        await AdminService.addExpToGamify(id, amount);
      }
      setExpandedAction(null);
      setFormValue(0);
      setFormMode('add');
      fetchProfiles();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setFormLoading(false);
    }
  };

  // Fetch all badges
  const fetchBadges = async () => {
    setBadgesLoading(true);
    setBadgesError(null);
    try {
      const all = await AdminService.getAllBadges();
      setBadges(Array.isArray(all) ? all : []);
    } catch (e: unknown) {
      setBadgesError(e instanceof Error ? e.message : String(e));
    } finally {
      setBadgesLoading(false);
    }
  };

  // Handle badge form submit
  const handleBadgeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBadgeFormLoading(true);
    setBadgeFormError(null);
    try {
      if (editingBadge) {
        await AdminService.updateBadge(editingBadge._id, badgeForm);
      } else {
        await AdminService.createBadge(badgeForm);
      }
      setShowBadgeForm(false);
      setEditingBadge(null);
      setBadgeForm({ name: '', description: '', icon: '' });
      fetchBadges();
    } catch (err: unknown) {
      setBadgeFormError(err instanceof Error ? err.message : 'Failed to save badge');
    } finally {
      setBadgeFormLoading(false);
    }
  };

  // Handle badge delete
  const handleDeleteBadge = async (id: string) => {
    if (!window.confirm('Delete this badge?')) return;
    setBadgeFormLoading(true);
    try {
      await AdminService.deleteBadge(id);
      fetchBadges();
    } finally {
      setBadgeFormLoading(false);
    }
  };

  // Fetch all rewards
  const fetchRewards = async () => {
    setRewardsLoading(true);
    setRewardsError(null);
    try {
      const all = await AdminService.getAllRewards();
      setRewards(Array.isArray(all) ? all : []);
    } catch (e: unknown) {
      setRewardsError(e instanceof Error ? e.message : String(e));
    } finally {
      setRewardsLoading(false);
    }
  };

  // Handle reward form submit
  const handleRewardFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRewardFormLoading(true);
    setRewardFormError(null);
    try {
      if (editingReward) {
        await AdminService.updateReward(editingReward._id, rewardForm);
      } else {
        await AdminService.createReward(rewardForm);
      }
      setShowRewardForm(false);
      setEditingReward(null);
      setRewardForm({ name: '', description: '', icon: '' });
      fetchRewards();
    } catch (err: unknown) {
      setRewardFormError(err instanceof Error ? err.message : 'Failed to save reward');
    } finally {
      setRewardFormLoading(false);
    }
  };

  // Handle reward delete
  const handleDeleteReward = async (id: string) => {
    if (!window.confirm('Delete this reward?')) return;
    setRewardFormLoading(true);
    try {
      await AdminService.deleteReward(id);
      fetchRewards();
    } finally {
      setRewardFormLoading(false);
    }
  };

  // Badge search
  const [badgeSearch, setBadgeSearch] = useState("");
  const filteredBadges = badges.filter(b =>
    (b.name?.toLowerCase() || "").includes(badgeSearch.toLowerCase()) ||
    (b.description?.toLowerCase() || "").includes(badgeSearch.toLowerCase())
  );
  const filteredRewards = rewards.filter(r =>
    (r.name?.toLowerCase() || "").includes(rewardSearch.toLowerCase()) ||
    (r.description?.toLowerCase() || "").includes(rewardSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 px-4 py-8">
      {/* FlipCard dashboard row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full mb-12">
        <div className="w-full h-48 relative">
          <FlipCard front={<FlipCardContent className="flex-1 flex flex-col items-center justify-center">
            <div
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
            >
              <span className="text-5xl font-extrabold text-white drop-shadow-xl">
                {loading ? <span className="animate-pulse">...</span> : error ? "-" : gamifyProfiles.length}
              </span>
              <span className="text-base text-gray-200 mt-2 font-medium">Total Gamify Profiles</span>
            </div>
          </FlipCardContent>} back={<FlipCardContent className="flex-1 flex flex-col items-center justify-center">
            <div
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
            >
              <span className="text-2xl font-bold text-[#ff3c00] mb-2">{gamifyProfiles.length ?? "-"} profiles</span>
              <span className="text-gray-200 text-center">Total number of gamification profiles.</span>
            </div>
          </FlipCardContent>} />
        </div>
        <div className="w-full h-48 relative">
          <FlipCard front={<FlipCardContent className="flex-1 flex flex-col items-center justify-center">
            <div
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
            >
              <span className="text-5xl font-extrabold text-white drop-shadow-xl">
                {badgesLoading ? <span className="animate-pulse">...</span> : badgesError ? "-" : badges.length}
              </span>
              <span className="text-base text-gray-200 mt-2 font-medium">Total Badges</span>
            </div>
          </FlipCardContent>} back={<FlipCardContent className="flex-1 flex flex-col items-center justify-center">
            <div
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
            >
              <span className="text-2xl font-bold text-[#ff3c00] mb-2">{badges.length ?? "-"} badges</span>
              <span className="text-gray-200 text-center">Total number of badges available.</span>
            </div>
          </FlipCardContent>} />
        </div>
        <div className="w-full h-48 relative">
          <FlipCard front={<FlipCardContent className="flex-1 flex flex-col items-center justify-center">
            <div
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
            >
              <span className="text-5xl font-extrabold text-white drop-shadow-xl">
                {rewardsLoading ? <span className="animate-pulse">...</span> : rewardsError ? "-" : rewards.length}
              </span>
              <span className="text-base text-gray-200 mt-2 font-medium">Total Rewards</span>
            </div>
          </FlipCardContent>} back={<FlipCardContent className="flex-1 flex flex-col items-center justify-center">
            <div
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
            >
              <span className="text-2xl font-bold text-[#ff3c00] mb-2">{rewards.length ?? "-"} rewards</span>
              <span className="text-gray-200 text-center">Total number of rewards available.</span>
            </div>
          </FlipCardContent>} />
        </div>
        {/* Optionally add a fourth card for another stat */}
      </div>
      <div className="w-full bg-gray-900 rounded-xl shadow-lg p-4 mt-8 overflow-x-auto">
        <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Search username or email..."
              className="px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
              value={search}
              onChange={e => { setSearch(e.target.value); }}
            />
          </div>
          <button
            className="ml-auto px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
            onClick={() => setShowCreate(v => !v)}
          >
            {showCreate ? 'Cancel' : 'Create Gamify Profile'}
          </button>
        </div>
        {showCreate && (
          <form
            className="bg-gray-800 rounded-lg p-6 mb-4 flex flex-col gap-4 max-w-xl ml-auto"
            onSubmit={handleCreate}
          >
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-300 font-semibold mb-1">User ID</label>
                <input
                  className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                  placeholder="User ID"
                  value={createForm.userId}
                  onChange={e => setCreateForm(f => ({ ...f, userId: e.target.value }))}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-300 font-semibold mb-1">Points</label>
                <input
                  className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                  placeholder="Points"
                  type="number"
                  value={createForm.points}
                  onChange={e => setCreateForm(f => ({ ...f, points: Number(e.target.value) }))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-300 font-semibold mb-1">Level</label>
                <input
                  className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                  placeholder="Level"
                  type="number"
                  value={createForm.level}
                  onChange={e => setCreateForm(f => ({ ...f, level: Number(e.target.value) }))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-300 font-semibold mb-1">Exp</label>
                <input
                  className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                  placeholder="Exp"
                  type="number"
                  value={createForm.exp}
                  onChange={e => setCreateForm(f => ({ ...f, exp: Number(e.target.value) }))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-300 font-semibold mb-1">Crystals</label>
                <input
                  className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                  placeholder="Crystals"
                  type="number"
                  value={createForm.crystals}
                  onChange={e => setCreateForm(f => ({ ...f, crystals: Number(e.target.value) }))}
                />
              </div>
            </div>
            <button
              className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
              type="submit"
              disabled={createLoading}
            >
              {createLoading ? "Creating..." : "Create"}
            </button>
            {createError && <div className="text-red-500">{createError}</div>}
          </form>
        )}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-800 text-gray-100">
                <th className="px-4 py-2 text-gray-100 font-semibold">Avatar</th>
                <th className="px-4 py-2 text-gray-100 font-semibold">Username</th>
                <th className="px-4 py-2 text-gray-100 font-semibold">Email</th>
                <th className="px-4 py-2 text-gray-100 font-semibold">Points</th>
                <th className="px-4 py-2 text-gray-100 font-semibold">Level</th>
                <th className="px-4 py-2 text-gray-100 font-semibold">Exp</th>
                <th className="px-4 py-2 text-gray-100 font-semibold">Crystals</th>
                <th className="px-4 py-2 text-gray-100 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
        {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-100">Loading...</td></tr>
              ) : paginatedProfiles.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-100">No profiles found.</td></tr>
              ) : paginatedProfiles.map((g) => [
                <tr key={g._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition text-gray-100">
                  <td className="px-4 py-2 text-gray-100">
                    {hasProfile(g.user) && g.user.profile.avatar ? (
                      <Image src={g.user.profile.avatar} alt="avatar" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span className="inline-block h-8 w-8 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold">
                        {getUserDisplay(g.user)[0]?.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-100 font-semibold">{
                     typeof g.user === 'object' && g.user !== null && 'username' in (g.user as object) && typeof (g.user as { username?: string }).username === 'string'
                       ? (g.user as { username: string }).username
                       : getUserDisplay(g.user)
                  }</td>
                  <td className="px-4 py-2 text-gray-100 font-semibold">{
                     typeof g.user === 'object' && g.user !== null && 'email' in (g.user as object) && typeof (g.user as { email?: string }).email === 'string'
                       ? (g.user as { email: string }).email
                       : <span className="text-gray-500">-</span>
                  }</td>
                  <td className="px-4 py-2 text-gray-100">{g.points}</td>
                  <td className="px-4 py-2 text-gray-100">{g.level}</td>
                  <td className="px-4 py-2 text-gray-100">{g.exp}</td>
                  <td className="px-4 py-2 text-gray-100">{g.crystals}</td>
                  <td className="px-4 py-2 flex gap-2 text-gray-100">
                    <button
                      className="px-2 py-1 rounded bg-gray-700 text-gray-100 hover:bg-gray-500 transition font-semibold"
                      onClick={() => setExpandedAction(expandedAction && expandedAction.id === g._id && expandedAction.type === 'points' ? null : { id: g._id, type: 'points' })}
                    >
                      Points
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-gray-700 text-gray-100 hover:bg-gray-500 transition font-semibold"
                      onClick={() => setExpandedAction(expandedAction && expandedAction.id === g._id && expandedAction.type === 'level' ? null : { id: g._id, type: 'level' })}
                    >
                      Level
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-gray-700 text-gray-100 hover:bg-gray-500 transition font-semibold"
                      onClick={() => setExpandedAction(expandedAction && expandedAction.id === g._id && expandedAction.type === 'exp' ? null : { id: g._id, type: 'exp' })}
                    >
                      Experience
                    </button>
                  </td>
                </tr>,
                expandedAction && expandedAction.id === g._id && (
                  <tr key={g._id + '-' + expandedAction.type + '-form'} className="text-gray-100">
                    <td colSpan={8} className="bg-gray-800/80 px-8 py-6 text-gray-100">
                      <form className="flex flex-col md:flex-row gap-4 items-center" onSubmit={e => { e.preventDefault(); handleActionSubmit(g._id, expandedAction.type); }}>
                        <div className="flex gap-2 items-center">
                          <label className="font-semibold mr-2">Amount:</label>
                          <input
                            type="number"
                            className="w-24 px-2 py-1 rounded bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none"
                            value={formValue}
                            min={1}
                            onChange={e => setFormValue(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="flex gap-4 items-center">
                          <label className="flex items-center gap-1">
                            <input type="radio" name="mode" value="add" checked={formMode === 'add'} onChange={() => setFormMode('add')} /> Add
                          </label>
                          <label className="flex items-center gap-1">
                            <input type="radio" name="mode" value="remove" checked={formMode === 'remove'} onChange={() => setFormMode('remove')} /> Remove
                          </label>
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
                          disabled={formLoading}
                        >
                          {formLoading ? 'Saving...' : 'Submit'}
                        </button>
                        {formError && <div className="text-red-400 ml-4">{formError}</div>}
                      </form>
                    </td>
                  </tr>
                )
              ])}
            </tbody>
          </table>
          {/* Pagination Controls - match user table style */}
          <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
            <div className="text-gray-400 text-sm">
              Showing {paginatedProfiles.length} of {totalProfiles} profiles
            </div>
            <div className="flex gap-2 items-center">
              <button
                className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Prev
              </button>
              <span className="text-gray-300">Page {currentPage} of {totalPages}</span>
              <button
                className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
            <select
              className="px-2 py-1 rounded bg-gray-800 text-gray-100 border border-gray-700"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BADGES & REWARDS MANAGEMENT SIDE BY SIDE FULL WIDTH */}
      <div className="w-full flex flex-col md:flex-row gap-8 mt-12 mb-8">
        {/* BADGES MANAGEMENT CARD */}
        <div className="flex-1 bg-gray-900 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-100">Badges Management</h3>
            <button
              className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
              onClick={() => { setShowBadgeForm(true); setEditingBadge(null); setBadgeForm({ name: '', description: '', icon: '' }); }}
            >
              Create Badge
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
              placeholder="Search badges..."
              value={badgeSearch}
              onChange={e => setBadgeSearch(e.target.value)}
            />
          </div>
          {badgesError && <div className="text-red-500 mb-2">{badgesError}</div>}
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-800 text-gray-100">
                <th className="px-4 py-2">Icon</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {badgesLoading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-100">Loading...</td></tr>
              ) : filteredBadges.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-100">No badges found.</td></tr>
              ) : filteredBadges.map((badge) => (
                <tr key={badge._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition text-gray-100">
                  <td className="px-4 py-2">
                    {badge.icon ? <img src={badge.icon} alt="icon" className="h-8 w-8 object-contain" /> : <span className="text-gray-500">-</span>}
                  </td>
                  <td className="px-4 py-2 font-semibold">{badge.name}</td>
                  <td className="px-4 py-2">{badge.description || <span className="text-gray-500">-</span>}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="px-2 py-1 rounded bg-gray-700 text-gray-100 hover:bg-gray-500 transition font-semibold"
                      onClick={() => { setShowBadgeForm(true); setEditingBadge(badge); setBadgeForm({ name: badge.name, description: badge.description, icon: badge.icon }); }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition font-semibold"
                      onClick={() => handleDeleteBadge(badge._id)}
                      disabled={badgeFormLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Badge Form Modal/Inline */}
          {showBadgeForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <form
                className="bg-gray-900 rounded-lg p-8 shadow-lg flex flex-col gap-4 min-w-[320px] max-w-md w-full"
                onSubmit={handleBadgeFormSubmit}
              >
                <h4 className="text-lg font-bold text-gray-100 mb-2">{editingBadge ? 'Edit Badge' : 'Create Badge'}</h4>
                <label className="text-gray-300 font-semibold">Name
                  <input
                    className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] mt-1"
                    value={badgeForm.name || ''}
                    onChange={e => setBadgeForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </label>
                <label className="text-gray-300 font-semibold">Description
                  <textarea
                    className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] mt-1"
                    value={badgeForm.description || ''}
                    onChange={e => setBadgeForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                  />
                </label>
                <label className="text-gray-300 font-semibold">Icon URL
          <input
                    className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] mt-1"
                    value={badgeForm.icon || ''}
                    onChange={e => setBadgeForm(f => ({ ...f, icon: e.target.value }))}
                  />
                </label>
                {badgeFormError && <div className="text-red-400 text-sm">{badgeFormError}</div>}
                <div className="flex gap-4 justify-end mt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-500 transition"
                    onClick={() => { setShowBadgeForm(false); setEditingBadge(null); setBadgeForm({ name: '', description: '', icon: '' }); }}
                    disabled={badgeFormLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
                    disabled={badgeFormLoading}
                  >
                    {badgeFormLoading ? (editingBadge ? 'Saving...' : 'Creating...') : (editingBadge ? 'Save' : 'Create')}
          </button>
                </div>
              </form>
            </div>
          )}
        </div>
        {/* REWARDS MANAGEMENT CARD */}
        <div className="flex-1 bg-gray-900 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-100">Rewards Management</h3>
            <button
              className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
              onClick={() => { setShowRewardForm(true); setEditingReward(null); setRewardForm({ name: '', description: '', icon: '' }); }}
            >
              Create Reward
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
              placeholder="Search rewards..."
              value={rewardSearch}
              onChange={e => setRewardSearch(e.target.value)}
            />
          </div>
          {rewardsError && <div className="text-red-500 mb-2">{rewardsError}</div>}
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-800 text-gray-100">
                <th className="px-4 py-2">Icon</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rewardsLoading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-100">Loading...</td></tr>
              ) : filteredRewards.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-100">No rewards found.</td></tr>
              ) : filteredRewards.map((reward) => (
                <tr key={reward._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition text-gray-100">
                  <td className="px-4 py-2">
                    {reward.icon ? <img src={reward.icon} alt="icon" className="h-8 w-8 object-contain" /> : <span className="text-gray-500">-</span>}
                  </td>
                  <td className="px-4 py-2 font-semibold">{reward.name}</td>
                  <td className="px-4 py-2">{reward.description || <span className="text-gray-500">-</span>}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="px-2 py-1 rounded bg-gray-700 text-gray-100 hover:bg-gray-500 transition font-semibold"
                      onClick={() => { setShowRewardForm(true); setEditingReward(reward); setRewardForm({ name: reward.name, description: reward.description, icon: reward.icon }); }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition font-semibold"
                      onClick={() => handleDeleteReward(reward._id)}
                      disabled={rewardFormLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Reward Form Modal/Inline */}
          {showRewardForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <form
                className="bg-gray-900 rounded-lg p-8 shadow-lg flex flex-col gap-4 min-w-[320px] max-w-md w-full"
                onSubmit={handleRewardFormSubmit}
              >
                <h4 className="text-lg font-bold text-gray-100 mb-2">{editingReward ? 'Edit Reward' : 'Create Reward'}</h4>
                <label className="text-gray-300 font-semibold">Name
                  <input
                    className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] mt-1"
                    value={rewardForm.name || ''}
                    onChange={e => setRewardForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </label>
                <label className="text-gray-300 font-semibold">Description
                  <textarea
                    className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] mt-1"
                    value={rewardForm.description || ''}
                    onChange={e => setRewardForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                  />
                </label>
                <label className="text-gray-300 font-semibold">Icon URL
                  <input
                    className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] mt-1"
                    value={rewardForm.icon || ''}
                    onChange={e => setRewardForm(f => ({ ...f, icon: e.target.value }))}
                  />
                </label>
                {rewardFormError && <div className="text-red-400 text-sm">{rewardFormError}</div>}
                <div className="flex gap-4 justify-end mt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-500 transition"
                    onClick={() => { setShowRewardForm(false); setEditingReward(null); setRewardForm({ name: '', description: '', icon: '' }); }}
                    disabled={rewardFormLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
                    disabled={rewardFormLoading}
                  >
                    {rewardFormLoading ? (editingReward ? 'Saving...' : 'Creating...') : (editingReward ? 'Save' : 'Create')}
                  </button>
                </div>
              </form>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamificationManagementPage; 