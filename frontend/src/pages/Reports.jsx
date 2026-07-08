import { useEffect, useState } from "react";
import api from "../services/api";

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
  </div>
);

const STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-700",
  quotation: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  closed: "bg-slate-200 text-slate-500",
};

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [paymentsSummary, setPaymentsSummary] = useState([]);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [revenue, setRevenue] = useState(null);
  const [error, setError] = useState("");

  const loadReports = () => {
    api.get("/reports/dashboard").then((res) => setSummary(res.data.summary)).catch(() => setError("Could not load reports"));
    api.get("/reports/subscriptions-by-status").then((res) => setStatusBreakdown(res.data.data)).catch(() => {});
    api.get("/reports/payments-summary").then((res) => setPaymentsSummary(res.data.summary)).catch(() => {});
    api.get("/reports/overdue-invoices").then((res) => setOverdueInvoices(res.data.invoices)).catch(() => {});
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleFilterRevenue = () => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    api
      .get("/reports/revenue", { params })
      .then((res) => setRevenue(res.data.totalRevenue))
      .catch(() => {});
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Reports</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Active Subscriptions" value={summary.activeSubscriptions} />
          <StatCard label="Total Revenue" value={`Rs. ${summary.totalRevenue.toLocaleString()}`} />
          <StatCard label="Outstanding Amount" value={`Rs. ${summary.outstandingAmount.toLocaleString()}`} />
          <StatCard label="Overdue Invoices" value={summary.overdueInvoicesCount} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Subscriptions by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Subscriptions by Status</h2>
          {statusBreakdown.length === 0 ? (
            <p className="text-slate-500 text-sm">No data.</p>
          ) : (
            <div className="space-y-2">
              {statusBreakdown.map((row) => (
                <div key={row.status} className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[row.status]}`}>
                    {row.status}
                  </span>
                  <span className="text-slate-700 font-medium">{row.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payments Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Payments by Method</h2>
          {paymentsSummary.length === 0 ? (
            <p className="text-slate-500 text-sm">No data.</p>
          ) : (
            <div className="space-y-2">
              {paymentsSummary.map((row) => (
                <div key={row.payment_method} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 capitalize">{row.payment_method.replace("_", " ")} ({row.count})</span>
                  <span className="text-slate-800 font-medium">Rs. {row.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue by Date Range</h2>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <button
            onClick={handleFilterRevenue}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-md text-sm hover:bg-slate-900"
          >
            Filter
          </button>
          {revenue !== null && (
            <span className="ml-4 text-slate-700 font-medium">Total: Rs. {revenue.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Overdue Invoices */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Overdue Invoices</h2>
        {overdueInvoices.length === 0 ? (
          <p className="text-slate-500 text-sm">No overdue invoices.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-2 font-medium text-slate-600">Invoice #</th>
                <th className="text-left py-2 font-medium text-slate-600">Customer</th>
                <th className="text-left py-2 font-medium text-slate-600">Due Date</th>
                <th className="text-left py-2 font-medium text-slate-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {overdueInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 text-slate-800">{inv.invoice_number}</td>
                  <td className="py-2 text-slate-600">{inv.customer_name}</td>
                  <td className="py-2 text-red-600">{inv.due_date?.slice(0, 10)}</td>
                  <td className="py-2 text-slate-600">Rs. {inv.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;
