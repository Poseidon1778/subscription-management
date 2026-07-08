import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role === "portal_user") return; // portal users don't have report access
    api
      .get("/reports/dashboard")
      .then((res) => setSummary(res.data.summary))
      .catch(() => setError("Could not load dashboard summary"));
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">
        Welcome, {user?.full_name || user?.email}
      </h1>
      <p className="text-slate-500 mb-6">Here's what's happening with your subscriptions.</p>

      {user?.role === "portal_user" && (
        <p className="text-slate-500">Use the sidebar to view your subscriptions and invoices.</p>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Subscriptions" value={summary.activeSubscriptions} />
          <StatCard label="Total Revenue" value={`₹${summary.totalRevenue.toLocaleString()}`} />
          <StatCard label="Outstanding Amount" value={`₹${summary.outstandingAmount.toLocaleString()}`} />
          <StatCard label="Overdue Invoices" value={summary.overdueInvoicesCount} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
