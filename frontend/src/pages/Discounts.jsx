import { useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";

const emptyForm = {
  discountName: "",
  discountType: "percentage",
  value: "",
  minimumPurchase: "",
  minimumQuantity: 1,
  startDate: "",
  endDate: "",
  limitUsage: "",
};

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadDiscounts = () => {
    setLoading(true);
    api
      .get("/discounts")
      .then((res) => setDiscounts(res.data.discounts))
      .catch(() => setError("Could not load discounts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (d) => {
    setEditingId(d.id);
    setForm({
      discountName: d.discount_name,
      discountType: d.discount_type,
      value: d.value,
      minimumPurchase: d.minimum_purchase,
      minimumQuantity: d.minimum_quantity,
      startDate: d.start_date ? d.start_date.slice(0, 10) : "",
      endDate: d.end_date ? d.end_date.slice(0, 10) : "",
      limitUsage: d.limit_usage || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editingId) {
        await api.put(`/discounts/${editingId}`, form);
      } else {
        await api.post("/discounts", form);
      }
      setModalOpen(false);
      loadDiscounts();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save discount");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this discount?")) return;
    try {
      await api.delete(`/discounts/${id}`);
      loadDiscounts();
    } catch {
      alert("Failed to delete discount");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Discounts</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + New Discount
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : discounts.length === 0 ? (
        <p className="text-slate-500">No discounts yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Value</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Min Purchase</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Usage Limit</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Used</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-800">{d.discount_name}</td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{d.discount_type}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {d.discount_type === "percentage" ? `${d.value}%` : `Rs. ${d.value}`}
                  </td>
                  <td className="px-4 py-3 text-slate-600">Rs. {d.minimum_purchase}</td>
                  <td className="px-4 py-3 text-slate-600">{d.limit_usage || "Unlimited"}</td>
                  <td className="px-4 py-3 text-slate-600">{d.times_used}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEditModal(d)} className="text-blue-600 hover:underline text-sm">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Discount" : "New Discount"}>
        {formError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-4">{formError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Discount Name</label>
            <input
              type="text"
              name="discountName"
              required
              value={form.discountName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
              <input
                type="number"
                step="0.01"
                name="value"
                required
                value={form.value}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Purchase</label>
              <input
                type="number"
                step="0.01"
                name="minimumPurchase"
                value={form.minimumPurchase}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Quantity</label>
              <input
                type="number"
                min="1"
                name="minimumQuantity"
                value={form.minimumQuantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usage Limit</label>
            <input
              type="number"
              min="1"
              name="limitUsage"
              placeholder="Leave blank for unlimited"
              value={form.limitUsage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update Discount" : "Create Discount"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Discounts;
