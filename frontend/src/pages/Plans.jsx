import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

const emptyForm = {
  planName: "",
  price: "",
  billingPeriod: "monthly",
  minimumQuantity: 1,
  startDate: "",
  endDate: "",
  autoClose: false,
  closable: true,
  pausable: true,
  renewable: true,
};

const BILLING_PERIODS = ["daily", "weekly", "monthly", "yearly"];

const Plans = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPlans = () => {
    setLoading(true);
    api
      .get("/plans")
      .then((res) => setPlans(res.data.plans))
      .catch(() => setError("Could not load plans"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingId(plan.id);
    setForm({
      planName: plan.plan_name,
      price: plan.price,
      billingPeriod: plan.billing_period,
      minimumQuantity: plan.minimum_quantity,
      startDate: plan.start_date ? plan.start_date.slice(0, 10) : "",
      endDate: plan.end_date ? plan.end_date.slice(0, 10) : "",
      autoClose: plan.auto_close,
      closable: plan.closable,
      pausable: plan.pausable,
      renewable: plan.renewable,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editingId) {
        await api.put(`/plans/${editingId}`, form);
      } else {
        await api.post("/plans", form);
      }
      setModalOpen(false);
      loadPlans();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await api.delete(`/plans/${id}`);
      loadPlans();
    } catch {
      alert("Failed to delete plan");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Recurring Plans</h1>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            + New Plan
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : plans.length === 0 ? (
        <p className="text-slate-500">No plans yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Plan Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Billing Period</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Min Qty</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Options</th>
                {isAdmin && <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-800">{p.plan_name}</td>
                  <td className="px-4 py-3 text-slate-600">₹{p.price}</td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{p.billing_period}</td>
                  <td className="px-4 py-3 text-slate-600">{p.minimum_quantity}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {[
                      p.auto_close && "Auto-close",
                      p.closable && "Closable",
                      p.pausable && "Pausable",
                      p.renewable && "Renewable",
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Plan" : "New Plan"}
      >
        {formError && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-4">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name</label>
            <input
              type="text"
              name="planName"
              required
              value={form.planName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                name="price"
                required
                value={form.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Billing Period</label>
              <select
                name="billingPeriod"
                value={form.billingPeriod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BILLING_PERIODS.map((period) => (
                  <option key={period} value={period}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Quantity</label>
              <input
                type="number"
                min="1"
                name="minimumQuantity"
                value={form.minimumQuantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {["autoClose", "closable", "pausable", "renewable"].map((field) => (
              <label key={field} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name={field}
                  checked={form[field]}
                  onChange={handleChange}
                  className="rounded border-slate-300"
                />
                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update Plan" : "Create Plan"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Plans;
