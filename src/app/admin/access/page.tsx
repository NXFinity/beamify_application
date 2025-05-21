import React, { useState, useEffect } from "react";
import { AdminService } from "@/core/api/admin/admin.service";
import { Role, Permission } from "@/core/api/admin/types/admin.interface";

const TABS = [
  { label: "Roles", value: "roles" },
  { label: "Permissions", value: "permissions" },
];

function FlipCard({ front, back }: { front: React.ReactNode; back: React.ReactNode }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="flip-card w-full h-48 cursor-pointer"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      tabIndex={0}
      onFocus={() => setFlipped(true)}
      onBlur={() => setFlipped(false)}
      style={{ outline: 'none' }}
    >
      <div className={`flip-card-inner w-full h-full transition-transform duration-500 ${flipped ? "flipped" : ""}`}>
        <div className="flip-card-front w-full h-full flex flex-col items-center justify-center bg-gray-900 rounded-xl shadow-lg absolute inset-0 backface-hidden">
          {front}
        </div>
        <div className="flip-card-back w-full h-full flex flex-col items-center justify-center bg-gray-800 rounded-xl shadow-lg absolute inset-0 backface-hidden transform rotateY-180">
          {back}
        </div>
      </div>
      <style jsx>{`
        .flip-card {
          perspective: 1000px;
          position: relative;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.5s;
          transform-style: preserve-3d;
        }
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}

export default function AccessManagementPage() {
  const [activeTab, setActiveTab] = useState("roles");
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    if (activeTab === "roles") {
      AdminService.getAllRoles()
        .then(setRoles)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    } else if (activeTab === "permissions") {
      AdminService.getAllPermissions()
        .then(setPermissions)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 px-4 py-8">
      {/* Dashboard flip cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full mb-12">
        <FlipCard
          front={
            <>
              <span className="text-5xl font-extrabold text-white drop-shadow-xl">{roles.length}</span>
              <span className="text-base text-gray-200 mt-2 font-medium">Total Roles</span>
            </>
          }
          back={
            <>
              <span className="text-lg font-bold text-white mb-2">Roles Preview</span>
              {roles.length === 0 ? (
                <span className="text-gray-400">No roles</span>
              ) : (
                <ul className="text-gray-200 text-sm list-disc list-inside">
                  {roles.slice(0, 3).map(r => (
                    <li key={r._id || r.name}>{r.name}</li>
                  ))}
                  {roles.length > 3 && <li>...and {roles.length - 3} more</li>}
                </ul>
              )}
            </>
          }
        />
        <FlipCard
          front={
            <>
              <span className="text-5xl font-extrabold text-white drop-shadow-xl">{permissions.length}</span>
              <span className="text-base text-gray-200 mt-2 font-medium">Total Permissions</span>
            </>
          }
          back={
            <>
              <span className="text-lg font-bold text-white mb-2">Permissions Preview</span>
              {permissions.length === 0 ? (
                <span className="text-gray-400">No permissions</span>
              ) : (
                <ul className="text-gray-200 text-sm list-disc list-inside">
                  {permissions.slice(0, 3).map(p => (
                    <li key={p._id || p.name}>{p.name}</li>
                  ))}
                  {permissions.length > 3 && <li>...and {permissions.length - 3} more</li>}
                </ul>
              )}
            </>
          }
        />
      </div>
      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        {TABS.map(tab => (
          <button
            key={tab.value}
            className={`px-6 py-2 rounded-t-lg font-semibold transition-colors ${activeTab === tab.value ? "bg-gray-900 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="w-full bg-gray-900 rounded-b-xl shadow-lg p-4 overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : activeTab === "roles" ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Roles</h2>
              <button
                className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
                onClick={() => setShowCreateRole(true)}
              >
                Create Role
              </button>
            </div>
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-800 text-gray-300">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Permissions</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">No roles found.</td></tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role._id || role.name}>
                      <td className="px-4 py-2">{role.name}</td>
                      <td className="px-4 py-2">{role.description || '-'}</td>
                      <td className="px-4 py-2">
                        {Array.isArray(role.permissions) && role.permissions.length > 0
                          ? role.permissions.join(", ")
                          : '-'}
                      </td>
                      <td className="px-4 py-2">
                        <button className="px-2 py-1 rounded bg-gray-700 text-gray-200 hover:bg-[#ff3c00] transition mr-2">Edit</button>
                        <button className="px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Create Role Modal/Form Placeholder */}
            {showCreateRole && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <form className="bg-gray-900 rounded-lg p-8 shadow-lg flex flex-col gap-4 min-w-[320px] max-w-md w-full">
                  <h4 className="text-lg font-bold text-gray-100 mb-2">Create Role</h4>
                  <label className="text-gray-300 font-semibold">Name
                    <input className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] mt-1" />
                  </label>
                  <label className="text-gray-300 font-semibold">Description
                    <textarea className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] mt-1" rows={2} />
                  </label>
                  <label className="text-gray-300 font-semibold">Permissions
                    <input className="w-full px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff3c00] mt-1" placeholder="Comma separated" />
                  </label>
                  <div className="flex gap-4 justify-end mt-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-500 transition"
                      onClick={() => setShowCreateRole(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Permissions</h2>
              <button
                className="px-4 py-2 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition"
                disabled
              >
                Create Permission
              </button>
            </div>
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-800 text-gray-300">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Resource</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-500">No permissions found.</td></tr>
                ) : (
                  permissions.map((perm) => (
                    <tr key={perm._id || perm.name}>
                      <td className="px-4 py-2">{perm.name}</td>
                      <td className="px-4 py-2">{perm.description || '-'}</td>
                      <td className="px-4 py-2">{perm.resource || '-'}</td>
                      <td className="px-4 py-2">{perm.action || '-'}</td>
                      <td className="px-4 py-2">
                        <button className="px-2 py-1 rounded bg-gray-700 text-gray-200 hover:bg-[#ff3c00] transition mr-2" disabled>Edit</button>
                        <button className="px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition" disabled>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
