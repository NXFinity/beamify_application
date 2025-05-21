"use client";
import React, { useEffect, useState } from "react";
import { AdminService } from "@/core/api/admin/admin.service";
import {
  FlipCard,
} from "@/theme/ui/flipcards";
import { User, BanType, UserBan } from "@/core/api/admin/types/admin.interface";
import Image from "next/image";
import { format } from "date-fns";

function getStatus(user: User & { status?: { isBanned?: boolean; isActive?: boolean }; timeoutUntil?: string }): string {
  if (user.status?.isBanned) return "Banned";
  if (user.status?.isActive === false) return "Suspended";
  if (user.timeoutUntil && new Date(user.timeoutUntil) > new Date()) return "Timed Out";
  return "Active";
}

function BanListItem({ ban, userId, refreshUsers }: { ban: UserBan; userId: string; refreshUsers: () => Promise<void> }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isInactive = ban.status === 'inactive';
  return (
    <li className={`bg-gray-900 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 border border-gray-700 ${isInactive ? 'opacity-60' : ''}`}>
      <span className={`font-semibold ${isInactive ? 'text-gray-400' : 'text-orange-400'}`}>{ban.type.replace("BAN", " Ban")}</span>
      {ban.reason && <span className="text-gray-300">Reason: {ban.reason}</span>}
      {ban.expiresAt && <span className="text-gray-400">Expires: {format(new Date(ban.expiresAt), "yyyy-MM-dd HH:mm")}</span>}
      <span className="text-xs text-gray-500 ml-auto">Issued: {format(new Date(ban.createdAt), "yyyy-MM-dd HH:mm")}</span>
      <button
        className={`ml-4 px-2 py-1 rounded bg-gray-700 text-gray-200 text-xs font-semibold ${isInactive ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600 transition'}`}
        onClick={async () => {
          if (isInactive) return;
          setLoading(true);
          setError(null);
          try {
            await AdminService.unbanUser(userId, { type: ban.type, targetId: ban.targetId });
            await refreshUsers();
          } catch (err) {
            setError((err as Error)?.message || "Failed to unban");
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading || isInactive}
      >
        {isInactive ? "Unbanned" : loading ? "Unbanning..." : "Unban"}
      </button>
      {error && <span className="text-red-400 text-xs ml-2">{error}</span>}
    </li>
  );
}

function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedMode, setExpandedMode] = useState<"view" | "edit" | "access" | null>(null);
  const [editForm, setEditForm] = useState<Partial<User> | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [banFormUserId, setBanFormUserId] = useState<string | null>(null);
  const [banType, setBanType] = useState<BanType>("SITEBAN");
  const [banReason, setBanReason] = useState("");
  const [banExpiresAt, setBanExpiresAt] = useState<string>("");
  const [banLoading, setBanLoading] = useState(false);
  const [banError, setBanError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ [userId: string]: string | null }>({});
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({ email: '', username: '', password: '', roles: '', isVerified: false });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    AdminService.getAllUsers({ page, limit: pageSize, search, role, status })
      .then((res) => {
        setUsers(Array.isArray(res.users) ? res.users : []);
        setTotal(res.total);
        setPage(res.page);
        setPageSize(res.pageSize);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error)?.message || "Failed to load users");
        setUsers([]);
        setLoading(false);
      });
  }, [page, pageSize, search, role, status]);

  const totalPages = Math.ceil(total / pageSize);

  const handleExpand = (userId: string, mode: "view" | "edit" | "access") => {
    if (expandedUserId === userId && expandedMode === mode) {
      setExpandedUserId(null);
      setExpandedMode(null);
      setEditForm(null);
      setEditError(null);
    } else {
      setExpandedUserId(userId);
      setExpandedMode(mode);
      setEditError(null);
      if (mode === "edit") {
        const user = users.find(u => u._id === userId);
        setEditForm(user ? { ...user } : null);
      } else {
        setEditForm(null);
      }
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editForm) return;
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditSave = async () => {
    if (!editForm || !expandedUserId) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await AdminService.updateUser(expandedUserId, editForm);
      // Refresh users
      const res = await AdminService.getAllUsers({ page, limit: pageSize, search, role, status });
      setUsers(Array.isArray(res.users) ? res.users : []);
      setExpandedMode("view");
      setEditForm(null);
    } catch (err) {
      setEditError((err as Error)?.message || "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setExpandedMode("view");
    setEditForm(null);
    setEditError(null);
  };

  return (
    <div className="w-full bg-gray-900 rounded-xl shadow-lg p-4 mt-8 overflow-x-auto">
      <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search username or email..."
            className="px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700"
            value={role}
            onChange={e => { setRole(e.target.value); setPage(1); }}
          >
            <option value="">All Roles</option>
            <option value="SYSTEM_ADMINISTRATOR">System Admin</option>
            <option value="MEMBER">Member</option>
            {/* Add more roles as needed */}
          </select>
          <select
            className="px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="timedout">Timed Out</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <button
          className="ml-auto px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
          onClick={() => setShowCreateUser(v => !v)}
        >
          {showCreateUser ? 'Cancel' : 'Create User'}
        </button>
      </div>
      {showCreateUser && (
        <form
          className="bg-gray-800 rounded-lg p-6 mb-4 flex flex-col gap-4 max-w-xl ml-auto"
          onSubmit={async e => {
            e.preventDefault();
            setCreateUserLoading(true);
            setCreateUserError(null);
            try {
              await AdminService.createUser({
                email: createUserForm.email,
                username: createUserForm.username,
                password: createUserForm.password,
                roles: createUserForm.roles ? createUserForm.roles.split(',').map(r => r.trim()) : undefined,
                isVerified: createUserForm.isVerified,
              });
              setShowCreateUser(false);
              setCreateUserForm({ email: '', username: '', password: '', roles: '', isVerified: false });
              // Refresh users
              const res = await AdminService.getAllUsers({ page, limit: pageSize, search, role, status });
              setUsers(Array.isArray(res.users) ? res.users : []);
            } catch (err) {
              setCreateUserError((err as Error)?.message || 'Failed to create user');
            } finally {
              setCreateUserLoading(false);
            }
          }}
        >
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                value={createUserForm.email}
                onChange={e => setCreateUserForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-300 font-semibold mb-1">Username</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                value={createUserForm.username}
                onChange={e => setCreateUserForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-300 font-semibold mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                value={createUserForm.password}
                onChange={e => setCreateUserForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-300 font-semibold mb-1">Roles (comma separated)</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                value={createUserForm.roles}
                onChange={e => setCreateUserForm(f => ({ ...f, roles: e.target.value }))}
                placeholder="MEMBER, SYSTEM_ADMINISTRATOR"
              />
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <label className="text-gray-300 font-semibold">Verified?</label>
            <input
              type="checkbox"
              checked={createUserForm.isVerified}
              onChange={e => setCreateUserForm(f => ({ ...f, isVerified: e.target.checked }))}
            />
          </div>
          {createUserError && <div className="text-red-400 text-sm">{createUserError}</div>}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-500 transition"
              onClick={() => setShowCreateUser(false)}
              disabled={createUserLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
              disabled={createUserLoading}
            >
              {createUserLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-800 text-gray-300">
              <th className="px-4 py-2">Avatar</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Roles</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={6} className="text-center text-red-400 py-8">{error}</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8">No users found.</td></tr>
            ) : users.map(user => [
              <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                <td className="px-4 py-2">
                  {user.profile?.avatar ? (
                    <Image src={user.profile.avatar} alt="avatar" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="inline-block h-8 w-8 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold">
                      {user.username[0].toUpperCase()}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 font-semibold">{user.username}</td>
                <td className="px-4 py-2">{user.email || <span className="text-gray-500">-</span>}</td>
                <td className="px-4 py-2">{user.roles?.join(", ") || <span className="text-gray-500">-</span>}</td>
                <td className="px-4 py-2">
                  <span className={
                    getStatus(user) === "Active" ? "text-green-400" :
                    getStatus(user) === "Banned" ? "text-red-400" :
                    getStatus(user) === "Timed Out" ? "text-yellow-400" :
                    getStatus(user) === "Suspended" ? "text-gray-400" : ""
                  }>
                    {getStatus(user)}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className="px-2 py-1 rounded bg-gray-700 text-gray-200 hover:bg-[#ff3c00] transition"
                    onClick={() => handleExpand(user._id, "view")}
                  >
                    {expandedUserId === user._id && expandedMode === "view" ? "Hide" : "View"}
                  </button>
                  <button
                    className={`px-2 py-1 rounded bg-gray-700 text-gray-200 transition ${user.roles?.includes("SYSTEM_ADMINISTRATOR") ? "opacity-50 cursor-not-allowed" : "hover:bg-[#ff3c00]"}`}
                    onClick={() => handleExpand(user._id, "edit")}
                    disabled={user.roles?.includes("SYSTEM_ADMINISTRATOR")}
                    title={user.roles?.includes("SYSTEM_ADMINISTRATOR") ? "Cannot edit a System Administrator account" : undefined}
                  >
                    {expandedUserId === user._id && expandedMode === "edit" ? "Cancel" : "Edit"}
                  </button>
                  <button
                    className={`px-2 py-1 rounded bg-gray-700 text-gray-200 transition hover:bg-blue-600`}
                    onClick={() => handleExpand(user._id, "access")}
                  >
                    {expandedUserId === user._id && expandedMode === "access" ? "Cancel" : "Access"}
                  </button>
                  <button
                    className={`px-2 py-1 rounded bg-gray-700 text-gray-200 transition ${user.roles?.includes("SYSTEM_ADMINISTRATOR") ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"}`}
                    disabled={user.roles?.includes("SYSTEM_ADMINISTRATOR")}
                    title={user.roles?.includes("SYSTEM_ADMINISTRATOR") ? "Cannot ban a System Administrator account" : undefined}
                    onClick={() => setBanFormUserId(banFormUserId === user._id ? null : user._id)}
                  >
                    Ban
                  </button>
                  <button
                    className={`px-2 py-1 rounded bg-gray-700 text-gray-200 transition ${user.roles?.includes("SYSTEM_ADMINISTRATOR") ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-500"}`}
                    disabled={user.roles?.includes("SYSTEM_ADMINISTRATOR") || deletingUserId === user._id}
                    title={user.roles?.includes("SYSTEM_ADMINISTRATOR") ? "Cannot delete a System Administrator account" : undefined}
                    onClick={() => {
                      if (user.roles?.includes("SYSTEM_ADMINISTRATOR")) return;
                      setConfirmDeleteUserId(user._id);
                    }}
                  >
                    {deletingUserId === user._id ? "Deleting..." : "Delete"}
                  </button>
                  {confirmDeleteUserId === user._id && (
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="text-yellow-300 text-xs font-semibold">Are you sure you want to delete user @{user.username}? This cannot be undone.</div>
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 rounded bg-red-700 text-white font-bold hover:bg-red-800 transition"
                          onClick={async () => {
                            setDeletingUserId(user._id);
                            setDeleteError(prev => ({ ...prev, [user._id]: null }));
                            try {
                              await AdminService.deleteUser(user._id);
                              setUsers(users => users.filter(u => u._id !== user._id));
                              setConfirmDeleteUserId(null);
                            } catch (err) {
                              setDeleteError(prev => ({ ...prev, [user._id]: (err as Error)?.message || "Failed to delete user" }));
                            } finally {
                              setDeletingUserId(null);
                            }
                          }}
                          disabled={deletingUserId === user._id}
                        >
                          Confirm Delete
                        </button>
                        <button
                          className="px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700 transition"
                          onClick={() => setConfirmDeleteUserId(null)}
                          disabled={deletingUserId === user._id}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {deleteError[user._id] && (
                    <div className="text-red-400 text-xs mt-1">{deleteError[user._id]}</div>
                  )}
                </td>
              </tr>,
              expandedUserId === user._id && (
                <tr key={user._id + "-expanded"}>
                  <td colSpan={6} className="bg-gray-800/80 px-8 py-6">
                    {expandedMode === "view" ? (
                      <div className="w-full bg-gray-900 rounded-2xl shadow-xl p-8 flex flex-col md:flex-row gap-10 items-center md:items-start border border-gray-800">
                        {/* Avatar and main info */}
                        <div className="flex flex-col items-center gap-4 min-w-[140px]">
                          {user.profile?.avatar ? (
                            <Image src={user.profile.avatar} alt="avatar" width={80} height={80} className="h-20 w-20 rounded-full object-cover border-4 border-[#ff3c00] shadow-lg" />
                          ) : (
                            <span className="inline-block h-20 w-20 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-extrabold text-3xl border-4 border-[#ff3c00] shadow-lg">
                              {user.username[0].toUpperCase()}
                            </span>
                          )}
                          <div className="text-2xl font-extrabold text-gray-100 mt-2">@{user.username}</div>
                          <div className="text-xs text-gray-400 font-mono">ID: {user._id}</div>
                          </div>
                        {/* Details */}
                        <div className="flex-1 flex flex-col gap-6 w-full">
                          {/* Profile Section */}
                          <div>
                            <div className="text-lg font-bold text-[#ff3c00] mb-1 flex items-center gap-2">
                              <svg className="w-5 h-5 text-[#ff3c00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              Profile
                            </div>
                            <div className="flex flex-wrap gap-3 items-center mt-1">
                              <span className="text-xl font-semibold text-gray-200">{user.profile?.displayName || <span className='italic text-gray-500'>No display name</span>}</span>
                            </div>
                          </div>
                          {/* Contact & Status Section */}
                          <div className="flex flex-wrap gap-3 items-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-800 text-gray-200 border border-gray-700 text-sm">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4" /></svg>
                              {user.email || <span className='italic text-gray-500'>No email</span>}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-semibold ${getStatus(user)==='Active' ? 'bg-green-900/60 border-green-500 text-green-300' : getStatus(user)==='Banned' ? 'bg-red-900/60 border-red-500 text-red-300' : getStatus(user)==='Timed Out' ? 'bg-yellow-900/60 border-yellow-500 text-yellow-300' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /></svg>
                              {getStatus(user)}
                            </span>
                            {user.roles?.length ? user.roles.map(r => (
                              <span key={r} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ff3c00]/10 border border-[#ff3c00] text-[#ff3c00] text-xs font-bold uppercase tracking-wide">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 01.894.553l1.382 2.8 3.09.45a1 1 0 01.554 1.706l-2.236 2.18.528 3.08a1 1 0 01-1.451 1.054L10 12.347l-2.761 1.453a1 1 0 01-1.451-1.054l.528-3.08-2.236-2.18a1 1 0 01.554-1.706l3.09-.45L9.106 2.553A1 1 0 0110 2z" /></svg>
                                {r}
                              </span>
                            )) : <span className='italic text-gray-500'>No roles</span>}
                          </div>
                          {/* Bio Section */}
                          <div>
                            <div className="text-md font-bold text-gray-400 mb-1 flex items-center gap-2">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8a9 9 0 1118 0z" /></svg>
                              Bio
                            </div>
                            <blockquote className="bg-gray-800 border-l-4 border-[#ff3c00] text-gray-200 italic px-4 py-2 rounded-lg max-w-2xl">
                              {user.profile?.bio ? user.profile.bio : <span className='italic text-gray-500'>No bio provided.</span>}
                            </blockquote>
                          </div>
                          {/* Active Bans Section */}
                          <div>
                            <div className="text-md font-bold text-gray-400 mb-1 flex items-center gap-2">
                              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414 1.414M6.343 17.657l-1.414-1.414M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.343 6.343L5.636 5.636" /></svg>
                              Active Bans
                            </div>
                            {user.bans && user.bans.filter(b => b.status === 'active').length > 0 ? (
                              <ul className="space-y-2 mt-2">
                                {user.bans.filter(b => b.status === 'active').map((ban, idx) => (
                                  <li key={idx} className="bg-red-900/60 border border-red-500 rounded-lg px-4 py-2 text-red-200 flex flex-col md:flex-row md:items-center gap-2">
                                    <span className="font-bold">{ban.type.replace('BAN', ' Ban')}</span>
                                    {ban.reason && <span className="ml-2 text-gray-100">Reason: {ban.reason}</span>}
                                    {ban.expiresAt && <span className="ml-2 text-gray-300">Expires: {format(new Date(ban.expiresAt), 'yyyy-MM-dd HH:mm')}</span>}
                                  </li>
                                ))}
                              </ul>
                            ) : <span className="italic text-gray-500">No active bans.</span>}
                          </div>
                        </div>
                      </div>
                    ) : expandedMode === "edit" ? (
                      <form className="flex flex-row flex-wrap gap-4 items-center max-w-full justify-end" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                        <div className="flex flex-col min-w-[120px]">
                            <label className="block text-gray-300 font-semibold mb-1">Username</label>
                            <input
                              type="text"
                              name="username"
                              className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                              value={editForm?.username || ""}
                              onChange={handleEditChange}
                              required
                            />
                          </div>
                        <div className="flex flex-col min-w-[180px]">
                            <label className="block text-gray-300 font-semibold mb-1">Email</label>
                            <input
                              type="email"
                              name="email"
                              className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                              value={editForm?.email || ""}
                              onChange={handleEditChange}
                              required
                            />
                          </div>
                        <div className="flex flex-col min-w-[140px]">
                          <label className="block text-gray-300 font-semibold mb-1">Display Name</label>
                          <input
                            type="text"
                            name="displayName"
                            className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                            value={editForm?.profile?.displayName || ""}
                            onChange={e => setEditForm(f => ({
                              ...f,
                              profile: { ...f?.profile, displayName: e.target.value }
                            }))}
                            maxLength={32}
                          />
                        </div>
                        <div className="flex flex-col min-w-[220px] max-w-[320px] flex-1">
                          <label className="block text-gray-300 font-semibold mb-1">Bio</label>
                          <input
                            type="text"
                            name="bio"
                            className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                            value={editForm?.profile?.bio || ""}
                            onChange={e => setEditForm(f => ({
                              ...f,
                              profile: { ...f?.profile, bio: e.target.value }
                            }))}
                            maxLength={256}
                          />
                        </div>
                        <div className="flex flex-col min-w-[120px]">
                            <label className="block text-gray-300 font-semibold mb-1">Roles</label>
                            <input
                              type="text"
                              name="roles"
                              className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                              value={Array.isArray(editForm?.roles) ? editForm?.roles.join(", ") : editForm?.roles || ""}
                            onChange={e => setEditForm(f => ({ ...f, roles: e.target.value.split(",").map(r => r.trim()) }))}
                            />
                          </div>
                        <div className="flex flex-col min-w-[120px]">
                            <label className="block text-gray-300 font-semibold mb-1">Status</label>
                            <select
                              name="status"
                              className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                              value={getStatus(user as User)}
                              onChange={() => {
                                // TODO: Map status string to user fields (isBanned, isActive, timeoutUntil, etc.)
                                // For now, do nothing to avoid linter error
                              }}
                            >
                              <option value="Active">Active</option>
                              <option value="Banned">Banned</option>
                              <option value="Timed Out">Timed Out</option>
                              <option value="Suspended">Suspended</option>
                            </select>
                          </div>
                        {editError && <div className="text-red-400 text-sm ml-2">{editError}</div>}
                        <div className="flex gap-2 ml-auto">
                          <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-500 transition"
                            onClick={handleEditCancel}
                            disabled={editLoading}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
                            disabled={editLoading}
                          >
                            {editLoading ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </form>
                    ) : expandedMode === "access" ? (
                      <div className="w-full bg-gray-900 rounded-2xl shadow-xl p-8 flex flex-col gap-6 border border-blue-800">
                        <div className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2zm-6 8v-1a4 4 0 014-4h4a4 4 0 014 4v1" /></svg>
                          Manage Access (Roles & Permissions)
                        </div>
                        <div className="flex flex-col gap-4">
                          <div>
                            <div className="font-semibold text-gray-200 mb-1">Roles</div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {user.roles?.length ? user.roles.map(r => (
                                <span key={r} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-400 text-blue-200 text-xs font-bold uppercase tracking-wide">
                                  {r}
                                  <button
                                    className="ml-1 text-blue-300 hover:text-red-400 focus:outline-none"
                                    title="Remove role"
                                    onClick={e => {
                                      e.stopPropagation();
                                      // Remove role logic (to be implemented)
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              )) : <span className='italic text-gray-500'>No roles</span>}
                            </div>
                            <input
                              type="text"
                              className="w-full max-w-xs px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Add role (comma separated)"
                              // onChange logic to be implemented
                            />
                            <button className="ml-2 px-3 py-1 rounded bg-blue-700 text-white font-semibold hover:bg-blue-500 transition" disabled>
                              Add Role
                            </button>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-200 mb-1">Permissions</div>
                            <div className="italic text-gray-500">(Permissions management coming soon...)</div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ),
              banFormUserId === user._id && (
                <tr key={user._id + "-banform"}>
                  <td colSpan={6} className="bg-gray-900 border-b border-gray-800">
                    <form
                      className="p-6 flex flex-row items-center gap-4 max-w-full justify-end"
                      onSubmit={async e => {
                        e.preventDefault();
                        setBanLoading(true);
                        setBanError(null);
                        try {
                          await AdminService.banUser(user._id, {
                            type: banType,
                            issuerType: "ADMIN",
                            reason: banReason,
                            expiresAt: banType === "TIMEBAN" && banExpiresAt ? new Date(banExpiresAt).toISOString() : undefined,
                          });
                          setBanType("SITEBAN");
                          setBanReason("");
                          setBanExpiresAt("");
                          setBanFormUserId(null);
                          // Refresh users
                          const res = await AdminService.getAllUsers({ page, limit: pageSize, search, role, status });
                          setUsers(Array.isArray(res.users) ? res.users : []);
                        } catch (err) {
                          setBanError((err as Error)?.message || "Failed to ban user");
                        } finally {
                          setBanLoading(false);
                        }
                      }}
                    >
                      <span className="font-semibold text-gray-200 whitespace-nowrap">Ban this user</span>
                      <select
                        className="min-w-[90px] w-auto px-2 py-1 rounded-md bg-gray-800 text-gray-100 border border-gray-700"
                        value={banType}
                        onChange={e => setBanType(e.target.value as BanType)}
                      >
                        <option value="SITEBAN">Site Ban</option>
                        <option value="TIMEBAN">Time Ban</option>
                        <option value="CHATBAN">Chat Ban</option>
                      </select>
                      {banType === "TIMEBAN" && (
                          <input
                            type="datetime-local"
                          className="flex-1 min-w-[180px] px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700"
                            value={banExpiresAt}
                            onChange={e => setBanExpiresAt(e.target.value)}
                          style={{ maxWidth: 220 }}
                          />
                      )}
                      <input
                        className="flex-1 min-w-[240px] max-w-[400px] px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700"
                        value={banReason}
                        onChange={e => setBanReason(e.target.value)}
                        placeholder="Enter reason (optional)"
                      />
                        <button
                          type="button"
                        className="px-3 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-500 transition whitespace-nowrap"
                          onClick={() => setBanFormUserId(null)}
                          disabled={banLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                        className="px-3 py-1 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition whitespace-nowrap"
                          disabled={banLoading}
                        >
                          {banLoading ? "Banning..." : "Ban"}
                        </button>
                    </form>
                    {banError && <div className="text-red-400 text-sm mb-1 mt-2">{banError}</div>}
                    {/* Bans lists go here */}
                    {user.bans && (
                      <div className="pt-8">
                        <div className="mt-6 w-full">
                          <div className="text-lg font-bold text-[#ff3c00] mb-2">Active Bans</div>
                          {user.bans.filter(b => b.status === 'active').length > 0 ? (
                            <ul className="space-y-2">
                              {user.bans.filter(b => b.status === 'active').map((ban, idx) => (
                                <BanListItem key={idx} ban={ban} userId={user._id} refreshUsers={async () => {
                                  const res = await AdminService.getAllUsers({ page, limit: pageSize, search, role, status });
                                  setUsers(Array.isArray(res.users) ? res.users : []);
                                }} />
                              ))}
                            </ul>
                          ) : (
                            <div className="text-gray-400 italic">No active bans.</div>
                          )}
                        </div>
                        <div className="mt-6 w-full">
                          <div className="text-lg font-bold text-gray-400 mb-2">Expired Bans</div>
                          {user.bans.filter(b => b.status === 'inactive').length > 0 ? (
                            <ul className="space-y-2">
                              {user.bans.filter(b => b.status === 'inactive').map((ban, idx) => (
                                <BanListItem key={idx} ban={ban} userId={user._id} refreshUsers={async () => {
                                  const res = await AdminService.getAllUsers({ page, limit: pageSize, search, role, status });
                                  setUsers(Array.isArray(res.users) ? res.users : []);
                                }} />
                              ))}
                            </ul>
                          ) : (
                            <div className="text-gray-500 italic">No expired bans.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )
            ])}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
        <div className="text-gray-400 text-sm">
          Showing {(users?.length ?? 0)} of {total} users
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className="text-gray-300">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
        <select
          className="px-2 py-1 rounded bg-gray-800 text-gray-100 border border-gray-700"
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
        >
          {[10, 20, 50, 100].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifiedCount, setVerifiedCount] = useState<number | null>(null);
  const [verifiedLoading, setVerifiedLoading] = useState(true);
  const [verifiedError, setVerifiedError] = useState<string | null>(null);
  const [bannedCount, setBannedCount] = useState<number | null>(null);
  const [bannedLoading, setBannedLoading] = useState(true);
  const [bannedError, setBannedError] = useState<string | null>(null);
  const [timedOutCount, setTimedOutCount] = useState<number | null>(null);
  const [timedOutLoading, setTimedOutLoading] = useState(true);
  const [timedOutError, setTimedOutError] = useState<string | null>(null);

  useEffect(() => {
    AdminService.getUserCount()
      .then((count) => {
        setUserCount(count);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error)?.message || "Failed to load user count");
        setLoading(false);
      });
    AdminService.getVerifiedUserCount()
      .then((count) => {
        setVerifiedCount(count);
        setVerifiedLoading(false);
      })
      .catch((err) => {
        setVerifiedError((err as Error)?.message || "Failed to load verified user count");
        setVerifiedLoading(false);
      });
    AdminService.getBannedUserCount()
      .then((count) => {
        setBannedCount(count);
        setBannedLoading(false);
      })
      .catch((err) => {
        setBannedError((err as Error)?.message || "Failed to load banned user count");
        setBannedLoading(false);
      });
    AdminService.getTimedOutUserCount()
      .then((count) => {
        setTimedOutCount(count);
        setTimedOutLoading(false);
      })
      .catch((err) => {
        setTimedOutError((err as Error)?.message || "Failed to load timed out user count");
        setTimedOutLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full mb-12">
        <div className="w-full h-48 relative">
          <FlipCard front={<div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-5xl font-extrabold text-white drop-shadow-xl">
                    {loading ? <span className="animate-pulse">...</span> : error ? "-" : userCount}
                  </span>
                  <span className="text-base text-gray-200 mt-2 font-medium">Total registered users</span>
                </div>
          </div>} back={<div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
              <span className="text-2xl font-bold text-[#ff3c00] mb-2">{userCount ?? "-"}</span>
                  <span className="text-gray-200 text-center">This is the total number of users registered on the platform.</span>
                </div>
          </div>} />
        </div>
        <div className="w-full h-48 relative">
          <FlipCard front={<div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-5xl font-extrabold text-white drop-shadow-xl">
                    {verifiedLoading ? <span className="animate-pulse">...</span> : verifiedError ? "-" : verifiedCount}
                  </span>
                  <span className="text-base text-gray-200 mt-2 font-medium">Verified users</span>
                </div>
          </div>} back={<div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
              <span className="text-2xl font-bold text-[#ff3c00] mb-2">{verifiedCount ?? "-"}</span>
                  <span className="text-gray-200 text-center">This is the number of users who have verified their email.</span>
                </div>
          </div>} />
        </div>
        <div className="w-full h-48 relative">
          <FlipCard front={<div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-5xl font-extrabold text-white drop-shadow-xl">
                    {bannedLoading ? <span className="animate-pulse">...</span> : bannedError ? "-" : bannedCount}
                  </span>
                  <span className="text-base text-gray-200 mt-2 font-medium">Banned users</span>
                </div>
          </div>} back={<div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-2xl font-bold text-[#ff3c00] mb-2">{bannedCount ?? "-"} users</span>
                  <span className="text-gray-200 text-center">This is the number of users who are currently banned.</span>
                </div>
          </div>} />
        </div>
        <div className="w-full h-48 relative">
          <FlipCard front={<div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-5xl font-extrabold text-white drop-shadow-xl">
                    {timedOutLoading ? <span className="animate-pulse">...</span> : timedOutError ? "-" : timedOutCount}
                  </span>
                  <span className="text-base text-gray-200 mt-2 font-medium">Timed out users</span>
                </div>
          </div>} back={<div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span className="text-2xl font-bold text-[#ff3c00] mb-2">{timedOutCount ?? "-"} users</span>
                  <span className="text-gray-200 text-center">This is the number of users who are currently timed out.</span>
                </div>
          </div>} />
        </div>
      </div>
      <UserTable />
    </div>
  );
}
