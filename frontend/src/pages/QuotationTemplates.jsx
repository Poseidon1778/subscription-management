import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

const emptyForm = { templateName: "", validityDays: 30, recurringPlanId: "" };
const emptyLine = { productId: "", quantity: 1, unitPrice: "" };

const QuotationTemplates = () => {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "internal_user";
  const isAdmin = user?.role === "admin";

  const [templates, setTemplates] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [expandedId, setExpandedId] = useState(null);
  const [lineForm, setLineForm] = useState(emptyLine);
  const [addingLine, setAddingLine] = useState(false);

  const loadTemplates = () => {
    setLoading(true);
    api
      .get("/quotation-templates")
      .then((res) => setTemplates(res.data.templates))
      .catch(() => setError("Could not load quotation templates"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTemplates();
    if (canManage) {
      api.get("/plans").then((res) => setPlans(res.data.plans)).catch(() => {});
      api.get("/products").then((res) => setProducts(res.data.products)).catch(() => {});
    }
  }, [canManage]);

  const openCreateModal = () => {
    setForm(emptyForm);
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
      await api.post("/quotation-templates", form);
      setModalOpen(false);
      loadTemplates();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create template");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this template?")) return;
    try {
      await api.delete(`/quotation-templates/${id}`);
      loadTemplates();
    } catch {
      alert("Failed to delete template");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setLineForm(emptyLine);
  };

  const handleLineChange = (e) => {
    setLineForm({ ...lineForm, [e.target.name]: e.target.value });
  };

  const handleAddLine = async (e, templateId) => {
    e.preventDefault();
    setAddingLine(true);
    try {
      await api.post(`/quotation-templates/${templateId}/lines`, lineForm);
      setLineForm(emptyLine);
      loadTemplates();
    } catch {
      alert("Failed to add line");
    } finally {
      setAddingLine(false);
    }
  };

  const handleRemoveLine = async (templateId, lineId) => {
    if (!confirm("Remove this line?")) return;
    try {
      await api.delete(`/quotation-templates/${templateId}/lines/${lineId}`);
      loadTemplates();
    } catch {
      alert("Failed to remove line");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quotation Templates</h1>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            + New Template
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : templates.length === 0 ? (
        <p className="text-slate-500">No templates yet.</p>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-slate-800">{t.template_name}</p>
                  <p className="text-sm text-slate-500">
                    Valid {t.validity_days} days
                    {t.plan_name ? ` — Plan: ${t.plan_name}` : ""}
                    {" — "}
                    {t.lines?.length || 0} line{(t.lines?.length || 0) === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleExpand(t.id)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {expandedId === t.id ? "Hide Lines" : "Manage Lines"}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {expandedId === t.id && (
                <div className="border-t border-slate-200 px-5 py-4 bg-slate-50">
                  {t.lines?.length > 0 ? (
                    <table className="w-full text-sm mb-4">
                      <thead>
                        <tr className="text-left text-slate-600">
                          <th className="py-1 font-medium">Product</th>
                          <th className="py-1 font-medium">Qty</th>
                          <th className="py-1 font-medium">Unit Price</th>
                          {canManage && <th className="py-1 font-medium text-right">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {t.lines.map((line) => (
                          <tr key={line.id} className="border-t border-slate-200">
                            <td className="py-2 text-slate-800">{line.product_name}</td>
                            <td className="py-2 text-slate-600">{line.quantity}</td>
                            <td className="py-2 text-slate-600">Rs. {line.unit_price}</td>
                            {canManage && (
                              <td className="py-2 text-right">
                                <button
                                  onClick={() => handleRemoveLine(t.id, line.id)}
                                  className="text-red-600 hover:underline text-sm"
                                >
                                  Remove
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-slate-500 text-sm mb-4">No lines yet.</p>
                  )}

                  {canManage && (
                    <form onSubmit={(e) => handleAddLine(e, t.id)} className="grid grid-cols-4 gap-2 items-end">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Product</label>
                        <select
                          name="productId"
                          required
                          value={lineForm.productId}
                          onChange={handleLineChange}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm"
                        >
                          <option value="">Select product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.product_name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Qty</label>
                        <input
                          type="number"
                          name="quantity"
                          min="1"
                          value={lineForm.quantity}
                          onChange={handleLineChange}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Unit Price</label>
                        <input
                          type="number"
                          step="0.01"
                          name="unitPrice"
                          required
                          value={lineForm.unitPrice}
                          onChange={handleLineChange}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-4">
                        <button
                          type="submit"
                          disabled={addingLine}
                          className="px-3 py-1.5 bg-slate-800 text-white rounded-md text-sm hover:bg-slate-900 disabled:opacity-50"
                        >
                          {addingLine ? "Adding..." : "Add Line"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Quotation Template">
        {formError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-4">{formError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
            <input
              type="text"
              name="templateName"
              required
              value={form.templateName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Validity Days</label>
            <input
              type="number"
              min="1"
              name="validityDays"
              value={form.validityDays}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Recurring Plan</label>
            <select
              name="recurringPlanId"
              value={form.recurringPlanId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="">None</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.plan_name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Template"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default QuotationTemplates;
