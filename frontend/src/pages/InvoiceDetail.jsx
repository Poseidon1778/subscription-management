import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-700",
  confirmed: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "upi", "cheque", "other"];

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "internal_user";

  const [invoice, setInvoice] = useState(null);
  const [outstanding, setOutstanding] = useState(null);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const [paymentForm, setPaymentForm] = useState({ paymentMethod: "card", amount: "", paymentDate: "" });
  const [payingLoading, setPayingLoading] = useState(false);
  const [payError, setPayError] = useState("");

  const loadInvoice = () => {
    api
      .get(`/invoices/${id}`)
      .then((res) => setInvoice(res.data.invoice))
      .catch(() => setError("Could not load invoice"));

    api
      .get(`/payments/invoice/${id}`)
      .then((res) => {
        setPayments(res.data.payments);
        setOutstanding({ totalAmount: res.data.totalAmount, totalPaid: res.data.totalPaid, outstanding: res.data.outstanding });
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const changeStatus = async (status) => {
    setUpdating(true);
    try {
      await api.patch(`/invoices/${id}/status`, { status });
      loadInvoice();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update invoice status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setPayingLoading(true);
    setPayError("");
    try {
      await api.post("/payments", { invoiceId: id, ...paymentForm });
      setPaymentForm({ paymentMethod: "card", amount: "", paymentDate: "" });
      loadInvoice();
    } catch (err) {
      setPayError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setPayingLoading(false);
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!invoice) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <button onClick={() => navigate("/invoices")} className="text-sm text-blue-600 hover:underline mb-4">
        &larr; Back to Invoices
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{invoice.invoice_number}</h1>
            <p className="text-slate-500 text-sm">{invoice.customer_name} — {invoice.subscription_number}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${STATUS_COLORS[invoice.status]}`}>
            {invoice.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <p className="text-slate-400">Invoice Date</p>
            <p className="text-slate-700">{invoice.invoice_date?.slice(0, 10)}</p>
          </div>
          <div>
            <p className="text-slate-400">Due Date</p>
            <p className="text-slate-700">{invoice.due_date?.slice(0, 10) || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">Total Amount</p>
            <p className="text-slate-700 font-semibold">₹{invoice.total_amount}</p>
          </div>
        </div>

        {outstanding && (
          <div className="bg-slate-50 rounded-md p-3 text-sm mb-4 flex gap-6">
            <span className="text-slate-600">Paid: <strong>₹{outstanding.totalPaid}</strong></span>
            <span className="text-slate-600">Outstanding: <strong>₹{outstanding.outstanding}</strong></span>
          </div>
        )}

        {canManage && (
          <div className="flex gap-3">
            {invoice.status === "draft" && (
              <button
                onClick={() => changeStatus("confirmed")}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                Confirm
              </button>
            )}
            {invoice.status !== "paid" && invoice.status !== "cancelled" && (
              <button
                onClick={() => changeStatus("cancelled")}
                disabled={updating}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <a
              href={"http://localhost:5000/api/invoices/${id}/print"}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 text-sm"
            >
              Print
            </a>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Invoice Lines</h2>
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200">
            <tr>
              <th className="text-left py-2 font-medium text-slate-600">Product</th>
              <th className="text-left py-2 font-medium text-slate-600">Qty</th>
              <th className="text-left py-2 font-medium text-slate-600">Unit Price</th>
              <th className="text-left py-2 font-medium text-slate-600">Tax %</th>
              <th className="text-left py-2 font-medium text-slate-600">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines?.map((line) => (
              <tr key={line.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2 text-slate-800">{line.product_name}</td>
                <td className="py-2 text-slate-600">{line.quantity}</td>
                <td className="py-2 text-slate-600">₹{line.unit_price}</td>
                <td className="py-2 text-slate-600">{line.tax_percent}%</td>
                <td className="py-2 text-slate-600">₹{line.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canManage && invoice.status !== "paid" && invoice.status !== "cancelled" && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Record Payment</h2>

          {payError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-4">{payError}</div>}

          {payments.length > 0 && (
            <ul className="mb-4 text-sm text-slate-600 space-y-1">
              {payments.map((p) => (
                <li key={p.id}>
                  {p.payment_number} — ₹{p.amount} via {p.payment_method.replace("_", " ")} on {p.payment_date?.slice(0, 10)}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleRecordPayment} className="grid grid-cols-4 gap-2 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Method</label>
              <select
                name="paymentMethod"
                value={paymentForm.paymentMethod}
                onChange={handlePaymentChange}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                required
                value={paymentForm.amount}
                onChange={handlePaymentChange}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input
                type="date"
                name="paymentDate"
                value={paymentForm.paymentDate}
                onChange={handlePaymentChange}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={payingLoading}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {payingLoading ? "Recording..." : "Record"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;

