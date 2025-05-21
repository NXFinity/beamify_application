import React, { useEffect, useState } from "react";
import { AdminService } from "@/core/api/admin/admin.service";
import { ShippingClass, ShippingClassInput } from "@/core/api/admin/types/admin.interface";
import { usePathname } from "next/navigation";

type RSidebarProps = {
  isCompact: boolean;
  toggleCompact: () => void;
};

const RSidebar: React.FC<RSidebarProps> = ({ isCompact, toggleCompact }) => {
  const pathname = usePathname();
  const [shippingClasses, setShippingClasses] = useState<ShippingClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ShippingClassInput>>({ name: "", description: "", rates: [] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showShipping, setShowShipping] = useState(false);

  // Listen for ecommerce tab visibility changes
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setShowShipping(!!detail?.visible);
    };
    window.addEventListener("ecommerce-tab-visibility", handler);
    // Set initial state
    setShowShipping(typeof window !== "undefined" && document.body.classList.contains("ecommerce-active"));
    return () => window.removeEventListener("ecommerce-tab-visibility", handler);
  }, []);

  useEffect(() => {
    if (!showShipping) return;
    setLoading(true);
    setError("");
    AdminService.getAllShippingClasses()
      .then(setShippingClasses)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load shipping classes"))
      .finally(() => setLoading(false));
  }, [showShipping]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editingId) {
        const updated = await AdminService.updateShippingClass(editingId, { ...form, name: form.name || "", rates: form.rates || [] });
        setShippingClasses(classes => classes.map(c => c._id === updated._id ? updated : c));
      } else {
        const created = await AdminService.createShippingClass({ ...form, name: form.name || "", rates: form.rates || [] });
        setShippingClasses(classes => [created, ...classes]);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", description: "", rates: [] });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save shipping class");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sc: ShippingClass) => {
    setEditingId(sc._id);
    setForm({ name: sc.name, description: sc.description, rates: sc.rates });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this shipping class?")) return;
    setLoading(true);
    setError("");
    try {
      await AdminService.deleteShippingClass(id);
      setShippingClasses(classes => classes.filter(c => c._id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete shipping class");
    } finally {
      setLoading(false);
    }
  };

  // Sidebar width: wider (w-80) for /admin, default (w-64) otherwise
  const sidebarWidth = pathname.startsWith("/admin") ? (isCompact ? "w-16" : "w-80") : (isCompact ? "w-16" : "w-64");
  const sidebarClass = `MainRSidebar hidden lg:flex flex-col max-h-full bg-gray-900 border-r p-4 fixed top-0 right-0 h-screen z-40 pt-[64px] transition-all duration-300 ${sidebarWidth}`;

  return (
    <aside className={sidebarClass} onClick={toggleCompact}>
      {/* Icon at the top in compact mode when shipping is available */}
      {isCompact && showShipping && (
        <div className="flex flex-col items-center mt-2 mb-2">
          <div className="group relative flex items-center justify-center">
            {/* Shipping Box Icon */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff3c00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <rect x="3" y="7" width="18" height="13" rx="2"/>
              <path d="M16 3v4M8 3v4M3 11h18" />
            </svg>
            <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 rounded bg-gray-800 text-xs text-white opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 shadow-lg border border-gray-700">
              Shipping Classes
            </span>
          </div>
        </div>
      )}
      {!isCompact && showShipping && (
        <>
          <div className="mb-4">
            <span className="font-semibold text-lg text-orange-400 tracking-wide">Shipping Classes</span>
          </div>
          <div className="flex flex-col gap-3">
            {error && <div className="text-red-400 text-xs mb-1">{error}</div>}
            {loading ? (
              <div className="text-gray-400 text-center py-4">Loading…</div>
            ) : (
              <>
                <button
                  className="px-3 py-1.5 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition mb-1 text-sm"
                  onClick={e => { e.stopPropagation(); setShowForm(f => !f); setEditingId(null); setForm({ name: "", description: "", rates: [] }); }}
                >
                  {showForm ? "Cancel" : "Create"}
                </button>
                {showForm && (
                  <form className="bg-gray-800 rounded-xl p-3 mb-2 border border-gray-700" onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
                    <input
                      name="name"
                      value={form.name || ""}
                      onChange={handleInput}
                      placeholder="Name"
                      className="w-full mb-2 px-2 py-1 rounded bg-gray-900 text-gray-100 border border-gray-700 text-sm"
                      required
                    />
                    <textarea
                      name="description"
                      value={form.description || ""}
                      onChange={handleInput}
                      placeholder="Description"
                      className="w-full mb-2 px-2 py-1 rounded bg-gray-900 text-gray-100 border border-gray-700 text-sm"
                    />
                    <div className="mb-2">
                      <label className="block text-xs text-gray-300 mb-1">Shipping Price <span className="text-gray-400">(GBP)</span></label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={form.rates && form.rates[0] ? form.rates[0].price : ""}
                        onChange={e => {
                          const price = parseFloat(e.target.value);
                          setForm({
                            ...form,
                            rates: [{ name: "Standard", price: isNaN(price) ? 0 : price }]
                          });
                        }}
                        placeholder="Enter price in GBP"
                        className="w-full px-2 py-1 rounded bg-gray-900 text-gray-100 border border-gray-700 text-sm"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="submit" className="px-3 py-1 rounded bg-[#ff3c00] text-white font-semibold hover:bg-[#ff6a00] transition text-sm" disabled={!(form.rates && form.rates[0] && form.rates[0].price > 0)}>
                        {editingId ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                )}
                <div className="flex flex-col gap-2">
                  {shippingClasses.length === 0 ? (
                    <div className="text-gray-500 text-center text-xs">No shipping classes found.</div>
                  ) : (
                    shippingClasses.map(sc => (
                      <div key={sc._id} className="bg-gray-900 rounded p-2 flex flex-col gap-1 border border-gray-800">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-100 text-sm truncate" title={sc.name}>{sc.name}</span>
                          <div className="flex gap-1">
                            <button className="px-2 py-1 rounded bg-gray-700 text-gray-200 hover:bg-[#ff3c00] transition text-xs" onClick={e => { e.stopPropagation(); handleEdit(sc); }}>Edit</button>
                            <button className="px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition text-xs" onClick={e => { e.stopPropagation(); handleDelete(sc._id); }}>Delete</button>
                          </div>
                        </div>
                        {sc.description && <div className="text-xs text-gray-400 truncate" title={sc.description}>{sc.description}</div>}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </aside>
  );
};

export default RSidebar;
