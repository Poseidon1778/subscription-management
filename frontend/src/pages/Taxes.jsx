import { useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";

const emptyForm = { taxName: "", taxPercent: "" };

const Taxes = () => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadTaxes = () => {
    setLoading(true);
    api
      .get("/taxes")
      .then((res) => setTaxes(res.data.taxes))
      .catch(() => setError("Could not load taxes"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTaxes();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingId(t.id);
    setForm({ taxName: t.tax_name, taxPercent: t.tax_percent });
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
        await api.put(`/taxes/${editingId}`, form);
      } else {
        await api.post("/taxes", form);
      }
      setModalOpen(false);
      loadTaxes();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save tax");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this tax?")) return;
    try {
      await api.delete(`/taxes/${id}`);
      loadTaxes();
    } catch {
      alert("Failed to delete tax");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Taxes</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + New Tax
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : taxes.length === 0 ? (
        <p className="text-slate-500">No taxes yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Percent</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Active</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-800">{t.tax_name}</td>
                  <td className="px-4 py-3 text-slate-600">{t.tax_percent}%</td>
                  <td className="px-4 py-3 text-slate-600">{t.is_active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEditModal(t)} className="text-blue-600 hover:underline text-sm">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:underline text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Tax" : "New Tax"}>
        {formError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-4">{formError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tax Name</label>
            <input
              type="text"
              name="taxName"
              required
              value={form.taxName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tax Percent</label>
            <input
              type="number"
              step="0.01"
              name="taxPercent"
              required
              value={form.taxPercent}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update Tax" : "Create Tax"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Taxes;
