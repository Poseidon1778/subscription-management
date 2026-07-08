import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/payments")
      .then((res) => setPayments(res.data.payments))
      .catch(() => setError("Could not load payments"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Payments</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : payments.length === 0 ? (
        <p className="text-slate-500">No payments recorded yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Payment #</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Invoice</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Method</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Invoice Total</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-800 font-medium">{p.payment_number}</td>
                  <td className="px-4 py-3 text-blue-600">
                    <Link to={`/invoices/${p.invoice_id}`} className="hover:underline">
                      {p.invoice_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{p.payment_method.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-slate-600">Rs. {p.amount}</td>
                  <td className="px-4 py-3 text-slate-600">{p.payment_date?.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right text-slate-500">Rs. {p.invoice_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Payments;
