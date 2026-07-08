import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_FLOW = ["draft", "quotation", "confirmed", "active", "closed"];

const emptyLine = { productId: "", quantity: 1, unitPrice: "", taxPercent: 0 };

const SubscriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "internal_user";

  const [subscription, setSubscription] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [lineForm, setLineForm] = useState(emptyLine);
  const [addingLine, setAddingLine] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadSubscription = () => {
    api
      .get(`/subscriptions/${id}`)
      .then((res) => setSubscription(res.data.subscription))
      .catch(() => setError("Could not load subscription"));
  };

  useEffect(() => {
    loadSubscription();
    if (canManage) {
      api.get("/products").then((res) => setProducts(res.data.products)).catch(() => {});
    }
  }, [id, canManage]);

  const handleLineChange = (e) => {
    setLineForm({ ...lineForm, [e.target.name]: e.target.value });
  };

  const handleAddLine = async (e) => {
    e.preventDefault();
    setAddingLine(true);
    try {
      await api.post(`/subscriptions/${id}/lines`, lineForm);
      setLineForm(emptyLine);
      loadSubscription();
    } catch {
      alert("Failed to add line");
    } finally {
      setAddingLine(false);
    }
  };

  const handleRemoveLine = async (lineId) => {
    if (!confirm("Remove this line?")) return;
    try {
      await api.delete(`/subscriptions/${id}/lines/${lineId}`);
      loadSubscription();
    } catch {
      alert("Failed to remove line");
    }
  };

  const advanceStatus = async () => {
    const currentIndex = STATUS_FLOW.indexOf(subscription.status);
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    if (!nextStatus) return;
    setStatusUpdating(true);
    try {
      await api.patch(`/subscriptions/${id}/status`, { status: nextStatus });
      loadSubscription();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const generateInvoice = async () => {
    try {
      const res = await api.post("/invoices/generate", { subscriptionId: id });
      alert(`Invoice ${res.data.invoice.invoice_number} generated`);
      navigate(`/invoices/${res.data.invoice.id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate invoice");
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!subscription) return <p className="text-slate-500">Loading...</p>;

  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(subscription.status) + 1];

  return (
    <div>
      <button onClick={() => navigate("/subscriptions")} className="text-sm text-blue-600 hover:underline mb-4">
        &larr; Back to Subscriptions
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{subscription.subscription_number}</h1>
            <p className="text-slate-500 text-sm">{subscription.customer_name} — {subscription.plan_name}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 capitalize">
            {subscription.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <p className="text-slate-400">Start Date</p>
            <p className="text-slate-700">{subscription.start_date?.slice(0, 10)}</p>
          </div>
          <div>
            <p className="text-slate-400">Expiration Date</p>
            <p className="text-slate-700">{subscription.expiration_date?.slice(0, 10) || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">Payment Terms</p>
            <p className="text-slate-700">{subscription.payment_terms || "—"}</p>
          </div>
        </div>

        {canManage && (
          <div className="flex gap-3">
            {nextStatus && (
              <button
                onClick={advanceStatus}
                disabled={statusUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                {statusUpdating ? "Updating..." : `Move to "${nextStatus}"`}
              </button>
            )}
            {subscription.status === "active" && (
              <button
                onClick={generateInvoice}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Generate Invoice
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Order Lines</h2>

        {subscription.lines?.length > 0 ? (
          <table className="w-full text-sm mb-4">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-2 font-medium text-slate-600">Product</th>
                <th className="text-left py-2 font-medium text-slate-600">Qty</th>
                <th className="text-left py-2 font-medium text-slate-600">Unit Price</th>
                <th className="text-left py-2 font-medium text-slate-600">Tax %</th>
                <th className="text-left py-2 font-medium text-slate-600">Amount</th>
                {canManage && <th className="text-right py-2 font-medium text-slate-600">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {subscription.lines.map((line) => (
                <tr key={line.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 text-slate-800">{line.product_name}</td>
                  <td className="py-2 text-slate-600">{line.quantity}</td>
                  <td className="py-2 text-slate-600">₹{line.unit_price}</td>
                  <td className="py-2 text-slate-600">{line.tax_percent}%</td>
                  <td className="py-2 text-slate-600">₹{line.amount}</td>
                  {canManage && (
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleRemoveLine(line.id)}
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
          <p className="text-slate-500 mb-4">No order lines yet.</p>
        )}

        {canManage && (
          <form onSubmit={handleAddLine} className="grid grid-cols-5 gap-2 items-end border-t border-slate-200 pt-4">
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
            <div>
              <button
                type="submit"
                disabled={addingLine}
                className="w-full px-3 py-1.5 bg-slate-800 text-white rounded-md text-sm hover:bg-slate-900 disabled:opacity-50"
              >
                {addingLine ? "Adding..." : "Add Line"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetail;
