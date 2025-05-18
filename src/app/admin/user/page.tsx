"use client";
import React, { useEffect, useState } from "react";
import { AdminService } from "@/core/api/admin/admin.service";
import {
  FlipCard,
  FlipCardFront,
  FlipCardBack,
  FlipCardContent,
} from "@/theme/ui/flipcards";
import { User, BanType, UserBan } from "@/core/api/admin/types/admin.interface";
import { format } from "date-fns";
import Image from "next/image";

function getStatus(user: User & { status?: { isBanned?: boolean; isActive?: boolean }; timeoutUntil?: string }): string {
  if (user.status?.isBanned) return "Banned";
  if (user.status?.isActive === false) return "Suspended";
  if (user.timeoutUntil && new Date(user.timeoutUntil) > new Date()) return "Timed Out";
  return "Active";
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
  const [expandedMode, setExpandedMode] = useState<"view" | "edit" | null>(null);
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

  const handleExpand = (userId: string, mode: "view" | "edit") => {
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
                    className={`px-2 py-1 rounded bg-gray-700 text-gray-200 transition ${user.roles?.includes("SYSTEM_ADMINISTRATOR") ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"}`}
                    disabled={user.roles?.includes("SYSTEM_ADMINISTRATOR")}
                    title={user.roles?.includes("SYSTEM_ADMINISTRATOR") ? "Cannot ban a System Administrator account" : undefined}
                    onClick={() => setBanFormUserId(banFormUserId === user._id ? null : user._id)}
                  >
                    Ban
                  </button>
                  <button
                    className={`px-2 py-1 rounded bg-gray-700 text-gray-200 transition ${user.roles?.includes("SYSTEM_ADMINISTRATOR") ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-500"}`}
                    disabled={user.roles?.includes("SYSTEM_ADMINISTRATOR")}
                    title={user.roles?.includes("SYSTEM_ADMINISTRATOR") ? "Cannot timeout a System Administrator account" : undefined}
                  >
                    Timeout
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
                      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        {/* ...profile summary... */}
                        <div className="flex flex-col items-center md:items-start gap-4 w-full">
                          {/* ...profile details... */}
                          {/* Bans List */}
                          <div className="mt-6 w-full">
                            <div className="text-lg font-bold text-[#ff3c00] mb-2">Active Bans</div>
                            {user.bans && user.bans.filter(b => b.status === 'active').length > 0 ? (
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
                            {user.bans && user.bans.filter(b => b.status === 'inactive').length > 0 ? (
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
                      </div>
                    ) : (
                      <form className="flex flex-col gap-6 max-w-2xl mx-auto" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1">
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
                          <div className="flex-1">
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
                        </div>
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1">
                            <label className="block text-gray-300 font-semibold mb-1">Roles</label>
                            <input
                              type="text"
                              name="roles"
                              className="w-full px-3 py-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00]"
                              value={Array.isArray(editForm?.roles) ? editForm?.roles.join(", ") : editForm?.roles || ""}
                              onChange={e => setEditForm({ ...editForm, roles: e.target.value.split(",").map(r => r.trim()) })}
                            />
                          </div>
                          <div className="flex-1">
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
                        </div>
                        {editError && <div className="text-red-400 text-sm">{editError}</div>}
                        <div className="flex gap-4 justify-end">
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
                    )}
                  </td>
                </tr>
              ),
              banFormUserId === user._id && (
                <tr key={user._id + "-banform"}>
                  <td colSpan={6} className="bg-gray-900 border-b border-gray-800">
                    <form
                      className="p-6 flex flex-col gap-4 max-w-xl mx-auto"
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
                      <div className="font-semibold text-gray-200 mb-1">Ban this user</div>
                      <label className="block text-gray-300 font-semibold mb-1">Ban Type</label>
                      <select
                        className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 mb-1"
                        value={banType}
                        onChange={e => setBanType(e.target.value as BanType)}
                      >
                        <option value="SITEBAN">Site Ban</option>
                        <option value="TIMEBAN">Time Ban</option>
                        <option value="CHATBAN">Chat Ban</option>
                      </select>
                      {banType === "TIMEBAN" && (
                        <>
                          <label className="block text-gray-300 font-semibold mb-1">Ban Expiry (date & time)</label>
                          <input
                            type="datetime-local"
                            className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 mb-1"
                            value={banExpiresAt}
                            onChange={e => setBanExpiresAt(e.target.value)}
                          />
                        </>
                      )}
                      <label className="block text-gray-300 font-semibold mb-1">Reason</label>
                      <input
                        className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 mb-1"
                        value={banReason}
                        onChange={e => setBanReason(e.target.value)}
                        placeholder="Enter reason (optional)"
                      />
                      {banError && <div className="text-red-400 text-sm mb-1">{banError}</div>}
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          className="px-3 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-500 transition"
                          onClick={() => setBanFormUserId(null)}
                          disabled={banLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
                          disabled={banLoading}
                        >
                          {banLoading ? "Banning..." : "Ban"}
                        </button>
                      </div>
                    </form>
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

export default function UserManagementPage() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedRegistered, setFlippedRegistered] = useState(false);
  const [flippedVerified, setFlippedVerified] = useState(false);
  const [verifiedCount, setVerifiedCount] = useState<number | null>(null);
  const [verifiedLoading, setVerifiedLoading] = useState(true);
  const [verifiedError, setVerifiedError] = useState<string | null>(null);
  const [flippedBanned, setFlippedBanned] = useState(false);
  const [bannedCount, setBannedCount] = useState<number | null>(null);
  const [bannedLoading, setBannedLoading] = useState(true);
  const [bannedError, setBannedError] = useState<string | null>(null);
  const [flippedTimedOut, setFlippedTimedOut] = useState(false);
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
          <FlipCard flipped={flippedRegistered} onFlip={setFlippedRegistered} className="w-full h-full">
            <FlipCardFront>
              <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                  onClick={() => setFlippedRegistered(true)}
                >
                  <span className="text-5xl font-extrabold text-white drop-shadow-xl">
                    {loading ? <span className="animate-pulse">...</span> : error ? "-" : userCount}
                  </span>
                  <span className="text-base text-gray-200 mt-2 font-medium">Total registered users</span>
                </div>
              </FlipCardContent>
            </FlipCardFront>
            <FlipCardBack>
              <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                  onClick={() => setFlippedRegistered(false)}
                >
                  <span className="text-2xl font-bold text-[#ff3c00] mb-2">{userCount ?? "-"} users</span>
                  <span className="text-gray-200 text-center">This is the total number of users registered on the platform.</span>
                </div>
              </FlipCardContent>
            </FlipCardBack>
          </FlipCard>
        </div>
        <div className="w-full h-48 relative">
          <FlipCard flipped={flippedVerified} onFlip={setFlippedVerified} className="w-full h-full">
            <FlipCardFront>
              <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                  onClick={() => setFlippedVerified(true)}
                >
                  <span className="text-5xl font-extrabold text-white drop-shadow-xl">
                    {verifiedLoading ? <span className="animate-pulse">...</span> : verifiedError ? "-" : verifiedCount}
                  </span>
                  <span className="text-base text-gray-200 mt-2 font-medium">Verified users</span>
                </div>
              </FlipCardContent>
            </FlipCardFront>
            <FlipCardBack>
              <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                  onClick={() => setFlippedVerified(false)}
                >
                  <span className="text-2xl font-bold text-[#ff3c00] mb-2">{verifiedCount ?? "-"} users</span>
                  <span className="text-gray-200 text-center">This is the number of users who have verified their email.</span>
                </div>
              </FlipCardContent>
            </FlipCardBack>
          </FlipCard>
        </div>
        <div className="w-full h-48 relative">
          <FlipCard flipped={flippedBanned} onFlip={setFlippedBanned} className="w-full h-full">
            <FlipCardFront>
              <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                  onClick={() => setFlippedBanned(true)}
                >
                  <span className="text-5xl font-extrabold text-white drop-shadow-xl">
                    {bannedLoading ? <span className="animate-pulse">...</span> : bannedError ? "-" : bannedCount}
                  </span>
                  <span className="text-base text-gray-200 mt-2 font-medium">Banned users</span>
                </div>
              </FlipCardContent>
            </FlipCardFront>
            <FlipCardBack>
              <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                  onClick={() => setFlippedBanned(false)}
                >
                  <span className="text-2xl font-bold text-[#ff3c00] mb-2">{bannedCount ?? "-"} users</span>
                  <span className="text-gray-200 text-center">This is the number of users who are currently banned.</span>
                </div>
              </FlipCardContent>
            </FlipCardBack>
          </FlipCard>
        </div>
        <div className="w-full h-48 relative">
          <FlipCard flipped={flippedTimedOut} onFlip={setFlippedTimedOut} className="w-full h-full">
            <FlipCardFront>
              <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                  onClick={() => setFlippedTimedOut(true)}
                >
                  <span className="text-5xl font-extrabold text-white drop-shadow-xl">
                    {timedOutLoading ? <span className="animate-pulse">...</span> : timedOutError ? "-" : timedOutCount}
                  </span>
                  <span className="text-base text-gray-200 mt-2 font-medium">Timed out users</span>
                </div>
              </FlipCardContent>
            </FlipCardFront>
            <FlipCardBack>
              <FlipCardContent className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                  onClick={() => setFlippedTimedOut(false)}
                >
                  <span className="text-2xl font-bold text-[#ff3c00] mb-2">{timedOutCount ?? "-"} users</span>
                  <span className="text-gray-200 text-center">This is the number of users who are currently timed out.</span>
                </div>
              </FlipCardContent>
            </FlipCardBack>
          </FlipCard>
        </div>
      </div>
      <UserTable />
    </div>
  );
}
