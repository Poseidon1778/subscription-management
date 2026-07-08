import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-700",
  confirmed: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/invoices")
      .then((res) => setInvoices(res.data.invoices))
      .catch(() => setError("Could not load invoices"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Invoices</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : invoices.length === 0 ? (
        <p className="text-slate-500">No invoices yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Invoice #</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Subscription</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Due Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-800 font-medium">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-slate-600">{inv.customer_name}</td>
                  <td className="px-4 py-3 text-slate-600">{inv.subscription_number}</td>
                  <td className="px-4 py-3 text-slate-600">₹{inv.total_amount}</td>
                  <td className="px-4 py-3 text-slate-600">{inv.due_date?.slice(0, 10) || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/invoices/${inv.id}`} className="text-blue-600 hover:underline text-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Invoices;
